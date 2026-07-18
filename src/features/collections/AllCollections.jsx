import React from "react";
import { Link } from "react-router-dom";

const AllCollections = () => {
  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* ========================================================= */}
        {/* 1. الهيدر */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-slate-500">الكولكشنات</p>
              <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#1a365d]">
                كل الكولكشنات
              </h1>
            </div>
            <Link
              to="/customer_service/add_collection"
              className="rounded-lg bg-[#b91c1c] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-800 text-center w-full sm:w-auto block"
            >
              + إنشاء كولكشن جديد
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. قائمة الكولكشنات */}
        {/* ========================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-5 sm:gap-6 hover:shadow-md transition">
          {/* بيانات الكولكشن (اليمين) */}
          <div className="text-right">
            <h2 className="text-lg sm:text-xl font-bold text-[#1a365d] mb-2 sm:mb-1">
              كولكشن 1
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium text-slate-600">
                اسم البراند
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-100">
                يسير حسب الخطة
              </span>
            </div>
          </div>

          {/* الإحصائيات والأزرار (اليسار/الأسفل) */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full md:w-auto">
            {/* الإحصائيات */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm w-full lg:w-auto bg-slate-50 lg:bg-transparent p-3 lg:p-0 rounded-lg border lg:border-none border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1a365d]">30</span>
                <span className="text-slate-500">موديل</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1a365d]">33%</span>
                <span className="text-slate-500">استكمال</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-[#92400e]">
                <span className="font-bold">20</span>
                <span>يوم متبقي</span>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-none border-slate-100">
              <button className="flex-1 lg:flex-none rounded-lg border border-[#b91c1c] text-[#b91c1c] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition hover:bg-red-50 text-center">
                تحميل PDF
              </button>
              <Link
                to="/customer_service/edit_collection/2"
                className="flex-1 lg:flex-none rounded-lg bg-[#b91c1c] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-red-800 text-center"
              >
                فتح ◀
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCollections;
