import React, { useState } from "react";
import { Link } from "react-router-dom";

const AddCollection = () => {
  // حالة التحكم في إظهار وإخفاء التفاصيل الإضافية (مفتوحة افتراضياً زي الصورة)
  const [showExtraDetails, setShowExtraDetails] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl flex flex-col gap-4">
        {/* زر الرجوع (كل الكولكشنات) */}
        <div className="flex justify-end mb-2">
          <Link
            to="/customer_service/collections"
            className="text-[#1a365d] border border-[#1a365d] bg-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ◀ كل الكولكشنات
          </Link>
        </div>

        {/* الكارت الرئيسي */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
          {/* الهيدر: العنوان ونسبة الاكتمال */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[#1a365d] mb-2">
                إعداد كولكشن جديد
              </h1>
              <p className="text-sm text-slate-500">
                نسبة اكتمال بيانات الكولكشن:
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">
                لسه ما اتحفظش
              </span>
              {/* شريط التقدم الدائري (Donut Chart مبسط) */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative"
                style={{ background: `conic-gradient(#1a365d 11%, #f1f5f9 0)` }}
              >
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#1a365d] font-bold text-xs">11%</span>
                </div>
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
                <option>— اختار براند —</option>
                <option>مدرسة ستانفورد (2284)</option>
              </select>
            </div>

            {/* الصف الأول (5 حقول) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  اسم الكولكشن *
                </label>
                <input
                  type="text"
                  defaultValue="كولكشن 2"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  القسم *
                </label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option>— اختار —</option>
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
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  السنة
                </label>
                <input
                  type="text"
                  defaultValue="2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  عدد الموديلات *
                </label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* الصف الثاني (حقلين فقط) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  موعد التسليم
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  مسؤول خدمة العملاء
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* الملاحظة العامة */}
            <div className="mb-6">
              <label className="block text-sm text-slate-600 mb-2">
                ملاحظة عامة
              </label>
              <textarea
                rows="3"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* الأزرار وقسم التفاصيل الإضافية */}
            <div className="flex flex-col gap-3 mb-6 w-full">
              {/* زر التبديل (يسار) */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtraDetails(!showExtraDetails)}
                  className="text-[#1a365d] border border-[#1a365d] px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  {showExtraDetails
                    ? "إخفاء التفاصيل الإضافية ▲"
                    : "إظهار التفاصيل الإضافية ▼"}
                </button>
              </div>

              {/* قسم التفاصيل الإضافية */}
              {showExtraDetails && (
                <div className="bg-[#f8fafc] w-full rounded-xl border border-slate-200 p-6 shadow-inner">
                  {/* الصف الأول */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        كود الكولكشن
                      </label>
                      <input
                        type="text"
                        defaultValue="COL-mro5w39dl6yec"
                        readOnly
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-center focus:outline-none text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        اسم العميل (مسحوب من البراند، قابل للتعديل)
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        كود العميل
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        تليفون العميل
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        إيميل العميل
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* الصف الثاني */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        نوع المنتج
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        المقاسات العامة (ملاحظة إضافية)
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        الكمية المتوقعة
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        نسبة العربون %
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        أولوية الكولكشن
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>عادي</option>
                        <option>عاجل</option>
                      </select>
                    </div>
                  </div>

                  {/* الصف الثالث */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        حالة الكولكشن
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>مسودة</option>
                        <option>نشط</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        حالة اعتماد البيانات
                      </label>
                      <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white">
                        <option>لم يعتمد بعد</option>
                        <option>معتمد</option>
                      </select>
                    </div>
                  </div>

                  {/* شروط الاتفاق */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-2 text-right">
                      شروط الاتفاق
                    </label>
                    <textarea
                      rows="3"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none bg-white"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="bg-[#b91c1c] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-red-800 transition"
            >
              حفظ وإنشاء الموديلات ◀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCollection;
