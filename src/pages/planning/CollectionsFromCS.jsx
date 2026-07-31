import React, { useState } from "react";
import { Link } from "react-router-dom";

const CollectionsFromCS = () => {
  // بيانات وهمية للكولكشنات الجاري العمل عليها (تم استلامها بالفعل)
  const collectionsData = [
    {
      id: "ORD-902",
      brand: "ستار كيدز",
      collectionName: "كولكشن خريفي",
      modelsCount: 3,
      deliveryDate: "01 سبتمبر 2026",
      currentStage: "القص والتجهيز",
      status: "يسير حسب الخطة", // أخضر
    },
    {
      id: "ORD-903",
      brand: "شركة الأمل",
      collectionName: "كولكشن الصيف",
      modelsCount: 4,
      deliveryDate: "20 أغسطس 2026",
      currentStage: "الطباعة والتطريز",
      status: "يسير حسب الخطة",
    },
    {
      id: "ORD-885",
      brand: "مدرسة ستانفورد",
      collectionName: "الزي الرياضي",
      modelsCount: 2,
      deliveryDate: "25 يوليو 2026",
      currentStage: "التقفيل النهائي",
      status: "متأخر", // أحمر
    },
    {
      id: "ORD-910",
      brand: "براند إيليت",
      collectionName: "تيشيرت بولو",
      modelsCount: 1,
      deliveryDate: "10 أغسطس 2026",
      currentStage: "فحص الجودة",
      status: "يوجد ملاحظة", // برتقالي
    },
  ];

  // حالة الفلترة
  const [filter, setFilter] = useState("الكل");

  // تطبيق الفلترة
  const filteredCollections = collectionsData.filter((col) => {
    if (filter === "الكل") return true;
    return col.status === filter;
  });

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر وشريط البحث/الفلترة */}
        {/* ======================= */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a365d] mb-1">
              الكولكشنات تحت التشغيل
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              متابعة أوامر التشغيل النشطة والمراحل الحالية في صالة الإنتاج.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="ابحث باسم البراند أو الكولكشن..."
              className="w-full sm:w-64 border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[#1a365d] bg-slate-50"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-40 border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[#1a365d] bg-white font-bold text-[#1a365d]"
            >
              <option value="الكل">كل الحالات</option>
              <option value="يسير حسب الخطة">حسب الخطة</option>
              <option value="متأخر">متأخر</option>
              <option value="يوجد ملاحظة">يوجد ملاحظة</option>
            </select>
          </div>
        </div>

        {/* ======================= */}
        {/* شبكة كروت الكولكشنات النشطة */}
        {/* ======================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group overflow-hidden"
            >
              {/* شريط الحالة العلوي بناءً على موقف التشغيل */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  col.status === "متأخر"
                    ? "bg-[#b91c1c]"
                    : col.status === "يوجد ملاحظة"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
              ></div>

              <div className="p-6 flex flex-col flex-1 mt-1">
                {/* رأس الكارت (البراند والكود) */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1a365d] leading-tight mb-1">
                      {col.brand}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {col.id}
                    </span>
                  </div>
                  {/* شارة الحالة */}
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      col.status === "متأخر"
                        ? "bg-red-50 text-[#b91c1c] border-red-100"
                        : col.status === "يوجد ملاحظة"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}
                  >
                    {col.status}
                  </span>
                </div>

                <hr className="border-slate-100 mb-4" />

                {/* تفاصيل الكولكشن ومرحلة التنفيذ */}
                <div className="mb-6 flex-1 space-y-4">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      الكولكشن
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {col.collectionName}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      المرحلة الحالية
                    </span>
                    <p className="text-sm font-bold text-[#1a365d]">
                      {col.currentStage}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">
                      موعد التسليم:
                    </span>
                    <span
                      className={`font-bold ${col.status === "متأخر" ? "text-[#b91c1c]" : "text-slate-700"}`}
                    >
                      {col.deliveryDate}
                    </span>
                  </div>
                </div>

                {/* زرار الإجراء (فتح شاشة المراحل) */}
                <Link
                  to={`/planning/checklist/${col.id}`}
                  className="w-full bg-slate-50 text-[#1a365d] border border-slate-200 hover:border-[#1a365d] hover:bg-[#1a365d] hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-auto"
                >
                  فتح وتحديث المراحل ◀
                </Link>
                <button className="w-full bg-red-800 cursor-pointer text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-2">
                  تسليم الكولكشن للمخزن ◀
                </button>
              </div>
            </div>
          ))}

          {/* رسالة حالة عدم وجود بيانات */}
          {filteredCollections.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500 font-bold text-sm">
                لا توجد كولكشنات تحت التشغيل في هذه الحالة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsFromCS;
