import React from "react";

const SahabaAssistant = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">مساعد الصحابة</h1>
        <p className="mt-2 text-sm text-slate-500">
          واجهة الذكاء الاصطناعي لملخص الحالة وإعداد رسائل واتساب وتقارير PDF.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "تحليل الصور", status: "مفعل" },
          { label: "توقع التأخير", status: "مستعد" },
          { label: "كتابة التقرير", status: "آلي" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {item.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SahabaAssistant;
