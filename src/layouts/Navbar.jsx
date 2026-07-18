import React from "react";

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm z-30">
      <div className="flex items-center gap-4">
        {/* زرار المنيو (يظهر في الشاشات الصغيرة فقط) */}
        <button
          onClick={toggleSidebar}
          className="xl:hidden flex items-center justify-center p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          {/* Menu Icon (SVG) */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <p className="text-sm text-slate-500 hidden sm:block">
            واجهة موحدة لأوردرات الصحابة
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a365d]">
            لوحة متابعة العمليات
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="hidden rounded-full bg-slate-100 w-10 h-10 items-center justify-center text-slate-600 sm:flex hover:bg-slate-200 transition">
          🔔
        </button>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-[#1a365d] hidden sm:block">
          سارة أحمد
        </div>
        <button className="rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
};

export default Navbar;
