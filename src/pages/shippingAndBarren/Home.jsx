import React from "react";

const stats = [
  {
    title: "إجمالي المخزون",
    value: "5,420",
    sub: "قطعة متاحة",
  },
  {
    title: "استلامات اليوم",
    value: "8",
    sub: "من قسم التخطيط",
  },
  {
    title: "شحنات قيد التجهيز",
    value: "12",
    sub: "بانتظار الخروج",
  },
  {
    title: "تم شحنها اليوم",
    value: "15",
    sub: "شحنة",
  },
];

const activities = [
  {
    type: "استلام",
    brand: "Nike",
    collection: "Summer 2026",
    details: "تم استلام 520 قطعة من التخطيط",
    color: "bg-green-100 text-green-700",
  },
  {
    type: "شحن",
    brand: "Adidas",
    collection: "Kids",
    details: "تم شحن 180 قطعة إلى عميل القاهرة",
    color: "bg-blue-100 text-blue-700",
  },
  {
    type: "استلام",
    brand: "Puma",
    collection: "Winter",
    details: "تم استلام 240 قطعة",
    color: "bg-green-100 text-green-700",
  },
  {
    type: "شحن",
    brand: "Zara",
    collection: "Basic",
    details: "تم تجهيز شحنة جديدة",
    color: "bg-blue-100 text-blue-700",
  },
];

const alerts = [
  "يوجد شحنة بانتظار التجهيز.",
  "رصيد أحد الموديلات منخفض.",
  "يوجد شحنة خرجت ولم يتم تأكيد تسليمها.",
];

const Home = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          لوحة الشحن والمخزون
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          نظرة عامة على المخزون، الاستلامات، والشحنات.
        </p>
      </section>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.title}</p>

            <p className="mt-3 text-3xl font-bold text-[#002366]">
              {item.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Latest Activities */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">آخر العمليات</h2>

        <div className="mt-5 space-y-4">
          {activities.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{item.brand}</h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}
                >
                  {item.type}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{item.collection}</p>

              <p className="mt-2 text-sm text-slate-500">{item.details}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
