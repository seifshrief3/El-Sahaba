import { Boxes, LayoutDashboard, Truck } from "lucide-react";
import React from "react";

const Navigation = ({ activePage, setActivePage }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 md:px-7">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActivePage("home")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
              activePage === "home"
                ? "bg-[#0D2748] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard size={17} />
            الرئيسية
          </button>

          <button
            onClick={() => setActivePage("collections")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
              activePage === "collections"
                ? "bg-[#0D2748] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Boxes size={17} />
            الكولكشنات
          </button>

          <button
            onClick={() => setActivePage("shipments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition ${
              activePage === "shipments"
                ? "bg-[#0D2748] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Truck size={17} />
            سجل الشحنات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
