import React from "react";

const Shipping = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">شحنات البراند</h1>
        <p className="mt-2 text-sm text-slate-500">
          عرض سريع لحالة الشحن الحالية للطلبات والعملاء.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "المحجوز", value: "26" },
          { label: "التجهيز", value: "14" },
          { label: "خرجت", value: "9" },
          { label: "متبقي", value: "12" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">شحنات اليوم</h2>
        <div className="mt-5 space-y-4">
          {[
            "شحنة S-2024: في طريقها للعميل.",
            "شحنة S-2025: جاهزة للتسليم.",
            "شحنة S-2026: تحتاج اعتماد المدير.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shipping;
