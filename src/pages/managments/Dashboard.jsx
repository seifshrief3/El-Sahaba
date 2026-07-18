import React from "react";

const stats = [
  { label: "قيد التشغيل", value: "12" },
  { label: "متأخرة", value: "3" },
  { label: "الشحنات اليوم", value: "7" },
  { label: "بانتظار الموافقة", value: "2" },
];

const activities = [
  "تم إنشاء كولكشن جديد لبراند Nike",
  "أنهى التخطيط مرحلة القص لكولكشن Summer",
  "تم إنشاء شحنة جديدة لبراند Adidas",
  "تم اعتماد عرض سعر جديد",
];

const orders = [
  {
    collection: "Summer 2026",
    brand: "Nike",
    status: "قيد التشغيل",
    color: "bg-blue-100 text-blue-700",
  },
  {
    collection: "Kids",
    brand: "Adidas",
    status: "متأخر",
    color: "bg-red-100 text-red-700",
  },
  {
    collection: "Winter",
    brand: "Puma",
    status: "جاهز للشحن",
    color: "bg-green-100 text-green-700",
  },
];

const alerts = [
  "يوجد 2 أوردر متأخر يحتاج المتابعة.",
  "يوجد طلب موافقة جديد من قسم التخطيط.",
  "يوجد شحنة لم يتم تسليمها حتى الآن.",
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          لوحة مدير المتابعة
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          نظرة عامة على حالة المصنع والأوردرات.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#002366]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">آخر النشاطات</h2>

          <div className="mt-5 space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
              >
                {activity}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">التنبيهات</h2>

          <div className="mt-5 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                ⚠ {alert}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Orders */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          الأوردرات المهمة
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">الكولكشن</th>
                <th className="pb-3">البراند</th>
                <th className="pb-3">الحالة</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.collection}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-4 font-medium">{order.collection}</td>
                  <td>{order.brand}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${order.color}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
