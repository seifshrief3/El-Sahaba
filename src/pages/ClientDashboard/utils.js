// src/pages/ClientDashboard/utils.js

export const formatNumber = (value) => {
  return new Intl.NumberFormat("ar-EG").format(Number(value) || 0);
};

export const formatDate = (date) => {
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

export const getStatusLabel = (status) => {
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

export const getStatusStyle = (status) => {
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

export const getCollectionProgress = (collection) => {
  const stages = Array.isArray(collection?.productionStages)
    ? collection.productionStages
    : [];

  const tracking = Array.isArray(collection?.orderTracking)
    ? collection.orderTracking
    : [];

  if (stages.length === 0) {
    return 0;
  }

  const completedStages = stages.filter((stage) => {
    const trackingRow = tracking.find(
      (item) => item.stage_id === stage.id
    );

    return trackingRow?.status === "completed";
  }).length;

  return Math.min(
    100,
    Math.round((completedStages / stages.length) * 100)
  );
};