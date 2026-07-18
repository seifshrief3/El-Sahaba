import React from "react";

const EditsHistory = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">سجل التعديلات</h1>
        <p className="mt-2 text-sm text-slate-500">
          عرض مبسط لتاريخ التعديلات على الملفات والأوامر.
        </p>
      </div>

      <div className="space-y-4">
        {[
          "تم تغيير موعد التسليم للطلب 1024.",
          "تم تعديل كمية الموديل M-1025.",
          "تم تحديث حالة الشحن لشحنة S-2024.",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditsHistory;
