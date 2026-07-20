import React, { useState } from "react";

const Pricing = () => {
  const [view, setView] = useState("list");
  const [selectedCollection, setSelectedCollection] = useState("");

  // بيانات الموديلات (بدون كميات حسب طلب العميل)
  const dummyModels = [
    { id: "2286", name: "موديل 3" },
    { id: "2287", name: "موديل 4" },
    { id: "2288", name: "موديل 5" },
    { id: "2289", name: "موديل 6" },
    { id: "2290", name: "موديل 7" },
    { id: "2291", name: "موديل 8" },
    { id: "2292", name: "موديل 9" },
  ];

  // حالة لتخزين التكلفة لكل موديل
  const [costs, setCosts] = useState({});
  // حالة لنسبة الربح (الافتراضي 15%)
  const [profitMargin, setProfitMargin] = useState(15);

  // تحديث التكلفة في الـ State
  const handleCostChange = (id, value) => {
    const numValue = parseFloat(value) || 0;
    setCosts({ ...costs, [id]: numValue });
  };

  // --- العمليات الحسابية التلقائية ---
  // 1. إجمالي التكلفة
  const totalCost = dummyModels.reduce(
    (acc, curr) => acc + (costs[curr.id] || 0),
    0,
  );
  // 2. متوسط التكلفة
  const averageCost =
    dummyModels.length > 0 ? totalCost / dummyModels.length : 0;
  // 3. سعر البيع النهائي بعد إضافة نسبة الربح
  const finalSellingPrice = totalCost + (totalCost * profitMargin) / 100;

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
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 border-b border-slate-100 pb-5 sm:pb-6 mb-5 sm:mb-6">
              <div className="text-right">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                  التسعير وعروض الأسعار
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  إنشاء عرض سعر بناءً على التكلفة المباشرة للموديلات وتحديد هامش
                  الربح.
                </p>
              </div>
              <button
                onClick={() => setView("form")}
                className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors w-full md:w-auto"
              >
                + عرض سعر جديد
              </button>
            </div>

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

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
            <div className="text-right w-full md:flex-1">
              <h2 className="text-lg font-bold text-[#1a365d] mb-2">
                كولكشن 1 — مدرسة ستانفورد
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-3">
                7 موديلات — إجمالي التكلفة 4,200 ج.م — 2026/07/16
              </p>
              <span className="bg-orange-50 text-orange-700 border border-orange-100 px-4 py-1.5 rounded-full text-xs font-bold inline-block">
                مسودة
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
                فتح وتسعير
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
          <div className="flex justify-end">
            <button
              onClick={() => {
                setView("list");
                setSelectedCollection("");
              }}
              className="text-[#1a365d] border border-[#1a365d] bg-white px-5 sm:px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              ◀ كل عروض الأسعار
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
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

            {selectedCollection && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-slate-100 pb-5 sm:pb-6">
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d]">
                      عرض سعر — {selectedCollection}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      العميل يعتمد الـ Tech Pack وعرض السعر معًا في هذه المرحلة.
                    </p>
                  </div>
                  <div>
                    <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                      قيد التسعير
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 text-right">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      البراند
                    </label>
                    <p className="font-semibold text-sm sm:text-base text-slate-800">
                      مدرسة ستانفورد
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      العميل
                    </label>
                    <p className="font-semibold text-sm sm:text-base text-slate-800">
                      مدرسة ستانفورد
                    </p>
                  </div>
                </div>

                {/* جدول إدخال التكلفة */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto mb-8">
                  <table className="w-full text-sm text-center min-w-[500px]">
                    <thead className="bg-[#1a365d] text-white">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-1/2 text-right">
                          الموديل
                        </th>
                        <th className="py-3 px-4 font-semibold w-1/2">
                          التكلفة على الشركة (ج.م)
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
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              placeholder="أدخل التكلفة"
                              value={costs[item.id] || ""}
                              onChange={(e) =>
                                handleCostChange(item.id, e.target.value)
                              }
                              className="w-32 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* الحسابات التلقائية ونسبة الربح */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
                    حساب التسعير التلقائي
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-6">
                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">
                        إجمالي تكلفة الموديلات
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalCost.toLocaleString()} ج.م
                      </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">
                        متوسط تكلفة الموديل
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        {averageCost.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        ج.م
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 text-right">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      اختر نسبة الربح المستهدفة:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[10, 15, 20, 25, 30].map((marginValue) => (
                        <button
                          key={marginValue}
                          onClick={() => setProfitMargin(marginValue)}
                          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors border ${
                            profitMargin === marginValue
                              ? "bg-[#1a365d] text-white border-[#1a365d]"
                              : "bg-white text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
                          }`}
                        >
                          {marginValue}%
                        </button>
                      ))}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          أو نسبة مخصصة:
                        </span>
                        <input
                          type="number"
                          value={profitMargin}
                          onChange={(e) =>
                            setProfitMargin(parseFloat(e.target.value) || 0)
                          }
                          className="w-20 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-blue-500 bg-white text-sm"
                        />{" "}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a365d] text-white p-5 rounded-lg text-center flex flex-col md:flex-row justify-between items-center">
                    <p className="text-lg font-medium mb-2 md:mb-0">
                      سعر البيع النهائي المقترح (شامل الربح)
                    </p>
                    <p className="text-2xl font-bold">
                      {finalSellingPrice.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      ج.م
                    </p>
                  </div>
                </div>

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
                      rows="2"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 pt-5 sm:pt-6">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                    💬 تجهيز رسالة واتساب
                  </button>
                  <button className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                    📄 إنشاء عرض سعر PDF
                  </button>
                  <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                    حفظ التعديلات
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
