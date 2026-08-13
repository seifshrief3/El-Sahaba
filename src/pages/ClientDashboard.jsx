import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Package,
  CheckCircle,
  Activity,
  ImageIcon,
  Factory,
  Truck,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  History,
  Printer,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import ClientPrintTemplate from "../components/ClientPrintTemplate"; // 💡 استدعاء ملف الطباعة

const ClientDashboard = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================
  const [activeTab, setActiveTab] = useState("overview");
  const [clientBrand, setClientBrand] = useState(null);
  const [expandedShipment, setExpandedShipment] = useState(null);

  const [stats, setStats] = useState({
    collectionsCount: 0,
    modelsCount: 0,
    activeOrdersCount: 0,
    totalInventory: 0,
    shippedPieces: 0,
    reservedPieces: 0,
    totalShipments: 0,
  });

  const [recentCollections, setRecentCollections] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================
  // PRINT CONFIGURATION
  // =========================================================
  const reportRef = useRef(null);

  const getReportTitle = () => {
    const brandName = clientBrand?.name_ar || "البراند";
    switch (activeTab) {
      case "inventory":
        return `تقرير جرد المخزون - ${brandName}`;
      case "shipments":
        return `تقرير حركة الشحنات - ${brandName}`;
      case "history":
        return `سجل الاستلامات - ${brandName}`;
      default:
        return `تقرير ${brandName}`;
    }
  };

  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: getReportTitle(),
  });

  // =========================================================
  // FETCH DATA
  // =========================================================
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) return;

        // 1. بيانات البراند
        const { data: brandData, error: brandError } = await supabase
          .from("brands")
          .select("*")
          .eq("client_portal_user_id", user.id)
          .maybeSingle();

        if (brandError || !brandData) {
          setClientBrand(null);
          return;
        }

        setClientBrand(brandData);
        const brandId = brandData.id;

        // 2. الكولكشنات والموديلات
        const { data: collectionsData } = await supabase
          .from("collections")
          .select(
            `
            id, name, customer_approval, created_at,
            production_orders ( status, id ),
            models ( id, name, model_number, image_url )
          `,
          )
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false });

        const safeCollections = collectionsData || [];
        const modelIds = [];
        const productionOrderIds = [];

        safeCollections.forEach((col) => {
          if (col.models) col.models.forEach((m) => modelIds.push(m.id));
          if (col.production_orders)
            col.production_orders.forEach((po) =>
              productionOrderIds.push(po.id),
            );
        });

        // 3. المخزون
        let inventoryData = [];
        if (modelIds.length > 0) {
          const { data: invData } = await supabase
            .from("inventory")
            .select(
              `model_id, available_qty, shipped_qty, reserved_qty, received_qty, size, color, last_updated`,
            )
            .in("model_id", modelIds);
          if (invData) inventoryData = invData;
        }

        // 4. الشحنات
        const { data: shipmentsData } = await supabase
          .from("shipments")
          .select(
            `
            id, shipment_number, status, created_at, tracking_number, shipping_company,
            customers (name, phone),
            shipment_items ( 
              quantity, 
              inventory ( size, color, models (name, model_number) ) 
            )
          `,
          )
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false });

        const formattedShipments =
          shipmentsData?.map((ship) => {
            const totalPieces =
              ship.shipment_items?.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0,
              ) || 0;
            return { ...ship, total_pieces: totalPieces };
          }) || [];
        setShipments(formattedShipments);

        // 5. سجل الاستلامات (الدفعات الواردة من المصنع)
        let deliveryHistory = [];
        if (productionOrderIds.length > 0) {
          const { data: deliveriesData } = await supabase
            .from("production_deliveries")
            .select(
              `
              delivery_number, status, updated_at, production_order_id,
              production_orders ( collections (name) ),
              production_delivery_items ( delivered_qty )
            `,
            )
            .in("production_order_id", productionOrderIds)
            .eq("status", "completed")
            .order("updated_at", { ascending: false });

          if (deliveriesData) deliveryHistory = deliveriesData;
        }
        setInventoryHistory(deliveryHistory);

        // 6. حسابات المخزون
        const inventoryByModel = {};
        const sizesByModel = {};
        let totalPieces = 0;
        let totalShipped = 0;
        let totalReserved = 0;

        inventoryData.forEach((item) => {
          const mId = item.model_id;
          const available = Number(item.available_qty || 0);
          const shipped = Number(item.shipped_qty || 0);
          const reserved = Number(item.reserved_qty || 0);
          const received = Number(item.received_qty || 0);

          if (!inventoryByModel[mId]) {
            inventoryByModel[mId] = {
              available: 0,
              reserved: 0,
              received: 0,
              shipped: 0,
            };
          }
          if (!sizesByModel[mId]) sizesByModel[mId] = [];

          inventoryByModel[mId].available += available;
          inventoryByModel[mId].reserved += reserved;
          inventoryByModel[mId].received += received;
          inventoryByModel[mId].shipped += shipped;

          totalPieces += available;
          totalShipped += shipped;
          totalReserved += reserved;

          sizesByModel[mId].push({
            size: item.size,
            color: item.color,
            available,
            reserved,
            received,
            shipped,
            lastUpdated: item.last_updated
              ? new Date(item.last_updated).toLocaleDateString("ar-EG")
              : "—",
          });
        });

        // 7. تجهيز بيانات العرض للكولكشنات والموديلات
        let activeOrders = 0;
        let totalModels = 0;
        const extractedModels = [];

        const formattedCollections = safeCollections.map((collection) => {
          const orders = Array.isArray(collection.production_orders)
            ? collection.production_orders
            : [];
          const activeOrder =
            orders.find(
              (o) => o.status && !["completed", "cancelled"].includes(o.status),
            ) || orders[0];
          const orderStatus = activeOrder?.status || "no_order";
          const approval = collection.customer_approval || "not_sent";

          if (
            orderStatus &&
            !["completed", "cancelled", "no_order"].includes(orderStatus)
          ) {
            activeOrders++;
          }

          const modelsInCollection = Array.isArray(collection.models)
            ? collection.models
            : [];
          totalModels += modelsInCollection.length;

          modelsInCollection.forEach((model) => {
            extractedModels.push({
              ...model,
              collectionName: collection.name,
              stockInfo: inventoryByModel[model.id] || {
                available: 0,
                reserved: 0,
                received: 0,
                shipped: 0,
              },
              details: sizesByModel[model.id] || [],
            });
          });

          return {
            id: collection.id,
            name: collection.name,
            modelsCount: modelsInCollection.length,
            approval,
            orderStatus,
            tracking: getTrackingDetails(
              approval,
              orderStatus,
              collection.created_at,
            ),
            date: collection.created_at
              ? new Date(collection.created_at).toLocaleDateString("ar-EG")
              : "—",
          };
        });

        setRecentCollections(formattedCollections);
        setAllModels(extractedModels);
        setStats({
          collectionsCount: safeCollections.length,
          modelsCount: totalModels,
          activeOrdersCount: activeOrders,
          totalInventory: totalPieces,
          shippedPieces: totalShipped,
          reservedPieces: totalReserved,
          totalShipments: formattedShipments.length,
        });
      } catch (error) {
        console.error("Error fetching client dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================
  const onLogout = async () => {
    try {
      await handleLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================================================
  // TRACKING LOGIC
  // =========================================================
  const getTrackingDetails = (approval, orderStatus, createdAt) => {
    let progress = 0;
    let currentStage = "";
    let nextStage = "";
    let expectedDate = "يُحدد بعد الاعتماد";
    let colorClass = "bg-blue-600";

    if (orderStatus === "completed") {
      progress = 100;
      currentStage = "مكتمل ومسلم للمخازن";
      nextStage = "جاهز للشحن للعملاء";
      expectedDate = "متاح بالمخزن";
      colorClass = "bg-emerald-500";
    } else if (orderStatus === "cancelled" || orderStatus === "canceled") {
      progress = 100;
      currentStage = "التشغيل ملغي";
      nextStage = "التواصل مع الإدارة";
      expectedDate = "ملغي";
      colorClass = "bg-red-500";
    } else if (["in_progress", "on_hold", "pending"].includes(orderStatus)) {
      progress = 75;
      currentStage =
        orderStatus === "on_hold"
          ? "موقوف مؤقتاً في المصنع"
          : "قيد التشغيل بخطوط الإنتاج";
      nextStage = "الفحص النهائي والجودة (QC)";
      let expectedDateValue = createdAt ? new Date(createdAt) : new Date();
      if (!Number.isNaN(expectedDateValue.getTime())) {
        expectedDateValue.setDate(expectedDateValue.getDate() + 30);
        expectedDate = expectedDateValue.toLocaleDateString("ar-EG");
      }
      colorClass = "bg-purple-600";
    } else if (approval === "approved") {
      progress = 50;
      currentStage = "تم اعتماد السعر والتصميمات";
      nextStage = "إصدار أمر التشغيل وبدء الإنتاج";
      expectedDate = "جاري الجدولة بالمصنع";
      colorClass = "bg-emerald-500";
    } else if (approval === "sent" || approval === "revised") {
      progress = 25;
      currentStage = "في انتظار موافقتك على العرض";
      nextStage = "مراجعة الـ Tech Pack وتأكيد الاعتماد";
      colorClass = "bg-orange-500";
    } else {
      progress = 10;
      currentStage = "التجهيز (باترون - عينة - تسعير)";
      nextStage = "إرسال عرض السعر للمراجعة";
      colorClass = "bg-[#1a365d]";
    }

    return { progress, currentStage, nextStage, expectedDate, colorClass };
  };

  // =========================================================
  // STATUS TRANSLATION
  // =========================================================
  const getShipmentStatusLabel = (status) => {
    switch (status) {
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التسليم";
      case "completed":
        return "مكتملة";
      case "pending":
        return "معلقة";
      case "cancelled":
      case "canceled":
        return "ملغاة";
      case "preparing":
        return "قيد التجهيز";
      default:
        return status || "—";
    }
  };

  const getShipmentStatusClass = (status) => {
    switch (status) {
      case "shipped":
      case "delivered":
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  // =========================================================
  // RENDER HELPERS
  // =========================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-arabic bg-slate-50">
        <div className="text-[#1a365d] font-bold text-xl animate-pulse">
          جاري تحميل بيانات لوحة التحكم...
        </div>
      </div>
    );
  }

  if (!clientBrand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-arabic bg-slate-50 gap-4">
        <h2 className="text-2xl font-bold text-slate-700">
          لم يتم العثور على براند مرتبط بحسابك.
        </h2>
        <button onClick={onLogout} className="text-red-600 font-bold underline">
          تسجيل الخروج
        </button>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      {/* HEADER */}
      <header className="bg-[#1a365d] text-white p-4 shadow-md flex justify-between items-center px-4 md:px-8 sticky top-0 z-10 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-black">
            بوابة عملاء | {clientBrand.name_ar}
          </h1>
          <p className="text-xs md:text-sm text-blue-200 font-medium mt-1">
            مركز التحكم والمتابعة الشامل
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">تسجيل الخروج</span>
        </button>
      </header>

      {/* TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-[72px] z-10 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex gap-8 px-4 md:px-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 font-bold border-b-4 whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#1a365d] text-[#1a365d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard size={18} /> نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-4 font-bold border-b-4 whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "inventory"
                ? "border-[#1a365d] text-[#1a365d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package size={18} /> المخزون التفصيلي
          </button>
          <button
            onClick={() => setActiveTab("shipments")}
            className={`py-4 font-bold border-b-4 whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "shipments"
                ? "border-[#1a365d] text-[#1a365d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Truck size={18} /> سجل الشحنات
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 font-bold border-b-4 whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === "history"
                ? "border-[#1a365d] text-[#1a365d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History size={18} /> سجل العمليات
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20 no-print">
        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-bold">المتاح للبيع</span>
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <p className="text-3xl font-black text-emerald-700">
                  {stats.totalInventory.toLocaleString()}{" "}
                  <span className="text-xs text-slate-500">قطعة</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-bold">محجوز في شحنات</span>
                  <Package size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-black text-orange-600">
                  {stats.reservedPieces.toLocaleString()}{" "}
                  <span className="text-xs text-slate-500">قطعة</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-bold">إجمالي المشحون</span>
                  <Truck size={20} className="text-blue-500" />
                </div>
                <p className="text-3xl font-black text-blue-700">
                  {stats.shippedPieces.toLocaleString()}{" "}
                  <span className="text-xs text-slate-500">قطعة</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-sm font-bold">تحت التشغيل</span>
                  <Factory size={20} className="text-purple-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">
                  {stats.activeOrdersCount}{" "}
                  <span className="text-xs text-slate-500">أوردر</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
                <Activity size={22} className="text-slate-400" /> تتبع الإنتاج
                الحي
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentCollections.filter((c) => c.orderStatus !== "completed")
                  .length > 0 ? (
                  recentCollections
                    .filter((c) => c.orderStatus !== "completed")
                    .map((col) => (
                      <div
                        key={col.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-black text-slate-800">
                              {col.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              تاريخ البدء: {col.date}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                            <div
                              className={`${col.tracking.colorClass} h-2.5 rounded-full`}
                              style={{ width: `${col.tracking.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-[#1a365d]">
                              {col.tracking.progress}% مكتمل
                            </span>
                            <span className="text-slate-500">
                              {col.tracking.currentStage}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
                    لا توجد كولكشنات تحت الإنشاء حالياً.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===================== TAB 2: INVENTORY ===================== */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a365d]">
                تفاصيل المخزون
              </h2>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              >
                <Printer size={16} /> طباعة / حفظ التقرير
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allModels.length > 0 ? (
                allModels.map((model) => (
                  <div
                    key={model.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      {model.image_url ? (
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={40} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-200 text-xs font-bold font-mono">
                        {model.model_number}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-black text-lg text-slate-800 mb-1">
                        {model.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit mb-4">
                        {model.collectionName}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-center border-y border-slate-100 py-3 mb-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">
                            متاح للبيع
                          </p>
                          <p className="text-lg font-black text-emerald-600">
                            {model.stockInfo.available}
                          </p>
                        </div>
                        <div className="border-r border-l border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold mb-1">
                            محجوز
                          </p>
                          <p className="text-lg font-black text-orange-500">
                            {model.stockInfo.reserved}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">
                            إجمالي مستلم
                          </p>
                          <p className="text-lg font-black text-slate-700">
                            {model.stockInfo.received}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto space-y-2 max-h-32 overflow-y-auto pr-1">
                        {model.details.length > 0 ? (
                          model.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded text-xs"
                            >
                              <span className="font-bold text-slate-600">
                                {detail.color} - {detail.size}
                              </span>
                              <span className="font-black text-[#1a365d]">
                                {detail.available} قطعة
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-center text-slate-400 py-2">
                            لا توجد تفاصيل مقاسات
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
                  لا توجد موديلات في المخزن.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: SHIPMENTS ===================== */}
        {activeTab === "shipments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a365d]">
                سجل الشحنات المفصل
              </h2>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              >
                <Printer size={16} /> طباعة / حفظ التقرير
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">رقم الشحنة</th>
                    <th className="p-4">العميل / بوليصة الشحن</th>
                    <th className="p-4">إجمالي القطع</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.length > 0 ? (
                    shipments.map((shipment) => (
                      <React.Fragment key={shipment.id}>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-[#1a365d]">
                            {shipment.shipment_number}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">
                              {shipment.customers?.name || "غير محدد"}
                            </p>
                            {shipment.tracking_number && (
                              <p className="text-xs text-slate-500 mt-1">
                                {shipment.shipping_company} -{" "}
                                {shipment.tracking_number}
                              </p>
                            )}
                          </td>
                          <td className="p-4 font-black">
                            {shipment.total_pieces} قطعة
                          </td>
                          <td className="p-4 text-slate-500">
                            {shipment.created_at
                              ? new Date(
                                  shipment.created_at,
                                ).toLocaleDateString("ar-EG")
                              : "—"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${getShipmentStatusClass(shipment.status)}`}
                            >
                              {getShipmentStatusLabel(shipment.status)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                setExpandedShipment(
                                  expandedShipment === shipment.id
                                    ? null
                                    : shipment.id,
                                )
                              }
                              className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"
                            >
                              {expandedShipment === shipment.id ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {expandedShipment === shipment.id && (
                          <tr className="bg-slate-50">
                            <td colSpan="6" className="p-0">
                              <div className="p-6 border-t border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
                                  محتويات الشحنة التفصيلية:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {shipment.shipment_items?.map(
                                    (item, index) => (
                                      <div
                                        key={index}
                                        className="bg-white border border-slate-200 p-3 rounded-lg flex justify-between items-center shadow-sm"
                                      >
                                        <div>
                                          <p className="font-bold text-xs text-[#1a365d]">
                                            {item.inventory?.models?.name}{" "}
                                            <span className="text-slate-400 font-mono">
                                              (
                                              {
                                                item.inventory?.models
                                                  ?.model_number
                                              }
                                              )
                                            </span>
                                          </p>
                                          <p className="text-[11px] font-bold text-slate-500 mt-1">
                                            {item.inventory?.color} - مقاس{" "}
                                            {item.inventory?.size}
                                          </p>
                                        </div>
                                        <div className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded">
                                          {item.quantity} قطعة
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-500 font-bold"
                      >
                        لا توجد شحنات مسجلة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: HISTORY ===================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a365d]">
                سجل الاستلامات
              </h2>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 bg-[#1a365d] hover:bg-[#122844] text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
              >
                <Printer size={16} /> طباعة / حفظ التقرير
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              {inventoryHistory.length > 0 ? (
                <div className="space-y-4">
                  {inventoryHistory.map((history, index) => {
                    const totalQty =
                      history.production_delivery_items?.reduce(
                        (sum, item) => sum + Number(item.delivered_qty || 0),
                        0,
                      ) || 0;
                    return (
                      <div
                        key={`${history.delivery_number}-${index}`}
                        className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              استلام دفعة{" "}
                              <span className="font-mono text-emerald-600">
                                {history.delivery_number}
                              </span>
                            </p>
                            <p className="text-xs font-bold text-slate-500 mt-1">
                              كولكشن:{" "}
                              {history.production_orders?.collections?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-black text-slate-800">
                            +{totalQty}{" "}
                            <span className="text-xs font-medium text-slate-500">
                              قطعة
                            </span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">
                            {history.updated_at
                              ? new Date(history.updated_at).toLocaleString(
                                  "ar-EG",
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500 font-bold py-10">
                  لا توجد سجلات استلام حتى الآن.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          PRINT TEMPLATE COMPONENT
      ===================================================== */}
      <ClientPrintTemplate
        ref={reportRef}
        activeTab={activeTab}
        clientBrand={clientBrand}
        stats={stats}
        allModels={allModels}
        shipments={shipments}
        inventoryHistory={inventoryHistory}
      />
    </div>
  );
};

export default ClientDashboard;
