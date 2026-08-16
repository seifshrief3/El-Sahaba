import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabase";
import { useAuth } from "../contexts/AuthContext";

import {
  LogOut,
  Package,
  Activity,
  Truck,
  History,
  ClipboardCheck,
  Home,
  Layers,
  Scissors,
  Shirt,
  PackageOpen,
  Palette,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  X,
  Eye,
  CalendarDays,
  Boxes,
  AlertCircle,
  Factory,
  BarChart3,
  Menu,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import ClientPrintTemplate from "../components/ClientPrintTemplate";
import logo from "../assets/logo.jpeg";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const ClientDashboard = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState("overview");

  const [clientBrand, setClientBrand] = useState(null);
  const [expandedShipment, setExpandedShipment] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState(null);

  const [stats, setStats] = useState({
    collectionsCount: 0,
    modelsCount: 0,
    activeOrdersCount: 0,
    totalInventory: 0,
    shippedPieces: 0,
    reservedPieces: 0,
    receivedPieces: 0,
    totalShipments: 0,
  });

  const [recentCollections, setRecentCollections] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  // Production stages
  const [productionStages, setProductionStages] = useState([]);
  const [orderTracking, setOrderTracking] = useState([]);

  // =========================================================
  // PRINT
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
  // HELPERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

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

  const getTrackingStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "مكتملة";

      case "in_progress":
        return "قيد التنفيذ";

      case "issue":
        return "يوجد مشكلة";

      case "pending":
        return "لم تبدأ";

      default:
        return status || "—";
    }
  };

  const getTrackingStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";

      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "issue":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-slate-100 text-slate-500";

      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  // =========================================================
  // GET CURRENT STAGE FOR ORDER
  // =========================================================

  const getOrderStageInfo = (productionOrderId) => {
    if (!productionOrderId || !productionStages.length) {
      return {
        currentStage: null,
        currentTracking: null,
        progress: 0,
        completedCount: 0,
        totalStages: productionStages.length,
      };
    }

    const trackingForOrder = orderTracking
      .filter((item) => item.production_order_id === productionOrderId)
      .sort(
        (a, b) =>
          Number(a.production_stages?.step_order || 0) -
          Number(b.production_stages?.step_order || 0),
      );

    if (!trackingForOrder.length) {
      return {
        currentStage: null,
        currentTracking: null,
        progress: 0,
        completedCount: 0,
        totalStages: productionStages.length,
      };
    }

    const completedStages = trackingForOrder.filter(
      (item) => item.status === "completed",
    );

    const issueStage = trackingForOrder.find((item) => item.status === "issue");

    const inProgressStage = trackingForOrder.find(
      (item) => item.status === "in_progress",
    );

    let currentTracking = null;

    if (issueStage) {
      currentTracking = issueStage;
    } else if (inProgressStage) {
      currentTracking = inProgressStage;
    } else if (completedStages.length > 0) {
      currentTracking = completedStages[completedStages.length - 1];
    } else {
      currentTracking = trackingForOrder[0];
    }

    const completedCount = completedStages.length;

    let progress = 0;

    if (productionStages.length > 0) {
      progress = Math.round((completedCount / productionStages.length) * 100);

      if (inProgressStage) {
        progress = Math.round(
          ((completedCount + 0.5) / productionStages.length) * 100,
        );
      }
    }

    if (
      trackingForOrder.length > 0 &&
      trackingForOrder.every((item) => item.status === "completed")
    ) {
      progress = 100;
    }

    return {
      currentStage: currentTracking?.production_stages || null,
      currentTracking,
      progress: Math.min(100, Math.max(0, progress)),
      completedCount,
      totalStages: productionStages.length,
      tracking: trackingForOrder,
    };
  };

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchClientData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setClientBrand(null);
        return;
      }

      // =====================================================
      // 1. BRAND
      // =====================================================

      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("*")
        .eq("client_portal_user_id", user.id)
        .maybeSingle();

      if (brandError || !brandData) {
        console.error("Brand error:", brandError);
        setClientBrand(null);
        return;
      }

      setClientBrand(brandData);

      const brandId = brandData.id;

      // =====================================================
      // 2. PRODUCTION STAGES
      // =====================================================

      const { data: stagesData, error: stagesError } = await supabase
        .from("production_stages")
        .select("id, name, step_order")
        .order("step_order", { ascending: true });

      if (stagesError) {
        console.error("Production stages error:", stagesError);
      }

      const safeStages = stagesData || [];

      setProductionStages(safeStages);

      // =====================================================
      // 3. COLLECTIONS + ORDERS + MODELS
      // =====================================================

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select(
          `
              id,
              name,
              customer_approval,
              created_at,
              production_orders (
                id,
                status,
                total_quantity,
                order_number
              ),
              models (
                id,
                name,
                model_number,
                image_url
              )
            `,
        )
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        console.error("Collections error:", collectionsError);
      }

      const safeCollections = collectionsData || [];

      const modelIds = [];
      const productionOrderIds = [];

      safeCollections.forEach((collection) => {
        if (Array.isArray(collection.models)) {
          collection.models.forEach((model) => {
            modelIds.push(model.id);
          });
        }

        if (Array.isArray(collection.production_orders)) {
          collection.production_orders.forEach((order) => {
            productionOrderIds.push(order.id);
          });
        }
      });

      // =====================================================
      // 4. INVENTORY
      // =====================================================

      let inventoryData = [];

      if (modelIds.length > 0) {
        const { data: invData, error: inventoryError } = await supabase
          .from("inventory")
          .select(
            `
              id,
              model_id,
              available_qty,
              shipped_qty,
              reserved_qty,
              received_qty,
              size,
              color,
              last_updated
            `,
          )
          .in("model_id", modelIds);

        if (inventoryError) {
          console.error("Inventory error:", inventoryError);
        }

        inventoryData = invData || [];
      }

      // =====================================================
      // 5. SHIPMENTS
      // =====================================================

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
            brand_id,
            customers (
              name,
              phone
            ),
            shipment_items (
              quantity,
              inventory (
                id,
                size,
                color,
                model_id,
                models (
                  id,
                  name,
                  model_number
                )
              )
            )
          `,
        )
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (shipmentsError) {
        console.error("Shipments error:", shipmentsError);
      }

      const formattedShipments =
        shipmentsData?.map((shipment) => {
          const totalPieces =
            shipment.shipment_items?.reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0,
            ) || 0;

          return {
            ...shipment,
            total_pieces: totalPieces,
          };
        }) || [];

      setShipments(formattedShipments);

      // =====================================================
      // 6. PRODUCTION DELIVERY HISTORY
      // =====================================================

      let deliveryHistory = [];

      if (productionOrderIds.length > 0) {
        const { data: deliveriesData, error: deliveriesError } = await supabase
          .from("production_deliveries")
          .select(
            `
                delivery_number,
                status,
                updated_at,
                production_order_id,
                production_orders (
                  id,
                  collections (
                    id,
                    name
                  )
                ),
                production_delivery_items (
                  delivered_qty
                )
              `,
          )
          .in("production_order_id", productionOrderIds)
          .eq("status", "completed")
          .order("updated_at", { ascending: false });

        if (deliveriesError) {
          console.error("Deliveries error:", deliveriesError);
        }

        if (deliveriesData) {
          deliveryHistory = deliveriesData;
        }
      }

      setInventoryHistory(deliveryHistory);

      // =====================================================
      // 7. ORDER TRACKING
      // =====================================================

      let trackingData = [];

      if (productionOrderIds.length > 0) {
        const { data: trackingResult, error: trackingError } = await supabase
          .from("order_tracking")
          .select(
            `
                id,
                production_order_id,
                stage_id,
                status,
                issue_notes,
                issue_image_url,
                started_at,
                completed_at,
                created_at,
                updated_at,
                production_stages (
                  id,
                  name,
                  step_order
                )
              `,
          )
          .in("production_order_id", productionOrderIds);

        if (trackingError) {
          console.error("Order tracking error:", trackingError);
        }

        trackingData = trackingResult || [];
      }

      setOrderTracking(trackingData);

      // =====================================================
      // 8. INVENTORY CALCULATIONS
      // =====================================================

      const inventoryByModel = {};
      const sizesByModel = {};

      let totalPieces = 0;
      let totalShipped = 0;
      let totalReserved = 0;
      let totalReceived = 0;

      inventoryData.forEach((item) => {
        const modelId = item.model_id;

        const available = Number(item.available_qty || 0);
        const shipped = Number(item.shipped_qty || 0);
        const reserved = Number(item.reserved_qty || 0);
        const received = Number(item.received_qty || 0);

        if (!inventoryByModel[modelId]) {
          inventoryByModel[modelId] = {
            available: 0,
            reserved: 0,
            received: 0,
            shipped: 0,
          };
        }

        if (!sizesByModel[modelId]) {
          sizesByModel[modelId] = [];
        }

        inventoryByModel[modelId].available += available;
        inventoryByModel[modelId].reserved += reserved;
        inventoryByModel[modelId].received += received;
        inventoryByModel[modelId].shipped += shipped;

        totalPieces += available;
        totalShipped += shipped;
        totalReserved += reserved;
        totalReceived += received;

        sizesByModel[modelId].push({
          id: item.id,
          size: item.size,
          color: item.color,
          available,
          reserved,
          received,
          shipped,
          lastUpdated: item.last_updated ? formatDate(item.last_updated) : "—",
        });
      });

      // =====================================================
      // 9. FORMAT COLLECTIONS
      // =====================================================

      let activeOrders = 0;
      let totalModels = 0;

      const extractedModels = [];

      const formattedCollections = safeCollections.map((collection) => {
        const orders = Array.isArray(collection.production_orders)
          ? collection.production_orders
          : [];

        const activeOrder =
          orders.find(
            (order) =>
              order.status &&
              !["completed", "cancelled", "canceled"].includes(order.status),
          ) || orders[0];

        const orderStatus = activeOrder?.status || "no_order";

        const orderNumber = activeOrder?.order_number || "—";

        const totalQty = Number(activeOrder?.total_quantity || 0);

        const modelsInCollection = Array.isArray(collection.models)
          ? collection.models
          : [];

        totalModels += modelsInCollection.length;

        if (
          orderStatus &&
          !["completed", "cancelled", "canceled", "no_order"].includes(
            orderStatus,
          )
        ) {
          activeOrders++;
        }

        const stageInfo = getOrderStageInfo(activeOrder?.id);

        modelsInCollection.forEach((model) => {
          extractedModels.push({
            ...model,
            collectionId: collection.id,
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

          qty: totalQty,

          orderId: activeOrder?.id || null,
          orderNumber,

          orderStatus,

          modelsCount: modelsInCollection.length,

          progress: stageInfo.progress,

          currentStage: stageInfo.currentStage,
          currentTracking: stageInfo.currentTracking,

          completedStages: stageInfo.completedCount,
          totalStages: stageInfo.totalStages,

          tracking: stageInfo.tracking || [],

          date: formatDate(collection.created_at),

          createdAt: collection.created_at,

          startDate: activeOrder?.start_date || null,
          deliveryDate: activeOrder?.delivery_date || null,

          customerApproval: collection.customer_approval || "not_sent",

          models: modelsInCollection,

          orders,
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
        receivedPieces: totalReceived,
        totalShipments: formattedShipments.length,
      });
    } catch (error) {
      console.error("Error fetching client dashboard data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchClientData(false);
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchClientData(true);
  };

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
  // CHART DATA
  // =========================================================

  const collectionStatusData = useMemo(() => {
    let completed = 0;
    let active = 0;
    let pending = 0;
    let issue = 0;

    recentCollections.forEach((collection) => {
      if (collection.orderStatus === "completed") {
        completed++;
        return;
      }

      if (collection.currentTracking?.status === "issue") {
        issue++;
        return;
      }

      if (
        collection.orderStatus === "pending" ||
        collection.orderStatus === "no_order"
      ) {
        pending++;
        return;
      }

      active++;
    });

    return [
      {
        name: "مكتمل",
        value: completed,
      },
      {
        name: "قيد التنفيذ",
        value: active,
      },
      {
        name: "في الانتظار",
        value: pending,
      },
      {
        name: "يوجد مشكلة",
        value: issue,
      },
    ].filter((item) => item.value > 0);
  }, [recentCollections]);

  const stageChartData = useMemo(() => {
    return productionStages.map((stage) => {
      const count = orderTracking.filter(
        (tracking) =>
          tracking.stage_id === stage.id && tracking.status === "in_progress",
      ).length;

      const completed = orderTracking.filter(
        (tracking) =>
          tracking.stage_id === stage.id && tracking.status === "completed",
      ).length;

      const issues = orderTracking.filter(
        (tracking) =>
          tracking.stage_id === stage.id && tracking.status === "issue",
      ).length;

      return {
        name:
          stage.name.length > 16
            ? `${stage.name.substring(0, 16)}...`
            : stage.name,

        fullName: stage.name,

        قيد_التنفيذ: count,
        مكتمل: completed,
        مشكلة: issues,
      };
    });
  }, [productionStages, orderTracking]);

  const inventoryChartData = useMemo(() => {
    return recentCollections
      .map((collection) => {
        const collectionModels = allModels.filter(
          (model) => model.collectionId === collection.id,
        );

        const available = collectionModels.reduce(
          (sum, model) => sum + Number(model.stockInfo.available || 0),
          0,
        );

        const reserved = collectionModels.reduce(
          (sum, model) => sum + Number(model.stockInfo.reserved || 0),
          0,
        );

        const shipped = collectionModels.reduce(
          (sum, model) => sum + Number(model.stockInfo.shipped || 0),
          0,
        );

        return {
          name:
            collection.name.length > 12
              ? `${collection.name.substring(0, 12)}...`
              : collection.name,

          fullName: collection.name,

          متاح: available,
          محجوز: reserved,
          مشحون: shipped,
        };
      })
      .slice(0, 8);
  }, [recentCollections, allModels]);

  // =========================================================
  // COLORS
  // =========================================================

  const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  // =========================================================
  // ACTIVE ORDERS
  // =========================================================

  const activeCollections = useMemo(() => {
    return recentCollections
      .filter(
        (collection) =>
          collection.orderStatus !== "completed" &&
          collection.orderStatus !== "cancelled" &&
          collection.orderStatus !== "canceled" &&
          collection.orderStatus !== "no_order",
      )
      .slice(0, 6);
  }, [recentCollections]);

  // =========================================================
  // TOP COLLECTIONS
  // =========================================================

  const topCollections = useMemo(() => {
    return [...recentCollections]
      .sort((a, b) => Number(b.qty || 0) - Number(a.qty || 0))
      .slice(0, 5);
  }, [recentCollections]);

  // =========================================================
  // SELECTED COLLECTION DETAILS
  // =========================================================

  const selectedCollectionModels = useMemo(() => {
    if (!selectedCollection) return [];

    return allModels.filter(
      (model) => model.collectionId === selectedCollection.id,
    );
  }, [selectedCollection, allModels]);

  const selectedCollectionShipments = useMemo(() => {
    if (!selectedCollection) return [];

    const collectionModelIds = new Set(
      selectedCollectionModels.map((model) => model.id),
    );

    return shipments.filter((shipment) =>
      shipment.shipment_items?.some((item) =>
        collectionModelIds.has(item.inventory?.model_id),
      ),
    );
  }, [selectedCollection, selectedCollectionModels, shipments]);

  const selectedCollectionInventory = useMemo(() => {
    return selectedCollectionModels.reduce(
      (acc, model) => {
        acc.available += Number(model.stockInfo.available || 0);
        acc.reserved += Number(model.stockInfo.reserved || 0);
        acc.received += Number(model.stockInfo.received || 0);
        acc.shipped += Number(model.stockInfo.shipped || 0);

        return acc;
      },
      {
        available: 0,
        reserved: 0,
        received: 0,
        shipped: 0,
      },
    );
  }, [selectedCollectionModels]);

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-arabic bg-slate-50"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="Factory"
            className="w-20 h-20 object-contain rounded-2xl"
          />

          <div className="text-[#1a365d] font-bold text-xl animate-pulse">
            جاري تحميل بيانات البوابة...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO BRAND
  // =========================================================

  if (!clientBrand) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-arabic bg-slate-50 gap-4"
        dir="rtl"
      >
        <img
          src={logo}
          alt="Factory"
          className="w-24 h-24 object-contain rounded-2xl"
        />

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
  // SIDEBAR
  // =========================================================

  const sidebarLinks = [
    {
      id: "overview",
      name: "الرئيسية",
      icon: Home,
    },
    {
      id: "inventory",
      name: "الكولكشنات والمخزون",
      icon: Layers,
    },
    {
      id: "shipments",
      name: "سجل الشحن",
      icon: Truck,
    },
    {
      id: "history",
      name: "سجل الاستلامات",
      icon: History,
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="flex h-screen bg-[#f3f4f6] font-arabic overflow-hidden"
      dir="rtl"
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-red-500 mb-1 flex items-center gap-2">
            <Shirt size={28} />
            الصحابة
          </div>

          <p className="text-[10px] text-slate-400">لتصنيع وتصدير الملابس</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {sidebarLinks.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white font-bold shadow-md"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ===================== MOBILE SIDEBAR OVERLAY ===================== */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ===================== MOBILE SIDEBAR ===================== */}
      <aside
        className={`
    fixed top-0 right-0 bottom-0
    w-72 max-w-[85vw]
    bg-[#0f172a]
    text-white
    z-50
    flex flex-col
    shadow-2xl
    transform transition-transform duration-300 ease-in-out
    lg:hidden
    ${isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"}
  `}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-red-500 flex items-center gap-2">
              <Shirt size={24} />
              الصحابة
            </div>

            <p className="text-[9px] text-slate-400 mt-1">
              لتصنيع وتصدير الملابس
            </p>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 overflow-y-auto py-5">
          <ul className="space-y-2 px-3">
            {sidebarLinks.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white font-bold shadow-md"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                  }`}
                >
                  <item.icon size={19} />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-3 rounded-xl font-bold transition"
          >
            <LogOut size={18} />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}

        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 border-b border-slate-200">
          {/* Mobile Menu Button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              aria-label="فتح القائمة"
            >
              <Menu size={22} />
            </button>

            <h1 className="text-base sm:text-xl font-bold text-[#0f172a]">
              بوابة عملاء
              <span className="hidden sm:inline">
                {" | "}
                {clientBrand.name_ar}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0f172a]">
                  مرحباً، {clientBrand.name_ar}
                </p>
              </div>
            </div>

            <div className="border-r border-slate-200 pr-3 sm:pr-6">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 text-xs sm:text-sm font-bold transition"
              >
                <LogOut size={16} />

                <span className="hidden sm:inline">تسجيل خروج</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-10">
            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* HERO */}

                <div className="bg-gradient-to-l from-[#0f172a] to-[#1e3a5f] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-bold mb-2">
                      لوحة متابعة الإنتاج
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-black">
                      أهلاً بك، {clientBrand.name_ar}
                    </h2>

                    <p className="text-slate-300 text-sm mt-2 max-w-xl">
                      تابع حالة الكولكشنات، مراحل الإنتاج، المخزون والشحنات من
                      مكان واحد.
                    </p>
                  </div>

                  <div className="absolute -left-10 -bottom-20 w-60 h-60 bg-blue-500/10 rounded-full" />

                  <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full" />
                </div>

                {/* KPI CARDS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  {/* Collections */}

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">
                          إجمالي الكولكشنات
                        </p>

                        <h3 className="text-3xl font-black text-[#0f172a]">
                          {stats.collectionsCount}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Active */}

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">
                          قيد التنفيذ
                        </p>

                        <h3 className="text-3xl font-black text-[#0f172a]">
                          {stats.activeOrdersCount}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Activity size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">
                          القطع المتاحة
                        </p>

                        <h3 className="text-3xl font-black text-[#0f172a]">
                          {stats.totalInventory.toLocaleString("en-US")}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Received */}

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">
                          إجمالي المستلم
                        </p>

                        <h3 className="text-3xl font-black text-[#0f172a]">
                          {stats.receivedPieces.toLocaleString("en-US")}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <PackageOpen size={22} />
                      </div>
                    </div>
                  </div>

                  {/* Shipments */}

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">
                          الشحنات
                        </p>

                        <h3 className="text-3xl font-black text-[#0f172a]">
                          {stats.totalShipments}
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Truck size={22} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHARTS */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* COLLECTION STATUS */}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-black text-[#0f172a]">
                          حالة الكولكشنات
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          توزيع الكولكشنات حسب حالتها الحالية
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <BarChart3 size={19} />
                      </div>
                    </div>

                    {collectionStatusData.length > 0 ? (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={collectionStatusData}
                              cx="50%"
                              cy="45%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {collectionStatusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={chartColors[index % chartColors.length]}
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              formatter={(value) => [
                                `${value} كولكشن`,
                                "العدد",
                              ]}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                fontFamily: "inherit",
                              }}
                            />

                            <Legend verticalAlign="bottom" iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-slate-400 font-bold">
                        لا توجد بيانات كافية
                      </div>
                    )}
                  </div>

                  {/* PRODUCTION STAGES */}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-black text-[#0f172a]">
                          مراحل الإنتاج
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          الحالة الفعلية للأوردرات داخل مراحل الإنتاج
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Activity size={19} />
                      </div>
                    </div>

                    {stageChartData.length > 0 ? (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stageChartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />

                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 10,
                              }}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              height={55}
                            />

                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fontSize: 10,
                              }}
                            />

                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                fontFamily: "inherit",
                              }}
                              formatter={(value, name) => [value, name]}
                            />

                            <Legend />

                            <Bar
                              dataKey="قيد_التنفيذ"
                              name="قيد التنفيذ"
                              fill="#3b82f6"
                              radius={[5, 5, 0, 0]}
                            />

                            <Bar
                              dataKey="مكتمل"
                              name="مكتمل"
                              fill="#10b981"
                              radius={[5, 5, 0, 0]}
                            />

                            <Bar
                              dataKey="مشكلة"
                              name="مشكلة"
                              fill="#ef4444"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-slate-400 font-bold">
                        لا توجد مراحل إنتاج مسجلة
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE PRODUCTION */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-black text-[#0f172a]">
                        متابعة الإنتاج
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        آخر حالة فعلية لكل كولكشن قيد التنفيذ
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("inventory")}
                      className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      عرض كل الكولكشنات
                      <ArrowUpRight size={14} />
                    </button>
                  </div>

                  {activeCollections.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {activeCollections.map((collection) => (
                        <div
                          key={collection.id}
                          className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-black text-slate-800">
                                {collection.name}
                              </h4>

                              <p className="text-xs text-slate-400 mt-1">
                                الأوردر: {collection.orderNumber}
                              </p>
                            </div>

                            <span className="font-black text-blue-600 text-lg">
                              {collection.progress}%
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                                style={{
                                  width: `${collection.progress}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-5">
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 font-bold">
                                الموديلات
                              </p>

                              <p className="font-black text-slate-800 mt-1">
                                {collection.modelsCount}
                              </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 font-bold">
                                الكمية
                              </p>

                              <p className="font-black text-slate-800 mt-1">
                                {Number(collection.qty || 0).toLocaleString(
                                  "en-US",
                                )}
                              </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-[10px] text-slate-400 font-bold">
                                المرحلة
                              </p>

                              <p className="font-black text-blue-600 mt-1 text-xs truncate">
                                {collection.currentStage?.name || "لم تبدأ"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {collection.currentTracking?.status ===
                              "issue" ? (
                                <AlertCircle
                                  size={15}
                                  className="text-red-500"
                                />
                              ) : collection.currentTracking?.status ===
                                "in_progress" ? (
                                <Activity size={15} className="text-blue-500" />
                              ) : (
                                <CheckCircle2
                                  size={15}
                                  className="text-emerald-500"
                                />
                              )}

                              <span>
                                {collection.currentStage?.name || "لم تبدأ"}
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedCollection(collection)}
                              className="text-blue-600 text-xs font-bold hover:underline"
                            >
                              عرض التفاصيل
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-400 font-bold">
                      لا توجد كولكشنات قيد التنفيذ حالياً
                    </div>
                  )}
                </div>

                {/* BOTTOM CHARTS */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* INVENTORY CHART */}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="mb-5">
                      <h3 className="font-black text-[#0f172a]">
                        المخزون حسب الكولكشن
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        مقارنة المتاح والمحجوز والمشحون
                      </p>
                    </div>

                    {inventoryChartData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={inventoryChartData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />

                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 10,
                              }}
                            />

                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fontSize: 10,
                              }}
                            />

                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                fontFamily: "inherit",
                              }}
                            />

                            <Legend />

                            <Bar
                              dataKey="متاح"
                              fill="#10b981"
                              radius={[5, 5, 0, 0]}
                            />

                            <Bar
                              dataKey="محجوز"
                              fill="#f59e0b"
                              radius={[5, 5, 0, 0]}
                            />

                            <Bar
                              dataKey="مشحون"
                              fill="#64748b"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400 font-bold">
                        لا توجد بيانات مخزون
                      </div>
                    )}
                  </div>

                  {/* TOP COLLECTIONS */}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="mb-5">
                      <h3 className="font-black text-[#0f172a]">
                        أكبر الكولكشنات من حيث الكمية
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        الكولكشنات الأعلى في إجمالي كمية الأوردر
                      </p>
                    </div>

                    <div className="space-y-3">
                      {topCollections.length > 0 ? (
                        topCollections.map((collection, index) => (
                          <div
                            key={collection.id}
                            className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-100"
                          >
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-black text-slate-500 border border-slate-200">
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-700 truncate">
                                {collection.name}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-1">
                                {collection.modelsCount} موديل
                              </p>
                            </div>

                            <div className="text-left">
                              <p className="font-black text-[#0f172a]">
                                {Number(collection.qty || 0).toLocaleString(
                                  "en-US",
                                )}
                              </p>

                              <p className="text-[9px] text-slate-400">قطعة</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-8">
                          لا توجد بيانات
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RECENT SHIPMENTS */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-black text-[#0f172a]">
                        أحدث الشحنات
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        آخر الشحنات المسجلة على حسابك
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("shipments")}
                      className="text-blue-600 text-xs font-bold hover:underline"
                    >
                      عرض الكل
                    </button>
                  </div>

                  {shipments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {shipments.slice(0, 4).map((shipment) => (
                        <div
                          key={shipment.id}
                          className="border border-slate-200 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-black text-sm text-[#0f172a]">
                                {shipment.shipment_number}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-1">
                                {formatDate(shipment.created_at)}
                              </p>
                            </div>

                            <Truck size={18} className="text-slate-400" />
                          </div>

                          <div className="mt-4">
                            <p className="text-xl font-black text-slate-800">
                              {shipment.total_pieces}
                            </p>

                            <p className="text-[10px] text-slate-400">قطعة</p>
                          </div>

                          <span
                            className={`inline-block mt-3 px-2 py-1 rounded text-[10px] font-bold ${getShipmentStatusClass(
                              shipment.status,
                            )}`}
                          >
                            {getShipmentStatusLabel(shipment.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8 font-bold">
                      لا توجد شحنات
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                COLLECTIONS + INVENTORY
            ================================================= */}

            {activeTab === "inventory" && (
              <div className="space-y-6 animate-fade-in">
                {/* HEADER */}

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1a365d]">
                      الكولكشنات والمخزون
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      عرض ملخص كل كولكشن والمخزون المرتبط به
                    </p>
                  </div>

                  <button
                    onClick={handlePrintReport}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm"
                  >
                    <Printer size={16} />
                    حفظ التقرير
                  </button>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      الكولكشنات
                    </p>

                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {stats.collectionsCount}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      الموديلات
                    </p>

                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {stats.modelsCount}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      المتاح للبيع
                    </p>

                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {stats.totalInventory.toLocaleString("en-US")}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-400 font-bold">المحجوز</p>

                    <p className="text-2xl font-black text-orange-500 mt-1">
                      {stats.reservedPieces.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                {/* COLLECTION CARDS */}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recentCollections.length > 0 ? (
                    recentCollections.map((collection) => {
                      const collectionModels = allModels.filter(
                        (model) => model.collectionId === collection.id,
                      );

                      const inventory = collectionModels.reduce(
                        (acc, model) => {
                          acc.available += Number(
                            model.stockInfo.available || 0,
                          );

                          acc.reserved += Number(model.stockInfo.reserved || 0);

                          acc.received += Number(model.stockInfo.received || 0);

                          acc.shipped += Number(model.stockInfo.shipped || 0);

                          return acc;
                        },
                        {
                          available: 0,
                          reserved: 0,
                          received: 0,
                          shipped: 0,
                        },
                      );

                      return (
                        <div
                          key={collection.id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition"
                        >
                          {/* Card Header */}

                          <div className="p-5 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-black text-lg text-slate-800 truncate">
                                  {collection.name}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1">
                                  {collection.orderNumber !== "—"
                                    ? `أوردر ${collection.orderNumber}`
                                    : "لا يوجد أوردر"}
                                </p>
                              </div>

                              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Layers size={20} />
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}

                          <div className="p-5">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-400 font-bold">
                                  الموديلات
                                </p>

                                <p className="text-lg font-black text-slate-800">
                                  {collection.modelsCount}
                                </p>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-400 font-bold">
                                  كمية الأوردر
                                </p>

                                <p className="text-lg font-black text-slate-800">
                                  {Number(collection.qty || 0).toLocaleString(
                                    "en-US",
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Inventory */}

                            <div className="mt-4">
                              <p className="text-xs font-black text-slate-700 mb-3">
                                ملخص المخزون
                              </p>

                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold">
                                    متاح
                                  </p>

                                  <p className="font-black text-emerald-600">
                                    {inventory.available.toLocaleString(
                                      "en-US",
                                    )}
                                  </p>
                                </div>

                                <div className="border-x border-slate-100">
                                  <p className="text-[9px] text-slate-400 font-bold">
                                    محجوز
                                  </p>

                                  <p className="font-black text-orange-500">
                                    {inventory.reserved.toLocaleString("en-US")}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold">
                                    مشحون
                                  </p>

                                  <p className="font-black text-slate-700">
                                    {inventory.shipped.toLocaleString("en-US")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Progress */}

                            <div className="mt-5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">
                                  تقدم الإنتاج
                                </span>

                                <span className="text-xs font-black text-blue-600">
                                  {collection.progress}%
                                </span>
                              </div>

                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{
                                    width: `${collection.progress}%`,
                                  }}
                                />
                              </div>

                              <p className="text-[10px] text-slate-400 mt-2">
                                المرحلة الحالية:{" "}
                                <span className="font-bold text-slate-600">
                                  {collection.currentStage?.name || "لم تبدأ"}
                                </span>
                              </p>
                            </div>

                            {/* Details Button */}

                            <button
                              onClick={() => setSelectedCollection(collection)}
                              className="w-full mt-5 bg-[#0f172a] hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                            >
                              <Eye size={17} />
                              عرض تفاصيل الكولكشن
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 font-bold">
                      لا توجد كولكشنات مسجلة.
                    </div>
                  )}
                </div>

                {/* MODELS */}

                <div className="pt-4">
                  <div className="mb-4">
                    <h3 className="font-black text-[#1a365d]">
                      تفاصيل الموديلات والمخزون
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      عرض المخزون على مستوى الموديل والمقاس واللون
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {allModels.length > 0 ? (
                      allModels.map((model) => (
                        <div
                          key={model.id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                        >
                          <div className="h-44 bg-slate-100 relative overflow-hidden">
                            {model.image_url ? (
                              <img
                                src={model.image_url}
                                alt={model.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon
                                  size={40}
                                  className="text-slate-300"
                                />
                              </div>
                            )}

                            <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-lg shadow-sm border border-slate-200 text-xs font-bold font-mono">
                              {model.model_number || "—"}
                            </div>
                          </div>

                          <div className="p-5">
                            <h3 className="font-black text-lg text-slate-800">
                              {model.name}
                            </h3>

                            <p className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-fit mt-2">
                              {model.collectionName}
                            </p>

                            <div className="grid grid-cols-3 gap-2 text-center border-y border-slate-100 py-4 mt-4">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold">
                                  متاح
                                </p>

                                <p className="text-lg font-black text-emerald-600">
                                  {model.stockInfo.available}
                                </p>
                              </div>

                              <div className="border-r border-l border-slate-100">
                                <p className="text-[9px] text-slate-400 font-bold">
                                  محجوز
                                </p>

                                <p className="text-lg font-black text-orange-500">
                                  {model.stockInfo.reserved}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] text-slate-400 font-bold">
                                  مشحون
                                </p>

                                <p className="text-lg font-black text-slate-700">
                                  {model.stockInfo.shipped}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                              {model.details.length > 0 ? (
                                model.details.map((detail) => (
                                  <div
                                    key={detail.id}
                                    className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-xs"
                                  >
                                    <span className="font-bold text-slate-600">
                                      {detail.color || "بدون لون"} -{" "}
                                      {detail.size || "بدون مقاس"}
                                    </span>

                                    <span className="font-black text-[#1a365d]">
                                      {detail.available} قطعة
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-center text-slate-400 py-2">
                                  لا توجد تفاصيل
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-slate-500 font-bold py-10">
                        لا توجد موديلات.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                SHIPMENTS
            ================================================= */}

            {activeTab === "shipments" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1a365d]">
                      سجل الشحنات
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      جميع الشحنات الخاصة بالبراند
                    </p>
                  </div>

                  <button
                    onClick={handlePrintReport}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm"
                  >
                    <Printer size={16} />
                    حفظ التقرير
                  </button>
                </div>

                {/* Shipment Summary */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      إجمالي الشحنات
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {shipments.length}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      القطع المشحونة
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {shipments
                        .reduce(
                          (sum, shipment) =>
                            sum + Number(shipment.total_pieces || 0),
                          0,
                        )
                        .toLocaleString("en-US")}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      تم التسليم
                    </p>

                    <p className="text-2xl font-black text-emerald-600 mt-1">
                      {
                        shipments.filter(
                          (shipment) =>
                            shipment.status === "delivered" ||
                            shipment.status === "completed",
                        ).length
                      }
                    </p>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">
                      قيد التجهيز / الشحن
                    </p>

                    <p className="text-2xl font-black text-orange-500 mt-1">
                      {
                        shipments.filter(
                          (shipment) =>
                            !["delivered", "completed"].includes(
                              shipment.status,
                            ),
                        ).length
                      }
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-4 whitespace-nowrap">رقم الشحنة</th>

                          <th className="p-4 whitespace-nowrap">
                            العميل / بوليصة الشحن
                          </th>

                          <th className="p-4 whitespace-nowrap">
                            إجمالي القطع
                          </th>

                          <th className="p-4 whitespace-nowrap">التاريخ</th>

                          <th className="p-4 whitespace-nowrap">الحالة</th>

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
                                  {formatDate(shipment.created_at)}
                                </td>

                                <td className="p-4">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-bold ${getShipmentStatusClass(
                                      shipment.status,
                                    )}`}
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
                                        محتويات الشحنة
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
              </div>
            )}

            {/* =================================================
                HISTORY
            ================================================= */}

            {activeTab === "history" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1a365d]">
                      سجل استلامات المخزن من المصنع
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      الدفعات التي تم استلامها فعلياً
                    </p>
                  </div>

                  <button
                    onClick={handlePrintReport}
                    className="flex items-center justify-center gap-2 bg-[#1a365d] hover:bg-[#122844] text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                  >
                    <Printer size={16} />
                    حفظ التقرير
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  {inventoryHistory.length > 0 ? (
                    <div className="space-y-4">
                      {inventoryHistory.map((history, index) => {
                        const totalQty =
                          history.production_delivery_items?.reduce(
                            (sum, item) =>
                              sum + Number(item.delivered_qty || 0),
                            0,
                          ) || 0;

                        return (
                          <div
                            key={`${history.delivery_number}-${index}`}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                                <CheckCircle2 size={20} />
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

                            <div className="text-right sm:text-left">
                              <p className="text-lg font-black text-slate-800">
                                +{totalQty}{" "}
                                <span className="text-xs font-medium text-slate-500">
                                  قطعة
                                </span>
                              </p>

                              <p className="text-[10px] font-bold text-slate-400 mt-1">
                                {formatDateTime(history.updated_at)}
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
        </main>
      </div>

      {/* =====================================================
          COLLECTION DETAILS MODAL
      ===================================================== */}

      {selectedCollection && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCollection(null)}
        >
          <div
            className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* MODAL HEADER */}

            <div className="bg-[#0f172a] text-white p-5 sm:p-6 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Layers size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black">
                      {selectedCollection.name}
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      رقم الأوردر:{" "}
                      <span className="font-mono text-slate-300">
                        {selectedCollection.orderNumber}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCollection(null)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="space-y-6">
                {/* SUMMARY */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] text-slate-400 font-bold">
                      الموديلات
                    </p>

                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {selectedCollection.modelsCount}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[10px] text-slate-400 font-bold">
                      كمية الأوردر
                    </p>

                    <p className="text-2xl font-black text-slate-800 mt-1">
                      {Number(selectedCollection.qty || 0).toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-[10px] text-emerald-600 font-bold">
                      المتاح
                    </p>

                    <p className="text-2xl font-black text-emerald-700 mt-1">
                      {selectedCollectionInventory.available.toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-[10px] text-blue-600 font-bold">
                      تقدم الإنتاج
                    </p>

                    <p className="text-2xl font-black text-blue-700 mt-1">
                      {selectedCollection.progress}%
                    </p>
                  </div>
                </div>

                {/* PRODUCTION STATUS */}

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-black text-slate-800">
                        مراحل الإنتاج
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        الحالة الحالية لكل مرحلة
                      </p>
                    </div>

                    <Activity size={20} className="text-blue-500" />
                  </div>

                  {productionStages.length > 0 ? (
                    <div className="overflow-x-auto pb-4">
                      <div className="flex items-start min-w-[800px]" dir="rtl">
                        {productionStages.map((stage, index) => {
                          const tracking = selectedCollection.tracking?.find(
                            (item) => item.stage_id === stage.id,
                          );

                          const status = tracking?.status || "pending";

                          const isLast = index === productionStages.length - 1;

                          return (
                            <div key={stage.id} className="flex-1 relative">
                              {!isLast && (
                                <div
                                  className={`absolute top-5 left-0 right-1/2 h-0.5 ${
                                    status === "completed"
                                      ? "bg-emerald-400"
                                      : "bg-slate-200"
                                  }`}
                                />
                              )}

                              <div className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white ${
                                    status === "completed"
                                      ? "border-emerald-500 text-emerald-500"
                                      : status === "in_progress"
                                        ? "border-blue-500 text-blue-500"
                                        : status === "issue"
                                          ? "border-red-500 text-red-500"
                                          : "border-slate-300 text-slate-300"
                                  }`}
                                >
                                  {status === "completed" ? (
                                    <CheckCircle2 size={18} />
                                  ) : status === "issue" ? (
                                    <AlertCircle size={18} />
                                  ) : status === "in_progress" ? (
                                    <Activity size={18} />
                                  ) : (
                                    <Clock size={18} />
                                  )}
                                </div>

                                <p
                                  className={`text-[10px] font-bold text-center mt-3 max-w-[90px] ${
                                    status === "completed"
                                      ? "text-emerald-600"
                                      : status === "in_progress"
                                        ? "text-blue-600"
                                        : status === "issue"
                                          ? "text-red-600"
                                          : "text-slate-400"
                                  }`}
                                >
                                  {stage.name}
                                </p>

                                <span
                                  className={`mt-2 px-2 py-1 rounded text-[9px] font-bold ${getTrackingStatusClass(
                                    status,
                                  )}`}
                                >
                                  {getTrackingStatusLabel(status)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-5">
                      لا توجد مراحل إنتاج.
                    </p>
                  )}

                  {/* ISSUE */}

                  {selectedCollection.currentTracking?.status === "issue" &&
                    selectedCollection.currentTracking?.issue_notes && (
                      <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={18}
                            className="text-red-500 mt-0.5"
                          />

                          <div>
                            <p className="font-bold text-red-700 text-sm">
                              يوجد ملاحظة على المرحلة الحالية
                            </p>

                            <p className="text-xs text-red-600 mt-1">
                              {selectedCollection.currentTracking.issue_notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* MODELS */}

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shirt size={19} className="text-slate-500" />

                    <h3 className="font-black text-slate-800">
                      موديلات الكولكشن
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCollectionModels.length > 0 ? (
                      selectedCollectionModels.map((model) => (
                        <div
                          key={model.id}
                          className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex gap-4"
                        >
                          <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                            {model.image_url ? (
                              <img
                                src={model.image_url}
                                alt={model.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon
                                  size={25}
                                  className="text-slate-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-black text-sm text-slate-800">
                                  {model.name}
                                </h4>

                                <p className="text-[10px] text-slate-400 font-mono mt-1">
                                  {model.model_number || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <div>
                                <p className="text-[9px] text-slate-400">
                                  متاح
                                </p>

                                <p className="font-black text-emerald-600 text-sm">
                                  {model.stockInfo.available}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] text-slate-400">
                                  محجوز
                                </p>

                                <p className="font-black text-orange-500 text-sm">
                                  {model.stockInfo.reserved}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] text-slate-400">
                                  مشحون
                                </p>

                                <p className="font-black text-slate-700 text-sm">
                                  {model.stockInfo.shipped}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-slate-400 py-5">
                        لا توجد موديلات.
                      </div>
                    )}
                  </div>
                </div>

                {/* INVENTORY */}

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Boxes size={19} className="text-slate-500" />

                    <h3 className="font-black text-slate-800">ملخص المخزون</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-[10px] text-emerald-600 font-bold">
                        متاح
                      </p>

                      <p className="text-xl font-black text-emerald-700 mt-1">
                        {selectedCollectionInventory.available.toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-[10px] text-orange-600 font-bold">
                        محجوز
                      </p>

                      <p className="text-xl font-black text-orange-700 mt-1">
                        {selectedCollectionInventory.reserved.toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-[10px] text-blue-600 font-bold">
                        مستلم
                      </p>

                      <p className="text-xl font-black text-blue-700 mt-1">
                        {selectedCollectionInventory.received.toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 font-bold">
                        مشحون
                      </p>

                      <p className="text-xl font-black text-slate-700 mt-1">
                        {selectedCollectionInventory.shipped.toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SHIPMENTS */}

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck size={19} className="text-slate-500" />

                    <h3 className="font-black text-slate-800">
                      شحنات الكولكشن
                    </h3>
                  </div>

                  {selectedCollectionShipments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCollectionShipments.map((shipment) => (
                        <div
                          key={shipment.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100"
                        >
                          <div>
                            <p className="font-black text-sm text-slate-800">
                              {shipment.shipment_number}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(shipment.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="font-black text-slate-700">
                              {shipment.total_pieces} قطعة
                            </p>

                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold ${getShipmentStatusClass(
                                shipment.status,
                              )}`}
                            >
                              {getShipmentStatusLabel(shipment.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-5">
                      لا توجد شحنات مرتبطة بهذا الكولكشن حتى الآن.
                    </div>
                  )}
                </div>

                {/* DATES */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <CalendarDays size={20} className="text-blue-500" />

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        تاريخ إنشاء الكولكشن
                      </p>

                      <p className="text-sm font-black text-slate-700 mt-1">
                        {selectedCollection.date}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <Clock size={20} className="text-indigo-500" />

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        بداية الإنتاج
                      </p>

                      <p className="text-sm font-black text-slate-700 mt-1">
                        {formatDate(selectedCollection.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500" />

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        موعد التسليم
                      </p>

                      <p className="text-sm font-black text-slate-700 mt-1">
                        {formatDate(selectedCollection.deliveryDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-slate-200 p-4 bg-slate-50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedCollection(null)}
                className="px-5 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl text-sm font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HIDDEN PRINT COMPONENT
      ===================================================== */}

      <div className="hidden">
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
    </div>
  );
};

export default ClientDashboard;
