import React from "react";

const PlanningEngineer = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* 1. كارت الهيدر (المقدمة) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 text-right">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-[#1a365d]">
            المهندس الذكي للتخطيط والإنتاج
          </h1>
        </div>
      </div>

      {/* 2. حاوية الشات */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
        {/* منطقة عرض الرسائل */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {/* رسالة المستخدم (يمين) */}
          <div className="bg-[#1a365d] text-white px-6 py-3.5 rounded-xl w-fit mr-0 ml-auto shadow-sm">
            <p className="text-sm font-medium">الطاقة الانتاجية او المخاطر</p>
          </div>

          {/* رسالة البوت (تمتد بعرض الشاشة مع حدود) */}
          <div className="border border-slate-200 bg-white p-5 rounded-xl w-full shadow-sm text-right">
            <p className="text-sm text-slate-700 leading-relaxed">
              (Demo Mode) عدد الكولكشنات تحت التشغيل حاليًا: 1. تحليل طاقة
              إنتاجية حقيقي (حساب أحمال كل مرحلة بالتفصيل) هيتضاف في مرحلة لاحقة
              (Phase 3) بمنطق حسابي كامل، مش تخمين.
            </p>
          </div>
        </div>

        {/* 3. منطقة الإدخال (الأسفل) */}
        <div className="border-t border-slate-100 p-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="اسأل المهندس الذكي..."
            className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <button className="bg-[#b91c1c] hover:bg-red-800 text-white px-10 py-3 rounded-lg text-sm font-bold transition-colors">
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningEngineer;
