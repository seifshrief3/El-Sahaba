import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // بيانات وهمية للإحصائيات ونظرة عامة على الإنتاج
  const productionOverview = {
    completedStages: 65, // % المراحل المكتملة
    inProgressStages: 28, // % المراحل قيد التنفيذ
    issueStages: 7, // % المراحل اللي فيها مشكلة
  };

  // آخر 3 كولكشنات
  const recentCollections = [
    {
      id: "C-105",
      name: "الزي الشتوي 2026",
      progress: 75,
      currentStage: "التجميع المبدئي",
      brand: "مدرسة ستانفورد",
    },
    {
      id: "C-108",
      name: "تيشيرت بولو",
      progress: 40,
      currentStage: "القص",
      brand: "براند إيليت",
    },
    {
      id: "C-109",
      name: "كولكشن الصيف",
      progress: 15,
      currentStage: "فحص الخامات",
      brand: "شركة الأمل",
    },
  ];

  // مراحل تم الانتهاء منها اليوم
  const stagesCompletedToday = [
    {
      time: "02:30 م",
      stage: "القص",
      model: "تيشيرت بولو شتوي",
      collection: "الزي الشتوي 2026",
    },
    {
      time: "11:15 ص",
      stage: "فحص الخامات",
      model: "بنطلون جبردين",
      collection: "كولكشن الصيف",
    },
    {
      time: "09:00 ص",
      stage: "الباترون",
      model: "جاكيت ووتر بروف",
      collection: "الزي الشتوي 2026",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر العلوي */}
        {/* ======================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d] mb-1">
              لوحة تحكم الإنتاج
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              مرحباً بك. ملخص سريع لحالة خطوط الإنتاج اليوم.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/planning/collections"
              className="w-full md:w-auto text-white text-center bg-[#b91c1c] hover:bg-red-800 px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
            >
              عرض كل الكولكشنات
            </Link>
          </div>
        </div>

        {/* ======================= */}
        {/* كروت المؤشرات الأساسية (KPIs) */}
        {/* ======================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* كارت 1: تحت التشغيل */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-[#1a365d]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-[#1a365d]">تحت التشغيل</h3>
              <div className="w-8 h-8 bg-[#1a365d]/10 rounded flex items-center justify-center text-[#1a365d]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-[#1a365d]">
              5{" "}
              <span className="text-sm font-medium text-slate-400">
                كولكشنات
              </span>
            </p>
          </div>

          {/* كارت 2: مراحل تم إنجازها */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-[#1a365d]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-[#1a365d]">
                مراحل تم إنجازها اليوم
              </h3>
              <div className="w-8 h-8 bg-[#1a365d]/10 rounded flex items-center justify-center text-[#1a365d]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-[#1a365d]">
              12{" "}
              <span className="text-sm font-medium text-slate-400">مرحلة</span>
            </p>
          </div>

          {/* كارت 3: عوائق ومشاكل (باللون الأحمر) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-[#b91c1c]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-[#b91c1c]">عوائق ومشاكل</h3>
              <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-[#b91c1c]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-[#b91c1c]">
              2{" "}
              <span className="text-sm font-medium text-red-300">
                مرحلة متوقفة
              </span>
            </p>
          </div>
        </div>

        {/* ======================= */}
        {/* قسم الرسوم والإحصائيات المتوسطة */}
        {/* ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نظرة عامة على الإنتاج (النسب المئوية) */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-[#1a365d] mb-6">
              نظرة عامة على حالة المراحل
            </h2>

            <div className="space-y-5">
              {/* المراحل المكتملة */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-[#1a365d]">
                    مراحل مكتملة
                  </span>
                  <span className="text-sm font-bold text-[#1a365d]">
                    {productionOverview.completedStages}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#1a365d] h-2 rounded-full"
                    style={{ width: `${productionOverview.completedStages}%` }}
                  ></div>
                </div>
              </div>

              {/* قيد التنفيذ */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">
                    قيد التنفيذ (جاري)
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {productionOverview.inProgressStages}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-400 h-2 rounded-full"
                    style={{ width: `${productionOverview.inProgressStages}%` }}
                  ></div>
                </div>
              </div>

              {/* فيها مشكلة */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-[#b91c1c]">
                    توجد ملاحظة / مشكلة
                  </span>
                  <span className="text-sm font-bold text-[#b91c1c]">
                    {productionOverview.issueStages}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#b91c1c] h-2 rounded-full"
                    style={{ width: `${productionOverview.issueStages}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* آخر 3 كولكشنات تحت التشغيل */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-[#1a365d]">
                نشاط الكولكشنات الحالي
              </h2>
              <Link
                to="/planning/collections"
                className="text-xs font-bold text-[#b91c1c] hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            <div className="flex-1 space-y-4">
              {recentCollections.map((col, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-[#1a365d] text-sm mb-1">
                        {col.name}{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          ({col.brand})
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        المرحلة الحالية:{" "}
                        <span className="font-bold text-[#1a365d]">
                          {col.currentStage}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#1a365d] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {col.progress}% إنجاز
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-[#1a365d] h-1.5 rounded-full"
                      style={{ width: `${col.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* قسم السجل الزمني (مراحل تمت اليوم) */}
        {/* ======================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-[#1a365d] mb-6">
            مراحل تم الانتهاء منها اليوم
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stagesCompletedToday.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="mt-1 w-2 h-2 rounded-full bg-[#1a365d] shrink-0 shadow-[0_0_0_4px_rgba(26,54,93,0.1)]"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[#1a365d]">
                      مرحلة {item.stage}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    الموديل:{" "}
                    <span className="font-bold text-[#1a365d]">
                      {item.model}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.collection}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
