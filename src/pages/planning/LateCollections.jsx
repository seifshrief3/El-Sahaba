import React from "react";

const LateCollections = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          المجموعات المتأخرة
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          عرض سريع للمجموعات التي تحتاج متابعة سريعة وتسليم عاجل.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {[
          {
            collection: "كولكشن الصيف",
            models: 12,
            deadline: "10 يوليو",
            status: "تأخير 3 أيام",
          },
          {
            collection: "كولكشن الشتاء",
            models: 8,
            deadline: "20 يوليو",
            status: "تأخير 1 يوم",
          },
          {
            collection: "كولكشن الريزن",
            models: 5,
            deadline: "25 يوليو",
            status: "في الموعد",
          },
        ].map((item) => (
          <div
            key={item.collection}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{item.collection}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {item.models} موديلات
                </p>
              </div>
              <span className="rounded-2xl bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-700">
              آخر ميعاد تسليم: {item.deadline}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LateCollections;
