import React from "react";
import { NavLink } from "react-router-dom";
import { menuItems } from "./MenuItems";
import logo from "../assets/logo.jpeg"; // 💡 استدعاء اللوجو هنا

const roleTitles = {
  customer_service: "خدمة العملاء",
  planning: "التخطيط",
  warehouse: "الشحن و المخزن",
  management: "الإدارة",
};

const Sidebar = ({ role, closeSidebar }) => {
  const menu = menuItems[role] || menuItems.customer_service;

  return (
    <aside
      className="h-full min-h-screen bg-blue-950 text-white overflow-y-auto flex flex-col font-arabic"
      dir="rtl"
    >
      {/* 💡 التعديل هنا: إضافة اللوجو وتنسيقه في الهيدر */}
      <div className="border-b border-white/10 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* حاوية اللوجو */}
          <div className="bg-white rounded-xl p-1 shrink-0 shadow-sm">
            <img
              src={logo}
              alt="الصحابة"
              className="w-12 h-12 object-contain rounded-lg"
            />
          </div>
          <div>
            <p className="text-xs tracking-widest text-slate-300 font-bold">
              نظام الصحابة
            </p>
            <h1 className="mt-1 text-lg font-black text-white">
              {roleTitles[role]}
            </h1>
          </div>
        </div>

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
                    ? "bg-white text-blue-950 shadow-sm"
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
