import React from "react";

const DeliverablesSchedule = () => {
  return (
    <div className="space-y-4 sm:space-y-6 font-arabic" dir="rtl">
      {/* 1. كارت العنوان */}
      <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-right">
        <h1 className="text-xl sm:text-3xl font-semibold text-slate-900">
          جدول التسليمات
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">
          عرض ثابت لأهم المواعيد المطلوبة لكل موديل.
        </p>
      </div>

      {/* 2. كارت الجدول (متجاوب) */}
      <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* حاوية التمرير الأفقي للشاشات الصغيرة */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          {/* تم إضافة min-w-[700px] لضمان عدم تداخل الأعمدة في الموبايل */}
          <table className="w-full min-w-[700px] divide-y divide-slate-200 text-right">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  الكولكشن
                </th>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  العميل
                </th>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  التسليم
                </th>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  الأيام المتبقية
                </th>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {[
                {
                  model: "M-1024",
                  quantity: "120",
                  due: "15 يونيو",
                  days: "3",
                  status: "جارٍ التنفيذ",
                },
                {
                  model: "M-1025",
                  quantity: "80",
                  due: "18 يونيو",
                  days: "3",
                  status: "تم إرسال الطباعة",
                },
                {
                  model: "M-1026",
                  quantity: "50",
                  due: "21 يونيو",
                  days: "3",
                  status: "الخياطة قيد التنفيذ",
                },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-sm font-medium text-slate-800">
                    {item.model}
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-700">
                    {item.due}
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-sm text-slate-700">
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                      {item.days} أيام
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 sm:px-5 py-3 sm:py-4 text-sm font-bold text-[#002366]">
                    {item.status}
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

export default DeliverablesSchedule;
