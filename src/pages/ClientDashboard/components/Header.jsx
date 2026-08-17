import React from "react";
import ElsahabaLogo from "../../../assets/logo.jpeg";
import { LogOut, RefreshCw } from "lucide-react";

const Header = ({ brand, refreshing, onRefresh, onLogout }) => {
  return (
    <header className="bg-white border-b-4 border-[#DC2626] shadow-sm sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 md:px-7">
        <div className="h-20 flex items-center justify-between gap-4">
          {/* الجزء الأيمن: اللوجوهات (الصحابة + العميل) */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* 1. لوجو واسم الصحابة */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0">
                <img
                  src={ElsahabaLogo}
                  alt="شعار الصحابة"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-black text-xl md:text-2xl text-[#0D2748] tracking-tight leading-none">
                  الصحابة
                </h1>
                <p className="text-[10px] md:text-[11px] text-[#DC2626] font-black tracking-widest uppercase mt-0.5">
                  لتصنيع وتصدير الملابس
                </p>
              </div>
            </div>

            {/* فاصل بين اللوجوهين */}
            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

            {/* 2. لوجو واسم العميل (البراند) */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={
                    brand?.logo_url ||
                    brand?.logo ||
                    brand?.image_url ||
                    "/logo.png"
                  }
                  alt="شعار البراند"
                  className="w-full h-full object-contain p-1"
                  onError={(event) => {
                    event.currentTarget.src = "/logo.png";
                  }}
                />
              </div>
              <div>
                <h2 className="font-black text-sm md:text-lg text-[#0D2748]">
                  {brand?.name_ar || brand?.name || "بوابة العملاء"}
                </h2>
                <p className="text-[9px] md:text-[11px] text-slate-500 font-bold">
                  بوابة متابعة الإنتاج والشحن
                </p>
              </div>
            </div>
          </div>

          {/* الجزء الأيسر: الأزرار */}
          <div className="flex items-center gap-2">
            {/* زر تحديث البيانات */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="h-10 px-3 md:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 text-xs font-bold transition shadow-sm"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:block">تحديث البيانات</span>
            </button>

            {/* زر تسجيل الخروج */}
            <button
              onClick={onLogout}
              className="h-10 px-3 md:px-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 flex items-center gap-2 text-xs font-bold transition shadow-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
