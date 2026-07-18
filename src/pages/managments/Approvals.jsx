import React from "react";
import { Check, Eye, X } from "lucide-react";

const approvals = [
  {
    id: "#1024",
    title: "اعتماد مدة التشغيل",
    brand: "Nike",
    collection: "Summer 2026",
    department: "التخطيط",
    date: "17 يوليو 2026",
  },
  {
    id: "#1025",
    title: "اعتماد تعديل موعد التسليم",
    brand: "Adidas",
    collection: "Kids Collection",
    department: "خدمة العملاء",
    date: "17 يوليو 2026",
  },
  {
    id: "#1026",
    title: "اعتماد استئناف أوردر",
    brand: "Puma",
    collection: "Winter Collection",
    department: "التخطيط",
    date: "16 يوليو 2026",
  },
];

const Approvals = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">الموافقات</h1>
        <p className="mt-2 text-sm text-slate-500">
          جميع الطلبات التي تحتاج اعتماد المدير قبل تنفيذها.
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {approvals.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h2>

                <div className="text-sm text-slate-500 space-y-1">
                  <p>
                    <span className="font-medium text-slate-700">
                      رقم الطلب:
                    </span>{" "}
                    {item.id}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">البراند:</span>{" "}
                    {item.brand}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      الكولكشن:
                    </span>{" "}
                    {item.collection}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">القسم:</span>{" "}
                    {item.department}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      تاريخ الطلب:
                    </span>{" "}
                    {item.date}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                  <Check size={18} />
                  موافقة
                </button>

                <button className="flex items-center gap-2 rounded-xl bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900">
                  <X size={18} />
                  رفض
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Approvals;
