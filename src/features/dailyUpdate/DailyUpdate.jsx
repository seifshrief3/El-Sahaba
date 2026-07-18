import React, { useState } from "react";

const DailyUpdate = () => {
  // حالة لفتح وإغلاق المودال
  const [isModalOpen, setIsModalOpen] = useState(false);

  // مصفوفة الـ 17 مرحلة
  const stages = [
    "تم استلام البيانات",
    "تم اعتماد الصورة",
    "تم توليد التيك باك",
    "تم مراجعة التخطيط",
    "تم تجهيز الملف الفني",
    "تم إرسال للتسعير",
    "تم اعتماد التسعير",
    "تم بدء العينة",
    "تم اعتماد العينة",
    "تم بدء التنفيذ",
    "تم القص",
    "تم الطباعة / التطريز",
    "تم الخياطة",
    "تم التشطيب",
    "تم التعبئة",
    "تم التجهيز للشحن",
    "تم التسليم",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* 1. بطاقة عنوان الصفحة (التحديث اليومي) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 text-right">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          التحديث اليومي
        </h1>
        <p className="text-sm text-slate-500">
          تحديث سريع مختصر لكل أوردر تحت التشغيل — يستخدمه النظام في حساب موعد
          التسليم المتوقع ورسائل متابعة العملاء.
        </p>
      </div>

      {/* 2. كارت الكولكشن */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-900 mb-1">كولكشن 1</h2>
          <p className="text-sm text-slate-500 mb-3">
            مدرسة ستانفورد — المرحلة الحالية: تم استلام البيانات
          </p>
          <span className="inline-block bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium border border-orange-100">
            محتاج تحديث النهاردة
          </span>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            + تحديث اليوم
          </button>
        </div>
      </div>

      {/* 3. نافذة (Modal) نموذج التحديث */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          {/* محتوى المودال */}
          <div
            className="bg-white rounded-2xl w-full max-w-5xl p-8 shadow-xl overflow-y-auto max-h-[95vh]"
            dir="rtl"
          >
            {/* الهيدر بتاع المودال */}
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                تحديث اليوم — كولكشن 1
              </h2>
              <p className="text-sm text-slate-500">
                مدرسة ستانفورد — آخر مرة اتحدّث: لسه ما اتحدّثش
              </p>
            </div>

            {/* الفورم (النموذج) */}
            <form className="space-y-6 text-right">
              {/* الصف الأول: 5 حقول */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    المرحلة الحالية
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">— اختار —</option>
                    {stages.map((stage, index) => (
                      <option key={index} value={stage}>
                        {index + 1}. {stage}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    نسبة الإنجاز %
                  </label>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    الكمية المخططة
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    الكمية المنفذة
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    موعد انتهاء المرحلة
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-600"
                  />
                </div>
              </div>

              {/* الصف الثاني: موعد التسليم */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    موعد التسليم المتوقع
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-600"
                  />
                </div>
              </div>

              {/* الصف الثالث: خيارات الـ Checkboxes */}
              <div className="flex items-center gap-6 justify-start">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">يوجد عائق</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    يحتاج قرار من العميل
                  </span>
                </label>
              </div>

              {/* الصف الرابع: الملاحظة الداخلية */}
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  ملاحظة داخلية (مش هتظهر للعميل)
                </label>
                <textarea
                  rows="3"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {/* الصف الخامس: ملاحظة العميل */}
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  ملاحظة مسموح بإرسالها للعميل
                </label>
                <textarea
                  rows="3"
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  حفظ تحديث اليوم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyUpdate;
