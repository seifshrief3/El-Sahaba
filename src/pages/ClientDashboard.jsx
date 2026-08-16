import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase";
import {
  LayoutDashboard,
  Package,
  Truck,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ChevronLeft,
  ChevronDown,
  X,
  Eye,
  RefreshCw,
  CalendarDays,
  Hash,
  MapPin,
  Building2,
  ClipboardList,
  Layers3,
  ShoppingBag,
  BarChart3,
  CircleDot,
  ArrowLeft,
  PackageCheck,
  PackageX,
  Send,
  Warehouse,
  Ruler,
  Palette,
  Shirt,
  FileText,
  Search,
  LogOut,
  Headset, // أيقونة خدمة العملاء
  MessageCircle, // أيقونة للواتساب
  TrendingUp,
} from "lucide-react";
import ElsahabaLogo from "../assets/logo.jpeg";

/* =========================================================
   Helpers
========================================================= */

const formatNumber = (value) => {
  return new Intl.NumberFormat("ar-EG").format(Number(value) || 0);
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  } catch {
    return "-";
  }
};

const getStatusLabel = (status) => {
  const statuses = {
    pending: "قيد الانتظار",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    issue: "يوجد مشكلة",
    ready: "جاهز",
    partially_shipped: "شحن جزئي",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };

  return statuses[status] || status || "غير محدد";
};

const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
    case "ready":
    case "shipped":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "in_progress":
    case "partially_shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "issue":
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getCollectionProgress = (collection) => {
  const total = Number(collection.totalQuantity) || 0;
  const shipped = Number(collection.shippedQuantity) || 0;

  if (total <= 0) return 0;

  return Math.min(100, Math.round((shipped / total) * 100));
};

/* =========================================================
   Small Components
========================================================= */

const SectionTitle = ({ icon: Icon, title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12335B] flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-black text-[#102A43]">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs md:text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs md:text-sm font-bold text-slate-500">{title}</p>
        <div
          className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-[#102A43]">
          {formatNumber(value)}
        </div>

        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap ${getStatusStyle(
        status,
      )}`}
    >
      <CircleDot size={10} />
      {getStatusLabel(status)}
    </span>
  );
};

const EmptyState = ({ icon: Icon = Package, title, description }) => {
  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
        <Icon size={30} />
      </div>

      <h3 className="font-black text-slate-600">{title}</h3>

      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
};

/* =========================================================
   Modal
========================================================= */

const Modal = ({ open, onClose, title, children, size = "max-w-5xl" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#06152a]/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      <div
        className={`w-full ${size} max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
      >
        <div className="bg-[#0D2748] text-white px-5 md:px-7 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-black text-lg md:text-xl">{title}</h2>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={19} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-7">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================
   Main Dashboard
========================================================= */

const ClientDashboard = ({ clientId }) => {
  const [activePage, setActivePage] = useState("home");

  const [user, setUser] = useState(null);
  const [brand, setBrand] = useState(null);

  const [collections, setCollections] = useState([]);
  const [models, setModels] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [productionOrderItems, setProductionOrderItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [shipments, setShipments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  /* =======================================================
     Authentication
  ======================================================= */

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      setUser(authUser || null);
    };

    getUser();
  }, []);

  /* =======================================================
     Fetch Dashboard
  ======================================================= */

  const fetchDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser && !clientId) {
        throw new Error("لم يتم العثور على المستخدم.");
      }

      const currentUserId = authUser?.id;

      let brandQuery = supabase.from("brands").select("*");

      if (clientId) {
        brandQuery = brandQuery.eq("id", clientId);
      } else {
        brandQuery = brandQuery.eq("client_portal_user_id", currentUserId);
      }

      const { data: brandData, error: brandError } =
        await brandQuery.maybeSingle();

      if (brandError) {
        throw brandError;
      }

      if (!brandData) {
        throw new Error("لم يتم العثور على بيانات البراند.");
      }

      setBrand(brandData);

      const brandId = brandData.id;

      /* =====================================================
         Collections
      ===================================================== */

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id,name,customer_approval,created_at,brand_id")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        throw collectionsError;
      }

      const safeCollections = collectionsData || [];
      setCollections(safeCollections);

      const collectionIds = safeCollections.map((item) => item.id);

      /* =====================================================
         Production Orders
      ===================================================== */

      let ordersData = [];

      if (collectionIds.length > 0) {
        const { data, error: ordersError } = await supabase
          .from("production_orders")
          .select(
            "id,collection_id,status,total_quantity,order_number,created_at,updated_at",
          )
          .in("collection_id", collectionIds);

        if (ordersError) {
          throw ordersError;
        }

        ordersData = data || [];
      }

      setProductionOrders(ordersData);

      const orderIds = ordersData.map((order) => order.id);

      /* =====================================================
         Models
      ===================================================== */

      let modelsData = [];

      if (collectionIds.length > 0) {
        const { data, error: modelsError } = await supabase
          .from("models")
          .select("id,name,model_number,image_url,collection_id")
          .in("collection_id", collectionIds);

        if (modelsError) {
          throw modelsError;
        }

        modelsData = data || [];
      }

      setModels(modelsData);

      const modelIds = modelsData.map((model) => model.id);

      /* =====================================================
         Production Order Items
      ===================================================== */

      let orderItemsData = [];

      if (orderIds.length > 0) {
        const { data, error: orderItemsError } = await supabase
          .from("production_order_items")
          .select(
            "id,production_order_id,model_id,variant_key,selling_price,total_quantity,part,color,size,quantity",
          )
          .in("production_order_id", orderIds);

        if (orderItemsError) {
          throw orderItemsError;
        }

        orderItemsData = data || [];
      }

      setProductionOrderItems(orderItemsData);

      /* =====================================================
         Inventory
      ===================================================== */

      let inventoryData = [];

      if (modelIds.length > 0) {
        const { data, error: inventoryError } = await supabase
          .from("inventory")
          .select(
            "model_id,available_qty,shipped_qty,reserved_qty,received_qty,size,color,last_updated,models(name,model_number,image_url)",
          )
          .in("model_id", modelIds);

        if (inventoryError) {
          throw inventoryError;
        }

        inventoryData = data || [];
      }

      setInventory(inventoryData);

      /* =====================================================
         Shipments
      ===================================================== */

      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from("shipments")
        .select(
          `
          id,
          shipment_number,
          status,
          created_at,
          tracking_number,
          shipping_company,
          customers(name,phone),
          shipment_items(
            quantity,
            inventory(
              size,
              color,
              models(
                name,
                model_number,
                image_url
              )
            )
          )
        `,
        )
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (shipmentsError) {
        throw shipmentsError;
      }

      setShipments(shipmentsData || []);
    } catch (error) {
      console.error("Client dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user || clientId) {
      fetchDashboard();
    }
  }, [user, clientId]);

  /* =======================================================
     Calculations
  ======================================================= */

  const inventorySummary = useMemo(() => {
    return inventory.reduce(
      (acc, item) => {
        acc.available += Number(item.available_qty) || 0;
        acc.shipped += Number(item.shipped_qty) || 0;
        acc.reserved += Number(item.reserved_qty) || 0;
        acc.received += Number(item.received_qty) || 0;

        return acc;
      },
      {
        available: 0,
        shipped: 0,
        reserved: 0,
        received: 0,
      },
    );
  }, [inventory]);

  const totalProductionQuantity = useMemo(() => {
    return productionOrders.reduce(
      (sum, order) => sum + (Number(order.total_quantity) || 0),
      0,
    );
  }, [productionOrders]);

  const totalShipped = inventorySummary.shipped;

  const totalRemaining = inventorySummary.available + inventorySummary.reserved;

  const totalReceived = inventorySummary.received;

  const shipmentCount = shipments.length;

  const completedShipments = shipments.filter(
    (shipment) =>
      shipment.status === "shipped" || shipment.status === "delivered",
  ).length;

  const pendingShipments = shipments.filter(
    (shipment) =>
      shipment.status === "pending" || shipment.status === "partially_shipped",
  ).length;

  // لحساب نسب الشارت
  const shippingProgressPercentage =
    totalProductionQuantity > 0
      ? Math.round((totalShipped / totalProductionQuantity) * 100)
      : 0;

  const inventoryProgressPercentage =
    totalProductionQuantity > 0
      ? Math.round((inventorySummary.available / totalProductionQuantity) * 100)
      : 0;

  /* =======================================================
     Collections Enriched
  ======================================================= */

  const enrichedCollections = useMemo(() => {
    return collections.map((collection) => {
      const order = productionOrders.find(
        (item) => item.collection_id === collection.id,
      );

      const collectionModels = models.filter(
        (model) => model.collection_id === collection.id,
      );

      const orderItems = productionOrderItems.filter(
        (item) => item.production_order_id === order?.id,
      );

      const totalQuantity = Number(order?.total_quantity) || 0;

      const collectionModelIds = collectionModels.map((model) => model.id);

      const collectionInventory = inventory.filter((item) =>
        collectionModelIds.includes(item.model_id),
      );

      const availableQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.available_qty) || 0),
        0,
      );

      const shippedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.shipped_qty) || 0),
        0,
      );

      const receivedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.received_qty) || 0),
        0,
      );

      const reservedQuantity = collectionInventory.reduce(
        (sum, item) => sum + (Number(item.reserved_qty) || 0),
        0,
      );

      const seriesCount = orderItems.reduce(
        (sum, item) => sum + (Number(item.total_quantity) || 0),
        0,
      );

      return {
        ...collection,
        order,
        models: collectionModels,
        orderItems,
        totalQuantity,
        availableQuantity,
        shippedQuantity,
        receivedQuantity,
        reservedQuantity,
        seriesCount,
      };
    });
  }, [collections, productionOrders, models, productionOrderItems, inventory]);

  /* =======================================================
     Inventory Rows
  ======================================================= */

  const inventoryRows = useMemo(() => {
    const grouped = {};

    inventory.forEach((item) => {
      const modelId = item.model_id;

      if (!grouped[modelId]) {
        grouped[modelId] = {
          modelId,
          model: item.models,
          available: 0,
          shipped: 0,
          reserved: 0,
          received: 0,
          sizes: {},
        };
      }

      grouped[modelId].available += Number(item.available_qty) || 0;

      grouped[modelId].shipped += Number(item.shipped_qty) || 0;

      grouped[modelId].reserved += Number(item.reserved_qty) || 0;

      grouped[modelId].received += Number(item.received_qty) || 0;

      const sizeName = item.size || "غير محدد";

      if (!grouped[modelId].sizes[sizeName]) {
        grouped[modelId].sizes[sizeName] = 0;
      }

      grouped[modelId].sizes[sizeName] += Number(item.available_qty) || 0;
    });

    return Object.values(grouped);
  }, [inventory]);

  const sizeColumns = useMemo(() => {
    const preferred = ["10", "12", "14", "16", "18"];

    const availableSizes = new Set();

    inventory.forEach((item) => {
      if (item.size) {
        availableSizes.add(String(item.size));
      }
    });

    const sorted = Array.from(availableSizes);

    const preferredExisting = preferred.filter((size) =>
      availableSizes.has(size),
    );

    const rest = sorted.filter((size) => !preferred.includes(size));

    return [...preferredExisting, ...rest].slice(0, 5);
  }, [inventory]);

  /* =======================================================
     Shipment Rows
  ======================================================= */

  const shipmentRows = useMemo(() => {
    return shipments.map((shipment) => {
      const items = shipment.shipment_items || [];

      const quantity = items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      );

      return {
        ...shipment,
        totalQuantity: quantity,
      };
    });
  }, [shipments]);

  /* =======================================================
     Search
  ======================================================= */

  const filteredCollections = useMemo(() => {
    if (!searchTerm.trim()) return enrichedCollections;

    const search = searchTerm.trim().toLowerCase();

    return enrichedCollections.filter((collection) => {
      const collectionName = String(collection.name || "").toLowerCase();

      const modelMatch = collection.models.some((model) =>
        String(model.name || "")
          .toLowerCase()
          .includes(search),
      );

      const numberMatch = collection.models.some((model) =>
        String(model.model_number || "")
          .toLowerCase()
          .includes(search),
      );

      return collectionName.includes(search) || modelMatch || numberMatch;
    });
  }, [enrichedCollections, searchTerm]);
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    window.location.href = "/login";
  };
  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#F3F5F8] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2748] text-white flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Boxes size={30} />
          </div>

          <p className="font-black text-[#102A43]">
            جاري تحميل بيانات لوحة العميل...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            يتم جلب البيانات من قاعدة البيانات
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     Header
  ======================================================= */

  const logo =
    brand?.logo_url || brand?.logo || brand?.image_url || "/logo.png";

  return (
    <div dir="rtl" className="min-h-screen bg-[#F3F5F8] text-[#102A43]">
      {/* ===================================================
          Top Header
      =================================================== */}

      <header className="bg-white border-b-4 border-[#DC2626] shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-7">
          <div className="h-20 flex items-center justify-between gap-4">
            {/* الجزء الأيمن: اللوجوهات (الصحابة + العميل) */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* 1. لوجو واسم الصحابة */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0">
                  <img
                    src={ElsahabaLogo}
                    alt="شعار الصحابة"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-black text-xl md:text-2xl text-[#0D2748] tracking-tight leading-none">
                    الصحابة
                  </h1>
                  <p className="text-[10px] md:text-[11px] text-[#DC2626] font-black tracking-widest uppercase mt-0.5">
                    لتصنيع وتصدير الملابس
                  </p>
                </div>
              </div>

              {/* فاصل بين اللوجوهين */}
              <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

              {/* 2. لوجو واسم العميل (البراند) */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={
                      brand?.logo_url ||
                      brand?.logo ||
                      brand?.image_url ||
                      "/logo.png"
                    }
                    alt="شعار البراند"
                    className="w-full h-full object-contain p-1"
                    onError={(event) => {
                      event.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>
                <div>
                  <h2 className="font-black text-sm md:text-lg text-[#0D2748]">
                    {brand?.name_ar || brand?.name || "بوابة العملاء"}
                  </h2>
                  <p className="text-[9px] md:text-[11px] text-slate-500 font-bold">
                    بوابة متابعة الإنتاج والشحن
                  </p>
                </div>
              </div>
            </div>

            {/* الجزء الأيسر: الأزرار */}
            <div className="flex items-center gap-2">
              {/* زر تحديث البيانات */}
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="h-10 px-3 md:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 text-xs font-bold transition shadow-sm"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:block">تحديث البيانات</span>
              </button>

              {/* زر تسجيل الخروج */}
              <button
                onClick={handleLogout}
                className="h-10 px-3 md:px-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 flex items-center gap-2 text-xs font-bold transition shadow-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          Navigation
      =================================================== */}

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 md:px-7">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActivePage("home")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
                activePage === "home"
                  ? "bg-[#0D2748] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard size={17} />
              الرئيسية
            </button>

            <button
              onClick={() => setActivePage("collections")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
                activePage === "collections"
                  ? "bg-[#0D2748] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Boxes size={17} />
              الكولكشنات
            </button>

            <button
              onClick={() => setActivePage("shipments")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
                activePage === "shipments"
                  ? "bg-[#0D2748] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Truck size={17} />
              سجل الشحنات
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-3 md:px-7 py-5 md:py-7">
        {/* =================================================
            HOME
        ================================================= */}

        {activePage === "home" && (
          <div className="space-y-5">
            {/* قسم المؤشرات الدائرية (Charts) وخدمة العملاء الجديد */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Chart 1: Shipping Progress */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#102A43] mb-1">
                    نسبة إنجاز الشحن
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    من إجمالي أوامر التشغيل
                  </p>
                  <div className="mt-4 font-black text-2xl text-emerald-600">
                    {formatNumber(totalShipped)}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      قطعة مشحونة
                    </span>
                  </div>
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${shippingProgressPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-[#102A43]">
                      {shippingProgressPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Inventory Availability */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#102A43] mb-1">
                    القطع الجاهزة للشحن
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    نسبة التوفر في المخزن
                  </p>
                  <div className="mt-4 font-black text-2xl text-blue-600">
                    {formatNumber(inventorySummary.available)}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      قطعة متاحة
                    </span>
                  </div>
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray={`${inventoryProgressPercentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-[#102A43]">
                      {inventoryProgressPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Service Support */}
              <div className="bg-gradient-to-br from-[#0D2748] to-[#1a3d6d] rounded-3xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -left-4 -bottom-4 opacity-10">
                  <Headset size={100} />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm">
                    <Headset size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">
                      تواصل مع خدمة العملاء
                    </h3>
                    <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                      نحن هنا لمساعدتك في أي استفسار يخص إنتاج وشحن الكولكشن
                      الخاص بك.
                    </p>
                  </div>
                </div>

                <a
                  href="https://wa.me/201115480308"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-5 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                >
                  <MessageCircle size={18} />
                  تواصل الآن عبر الواتساب
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.9fr] gap-5">
              {/* Inventory */}

              <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 pb-3">
                  <SectionTitle
                    icon={Warehouse}
                    title="مخزون مخزن الشحن"
                    subtitle="تفاصيل الكميات المتاحة والمشحونة حسب الموديل"
                  />
                </div>

                {inventoryRows.length === 0 ? (
                  <EmptyState
                    icon={Boxes}
                    title="لا توجد بيانات مخزون"
                    description="لا توجد كميات مسجلة لهذا البراند حالياً."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[950px]">
                      <thead>
                        <tr className="bg-[#0D2748] text-white">
                          <th className="px-3 py-3 text-right font-black">
                            الموديل
                          </th>

                          <th className="px-3 py-3 font-black">الكود</th>

                          <th className="px-3 py-3 font-black">عدد الأشكال</th>

                          <th className="px-3 py-3 font-black">المتاح</th>

                          <th className="px-3 py-3 font-black">المحجوز</th>

                          {sizeColumns.map((size) => (
                            <th key={size} className="px-3 py-3 font-black">
                              {size}
                            </th>
                          ))}

                          <th className="px-3 py-3 font-black">المشحون</th>

                          <th className="px-3 py-3 font-black">الإجمالي</th>
                        </tr>
                      </thead>

                      <tbody>
                        {inventoryRows.map((row) => {
                          const total = row.available + row.shipped;

                          return (
                            <tr
                              key={row.modelId}
                              className="border-b border-slate-100 hover:bg-blue-50/40 transition"
                            >
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                                    {row.model?.image_url ? (
                                      <img
                                        src={row.model.image_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Shirt
                                        size={18}
                                        className="text-slate-300"
                                      />
                                    )}
                                  </div>

                                  <div>
                                    <div className="font-black text-[#102A43]">
                                      {row.model?.name || "موديل غير محدد"}
                                    </div>

                                    <div className="text-[10px] text-slate-400">
                                      {row.model?.model_number || "-"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-3 text-center font-bold">
                                {row.model?.model_number || "-"}
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span className="font-black">1</span>
                              </td>

                              <td className="px-3 py-3 text-center font-black text-emerald-600">
                                {formatNumber(row.available)}
                              </td>

                              <td className="px-3 py-3 text-center font-black text-red-500">
                                {formatNumber(row.reserved)}
                              </td>

                              {sizeColumns.map((size) => (
                                <td
                                  key={size}
                                  className="px-3 py-3 text-center font-bold text-slate-600"
                                >
                                  {formatNumber(row.sizes[size] || 0)}
                                </td>
                              ))}

                              <td className="px-3 py-3 text-center font-black text-orange-500">
                                {formatNumber(row.shipped)}
                              </td>

                              <td className="px-3 py-3 text-center font-black text-[#102A43]">
                                {formatNumber(total)}
                              </td>
                            </tr>
                          );
                        })}

                        <tr className="bg-blue-50/70 font-black">
                          <td className="px-3 py-3">الإجمالي</td>

                          <td />

                          <td />

                          <td className="px-3 py-3 text-center text-emerald-700">
                            {formatNumber(inventorySummary.available)}
                          </td>

                          <td className="px-3 py-3 text-center text-red-600">
                            {formatNumber(inventorySummary.reserved)}
                          </td>

                          {sizeColumns.map((size) => {
                            const totalSize = inventory.reduce((sum, item) => {
                              if (String(item.size) === String(size)) {
                                return sum + (Number(item.available_qty) || 0);
                              }

                              return sum;
                            }, 0);

                            return (
                              <td key={size} className="px-3 py-3 text-center">
                                {formatNumber(totalSize)}
                              </td>
                            );
                          })}

                          <td className="px-3 py-3 text-center text-orange-600">
                            {formatNumber(inventorySummary.shipped)}
                          </td>

                          <td className="px-3 py-3 text-center text-[#102A43]">
                            {formatNumber(
                              inventorySummary.available +
                                inventorySummary.shipped,
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Shipment Table */}

              <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 pb-3">
                  <SectionTitle
                    icon={Truck}
                    title="سجل الشحنات"
                    subtitle="آخر الشحنات الخاصة بالبراند"
                    action={
                      <button
                        onClick={() => setActivePage("shipments")}
                        className="text-[#0D5FE8] text-xs font-black flex items-center gap-1"
                      >
                        عرض الكل
                        <ChevronLeft size={14} />
                      </button>
                    }
                  />
                </div>

                {shipmentRows.length === 0 ? (
                  <EmptyState
                    icon={Truck}
                    title="لا توجد شحنات"
                    description="لم يتم تسجيل أي شحنات لهذا البراند حتى الآن."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                      <thead>
                        <tr className="bg-[#0D2748] text-white">
                          <th className="px-3 py-3 text-right">رقم الشحنة</th>

                          <th className="px-3 py-3">الكمية</th>

                          <th className="px-3 py-3">شركة الشحن</th>

                          <th className="px-3 py-3">الحالة</th>

                          <th className="px-3 py-3">الإجراء</th>
                        </tr>
                      </thead>

                      <tbody>
                        {shipmentRows.slice(0, 5).map((shipment) => (
                          <tr
                            key={shipment.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="px-3 py-3 font-black">
                              {shipment.shipment_number || "-"}
                            </td>

                            <td className="px-3 py-3 text-center font-black text-[#0D2748]">
                              {formatNumber(shipment.totalQuantity)}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {shipment.shipping_company || "-"}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <StatusBadge status={shipment.status} />
                            </td>

                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() => setSelectedShipment(shipment)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 inline-flex items-center justify-center"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                INDICATORS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <SectionTitle
                icon={BarChart3}
                title="خلاصة المؤشرات الرئيسية"
                subtitle="ملخص سريع لحالة الإنتاج والمخزون والشحن"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <StatCard
                  title="إجمالي المستلم"
                  value={totalReceived}
                  subtitle="الكمية المستلمة"
                  icon={CheckCircle2}
                  iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  title="إجمالي القطع الحالية"
                  value={totalProductionQuantity}
                  subtitle="إجمالي أوامر التشغيل"
                  icon={Package}
                  iconClass="bg-blue-50 text-blue-700"
                />

                <StatCard
                  title="إجمالي المشحون"
                  value={totalShipped}
                  subtitle="تم شحنها بالفعل"
                  icon={Truck}
                  iconClass="bg-orange-50 text-orange-600"
                />

                <StatCard
                  title="المتاح بالمخزن"
                  value={inventorySummary.available}
                  subtitle="جاهز للشحن"
                  icon={Boxes}
                  iconClass="bg-violet-50 text-violet-600"
                />

                <StatCard
                  title="القطع المحجوزة"
                  value={inventorySummary.reserved}
                  subtitle="كميات محجوزة"
                  icon={PackageCheck}
                  iconClass="bg-red-50 text-red-600"
                />

                <StatCard
                  title="عدد الشحنات"
                  value={shipmentCount}
                  subtitle={`${completedShipments} شحنة مكتملة`}
                  icon={Send}
                  iconClass="bg-cyan-50 text-cyan-600"
                />
              </div>
            </section>

            {/* =================================================
                BOTTOM ROW
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1fr_0.85fr] gap-5">
              {/* Shipment Path */}

              <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <SectionTitle
                  icon={Truck}
                  title="مسار الشحن"
                  subtitle="مراحل انتقال الطلب"
                />

                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0">
                      <FileText size={22} />
                    </div>

                    <div>
                      <div className="font-black text-sm">أمر التشغيل</div>

                      <div className="text-[11px] text-slate-400">
                        تم إصدار أمر التشغيل
                      </div>
                    </div>
                  </div>

                  <div className="mr-6 border-r-2 border-dashed border-slate-200 h-5" />

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <PackageCheck size={22} />
                    </div>

                    <div>
                      <div className="font-black text-sm">تم التجهيز</div>

                      <div className="text-[11px] text-slate-400">
                        الكميات وصلت للمخزن
                      </div>
                    </div>
                  </div>

                  <div className="mr-6 border-r-2 border-dashed border-slate-200 h-5" />

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Truck size={22} />
                    </div>

                    <div>
                      <div className="font-black text-sm">تم الشحن</div>

                      <div className="text-[11px] text-slate-400">
                        {formatNumber(totalShipped)} قطعة تم شحنها
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Shipments */}

              <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <SectionTitle
                  icon={ClipboardList}
                  title="آخر الشحنات"
                  subtitle="آخر عمليات الشحن المسجلة"
                />

                {shipmentRows.length === 0 ? (
                  <EmptyState
                    icon={Truck}
                    title="لا توجد شحنات"
                    description="ستظهر الشحنات هنا بمجرد تسجيلها."
                  />
                ) : (
                  <div className="space-y-2">
                    {shipmentRows.slice(0, 6).map((shipment) => (
                      <button
                        key={shipment.id}
                        onClick={() => setSelectedShipment(shipment)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition text-right"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0">
                            <Truck size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="font-black text-sm truncate">
                              {shipment.shipment_number || "شحنة"}
                            </div>

                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {formatDate(shipment.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusBadge status={shipment.status} />

                          <span className="text-[10px] font-bold text-slate-400">
                            {formatNumber(shipment.totalQuantity)} قطعة
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Alerts / Progress */}

              <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <SectionTitle
                  icon={AlertTriangle}
                  title="حالة الكولكشنات"
                  subtitle="نسبة الشحن لكل كولكشن"
                />

                {enrichedCollections.length === 0 ? (
                  <EmptyState
                    icon={Boxes}
                    title="لا توجد كولكشنات"
                    description="ستظهر الكولكشنات هنا عند إضافتها."
                  />
                ) : (
                  <div className="space-y-4">
                    {enrichedCollections.slice(0, 5).map((collection) => {
                      const progress = getCollectionProgress(collection);

                      return (
                        <div key={collection.id} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-black truncate">
                              {collection.name}
                            </span>

                            <span className="text-[11px] font-black text-[#0D2748]">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress >= 100
                                  ? "bg-emerald-500"
                                  : "bg-[#0D2748]"
                              }`}
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>
                              مشحون: {formatNumber(collection.shippedQuantity)}
                            </span>

                            <span>
                              متبقي:{" "}
                              {formatNumber(
                                Math.max(
                                  0,
                                  collection.totalQuantity -
                                    collection.shippedQuantity,
                                ),
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Footer */}

            <div className="flex justify-center pt-1">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 shadow-sm">
                <RefreshCw size={13} />
                جميع البيانات محدثة من قاعدة البيانات
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            COLLECTIONS PAGE
        ================================================= */}

        {activePage === "collections" && (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionTitle
                  icon={Boxes}
                  title="الكولكشنات"
                  subtitle="جميع الكولكشنات الخاصة بالبراند"
                />

                <div className="relative w-full md:w-80">
                  <Search
                    size={17}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="ابحث باسم الكولكشن أو الموديل..."
                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0D2748] outline-none text-sm"
                  />
                </div>
              </div>

              {filteredCollections.length === 0 ? (
                <EmptyState
                  icon={Boxes}
                  title="لا توجد كولكشنات"
                  description="لا توجد نتائج مطابقة للبحث."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredCollections.map((collection) => {
                    const progress = getCollectionProgress(collection);

                    const firstModel = collection.models?.[0];

                    return (
                      <div
                        key={collection.id}
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="h-44 bg-[#0D2748] relative overflow-hidden">
                          {firstModel?.image_url ? (
                            <img
                              src={firstModel.image_url}
                              alt=""
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Boxes size={60} className="text-white/20" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-[#071A31]/90 via-transparent to-transparent" />

                          <div className="absolute bottom-4 right-4 left-4">
                            <div className="text-white text-xl font-black">
                              {collection.name}
                            </div>

                            <div className="text-blue-100/80 text-xs mt-1">
                              {collection.models.length} موديل
                            </div>
                          </div>

                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1.5 rounded-lg bg-white/95 text-[#0D2748] text-[11px] font-black">
                              {progress}% مكتمل
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <div className="text-[10px] text-slate-400">
                                إجمالي القطع
                              </div>

                              <div className="font-black text-lg mt-1">
                                {formatNumber(collection.totalQuantity)}
                              </div>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3">
                              <div className="text-[10px] text-emerald-600">
                                تم الشحن
                              </div>

                              <div className="font-black text-lg text-emerald-700 mt-1">
                                {formatNumber(collection.shippedQuantity)}
                              </div>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3">
                              <div className="text-[10px] text-blue-600">
                                بالمخزن
                              </div>

                              <div className="font-black text-lg text-blue-700 mt-1">
                                {formatNumber(collection.availableQuantity)}
                              </div>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-3">
                              <div className="text-[10px] text-orange-600">
                                محجوز
                              </div>

                              <div className="font-black text-lg text-orange-700 mt-1">
                                {formatNumber(collection.reservedQuantity)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-slate-500">
                                نسبة الإنجاز
                              </span>

                              <span className="font-black text-[#0D2748]">
                                {progress}%
                              </span>
                            </div>

                            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#0D2748] rounded-full"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedCollection(collection)}
                            className="w-full mt-4 h-11 rounded-xl bg-[#0D2748] hover:bg-[#163A65] text-white font-black text-sm flex items-center justify-center gap-2 transition"
                          >
                            <Eye size={17} />
                            عرض تفاصيل الكولكشن
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* =================================================
            SHIPMENTS PAGE
        ================================================= */}

        {activePage === "shipments" && (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 md:p-7">
                <SectionTitle
                  icon={Truck}
                  title="سجل الشحنات"
                  subtitle="جميع الشحنات الخاصة بالبراند"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    title="إجمالي الشحنات"
                    value={shipmentCount}
                    icon={Truck}
                    iconClass="bg-blue-50 text-blue-600"
                  />

                  <StatCard
                    title="مكتملة"
                    value={completedShipments}
                    icon={CheckCircle2}
                    iconClass="bg-emerald-50 text-emerald-600"
                  />

                  <StatCard
                    title="قيد المتابعة"
                    value={pendingShipments}
                    icon={Clock3}
                    iconClass="bg-amber-50 text-amber-600"
                  />

                  <StatCard
                    title="إجمالي القطع المشحونة"
                    value={totalShipped}
                    icon={Package}
                    iconClass="bg-violet-50 text-violet-600"
                  />
                </div>
              </div>

              {shipmentRows.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="لا توجد شحنات"
                  description="لم يتم تسجيل شحنات لهذا البراند."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-sm">
                    <thead>
                      <tr className="bg-[#0D2748] text-white">
                        <th className="px-4 py-4 text-right">رقم الشحنة</th>

                        <th className="px-4 py-4">شركة الشحن</th>

                        <th className="px-4 py-4">رقم البوليصة</th>

                        <th className="px-4 py-4">عدد القطع</th>

                        <th className="px-4 py-4">تاريخ الشحن</th>

                        <th className="px-4 py-4">الحالة</th>

                        <th className="px-4 py-4">التفاصيل</th>
                      </tr>
                    </thead>

                    <tbody>
                      {shipmentRows.map((shipment) => (
                        <tr
                          key={shipment.id}
                          className="border-b border-slate-100 hover:bg-blue-50/30 transition"
                        >
                          <td className="px-4 py-4 font-black">
                            {shipment.shipment_number || "-"}
                          </td>

                          <td className="px-4 py-4 text-center">
                            {shipment.shipping_company || "-"}
                          </td>

                          <td className="px-4 py-4 text-center font-bold">
                            {shipment.tracking_number || "-"}
                          </td>

                          <td className="px-4 py-4 text-center font-black text-[#0D2748]">
                            {formatNumber(shipment.totalQuantity)}
                          </td>

                          <td className="px-4 py-4 text-center text-slate-500">
                            {formatDate(shipment.created_at)}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <StatusBadge status={shipment.status} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => setSelectedShipment(shipment)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black"
                            >
                              <Eye size={15} />
                              عرض التفاصيل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* =====================================================
          COLLECTION DETAILS MODAL
      ===================================================== */}

      <Modal
        open={Boolean(selectedCollection)}
        onClose={() => setSelectedCollection(null)}
        title={
          selectedCollection
            ? `تفاصيل الكولكشن: ${selectedCollection.name}`
            : "تفاصيل الكولكشن"
        }
        size="max-w-6xl"
      >
        {selectedCollection && (
          <div className="space-y-6">
            {/* Summary */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="عدد الموديلات"
                value={selectedCollection.models.length}
                icon={Shirt}
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                title="إجمالي القطع"
                value={selectedCollection.totalQuantity}
                icon={Package}
                iconClass="bg-violet-50 text-violet-600"
              />

              <StatCard
                title="تم الشحن"
                value={selectedCollection.shippedQuantity}
                icon={Truck}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                title="بالمخزن"
                value={selectedCollection.availableQuantity}
                icon={Warehouse}
                iconClass="bg-orange-50 text-orange-600"
              />
            </div>

            {/* Collection Info */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="text-xs text-slate-400">
                  تاريخ إنشاء الكولكشن
                </div>

                <div className="font-black mt-2">
                  {formatDate(selectedCollection.created_at)}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="text-xs text-slate-400">أمر التشغيل</div>

                <div className="font-black mt-2">
                  {selectedCollection.order?.order_number || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="text-xs text-slate-400">حالة الإنتاج</div>

                <div className="mt-2">
                  <StatusBadge status={selectedCollection.order?.status} />
                </div>
              </div>
            </div>

            {/* Progress */}

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black">نسبة إنجاز الكولكشن</h3>

                  <p className="text-xs text-slate-400 mt-1">
                    بناءً على الكميات التي تم شحنها
                  </p>
                </div>

                <span className="text-2xl font-black text-[#0D2748]">
                  {getCollectionProgress(selectedCollection)}%
                </span>
              </div>

              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0D2748]"
                  style={{
                    width: `${getCollectionProgress(selectedCollection)}%`,
                  }}
                />
              </div>
            </div>

            {/* Models */}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shirt size={19} className="text-[#0D2748]" />

                <h3 className="font-black text-lg">تفاصيل الموديلات</h3>
              </div>

              {selectedCollection.models.length === 0 ? (
                <EmptyState
                  icon={Shirt}
                  title="لا توجد موديلات"
                  description="لا توجد موديلات مرتبطة بهذا الكولكشن."
                />
              ) : (
                <div className="space-y-4">
                  {selectedCollection.models.map((model) => {
                    const itemRows = selectedCollection.orderItems.filter(
                      (item) => item.model_id === model.id,
                    );

                    const inventoryForModel = inventory.filter(
                      (item) => item.model_id === model.id,
                    );

                    const modelAvailable = inventoryForModel.reduce(
                      (sum, item) => sum + (Number(item.available_qty) || 0),
                      0,
                    );

                    const modelShipped = inventoryForModel.reduce(
                      (sum, item) => sum + (Number(item.shipped_qty) || 0),
                      0,
                    );

                    const modelTotal = itemRows.reduce(
                      (sum, item) => sum + (Number(item.total_quantity) || 0),
                      0,
                    );

                    const colors = [
                      ...new Set(
                        itemRows.map((item) => item.color).filter(Boolean),
                      ),
                    ];

                    const parts = [
                      ...new Set(
                        itemRows.map((item) => item.part).filter(Boolean),
                      ),
                    ];

                    return (
                      <div
                        key={model.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden"
                      >
                        <div className="bg-slate-50 p-4 flex flex-col md:flex-row gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                            {model.image_url ? (
                              <img
                                src={model.image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Shirt size={28} className="text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-lg">
                                {model.name || "موديل غير محدد"}
                              </h4>

                              {model.model_number && (
                                <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500">
                                  {model.model_number}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                              <div>
                                <div className="text-[10px] text-slate-400">
                                  إجمالي القطع
                                </div>
                                <div className="font-black">
                                  {formatNumber(modelTotal)}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] text-slate-400">
                                  بالمخزن
                                </div>
                                <div className="font-black text-blue-700">
                                  {formatNumber(modelAvailable)}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] text-slate-400">
                                  تم الشحن
                                </div>
                                <div className="font-black text-emerald-700">
                                  {formatNumber(modelShipped)}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] text-slate-400">
                                  عدد السريهات
                                </div>
                                <div className="font-black text-violet-700">
                                  {itemRows.length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2">
                                <Palette size={15} />
                                الألوان
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {colors.length > 0 ? (
                                  colors.map((color) => (
                                    <span
                                      key={color}
                                      className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold"
                                    >
                                      {color}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    غير محدد
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2">
                                <Layers3 size={15} />
                                الأجزاء
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {parts.length > 0 ? (
                                  parts.map((part) => (
                                    <span
                                      key={part}
                                      className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold"
                                    >
                                      {part}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    غير محدد
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 p-3">
                              <div className="flex items-center gap-2 text-xs font-black text-slate-500 mb-2">
                                <Ruler size={15} />
                                الكميات
                              </div>

                              <div className="text-xs text-slate-500">
                                إجمالي:{" "}
                                <strong>{formatNumber(modelTotal)}</strong>
                              </div>

                              <div className="text-xs text-blue-600 mt-1">
                                بالمخزن:{" "}
                                <strong>{formatNumber(modelAvailable)}</strong>
                              </div>

                              <div className="text-xs text-emerald-600 mt-1">
                                مشحون:{" "}
                                <strong>{formatNumber(modelShipped)}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Model Sizes Table */}

                          {inventoryForModel.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-[#0D2748] text-white">
                                    <th className="px-3 py-2 text-right">
                                      اللون
                                    </th>

                                    <th className="px-3 py-2">المقاس</th>

                                    <th className="px-3 py-2">المستلم</th>

                                    <th className="px-3 py-2">المتاح</th>

                                    <th className="px-3 py-2">المحجوز</th>

                                    <th className="px-3 py-2">المشحون</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {inventoryForModel.map((row, index) => (
                                    <tr
                                      key={`${model.id}-${index}`}
                                      className="border-b border-slate-100"
                                    >
                                      <td className="px-3 py-2 font-bold">
                                        {row.color || "-"}
                                      </td>

                                      <td className="px-3 py-2 text-center font-black">
                                        {row.size || "-"}
                                      </td>

                                      <td className="px-3 py-2 text-center">
                                        {formatNumber(row.received_qty)}
                                      </td>

                                      <td className="px-3 py-2 text-center text-blue-700 font-black">
                                        {formatNumber(row.available_qty)}
                                      </td>

                                      <td className="px-3 py-2 text-center text-orange-600 font-black">
                                        {formatNumber(row.reserved_qty)}
                                      </td>

                                      <td className="px-3 py-2 text-center text-emerald-600 font-black">
                                        {formatNumber(row.shipped_qty)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          SHIPMENT DETAILS MODAL
      ===================================================== */}

      <Modal
        open={Boolean(selectedShipment)}
        onClose={() => setSelectedShipment(null)}
        title={
          selectedShipment
            ? `تفاصيل الشحنة: ${selectedShipment.shipment_number || ""}`
            : "تفاصيل الشحنة"
        }
        size="max-w-5xl"
      >
        {selectedShipment && (
          <div className="space-y-6">
            {/* Shipment Header */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Hash size={14} />
                  رقم الشحنة
                </div>

                <div className="font-black mt-2">
                  {selectedShipment.shipment_number || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Truck size={14} />
                  شركة الشحن
                </div>

                <div className="font-black mt-2">
                  {selectedShipment.shipping_company || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={14} />
                  رقم البوليصة
                </div>

                <div className="font-black mt-2">
                  {selectedShipment.tracking_number || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  التاريخ
                </div>

                <div className="font-black mt-2">
                  {formatDate(selectedShipment.created_at)}
                </div>
              </div>
            </div>

            {/* Status */}

            <div className="rounded-2xl bg-[#F7F9FC] border border-slate-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black">حالة الشحنة</h3>

                <p className="text-xs text-slate-400 mt-1">
                  آخر حالة مسجلة للشحنة
                </p>
              </div>

              <StatusBadge status={selectedShipment.status} />
            </div>

            {/* Customer */}

            {selectedShipment.customers && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-[#0D2748]" />

                  <h3 className="font-black">بيانات العميل</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">اسم العميل</div>

                    <div className="font-black mt-1">
                      {selectedShipment.customers.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">رقم الهاتف</div>

                    <div className="font-black mt-1">
                      {selectedShipment.customers.phone}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipment Items */}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package size={19} className="text-[#0D2748]" />

                <h3 className="font-black text-lg">تفاصيل محتويات الشحنة</h3>
              </div>

              {!selectedShipment.shipment_items ||
              selectedShipment.shipment_items.length === 0 ? (
                <EmptyState
                  icon={PackageX}
                  title="لا توجد تفاصيل"
                  description="لا توجد عناصر مرتبطة بهذه الشحنة."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[#0D2748] text-white">
                        <th className="px-4 py-3 text-right">الموديل</th>

                        <th className="px-4 py-3">الكود</th>

                        <th className="px-4 py-3">اللون</th>

                        <th className="px-4 py-3">المقاس</th>

                        <th className="px-4 py-3">الكمية</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedShipment.shipment_items.map((item, index) => {
                        const inventoryItem = item.inventory;

                        const model = inventoryItem?.models;

                        return (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-black">
                              {model?.name || "غير محدد"}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {model?.model_number || "-"}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {inventoryItem?.color || "-"}
                            </td>

                            <td className="px-4 py-3 text-center font-bold">
                              {inventoryItem?.size || "-"}
                            </td>

                            <td className="px-4 py-3 text-center font-black text-[#0D2748]">
                              {formatNumber(item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-blue-50 font-black">
                        <td colSpan="4" className="px-4 py-3 text-right">
                          الإجمالي
                        </td>

                        <td className="px-4 py-3 text-center text-[#0D2748]">
                          {formatNumber(
                            selectedShipment.shipment_items.reduce(
                              (sum, item) => sum + (Number(item.quantity) || 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientDashboard;
