import React from "react";
import { NavLink } from "react-router-dom";
import { menuItems } from "./MenuItems"; // تأكد إن مسار الملف ده صح عندك

const roleTitles = {
  customer_service: "خدمة العملاء",
  planning: "التخطيط",
  warehouse: "مخزن منتجات البراندات",
  shipping: "الشحن",
  managments: "الإدارة",
};

const Sidebar = ({ role = "customer_service", closeSidebar }) => {
  const menu = menuItems[role] || menuItems.customer_service;

  return (
    <aside className="h-full min-h-screen bg-blue-950 text-white overflow-y-auto flex flex-col">
      <div className="border-b border-white/10 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              نظام الصحابة
            </p>
            <h1 className="mt-2 text-lg font-bold">{roleTitles[role]}</h1>
          </div>
        </div>

        {/* زرار إغلاق (X) يظهر في الموبايل فقط */}
        <button
          onClick={closeSidebar}
          className="xl:hidden text-white/70 hover:text-white p-2 rounded-lg bg-white/5 transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 py-5 flex-1">
        <nav className="space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar} // قفل القائمة تلقائياً عند الضغط في الموبايل
              end
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-white text-blue-950"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
