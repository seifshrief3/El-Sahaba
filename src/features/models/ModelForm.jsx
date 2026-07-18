import React from "react";

const ModelForm = ({ activeModel, onModelChange }) => {
  const sizes = [
    "6 شهور",
    "9 شهور",
    "12 شهر",
    "18 شهر",
    "24 شهر",
    "3 سنوات",
    "4 سنوات",
    "5 سنوات",
    "6 سنوات",
    "7 سنوات",
    "8 سنوات",
    "9 سنوات",
    "10 سنوات",
    "11 سنة",
    "12 سنة",
    "13 سنة",
    "14 سنة",
    "15 سنة",
    "16 سنة",
    "18 سنة",
    "20 سنة",
  ];

  if (!activeModel) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
      {/* هيدر الموديل والتنبيه */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
            {activeModel.name}{" "}
            <span className="text-sm font-normal text-slate-400">
              — {activeModel.code}
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
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm font-medium">
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
        <p className="text-sm text-slate-500 mb-6">
          دي كل المدخلات المطلوبة من خدمة العملاء — أي تفاصيل فنية تانية
          بيقترحها الذكاء الاصطناعي بعد رفع الصور.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              اسم المنتج
            </label>
            <input
              type="text"
              value={activeModel.name}
              onChange={(e) => onModelChange("name", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              رقم الموديل (تلقائي)
            </label>
            <input
              type="text"
              value={activeModel.code}
              disabled
              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm text-slate-500 text-center"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              نوع الخامة *
            </label>
            <input
              type="text"
              value={activeModel.fabric || ""}
              onChange={(e) => onModelChange("fabric", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              وزن الخامة *
            </label>
            <input
              type="text"
              value={activeModel.weight || ""}
              onChange={(e) => onModelChange("weight", e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* المقاسات */}
        <div className="mb-8">
          <label className="block text-sm text-slate-600 mb-3">
            المقاسات (جدول أطفال)
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.map((size, idx) => (
              <button
                key={idx}
                className="border border-slate-300 rounded-full px-4 py-1.5 text-sm text-slate-600 hover:border-[#1a365d] hover:text-[#1a365d] transition bg-white"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ملاحظة */}
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            ملاحظة قصيرة من العميل (اختياري)
          </label>
          <textarea
            rows="2"
            value={activeModel.notes || ""}
            onChange={(e) => onModelChange("notes", e.target.value)}
            placeholder="مثال: ترينج أطفال شتوي..."
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none placeholder-slate-400"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ModelForm;
