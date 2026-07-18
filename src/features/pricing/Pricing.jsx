import React, { useState } from "react";

const Pricing = () => {
  // حالة لتحديد الشاشة الحالية: 'list' (القائمة) أو 'form' (شاشة إنشاء/تعديل العرض)
  const [view, setView] = useState("list");
  // حالة لتخزين الكولكشن المختار
  const [selectedCollection, setSelectedCollection] = useState("");

  // بيانات وهمية لملء الجدول عشان يظهر زي الصورة
  const dummyModels = [
    { id: "2286", name: "موديل 3", qty: "5646" },
    { id: "2287", name: "موديل 4", qty: "5646" },
    { id: "2288", name: "موديل 5", qty: "5646" },
    { id: "2289", name: "موديل 6", qty: "5646" },
    { id: "2290", name: "موديل 7", qty: "5646" },
    { id: "2291", name: "موديل 8", qty: "5646" },
    { id: "2292", name: "موديل 9", qty: "5646" },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      {/* ========================================================= */}
      {/* 1. شاشة القائمة الرئيسية */}
      {/* ========================================================= */}
      {view === "list" && (
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* كارت العنوان والفلتر */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 border-b border-slate-100 pb-5 sm:pb-6 mb-5 sm:mb-6">
              <div className="text-right">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                  التسعير وعروض الأسعار
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  كل عرض سعر مرتبط مباشرة بكولكشن وموديلاته الفعلية — مفيش
                  بيانات ثابتة.
                </p>
              </div>
              <button
                onClick={() => setView("form")}
                className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors w-full md:w-auto"
              >
                + عرض سعر جديد
              </button>
            </div>

            {/* الفلتر */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-slate-600 mb-2 font-medium">
                فلترة بكولكشن
              </label>
              <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                <option>كل الكولكشنات</option>
                <option>كولكشن 1</option>
              </select>
            </div>
          </div>

          {/* كارت عرض السعر المحفوظ */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
            <div className="text-right w-full md:flex-1">
              <h2 className="text-lg font-bold text-[#1a365d] mb-2">
                كولكشن 1 — مدرسة ستانفورد
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-3">
                65 موديل — إجمالي 401,280 ج.م — 2026/07/16
              </p>
              <span className="bg-orange-50 text-orange-700 border border-orange-100 px-4 py-1.5 rounded-full text-xs font-bold inline-block">
                جاهز للمراجعة
              </span>
            </div>
            <div className="w-full md:w-auto">
              <button
                onClick={() => {
                  setSelectedCollection("كولكشن 1");
                  setView("form");
                }}
                className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors w-full md:w-auto"
              >
                فتح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. شاشة إضافة/تعديل عرض سعر */}
      {/* ========================================================= */}
      {view === "form" && (
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
          {/* زر الرجوع */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setView("list");
                setSelectedCollection(""); // تصفير الاختيار عند الرجوع
              }}
              className="text-[#1a365d] border border-[#1a365d] bg-white px-5 sm:px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              ◀ كل عروض الأسعار
            </button>
          </div>

          {/* الكارت الرئيسي لنموذج التسعير */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
            {/* اختيار الكولكشن (يظهر لو لسه مختارش) */}
            {!selectedCollection && (
              <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <h3 className="text-base sm:text-lg font-bold text-[#1a365d] mb-4">
                  اختار الكولكشن لإنشاء عرض السعر
                </h3>
                <select
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full md:w-1/2 mx-auto border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">— اختار كولكشن —</option>
                  <option value="كولكشن 1">كولكشن 1 — مدرسة ستانفورد</option>
                  <option value="كولكشن 2">كولكشن 2 — شركة الأمل</option>
                </select>
              </div>
            )}

            {/* تفاصيل العرض (تظهر فقط بعد اختيار الكولكشن) */}
            {selectedCollection && (
              <div className="animate-fade-in">
                {/* الهيدر وحالة المسودة */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-slate-100 pb-5 sm:pb-6">
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d]">
                      عرض سعر — {selectedCollection}
                    </h2>
                  </div>
                  <div>
                    <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                      مسودة
                    </span>
                  </div>
                </div>

                {/* البيانات الأساسية (2 أعمدة في الموبايل، 4 في الديسكتوب) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 text-right">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 sm:mb-2">
                      البراند
                    </label>
                    <p className="font-semibold text-sm sm:text-base text-slate-800">
                      مدرسة ستانفورد
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 sm:mb-2">
                      العميل
                    </label>
                    <p className="font-semibold text-sm sm:text-base text-slate-800">
                      مدرسة ستانفورد
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 sm:mb-2">
                      تاريخ العرض
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-07-16"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 sm:mb-2">
                      مدة الصلاحية (يوم)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none text-right"
                    />
                  </div>
                </div>

                {/* جدول الموديلات (مع دعم السكرول الأفقي) */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto mb-6 sm:mb-8">
                  <table className="w-full text-sm text-center min-w-[600px]">
                    <thead className="bg-[#1a365d] text-white">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-1/4 text-right">
                          الموديل
                        </th>
                        <th className="py-3 px-4 font-semibold w-1/4">
                          الكمية
                        </th>
                        <th className="py-3 px-4 font-semibold w-1/4">
                          سعر القطعة
                        </th>
                        <th className="py-3 px-4 font-semibold w-1/4">
                          الإجمالي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dummyModels.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 text-slate-700 font-medium text-right whitespace-nowrap">
                            {item.name}{" "}
                            <span className="text-slate-400 text-xs">
                              #{item.id}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              defaultValue={item.qty}
                              className="w-20 sm:w-24 border border-slate-300 rounded p-1.5 text-center focus:outline-none focus:border-blue-500 text-slate-700"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="text"
                              className="w-20 sm:w-24 border border-slate-300 rounded p-1.5 text-center focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-700">
                            -
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* الإجمالي الكلي وملاحظة التكلفة */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-[#1a365d] font-bold text-lg mb-4 text-right">
                    الإجمالي الكلي: 0 ج.م
                  </p>
                  <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-right leading-relaxed">
                    التكلفة الداخلية والهامش مش ظاهرين ليك - لو محتاجهم اطلب من
                    المدير يفعل الصلاحية.
                  </div>
                </div>

                {/* شروط الدفع والملاحظات */}
                <div className="space-y-4 sm:space-y-6 text-right mb-6 sm:mb-8">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                      شروط الدفع والتنفيذ
                    </label>
                    <textarea
                      rows="3"
                      defaultValue="50% مقدمًا عند الاعتماد، والباقي عند التسليم."
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none text-slate-700"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                      ملاحظات العرض
                    </label>
                    <textarea
                      rows="3"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* زر الحفظ */}
                <div className="flex justify-end border-t border-slate-100 pt-5 sm:pt-6">
                  <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-10 py-3 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                    حفظ كمسودة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
