import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase"; // تأكد من مسار الـ supabase
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // States للبيانات الديناميكية
  const [stats, setStats] = useState({
    activeOrders: 0,
    delayedOrders: 0,
    todayShipments: 0,
    pendingApprovals: 0,
  });
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. حساب تاريخ اليوم لفلترة شحنات اليوم
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // جلب البيانات بالتوازي (Parallel) عشان السرعة
      const [
        { count: activeOrdersCount },
        { count: todayShipmentsCount },
        { count: pendingApprovalsCount },
        { data: recentLogs },
        { data: recentOrders },
      ] = await Promise.all([
        // عدد الأوردرات قيد التشغيل (بافتراض إن الحالة مش مكتملة)
        supabase
          .from("production_orders")
          .select("*", { count: "exact", head: true })
          .neq("status", "completed")
          .neq("status", "مكتمل"), // التعامل مع الحالتين

        // شحنات اليوم
        supabase
          .from("shipments")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfToday.toISOString()),

        // الموافقات المعلقة
        supabase
          .from("approvals")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent"), // أو الحالة اللي بتستخدمها للمراجعة

        // آخر 4 نشاطات من سجل التعديلات
        supabase
          .from("system_logs")
          .select("id, module, action_type, title, description, created_at")
          .order("created_at", { ascending: false })
          .limit(4),

        // أحدث 4 أوردرات مهمة
        supabase
          .from("production_orders")
          .select(
            `
            id,
            status,
            collections (
              name,
              brands ( name_ar )
            )
          `,
          )
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      const delayed = 0; // منطق الأوردرات المتأخرة يحتاج للتعديل حسب تواريخك

      setStats({
        activeOrders: activeOrdersCount || 0,
        delayedOrders: delayed,
        todayShipments: todayShipmentsCount || 0,
        pendingApprovals: pendingApprovalsCount || 0,
      });

      if (recentLogs) {
        setActivities(recentLogs);
      }

      const newAlerts = [];
      if (delayed > 0)
        newAlerts.push(`يوجد ${delayed} أوردر متأخر يحتاج المتابعة.`);
      if (pendingApprovalsCount > 0)
        newAlerts.push(
          `يوجد ${pendingApprovalsCount} طلبات موافقة بانتظار اعتمادك.`,
        );
      if (activeOrdersCount > 10)
        newAlerts.push(
          `ضغط عمل مرتفع: يوجد ${activeOrdersCount} أوردر قيد التشغيل.`,
        );
      if (newAlerts.length === 0)
        newAlerts.push("لا توجد تنبيهات عاجلة، سير العمل طبيعي.");

      setAlerts(newAlerts);

      if (recentOrders) {
        const formattedOrders = recentOrders.map((order) => {
          let phase = order.status || "قيد الانتظار";

          // ترجمة الحالة هنا
          if (phase === "draft") phase = "مسودة";
          if (phase === "completed" || phase === "مكتمل") phase = "تم الانجاز";

          let color = "bg-slate-100 text-slate-700";
          if (
            phase === "قيد التشغيل" ||
            phase === "القص والتنفيذ" ||
            phase === "الخياطة" ||
            phase === "الطباعة والتطريز" ||
            phase === "الشحن"
          )
            color = "bg-blue-100 text-blue-700";
          if (phase === "متأخر" || phase === "عاجل")
            color = "bg-red-100 text-red-700";
          if (phase === "تم الانجاز" || phase === "جاهز للشحن")
            color = "bg-green-100 text-green-700";
          if (
            phase.includes("انتظار") ||
            phase === "متوقف" ||
            phase === "مسودة"
          )
            color = "bg-orange-100 text-orange-700";

          return {
            id: order.id,
            collection: order.collections?.name || "غير محدد",
            brand: order.collections?.brands?.name_ar || "غير محدد",
            status: phase, // هيتعرض مترجم
            color: color,
          };
        });
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- دوال الترجمة ---
  const translateModule = (moduleName) => {
    const modules = {
      customer_service: "خدمة العملاء",
      production: "الإنتاج",
      planning: "التخطيط",
      inventory: "المخازن",
      shipping: "الشحن",
      management: "الإدارة",
    };
    return modules[moduleName?.toLowerCase()] || moduleName;
  };

  const translateAction = (actionType) => {
    const actions = {
      STATUS_CHANGE: "تغيير حالة",
      CREATE: "إضافة",
      UPDATE: "تعديل",
      DELETE: "حذف",
      APPROVE: "موافقة",
      REJECT: "رفض",
    };
    return actions[actionType?.toUpperCase()] || actionType;
  };

  const getActionColor = (type) => {
    const upperType = type?.toUpperCase();
    if (["CREATE", "إضافة", "APPROVE", "موافقة"].includes(upperType)) {
      return "bg-green-100 text-green-700";
    }
    if (
      ["UPDATE", "تعديل", "STATUS_CHANGE", "تغيير حالة"].includes(upperType)
    ) {
      return "bg-blue-100 text-blue-700";
    }
    if (["DELETE", "حذف", "REJECT", "رفض"].includes(upperType)) {
      return "bg-red-100 text-red-700";
    }
    return "bg-slate-200 text-slate-700";
  };
  // -------------------

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center text-[#1a233a]">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <h2 className="text-xl font-bold">جاري تحميل بيانات المصنع...</h2>
        </div>
      </div>
    );
  }

  const statsArray = [
    { label: "قيد التشغيل", value: stats.activeOrders },
    { label: "متأخرة", value: stats.delayedOrders },
    { label: "الشحنات اليوم", value: stats.todayShipments },
    { label: "بانتظار الموافقة", value: stats.pendingApprovals },
  ];

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#1a233a]">
          لوحة مدير المتابعة
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          نظرة عامة على حالة المصنع والأوردرات.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statsArray.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#cc0000]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a233a]">آخر النشاطات</h2>
          <div className="mt-5 space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-[#1a233a] leading-relaxed">
                      {activity.title}
                    </p>
                    <span
                      className="text-[10px] text-slate-400 shrink-0 mt-0.5"
                      dir="ltr"
                    >
                      {new Date(activity.created_at).toLocaleString("ar-EG", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {translateModule(activity.module)}{" "}
                      {/* استخدام دالة الترجمة */}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${getActionColor(
                        activity.action_type,
                      )}`}
                    >
                      {translateAction(activity.action_type)}{" "}
                      {/* استخدام دالة الترجمة */}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                لا توجد نشاطات مسجلة حديثاً.
              </p>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a233a]">التنبيهات</h2>
          <div className="mt-5 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-xl border p-4 text-sm font-bold ${
                  alert.includes("لا توجد")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-[#cc0000]"
                }`}
              >
                {!alert.includes("لا توجد") && "⚠ "} {alert}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Orders */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold text-[#1a233a]">الأوردرات المهمة</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold">الكولكشن</th>
                <th className="pb-3 font-semibold">البراند</th>
                <th className="pb-3 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 font-bold text-[#1a233a]">
                      {order.collection}
                    </td>
                    <td className="font-medium text-slate-600">
                      {order.brand}
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${order.color}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-slate-500">
                    لا توجد أوردرات حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
