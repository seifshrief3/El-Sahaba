import React from "react";

const Notifications = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">التنبيهات</h1>
        <p className="mt-2 text-sm text-slate-500">
          عرض سريع لجميع التنبيهات المهمة والرسائل التي تحتاج انتباهك.
        </p>
      </section>

      <div className="space-y-4">
        {[
          "تنبيه: طلب 1024 يحتاج مراجعة قبل الإرسال.",
          "تنبيه: شحنة S-2025 تأخرت 1 يوم.",
          "رسالة: العميل طلب تغيير طريقة الشحن.",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
          >
            <p className="text-sm text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
