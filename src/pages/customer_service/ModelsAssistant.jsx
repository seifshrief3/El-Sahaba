import React from "react";

const ModelsAssistant = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* 1. كارت الهيدر العلوي */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-right flex justify-between items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 justify-start">
              <h1 className="text-xl md:text-2xl font-bold text-[#1a365d]">
                مساعد الصحابة الفني للموديلات
              </h1>
              <span className="bg-[#fef3c7] text-[#92400e] text-xs font-bold px-3 py-1 rounded-full">
                Demo Mode
              </span>
            </div>
            <p className="text-sm text-slate-500">
              اكتب وصف مبدئي للموديل، وهيقترح لك تفاصيل فنية للمراجعة (مش اعتماد
              تلقائي).
            </p>
          </div>
        </div>

        {/* 2. حاوية المحاكاة والشات */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[350px] justify-between">
          {/* النص الإرشادي في وسط الكارت */}
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-400 text-sm md:text-base text-center font-medium">
              جرب: "ترينج أطفال شتوي من ميلتون، هودي بسوستة، طباعة صغيرة على
              الصدر"
            </p>
          </div>

          {/* منطقة الإدخال وزر الإرسال في الأسفل */}
          <div className="border-t border-slate-100 pt-4 flex items-center gap-4">
            <input
              type="text"
              placeholder="اكتب وصف الموديل..."
              className="flex-1 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-right placeholder-slate-400 text-slate-700"
            />
            <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors">
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsAssistant;
