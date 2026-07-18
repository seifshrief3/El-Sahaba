import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ role = "customer_service", children }) => {
  // حالة التحكم في فتح وإغلاق القائمة الجانبية في الشاشات الصغيرة
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div
      className="min-h-screen w-full bg-slate-50 overflow-x-hidden font-arabic"
      dir="rtl"
    >
      <div className="flex min-h-screen flex-col xl:flex-row relative">
        {/* خلفية شفافة تظهر في الموبايل لما القائمة تفتح عشان تقفلها لما تدوس برا */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm xl:hidden transition-opacity"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Sidebar */}
        {/* استخدمنا fixed في الموبايل مع تحريك (translate) بناءً على الحالة */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-[250px] transform bg-blue-950 transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 xl:block xl:flex-shrink-0 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Sidebar role={role} closeSidebar={closeSidebar} />
        </aside>

        {/* المحتوى الرئيسي */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} />

          <main className="flex-1 w-full overflow-y-auto p-4 sm:p-6 xl:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
