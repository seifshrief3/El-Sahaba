import React, { useState } from "react";
import { Link } from "react-router-dom";

const StartOrder = () => {
  // بيانات افتراضية للكولكشن المعتمد
  const collectionInfo = {
    id: "C-101",
    brandName: "مدرسة ستانفورد",
    collectionName: "الزي المدرسي الشتوي",
    approvedDate: "2026-07-20",
    models: [
      { id: "M-1", name: "تيشيرت بولو شتوي", approvedPrice: 350 },
      { id: "M-2", name: "بنطلون جبردين كحلي", approvedPrice: 420 },
      { id: "M-3", name: "جاكيت ووتر بروف", approvedPrice: 650 },
    ],
  };

  // قائمة المقاسات المتاحة
  const availableSizes = [
    "4 سنوات",
    "6 سنوات",
    "8 سنوات",
    "10 سنوات",
    "12 سنة",
    "14 سنة",
    "16 سنة",
  ];

  // الـ States الخاصة بالمدخلات
  const [selectedSizes, setSelectedSizes] = useState([
    "6 سنوات",
    "8 سنوات",
    "10 سنوات",
    "12 سنة",
  ]);
  const [seriesCount, setSeriesCount] = useState(5); // عدد السريهات الافتراضي

  // دالة اختيار/إلغاء المقاسات
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // --- الحسابات التلقائية (AI / System Math) ---
  // كمية القطع في المقاس الواحد = عدد السريهات (مثال: 5 سريهات = 5 قطع من مقاس 6 سنوات)
  const piecesPerSize = seriesCount;
  // كمية الموديل الواحد = عدد المقاسات المختارة × عدد السريهات
  const qtyPerModel = selectedSizes.length * seriesCount;
  // الإجمالي الكلي للقطع = كمية الموديل × عدد الموديلات
  const grandTotalQty = qtyPerModel * collectionInfo.models.length;
  // القيمة الإجمالية = (كمية الموديل 1 × سعره) + (كمية الموديل 2 × سعره)...
  const grandTotalValue = collectionInfo.models.reduce(
    (acc, model) => acc + qtyPerModel * model.approvedPrice,
    0,
  );

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* زر الرجوع */}
        <div className="flex justify-end">
          <Link
            to="/customer_service/followup"
            className="text-[#1a365d] border border-[#1a365d] bg-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ◀ رجوع للمتابعة
          </Link>
        </div>

        {/* 1. هيدر أمر التشغيل */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                إصدار أمر التشغيل (كميات الكولكشن)
              </h1>
              <p className="text-sm text-slate-500">
                تم اعتماد الـ Tech Pack والسعر. قم بتحديد المقاسات وعدد السريهات
                وسيقوم النظام بحساب الكميات تلقائياً.
              </p>
            </div>
            <div>
              <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200">
                جاهز للتشغيل ✓
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2. لوحة التحكم والإدخالات (لا يوجد إدخال يدوي للكميات) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* اختيار المقاسات */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
                1. تحديد المقاسات المطلوبة
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                      selectedSizes.includes(size)
                        ? "bg-[#1a365d] text-white border-[#1a365d]"
                        : "bg-slate-50 text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSizes.length === 0 && (
                <p className="text-xs text-red-500 mt-3 text-right">
                  يرجى اختيار مقاس واحد على الأقل.
                </p>
              )}
            </div>

            {/* اختيار عدد السريهات */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
                2. عدد السريهات (التوزيع متساوي)
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {[1, 2, 3, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSeriesCount(num)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                      seriesCount === num
                        ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                        : "bg-slate-50 text-slate-600 border-slate-300 hover:border-[#b91c1c] hover:text-[#b91c1c]"
                    }`}
                  >
                    {num} سري
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 font-medium">
                  أو إدخال مخصص:
                </span>
                <input
                  type="number"
                  min="1"
                  value={seriesCount}
                  onChange={(e) =>
                    setSeriesCount(parseInt(e.target.value) || 0)
                  }
                  className="w-24 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 text-right leading-relaxed">
                <strong>توضيح النظام:</strong> اختيار {seriesCount} سري يعني أن
                النظام سيضع تلقائياً {piecesPerSize} قطع في كل مقاس من المقاسات
                المحددة لكل موديل.
              </div>
            </div>
          </div>

          {/* 3. العرض المباشر للحسابات (النتيجة) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#1a365d] mb-6 text-right">
              معاينة أمر التشغيل والحسابات التلقائية
            </h3>

            {/* جدول الموديلات والكميات */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto mb-6">
              <table className="w-full text-sm text-center min-w-[600px]">
                <thead className="bg-[#1a365d] text-white">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-right">
                      الموديل
                    </th>
                    <th className="py-3 px-4 font-semibold">توزيع المقاسات</th>
                    <th className="py-3 px-4 font-semibold">إجمالي الكمية</th>
                    <th className="py-3 px-4 font-semibold">السعر المعتمد</th>
                    <th className="py-3 px-4 font-semibold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {collectionInfo.models.map((model) => (
                    <tr key={model.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-4 font-bold text-right">
                        {model.name}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap justify-center gap-1">
                          {selectedSizes.map((size) => (
                            <span
                              key={size}
                              className="bg-slate-100 border border-slate-200 text-xs px-2 py-1 rounded"
                            >
                              {size}{" "}
                              <span className="font-bold text-[#b91c1c]">
                                ({piecesPerSize})
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-lg">
                        {qtyPerModel}{" "}
                        <span className="text-xs text-slate-500 font-normal">
                          قطعة
                        </span>
                      </td>
                      <td className="py-4 px-4 text-emerald-700 font-bold">
                        {model.approvedPrice} ج
                      </td>
                      <td className="py-4 px-4 font-bold">
                        {(qtyPerModel * model.approvedPrice).toLocaleString()}{" "}
                        ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الإجماليات النهائية (Summary) */}
            <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold">
                  إجمالي قطع الأوردر:
                </span>
                <span className="text-2xl font-black text-[#1a365d]">
                  {grandTotalQty.toLocaleString()}{" "}
                  <span className="text-sm font-normal">قطعة</span>
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-bold">
                  إجمالي قيمة التعاقد:
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {grandTotalValue.toLocaleString()}{" "}
                  <span className="text-sm font-normal">ج.م</span>
                </span>
              </div>
            </div>

            {/* الأزرار النهائية لإنشاء العقد والإرسال للتخطيط */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
              <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-2">
                📄 معاينة وإنشاء العقد التلقائي
              </button>
              <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition shadow-sm w-full sm:w-auto">
                إصدار أمر التشغيل وإرسال للتخطيط 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartOrder;
