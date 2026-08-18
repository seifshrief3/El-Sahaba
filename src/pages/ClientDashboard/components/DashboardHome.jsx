import React, { useMemo, useState } from "react";
import {
  Eye,
  FileText,
  Headset,
  PackageCheck,
  RefreshCw,
  Truck,
  MessageCircle,
  Warehouse,
  Boxes,
  Shirt,
  ChevronLeft,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Package,
  Send,
  Scissors,
  Printer,
  Sparkles,
  Ruler,
  Layers3,
  BadgeCheck,
  Hammer,
  Wrench,
  ClipboardCheck,
} from "lucide-react";

import SectionTitle from "../ui/SectionTitle";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";

import { formatNumber, formatDate, getCollectionProgress } from "../utils";

const DashboardHome = ({
  totalShipped,
  totalProductionQuantity,
  inventorySummary,
  inventoryRows,
  sizeColumns,
  shipmentRows,
  shipmentCount,
  completedShipments,
  pendingShipments,
  enrichedCollections,
  inventory,
  setActivePage,
  setSelectedShipment,

  productionStages = [],
  orderTracking = [],
  productionOrders = [],
  activeOrder = null,
}) => {
  // =========================================================
  // Selected Production Order
  // =========================================================

  const [selectedOrderId, setSelectedOrderId] = useState(
    activeOrder?.id ||
      activeOrder?.order_id ||
      activeOrder?.production_order_id ||
      productionOrders?.[0]?.id ||
      null,
  );

  // =========================================================
  // Basic Calculations
  // =========================================================

  const totalReceived = inventorySummary?.received || 0;

  const shippingProgressPercentage =
    totalProductionQuantity > 0
      ? Math.min(
          100,
          Math.round((totalShipped / totalProductionQuantity) * 100),
        )
      : 0;

  const inventoryProgressPercentage =
    totalProductionQuantity > 0
      ? Math.min(
          100,
          Math.round(
            (inventorySummary?.available / totalProductionQuantity) * 100,
          ),
        )
      : 0;

  // =========================================================
  // Production Stage Helpers
  // =========================================================

  const getStageId = (stage) => {
    return stage?.id ?? stage?.stage_id ?? stage?.production_stage_id ?? null;
  };

  const getStageName = (stage) => {
    return (
      stage?.name ||
      stage?.stage_name ||
      stage?.title ||
      stage?.label ||
      "مرحلة إنتاج"
    );
  };

  const getStageOrder = (stage, index) => {
    const order =
      stage?.sequence ??
      stage?.stage_order ??
      stage?.order_number ??
      stage?.sort_order ??
      stage?.position;

    const numericOrder = Number(order);

    return Number.isFinite(numericOrder) ? numericOrder : index + 1;
  };

  const getTrackingStageId = (tracking) => {
    return (
      tracking?.stage_id ??
      tracking?.production_stage_id ??
      tracking?.stageId ??
      null
    );
  };

  const getTrackingOrderId = (tracking) => {
    return (
      tracking?.order_id ??
      tracking?.production_order_id ??
      tracking?.orderId ??
      null
    );
  };

  const getTrackingStatus = (tracking) => {
    return String(
      tracking?.status ||
        tracking?.stage_status ||
        tracking?.tracking_status ||
        "",
    ).toLowerCase();
  };

  const isTrackingCompleted = (tracking) => {
    if (!tracking) return false;

    const status = getTrackingStatus(tracking);

    return [
      "completed",
      "complete",
      "done",
      "finished",
      "delivered",
      "approved",
      "تم",
      "مكتمل",
      "مكتملة",
      "منتهي",
      "منتهية",
      "تم التنفيذ",
      "تمت",
    ].some((value) => status.includes(value));
  };

  const isTrackingInProgress = (tracking) => {
    if (!tracking) return false;

    const status = getTrackingStatus(tracking);

    return [
      "in_progress",
      "in-progress",
      "progress",
      "working",
      "active",
      "processing",
      "started",
      "جاري",
      "جاري التنفيذ",
      "قيد التنفيذ",
      "تحت التنفيذ",
      "بدأ",
      "نشط",
    ].some((value) => status.includes(value));
  };

  // =========================================================
  // Sorted Production Stages
  // =========================================================

  const sortedProductionStages = useMemo(() => {
    if (!Array.isArray(productionStages)) {
      return [];
    }

    return [...productionStages].sort((a, b) => {
      const indexA = productionStages.indexOf(a);
      const indexB = productionStages.indexOf(b);

      return getStageOrder(a, indexA) - getStageOrder(b, indexB);
    });
  }, [productionStages]);

  // =========================================================
  // Get Tracking For Specific Order
  // =========================================================

  const getOrderTracking = (orderId) => {
    if (!Array.isArray(orderTracking) || !orderId) {
      return [];
    }

    return orderTracking.filter((tracking) => {
      const trackingOrderId = getTrackingOrderId(tracking);

      return String(trackingOrderId) === String(orderId);
    });
  };

  // =========================================================
  // Get Latest Tracking For Stage
  // =========================================================

  const getTrackingForStage = (orderTrackingRecords, stageId) => {
    if (!stageId || !Array.isArray(orderTrackingRecords)) {
      return null;
    }

    const records = orderTrackingRecords.filter((tracking) => {
      return String(getTrackingStageId(tracking)) === String(stageId);
    });

    if (records.length === 0) {
      return null;
    }

    return [...records].sort((a, b) => {
      const dateA = new Date(
        a?.updated_at || a?.created_at || a?.completed_at || 0,
      ).getTime();

      const dateB = new Date(
        b?.updated_at || b?.created_at || b?.completed_at || 0,
      ).getTime();

      return dateB - dateA;
    })[0];
  };

  // =========================================================
  // Calculate Order Production Info
  // =========================================================

  const getOrderProductionInfo = (order) => {
    if (!order) {
      return {
        progress: 0,
        currentStage: null,
        currentStageIndex: -1,
        tracking: [],
      };
    }

    const tracking = getOrderTracking(order.id);

    if (sortedProductionStages.length === 0) {
      return {
        progress: 0,
        currentStage: null,
        currentStageIndex: -1,
        tracking,
      };
    }

    const completedStages = sortedProductionStages.filter((stage) => {
      const stageId = getStageId(stage);
      const stageTracking = getTrackingForStage(tracking, stageId);

      return isTrackingCompleted(stageTracking);
    });

    const completedCount = completedStages.length;

    let activeStageIndex = -1;

    sortedProductionStages.forEach((stage, index) => {
      if (activeStageIndex !== -1) {
        return;
      }

      const stageId = getStageId(stage);
      const stageTracking = getTrackingForStage(tracking, stageId);

      if (stageTracking && isTrackingInProgress(stageTracking)) {
        activeStageIndex = index;
      }
    });

    if (activeStageIndex === -1) {
      activeStageIndex = sortedProductionStages.findIndex((stage) => {
        const stageId = getStageId(stage);
        const stageTracking = getTrackingForStage(tracking, stageId);

        return !isTrackingCompleted(stageTracking);
      });
    }

    if (activeStageIndex === -1) {
      activeStageIndex = sortedProductionStages.length - 1;
    }

    const progress = Math.round(
      (completedCount / sortedProductionStages.length) * 100,
    );

    return {
      progress,
      currentStage: sortedProductionStages[activeStageIndex] || null,
      currentStageIndex: activeStageIndex,
      tracking,
    };
  };

  // =========================================================
  // Order List With Production Information
  // =========================================================

  const orderProductionList = useMemo(() => {
    if (!Array.isArray(productionOrders)) {
      return [];
    }

    return productionOrders.map((order) => {
      const info = getOrderProductionInfo(order);

      return {
        ...order,
        productionProgress: info.progress,
        currentStage: info.currentStage,
        currentStageIndex: info.currentStageIndex,
        orderTracking: info.tracking,
      };
    });
  }, [productionOrders, orderTracking, sortedProductionStages]);

  // =========================================================
  // Selected Order
  // =========================================================

  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = orderProductionList.find(
        (order) => String(order.id) === String(selectedOrderId),
      );

      if (found) {
        return found;
      }
    }

    return orderProductionList[0] || null;
  }, [orderProductionList, selectedOrderId]);

  // =========================================================
  // Selected Order Tracking
  // =========================================================

  const selectedOrderTracking = useMemo(() => {
    if (!selectedOrder) {
      return [];
    }

    return getOrderTracking(selectedOrder.id);
  }, [selectedOrder, orderTracking]);

  const productionProgress = selectedOrder?.productionProgress || 0;

  const currentOrderNumber =
    selectedOrder?.order_number ||
    selectedOrder?.orderNumber ||
    selectedOrder?.number ||
    selectedOrder?.code ||
    selectedOrder?.name ||
    "-";

  const currentStageName = selectedOrder?.currentStage
    ? getStageName(selectedOrder.currentStage)
    : "لم تبدأ";

  // =========================================================
  // Icon For Stage
  // =========================================================

  const getStageIcon = (stage, index) => {
    const name = String(getStageName(stage)).toLowerCase();

    if (name.includes("أمر") || name.includes("order") || name.includes("طلب"))
      return ClipboardList;

    if (
      name.includes("خامة") ||
      name.includes("fabric") ||
      name.includes("material")
    )
      return Layers3;

    if (name.includes("باترون") || name.includes("pattern")) return Ruler;

    if (name.includes("قص") || name.includes("cut")) return Scissors;

    if (name.includes("طباعة") || name.includes("print")) return Printer;

    if (name.includes("تطريز") || name.includes("embroidery")) return Sparkles;

    if (
      name.includes("تشغيل") ||
      name.includes("sewing") ||
      name.includes("خياطة")
    )
      return Shirt;

    if (
      name.includes("جودة") ||
      name.includes("quality") ||
      name.includes("qc")
    )
      return BadgeCheck;

    if (name.includes("تشطيب") || name.includes("finishing")) return Wrench;

    if (
      name.includes("تجهيز") ||
      name.includes("preparation") ||
      name.includes("prepare")
    )
      return PackageCheck;

    if (
      name.includes("تعبئة") ||
      name.includes("packaging") ||
      name.includes("packing")
    )
      return Package;

    if (
      name.includes("مخزن") ||
      name.includes("warehouse") ||
      name.includes("inventory")
    )
      return Warehouse;

    if (
      name.includes("شحن") ||
      name.includes("shipping") ||
      name.includes("shipment")
    )
      return Truck;

    if (name.includes("فحص") || name.includes("inspection"))
      return ClipboardCheck;

    const fallbackIcons = [
      ClipboardList,
      Layers3,
      Ruler,
      Scissors,
      Printer,
      Sparkles,
      Shirt,
      Wrench,
      BadgeCheck,
      ClipboardCheck,
      Package,
      PackageCheck,
      Warehouse,
      Boxes,
      Hammer,
      Send,
      Truck,
    ];

    return fallbackIcons[index % fallbackIcons.length];
  };

  // =========================================================
  // Stage State
  // =========================================================

  const getStageState = (stage, index) => {
    const stageId = getStageId(stage);

    const tracking = getTrackingForStage(selectedOrderTracking, stageId);

    if (tracking && isTrackingCompleted(tracking)) {
      return {
        type: "completed",
        label: "تم التنفيذ",
      };
    }

    if (
      selectedOrder?.currentStage &&
      String(getStageId(selectedOrder.currentStage)) === String(stageId)
    ) {
      return {
        type: "current",
        label: "قيد التنفيذ",
      };
    }

    if (selectedOrder && index === selectedOrder.currentStageIndex) {
      return {
        type: "current",
        label: "قيد التنفيذ",
      };
    }

    const previousStages = sortedProductionStages.slice(0, index);

    const previousCompleted = previousStages.filter((previousStage) => {
      const previousTracking = getTrackingForStage(
        selectedOrderTracking,
        getStageId(previousStage),
      );

      return isTrackingCompleted(previousTracking);
    }).length;

    if (
      previousCompleted === index &&
      index === selectedOrder?.currentStageIndex
    ) {
      return {
        type: "current",
        label: "قيد التنفيذ",
      };
    }

    return {
      type: "pending",
      label: "لم تبدأ",
    };
  };

  // =========================================================
  // Safe Data
  // =========================================================

  const inventorySummarySafe = inventorySummary || {
    available: 0,
    shipped: 0,
    reserved: 0,
    received: 0,
  };

  const shipmentRowsSafe = shipmentRows || [];
  const inventoryRowsSafe = inventoryRows || [];
  const collectionsSafe = enrichedCollections || [];
  const inventorySafe = inventory || [];

  // =========================================================
  // Stat Card Styles
  // =========================================================

  const statCards = [
    {
      title: "إجمالي المستلم",
      value: totalReceived,
      subtitle: "الكمية المستلمة",
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-100",
      delay: 0,
    },
    {
      title: "إجمالي القطع الحالية",
      value: totalProductionQuantity,
      subtitle: "إجمالي أوامر التشغيل",
      icon: Package,
      iconClass:
        "bg-blue-50 text-[#0D5FE8] border-blue-200 group-hover:bg-blue-100",
      delay: 60,
    },
    {
      title: "إجمالي المشحون",
      value: totalShipped,
      subtitle: "تم شحنها بالفعل",
      icon: Truck,
      iconClass:
        "bg-orange-50 text-orange-600 border-orange-200 group-hover:bg-orange-100",
      delay: 120,
    },
    {
      title: "المتاح بالمخزن",
      value: inventorySummarySafe.available,
      subtitle: "جاهز للشحن",
      icon: Boxes,
      iconClass:
        "bg-violet-50 text-violet-600 border-violet-200 group-hover:bg-violet-100",
      delay: 180,
    },
    {
      title: "القطع المحجوزة",
      value: inventorySummarySafe.reserved,
      subtitle: "كميات محجوزة",
      icon: PackageCheck,
      iconClass:
        "bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-rose-100",
      delay: 240,
    },
    {
      title: "عدد الشحنات",
      value: shipmentCount,
      subtitle: `${completedShipments} شحنة مكتملة`,
      icon: Send,
      iconClass:
        "bg-cyan-50 text-cyan-600 border-cyan-200 group-hover:bg-cyan-100",
      delay: 300,
    },
  ];

  // =========================================================
  // Render
  // =========================================================

  return (
    <main
      className="max-w-[1600px] mx-auto px-3 md:px-7 py-5 md:py-7"
      dir="rtl"
    >
      <div className="space-y-5">
        {/* =====================================================
            MAIN STATS
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-500 hover:shadow-md">
          <div className="pointer-events-none absolute -top-28 -left-20 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />

          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-50/50 blur-3xl" />

          <div className="relative z-10">
            <SectionTitle
              icon={BarChart3}
              title="خلاصة المؤشرات الرئيسية"
              subtitle="ملخص سريع لحالة الإنتاج والمخزون والشحن"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="group"
                    style={{
                      animationDelay: `${card.delay}ms`,
                    }}
                  >
                    <StatCard
                      title={card.title}
                      value={card.value}
                      subtitle={card.subtitle}
                      icon={Icon}
                      iconClass={card.iconClass}
                      delay={card.delay}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCTION TRACKING
        ===================================================== */}

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-shadow duration-500 hover:shadow-md">
          {/* Header */}

          <div className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-l from-white to-slate-50/50">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D2748] flex items-center justify-center">
                    <ClipboardCheck size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg md:text-xl font-black text-[#102A43]">
                      مراحل التنفيذ
                    </h2>

                    <p className="text-xs md:text-sm text-slate-400 font-bold mt-1">
                      متابعة مراحل إنتاج الطلبات
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="text-[10px] text-slate-400 font-bold">
                      رقم الأمر
                    </div>

                    <div className="text-sm font-black text-[#0D2748] mt-0.5">
                      {currentOrderNumber}
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="text-[10px] text-red-400 font-bold">
                      المرحلة الحالية
                    </div>

                    <div className="text-sm font-black text-[#C62828] mt-0.5">
                      {currentStageName}
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl bg-[#0D2748] text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-[10px] text-blue-200 font-bold">
                      نسبة التنفيذ
                    </div>

                    <div className="text-sm font-black mt-0.5">
                      {productionProgress}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders + Timeline */}

          <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_2fr] gap-0">
            {/* Orders */}

            <div className="border-b xl:border-b-0 xl:border-l border-slate-100 bg-slate-50/50">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#102A43]">أوامر التشغيل</h3>

                    <p className="text-[11px] text-slate-400 font-bold mt-1">
                      اختر أمرًا لمتابعة مراحل تنفيذه
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-[#0D2748] text-white flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                    <ClipboardList size={18} />
                  </div>
                </div>
              </div>

              {orderProductionList.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={ClipboardList}
                    title="لا توجد أوامر تشغيل"
                    description="لم يتم العثور على أوامر تشغيل لهذا البراند."
                  />
                </div>
              ) : (
                <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                  {orderProductionList.map((order, index) => {
                    const isSelected =
                      String(order.id) === String(selectedOrder?.id);

                    const orderNumber =
                      order.order_number ||
                      order.orderNumber ||
                      order.number ||
                      order.code ||
                      "-";

                    const stageName = order.currentStage
                      ? getStageName(order.currentStage)
                      : "لم تبدأ";

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`
                          w-full text-right rounded-2xl border p-4
                          transition-all duration-300
                          hover:-translate-y-0.5
                          ${
                            isSelected
                              ? "bg-[#0D2748] border-[#0D2748] text-white shadow-lg shadow-[#0D2748]/15"
                              : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
                          }
                        `}
                        style={{
                          animationDelay: `${index * 40}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div
                              className={`text-sm font-black truncate ${
                                isSelected ? "text-white" : "text-[#102A43]"
                              }`}
                            >
                              {orderNumber}
                            </div>

                            <div
                              className={`text-[10px] font-bold mt-1 ${
                                isSelected ? "text-blue-200" : "text-slate-400"
                              }`}
                            >
                              {order.total_quantity
                                ? `${formatNumber(order.total_quantity)} قطعة`
                                : "أمر تشغيل"}
                            </div>
                          </div>

                          <div
                            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                              isSelected
                                ? "bg-white/10 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {order.productionProgress}%
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-black truncate ${
                                isSelected ? "text-blue-100" : "text-[#102A43]"
                              }`}
                            >
                              {stageName}
                            </span>

                            <span
                              className={`text-[9px] font-bold shrink-0 ${
                                isSelected ? "text-blue-200" : "text-slate-400"
                              }`}
                            >
                              المرحلة الحالية
                            </span>
                          </div>

                          <div
                            className={`h-1.5 rounded-full overflow-hidden ${
                              isSelected ? "bg-white/15" : "bg-slate-100"
                            }`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                order.productionProgress >= 100
                                  ? "bg-emerald-500"
                                  : isSelected
                                    ? "bg-white"
                                    : "bg-[#0D2748]"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  order.productionProgress,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline */}

            <div className="min-w-0">
              {!selectedOrder ? (
                <div className="p-8">
                  <EmptyState
                    icon={ClipboardList}
                    title="اختر أمر تشغيل"
                    description="اختر أحد أوامر التشغيل لعرض مراحل التنفيذ."
                  />
                </div>
              ) : (
                <>
                  {/* Progress Summary */}

                  <div className="px-5 md:px-6 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-black text-[#102A43]">
                          تقدم الإنتاج
                        </span>

                        <span className="mr-2 text-[11px] font-bold text-slate-400">
                          {currentOrderNumber}
                        </span>
                      </div>

                      <span className="text-xs font-black text-[#0D2748]">
                        {productionProgress}%
                      </span>
                    </div>

                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-[#0D2748] to-[#0D5FE8] transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(100, productionProgress)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Stage Banner */}

                  <div className="px-5 md:px-6 pt-4">
                    <div className="rounded-2xl border border-red-100 bg-gradient-to-l from-red-50/80 to-white p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-xl bg-red-100 text-[#C62828] flex items-center justify-center shrink-0">
                          <span className="absolute inset-0 rounded-xl bg-red-200/50 animate-ping opacity-30" />
                          <RefreshCw
                            size={18}
                            className="relative animate-[spin_4s_linear_infinite]"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-red-400">
                            المرحلة الحالية
                          </div>

                          <div className="text-sm font-black text-[#C62828] mt-0.5 truncate">
                            {currentStageName}
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-[10px] text-red-400 font-bold">
                          الأمر
                        </div>

                        <div className="text-sm font-black text-[#102A43]">
                          {currentOrderNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}

                  {sortedProductionStages.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon={ClipboardList}
                        title="لا توجد مراحل إنتاج"
                        description="لم يتم العثور على مراحل إنتاج مسجلة."
                      />
                    </div>
                  ) : (
                    <div className="p-5 md:p-6">
                      <div className="overflow-x-auto pb-4">
                        <div
                          className="flex items-start min-w-max"
                          style={{
                            direction: "rtl",
                          }}
                        >
                          {sortedProductionStages.map((stage, index) => {
                            const stageId = getStageId(stage);
                            const state = getStageState(stage, index);
                            const Icon = getStageIcon(stage, index);

                            const tracking = getTrackingForStage(
                              selectedOrderTracking,
                              stageId,
                            );

                            const isLast =
                              index === sortedProductionStages.length - 1;

                            let iconWrapperClass =
                              "bg-slate-50 border-slate-200 text-slate-400";

                            let lineClass = "border-slate-200";

                            if (state.type === "completed") {
                              iconWrapperClass =
                                "bg-emerald-50 border-emerald-300 text-emerald-600 shadow-sm";

                              lineClass = "border-emerald-300";
                            }

                            if (state.type === "current") {
                              iconWrapperClass =
                                "bg-red-50 border-red-400 text-[#C62828] shadow-md shadow-red-100";

                              lineClass = "border-[#C62828]";
                            }

                            return (
                              <React.Fragment
                                key={
                                  stageId || `${getStageName(stage)}-${index}`
                                }
                              >
                                <div
                                  className="flex flex-col items-center w-[125px] shrink-0"
                                  style={{
                                    animationDelay: `${index * 80}ms`,
                                  }}
                                >
                                  <div
                                    className={`
                                      relative w-16 h-16 rounded-full border-2
                                      flex items-center justify-center
                                      transition-all duration-500
                                      hover:scale-105
                                      ${iconWrapperClass}
                                      ${
                                        state.type === "current"
                                          ? "animate-[pulse_2.5s_ease-in-out_infinite]"
                                          : ""
                                      }
                                    `}
                                  >
                                    <Icon size={25} />

                                    {state.type === "completed" && (
                                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
                                        <CheckCircle2 size={14} />
                                      </div>
                                    )}

                                    {state.type === "current" && (
                                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#C62828] border-2 border-white shadow-sm" />
                                    )}
                                  </div>

                                  <div className="text-center mt-3">
                                    <div
                                      className={`text-xs font-black leading-5 ${
                                        state.type === "completed"
                                          ? "text-emerald-700"
                                          : state.type === "current"
                                            ? "text-[#C62828]"
                                            : "text-[#102A43]"
                                      }`}
                                    >
                                      {getStageName(stage)}
                                    </div>

                                    <div
                                      className={`text-[10px] font-bold mt-1 ${
                                        state.type === "completed"
                                          ? "text-emerald-500"
                                          : state.type === "current"
                                            ? "text-[#C62828]"
                                            : "text-slate-400"
                                      }`}
                                    >
                                      {state.label}
                                    </div>

                                    {tracking?.completed_at && (
                                      <div className="text-[9px] text-slate-400 mt-1">
                                        {formatDate(tracking.completed_at)}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {!isLast && (
                                  <div
                                    className={`
                                      mt-8 w-[70px] border-t-2 border-dashed
                                      shrink-0 transition-colors duration-500
                                      ${lineClass}
                                    `}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}

                      <div className="flex flex-wrap items-center justify-center gap-5 mt-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                          <span className="text-[11px] font-bold text-slate-500">
                            تم التنفيذ
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#C62828] shadow-sm" />
                          <span className="text-[11px] font-bold text-slate-500">
                            المرحلة الحالية
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-300" />
                          <span className="text-[11px] font-bold text-slate-500">
                            لم تبدأ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            INVENTORY + SHIPMENTS
        ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.9fr] gap-5">
          {/* Inventory */}

          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all duration-500 hover:shadow-md">
            <div className="p-5 pb-3">
              <SectionTitle
                icon={Warehouse}
                title="مخزون مخزن الشحن"
                subtitle="تفاصيل الكميات المتاحة والمشحونة حسب الموديل"
              />
            </div>

            {inventoryRowsSafe.length === 0 ? (
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
                    {inventoryRowsSafe.map((row) => {
                      const total =
                        (Number(row.available) || 0) +
                        (Number(row.shipped) || 0);

                      return (
                        <tr
                          key={row.modelId}
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition-all duration-200"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                                {row.model?.image_url ? (
                                  <img
                                    src={row.model.image_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Shirt size={18} className="text-slate-300" />
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
                              {formatNumber(row.sizes?.[size] || 0)}
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
                        {formatNumber(inventorySummarySafe.available)}
                      </td>

                      <td className="px-3 py-3 text-center text-red-600">
                        {formatNumber(inventorySummarySafe.reserved)}
                      </td>

                      {sizeColumns.map((size) => {
                        const totalSize = inventorySafe.reduce((sum, item) => {
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
                        {formatNumber(inventorySummarySafe.shipped)}
                      </td>

                      <td className="px-3 py-3 text-center text-[#102A43]">
                        {formatNumber(
                          inventorySummarySafe.available +
                            inventorySummarySafe.shipped,
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Shipments */}

          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all duration-500 hover:shadow-md">
            <div className="p-5 pb-3">
              <SectionTitle
                icon={Truck}
                title="سجل الشحنات"
                subtitle="آخر الشحنات الخاصة بالبراند"
                action={
                  <button
                    onClick={() => setActivePage("shipments")}
                    className="text-[#0D5FE8] text-xs font-black flex items-center gap-1 transition-all duration-200 hover:gap-2"
                  >
                    عرض الكل
                    <ChevronLeft size={14} />
                  </button>
                }
              />
            </div>

            {shipmentRowsSafe.length === 0 ? (
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
                    {shipmentRowsSafe.slice(0, 5).map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
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
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 inline-flex items-center justify-center transition-all duration-200"
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

        {/* =====================================================
            INDICATORS
        ===================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Shipping Progress */}

          <div className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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

            <div className="relative w-24 h-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
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
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${shippingProgressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#102A43]">
                  {shippingProgressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Availability */}

          <div className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div>
              <h3 className="font-black text-[#102A43] mb-1">
                القطع الجاهزة للشحن
              </h3>

              <p className="text-xs text-slate-500 font-bold">
                نسبة التوفر في المخزن
              </p>

              <div className="mt-4 font-black text-2xl text-blue-600">
                {formatNumber(inventorySummarySafe.available)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  قطعة متاحة
                </span>
              </div>
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
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
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${inventoryProgressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#102A43]">
                  {inventoryProgressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Customer Service */}

          <div className="group bg-gradient-to-br from-[#0D2748] to-[#1a3d6d] rounded-3xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -left-4 -bottom-4 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
              <Headset size={100} />
            </div>

            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <Headset size={24} className="text-white" />
              </div>

              <div>
                <h3 className="font-black text-lg">تواصل مع خدمة العملاء</h3>

                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  نحن هنا لمساعدتك في أي استفسار يخص إنتاج وشحن الكولكشن الخاص
                  بك.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/201115480308"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-5 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageCircle size={18} />
              تواصل الآن عبر الواتساب
            </a>
          </div>
        </div>

        {/* =====================================================
            BOTTOM ROW
        ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1fr_0.85fr] gap-5">
          {/* Shipment Path */}

          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <SectionTitle
              icon={Truck}
              title="مسار الشحن"
              subtitle="مراحل انتقال الطلب"
            />

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-100">
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

              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-100">
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

              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-100">
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

          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <SectionTitle
              icon={ClipboardList}
              title="آخر الشحنات"
              subtitle="آخر عمليات الشحن المسجلة"
            />

            {shipmentRowsSafe.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="لا توجد شحنات"
                description="ستظهر الشحنات هنا بمجرد تسجيلها."
              />
            ) : (
              <div className="space-y-2">
                {shipmentRowsSafe.slice(0, 6).map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm transition-all duration-300 text-right hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
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

          {/* Collections Progress */}

          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <SectionTitle
              icon={AlertTriangle}
              title="حالة الكولكشنات"
              subtitle="نسبة الشحن لكل كولكشن"
            />

            {collectionsSafe.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="لا توجد كولكشنات"
                description="ستظهر الكولكشنات هنا عند إضافتها."
              />
            ) : (
              <div className="space-y-4">
                {collectionsSafe.slice(0, 5).map((collection, index) => {
                  const progress = getCollectionProgress(collection);

                  return (
                    <div
                      key={collection.id}
                      className="space-y-2"
                      style={{
                        animationDelay: `${index * 70}ms`,
                      }}
                    >
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
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            progress >= 100
                              ? "bg-emerald-500"
                              : "bg-gradient-to-l from-[#0D2748] to-[#0D5FE8]"
                          }`}
                          style={{
                            width: `${Math.min(100, progress)}%`,
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

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex justify-center pt-1">
          <div className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:text-emerald-600 hover:shadow-sm">
            <RefreshCw
              size={13}
              className="transition-transform duration-700 group-hover:rotate-180"
            />
            جميع البيانات محدثة من قاعدة البيانات
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardHome;
