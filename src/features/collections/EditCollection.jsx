import React, { useState } from "react";

const EditCollection = () => {
  // حالة التحكم في إظهار وإخفاء التفاصيل الإضافية
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* الكارت الرئيسي (العلوي) */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm">
          {/* الهيدر: العنوان ونسبة الاكتمال */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1 sm:mb-2">
                تعديل: كولكشن 1
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                نسبة اكتمال بيانات الكولكشن:
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
              <span className="text-xs sm:text-sm text-slate-500">
                آخر حفظ: 2026/07/16
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[4px] sm:border-[5px] border-[#1a365d] flex items-center justify-center text-[#1a365d] font-bold text-xs sm:text-sm">
                100%
              </div>
            </div>
          </div>

          <form className="text-right">
            {/* اختيار البراند */}
            <div className="mb-6">
              <label className="block text-sm text-slate-600 mb-2">
                البراند *
              </label>
              <select className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 bg-white">
                <option>مدرسة ستانفورد (2284)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                تم سحب لوجو وبيانات البراند تلقائياً. عايز تغير اللوجو؟ عدله من{" "}
                <a href="#" className="text-[#1a365d] font-bold underline">
                  صفحة البراند نفسها
                </a>{" "}
                — كل الكولكشنات هتاخد اللوجو الجديد تلقائياً.
              </p>
            </div>

            {/* الصف الأول */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm text-slate-600 mb-2">
                  اسم الكولكشن *
                </label>
                <input
                  type="text"
                  defaultValue="كولكشن 1"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  القسم *
                </label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option>أطفال</option>
                  <option>حريمي</option>
                  <option>رجالي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  الموسم
                </label>
                <input
                  type="text"
                  defaultValue="صيف 2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  السنة
                </label>
                <input
                  type="text"
                  defaultValue="2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  عدد الموديلات *
                </label>
                <input
                  type="number"
                  defaultValue="65"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
            </div>

            {/* الصف الثاني */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  موعد التسليم
                </label>
                <input
                  type="text"
                  defaultValue="08/05/2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  مسؤول خدمة العملاء
                </label>
                <input
                  type="text"
                  defaultValue="hgfhf"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
            </div>

            {/* الملاحظة العامة */}
            <div className="mb-8">
              <label className="block text-sm text-slate-600 mb-2">
                ملاحظة عامة
              </label>
              <textarea
                rows="3"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* الأزرار وقسم التفاصيل الإضافية */}
            <div className="flex flex-col items-end gap-3 mb-6 w-full">
              {/* زر التبديل */}
              <button
                type="button"
                onClick={() => setShowExtraDetails(!showExtraDetails)}
                className="w-full sm:w-auto text-[#1a365d] border border-[#1a365d] px-6 py-2.5 sm:py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition text-center"
              >
                {showExtraDetails
                  ? "إخفاء التفاصيل الإضافية ▲"
                  : "تفاصيل إضافية (اختياري) ▼"}
              </button>

              {/* قسم التفاصيل الإضافية (يظهر عند الضغط) */}
              {showExtraDetails && (
                <div className="bg-[#f8fafc] w-full rounded-xl border border-slate-200 p-4 sm:p-6 my-2 shadow-inner">
                  {/* الصف الأول */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        كود الكولكشن
                      </label>
                      <input
                        type="text"
                        defaultValue="COL-mrm379tgzsa6b"
                        readOnly
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-right sm:text-center focus:outline-none text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center line-clamp-1">
                        اسم العميل (مسحوب من البراند)
                      </label>
                      <input
                        type="text"
                        defaultValue="مدرسة ستانفورد"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        كود العميل
                      </label>
                      <input
                        type="text"
                        defaultValue="6564"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        تليفون العميل
                      </label>
                      <input
                        type="text"
                        defaultValue="6546"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        إيميل العميل
                      </label>
                      <input
                        type="text"
                        defaultValue="hgfhf"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* الصف الثاني */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        نوع المنتج
                      </label>
                      <input
                        type="text"
                        defaultValue="hfghf"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center line-clamp-1">
                        المقاسات العامة
                      </label>
                      <input
                        type="text"
                        defaultValue="656"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        الكمية المتوقعة
                      </label>
                      <input
                        type="text"
                        defaultValue="5646"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        نسبة العربون %
                      </label>
                      <input
                        type="text"
                        defaultValue="5646"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        أولوية الكولكشن
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>عادي</option>
                        <option>عاجل</option>
                      </select>
                    </div>
                  </div>

                  {/* الصف الثالث */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        حالة الكولكشن
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>مسودة</option>
                        <option>قيد الاعداد</option>
                        <option>بيانات مكتملة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
                        حالة اعتماد البيانات
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>لم يعتمد بعد</option>
                        <option>معتمد جزئيا</option>
                        <option>معتمد بالكامل</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* أزرار الحفظ */}
              <div className="flex w-full sm:w-auto mt-2">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-[#b91c1c] text-white px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold hover:bg-red-800 transition"
                >
                  حفظ وإنشاء الموديلات ◀
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* الكارت السفلي (أمر التشغيل) */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="text-right w-full sm:w-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#1a365d]">
                أمر التشغيل
              </h3>
              {/* شارة الحالة تظهر جنب العنوان في الموبايل أو على الشمال في الديسكتوب */}
              <span className="sm:hidden bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                لم يصدر أمر
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 sm:px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold w-full sm:w-auto transition flex items-center justify-center gap-2">
                إصدار أمر بدء 🚀
              </button>
              <button className="text-[#1a365d] border border-[#1a365d] px-6 sm:px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold w-full sm:w-auto hover:bg-slate-50 transition flex items-center justify-center gap-2">
                فتح سجل الأوامر 📜
              </button>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-sm font-bold border border-slate-200">
              لم يصدر أمر تشغيل
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCollection;
