import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* الحاوية البيضاء الرئيسية */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        {/* الترحيب والنص التوضيحي */}
        <div className="text-right mb-6">
          <h1 className="text-xl font-bold text-[#1a365d] mb-2 flex items-center gap-2">
            أهلاً، محمد يونس <span>👋</span>
          </h1>
          <p className="text-sm text-slate-500">
            نظرة سريعة على الكولكشنات تحت التشغيل.
          </p>
        </div>

        {/* المربعات الإحصائية */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* مربع "تحت التشغيل" (اليمين) */}
          <div className="flex-1 bg-slate-50/70 rounded-xl py-10 text-center border border-slate-100">
            <p className="text-3xl font-bold text-[#1a365d] mb-2">1</p>
            <p className="text-sm text-slate-500 font-medium">تحت التشغيل</p>
          </div>

          {/* مربع "متأخر" (اليسار) */}
          <div className="flex-1 bg-red-50/50 rounded-xl py-10 text-center border border-red-50">
            <p className="text-3xl font-bold text-red-600 mb-2">0</p>
            <p className="text-sm text-slate-500 font-medium">متأخر</p>
          </div>
        </div>

        {/* زر متابعة الكولكشنات */}
        <div className="flex justify-end">
          <Link
            to="/planning/collections_followup"
            className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 w-fit inline-block"
          >
            متابعة الكولكشنات ◀
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
