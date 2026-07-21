import React, { useState } from "react";
import { Link } from "react-router-dom";

const DeliverablesSchedule = () => {
  // بيانات وهمية للكولكشنات الجاري العمل عليها (مترتبة حسب الأولوية)
  const [scheduleData] = useState([
    {
      id: "C-105",
      collectionName: "الزي الشتوي 2026",
      brand: "مدرسة ستانفورد",
      dueDate: "15 أغسطس 2026",
      daysLeft: 2,
      currentStage: "التقفيل النهائي",
    },
    {
      id: "C-108",
      collectionName: "تيشيرت بولو",
      brand: "براند إيليت",
      dueDate: "18 أغسطس 2026",
      daysLeft: 5,
      currentStage: "الطباعة والتطريز",
    },
    {
      id: "C-109",
      collectionName: "كولكشن الصيف",
      brand: "شركة الأمل",
      dueDate: "25 أغسطس 2026",
      daysLeft: 12,
      currentStage: "القص",
    },
    {
      id: "C-112",
      collectionName: "كولكشن خريفي",
      brand: "ستار كيدز",
      dueDate: "01 سبتمبر 2026",
      daysLeft: 19,
      currentStage: "استلام الخامات",
    },
  ]);

  // دالة لتحديد لون شارة (Badge) الأيام المتبقية
  const getDaysBadgeStyle = (days) => {
    if (days <= 3) return "bg-red-50 text-[#b91c1c] border-red-200"; // حرج جداً
    if (days <= 7) return "bg-orange-50 text-orange-600 border-orange-200"; // تحذير
    return "bg-emerald-50 text-emerald-700 border-emerald-200"; // آمن
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر العلوي */}
        {/* ======================= */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a365d] mb-1">
              جدول التسليمات والأولويات
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              عرض وترتيب أوامر التشغيل بناءً على مواعيد التسليم لضمان الالتزام
              بالخطط.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none text-center bg-white text-[#1a365d] border border-slate-300 hover:bg-slate-50 px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              استخراج تقرير AI
            </button>
          </div>
        </div>

        {/* ======================= */}
        {/* شريط البحث والفلترة */}
        {/* ======================= */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="ابحث باسم الكولكشن أو البراند..."
            className="w-full sm:flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm"
          />
          <select className="w-full sm:w-48 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm font-bold text-[#1a365d]">
            <option>ترتيب: الأقرب تسليماً</option>
            <option>ترتيب: الأبعد تسليماً</option>
            <option>فلترة: متأخر فقط</option>
          </select>
        </div>

        {/* ======================= */}
        {/* كارت الجدول */}
        {/* ======================= */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-right">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    الكولكشن
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    البراند
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    موعد التسليم
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    الأيام المتبقية
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    المرحلة الحالية
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scheduleData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#1a365d] text-sm">
                        {item.collectionName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {item.id}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {item.brand}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                      {item.dueDate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold border ${getDaysBadgeStyle(item.daysLeft)}`}
                      >
                        {item.daysLeft} أيام
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">
                      {item.currentStage}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link
                        to={`/planning/checklist/${item.id}`}
                        className="text-[#1a365d] hover:text-[#b91c1c] text-xs font-bold transition-colors underline"
                      >
                        تحديث المراحل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* رسالة في حالة عدم وجود داتا */}
          {scheduleData.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm font-bold">
                لا توجد تسليمات قادمة حالياً.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliverablesSchedule;
