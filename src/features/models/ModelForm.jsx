import React, { useState } from "react";

const ModelForm = ({ activeModel }) => {
  // قائمة المقاسات المطلوبة
  const sizesList = [
    "6 شهور",
    "9 شهور",
    "12 شهور",
    "18 شهور",
    "24 شهور",
    "2 سنوات",
    "3 سنوات",
    "4 سنوات",
    "5 سنوات",
    "6 سنوات",
    "7 سنوات",
    "8 سنوات",
    "10 سنوات",
    "12 سنة",
    "14 سنة",
    "16 سنة",
    "18 سنة",
    "20 سنة",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
  ];

  // State الخاص بزرار إضافة خامات جديدة فقط
  const [fabrics, setFabrics] = useState([""]);

  const addFabric = () => {
    setFabrics([...fabrics, ""]);
  };

  if (!activeModel) return null;

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6"
      dir="rtl"
    >
      {/* هيدر الموديل والتنبيه */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
            {activeModel.name || "اسم الموديل"}
            <span className="text-sm font-normal text-slate-400">
              — {activeModel.code || "كود الموديل"}
            </span>
          </h3>
          <div className="flex items-center gap-4">
            {activeModel.hasError && (
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                أحمر - بيانات ناقصة
              </span>
            )}
          </div>
        </div>

        {activeModel.hasError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm font-medium text-right">
            بيانات ناقصة: الخامة، وزن الخامة، المقاسات، الصور
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* قسم بيانات الموديل الأساسية */}
      <div>
        <h4 className="text-lg font-bold text-[#1a365d] mb-1">
          بيانات الموديل الأساسية
        </h4>
        <p className="text-sm text-slate-500 mb-6 text-right">
          دي كل المدخلات المطلوبة من خدمة العملاء — أي تفاصيل فنية تانية
          بيقترحها الذكاء الاصطناعي بعد رفع الصور.
        </p>

        {/* 1. رفع صورة الموديل (تصميم المربع) */}
        <div className="mb-6">
          <label className="block text-sm text-slate-600 mb-3 text-right">
            صورة الموديل *
          </label>
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
            <span className="text-3xl text-slate-400 mb-1">+</span>
            <span className="text-xs text-slate-500 font-medium text-center px-2">
              إضافة صورة الموديل
            </span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-slate-600 mb-2 text-right">
              اسم المنتج
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2 text-right">
              رقم الموديل (تلقائي)
            </label>
            <input
              type="text"
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm text-slate-500 text-right"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2 text-right">
              وزن الخامة *
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 2. أنواع الخامات (مع زرار الإضافة) */}
        <div className="mb-8 w-full md:w-1/2">
          <label className="block text-sm text-slate-600 mb-2 text-right">
            نوع الخامة *
          </label>
          {fabrics.map((_, idx) => (
            <div key={idx} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="أدخل نوع الخامة..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-blue-500"
              />
              {idx === fabrics.length - 1 && (
                <button
                  type="button"
                  onClick={addFabric}
                  className="bg-slate-100 hover:bg-slate-200 text-[#1a365d] px-4 py-2.5 rounded-lg text-sm transition font-medium"
                >
                  إضافة+
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 4. المقاسات المحدثة */}
        <div className="mb-8">
          <label className="block text-sm text-slate-600 mb-3 text-right">
            المقاسات المتاحة
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {sizesList.map((size, idx) => (
              <button
                key={idx}
                type="button"
                className="bg-white border border-slate-300 text-slate-600 rounded-full px-4 py-1.5 text-sm transition hover:border-[#1a365d] hover:text-[#1a365d]"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ملاحظة */}
        <div>
          <label className="block text-sm text-slate-600 mb-2 text-right">
            ملاحظة قصيرة من العميل (اختياري)
          </label>
          <textarea
            rows="2"
            placeholder="مثال: ترينج أطفال شتوي..."
            className="w-full border border-slate-300 rounded-lg p-3 text-sm text-right focus:outline-none focus:border-blue-500 resize-none placeholder-slate-400"
          ></textarea>
        </div>
      </div>

      <hr className="border-slate-100 mt-4 mb-2" />

      {/* 3. زرار إنشاء الورقة الفنية والشات الذكي (UI فقط) */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex justify-between flex-wrap gap-5 items-center mb-6">
          <div>
            <h4 className="text-lg font-bold text-[#1a365d]">
              الورقة الفنية (Tech Pack)
            </h4>
            <p className="text-sm text-slate-500 text-right">
              قم بإنشاء الورقة الفنية ليقوم الذكاء الاصطناعي باقتراح التفاصيل.
            </p>
          </div>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 w-full md:w-fit rounded-lg text-sm transition shadow-sm"
          >
            إنشاء الورقة الفنية
          </button>
        </div>

        {/* واجهة الشات مع الذكاء الاصطناعي (بدون وظائف) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600 mb-4 text-right">
            المساعد الذكي: اطلب أي تعديل على الورقة الفنية (المقاسات، الألوان،
            الخامات...)
          </p>

          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-slate-400 text-center py-4">
              لا توجد رسائل حتى الآن، ابدأ المحادثة لتعديل الورقة الفنية.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-blue-500 bg-slate-50"
              placeholder="مثال: غير لون التيشيرت للأزرق وضيف سوستة..."
            />
            <button
              type="button"
              className="bg-[#1a365d] hover:bg-slate-800 text-white px-5 py-2.5 text-sm font-medium rounded-lg transition"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelForm;
