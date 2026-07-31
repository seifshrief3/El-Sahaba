import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { role } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
      <div className="flex min-h-screen flex-col xl:flex-row relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm xl:hidden transition-opacity"
            onClick={closeSidebar}
          ></div>
        )}

        <aside
          className={`fixed inset-y-0 right-0 z-50 w-[250px] transform bg-blue-950 transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 xl:block xl:flex-shrink-0 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Sidebar role={role} closeSidebar={closeSidebar} />
        </aside>

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
