import React from "react";

const OrdersFollowup = () => {
  // بيانات وهمية للأوردرات (في المستقبل هتجيبها من الـ API)
  const orders = [
    {
      id: "1024",
      brand: "مدرسة ستانفورد",
      collection: "صيف 2026",
      phase: "الخياطة",
      progress: 75,
      status: "يسير حسب الخطة",
    },
    {
      id: "1025",
      brand: "شركة الأمل",
      collection: "يونيفورم 2026",
      phase: "في انتظار اعتماد السعر",
      progress: 20,
      status: "متوقف",
    },
    {
      id: "1026",
      brand: "براند إيليت",
      collection: "خريف 2026",
      phase: "الشحن",
      progress: 95,
      status: "عاجل",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* الهيدر */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a365d]">
            متابعة الأوردرات
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            عرض حالة التنفيذ الفعلي لكل أوردر.
          </p>
        </div>

        {/* الفلاتر */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="بحث بالبراند أو الكود..."
            className="flex-1 p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
          />
          <select className="p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white">
            <option>كل المراحل</option>
            <option>القص والتنفيذ</option>
            <option>الطباعة والتطريز</option>
            <option>الخياطة</option>
            <option>الشحن</option>
          </select>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">كود الطلب</th>
                  <th className="p-4">البراند</th>
                  <th className="p-4">الكولكشن</th>
                  <th className="p-4">المرحلة الحالية</th>
                  <th className="p-4">نسبة الإنجاز</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-[#1a365d]">
                      #{order.id}
                    </td>
                    <td className="p-4 font-medium">{order.brand}</td>
                    <td className="p-4 text-slate-600">{order.collection}</td>
                    <td className="p-4 text-slate-600">{order.phase}</td>
                    <td className="p-4">
                      <div className="w-full bg-slate-200 rounded-full h-2 w-24">
                        <div
                          className="bg-[#1a365d] h-2 rounded-full"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "عاجل"
                            ? "bg-red-100 text-red-700"
                            : order.status === "متوقف"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
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
    </div>
  );
};

export default OrdersFollowup;
