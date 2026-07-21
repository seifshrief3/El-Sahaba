import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);

  // بيانات وهمية للكولكشنات
  const collectionsData = [
    {
      id: "C-101",
      brand: "مدرسة ستانفورد",
      name: "الزي الشتوي 2026",
      status: "جاهزة لإصدار أمر التشغيل",
      date: "2026-07-20",
    },
    {
      id: "C-104",
      brand: "ستار كيدز",
      name: "كولكشن خريفي",
      status: "جاهزة لإصدار أمر التشغيل",
      date: "2026-07-19",
    },
    {
      id: "C-102",
      brand: "شركة الأمل",
      name: "كولكشن الصيف",
      status: "قيد انتظار العميل",
      date: "2026-07-18",
    },
    {
      id: "C-103",
      brand: "براند إيليت",
      name: "تيشيرت بولو",
      status: "قيد انتظار العميل",
      date: "2026-07-17",
    },
    {
      id: "C-105",
      brand: "أكاديمية المستقبل",
      name: "الزي الرياضي",
      status: "مسودة",
      date: "2026-07-20",
    },
  ];

  // سجل النظام (System Logs)
  const systemLogs = [
    {
      id: 1,
      title: "اعتماد عميل",
      desc: "تم اعتماد عرض السعر للبراند: مدرسة ستانفورد.",
      time: "10:30 ص",
      date: "اليوم",
      type: "success",
    },
    {
      id: 2,
      title: "طلب تعديل",
      desc: "براند إيليت يطلب تعديل مقاسات الموديل (تيشيرت بولو).",
      time: "09:15 ص",
      date: "اليوم",
      type: "warning",
    },
    {
      id: 3,
      title: "إنشاء ملف",
      desc: "تم إنشاء الورقة الفنية (Tech Pack) للبراند: ستار كيدز.",
      time: "04:00 م",
      date: "أمس",
      type: "info",
    },
  ];

  // الحسابات
  const stats = {
    total: collectionsData.length,
    notStarted: collectionsData.filter((c) => c.status === "مسودة").length,
    waitingClient: collectionsData.filter(
      (c) => c.status === "قيد انتظار العميل",
    ).length,
    readyToStart: collectionsData.filter(
      (c) => c.status === "جاهزة لإصدار أمر التشغيل",
    ).length,
  };

  const handleCardClick = (title, statusFilter) => {
    let data = [];
    if (statusFilter === "الكل") {
      data = collectionsData;
    } else {
      data = collectionsData.filter((c) => c.status === statusFilter);
    }
    setModalTitle(title);
    setFilteredCollections(data);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر العلوي */}
        {/* ======================= */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a365d] mb-1">
              لوحة التحكم الرئيسية — خدمة العملاء
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              نظرة عامة على الكولكشنات، حالات الاعتماد، وسجل نشاط النظام.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/customer_service/brands"
              className="flex-1 md:flex-none text-center bg-white text-[#1a365d] border border-slate-300 hover:bg-slate-50 px-6 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
            >
              سجل البراندات
            </Link>
            <Link
              to="/customer_service/add_collection"
              className="flex-1 md:flex-none text-center bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
            >
              + كولكشن جديد
            </Link>
          </div>
        </div>

        {/* ======================= */}
        {/* كروت الإحصائيات (تفاعلية) */}
        {/* ======================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleCardClick("سجل الكولكشنات الكامل", "الكل")}
            className="bg-white p-5 rounded-lg border-t-4 border-slate-200 border-x border-b shadow-sm hover:shadow hover:border-t-[#1a365d] transition-all cursor-pointer group flex items-start justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                إجمالي الكولكشنات
              </h3>
              <p className="text-3xl font-black text-[#1a365d]">
                {stats.total}
              </p>
            </div>
            <div className="text-slate-300 group-hover:text-[#1a365d] transition-colors">
              <svg
                className="w-8 h-8"
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

          <div
            onClick={() => handleCardClick("مسودات النظام (لم تبدأ)", "مسودة")}
            className="bg-white p-5 rounded-lg border-t-4 border-slate-200 border-x border-b shadow-sm hover:shadow hover:border-t-slate-500 transition-all cursor-pointer group flex items-start justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                مسودات (لم تبدأ)
              </h3>
              <p className="text-3xl font-black text-slate-700">
                {stats.notStarted}
              </p>
            </div>
            <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
            </div>
          </div>

          <div
            onClick={() =>
              handleCardClick("كولكشنات قيد الانتظار", "قيد انتظار العميل")
            }
            className="bg-white p-5 rounded-lg border-t-4 border-slate-200 border-x border-b shadow-sm hover:shadow hover:border-t-orange-500 transition-all cursor-pointer group flex items-start justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                قيد انتظار العميل
              </h3>
              <p className="text-3xl font-black text-orange-600">
                {stats.waitingClient}
              </p>
            </div>
            <div className="text-slate-300 group-hover:text-orange-500 transition-colors">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>

          <div
            onClick={() =>
              handleCardClick(
                "كولكشنات جاهزة للتشغيل",
                "جاهزة لإصدار أمر التشغيل",
              )
            }
            className="bg-white p-5 rounded-lg border-t-4 border-slate-200 border-x border-b shadow-sm hover:shadow hover:border-t-emerald-600 transition-all cursor-pointer group flex items-start justify-between"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                جاهزة للتشغيل
              </h3>
              <p className="text-3xl font-black text-emerald-600">
                {stats.readyToStart}
              </p>
            </div>
            <div className="text-slate-300 group-hover:text-emerald-600 transition-colors">
              <svg
                className="w-8 h-8"
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
        </div>

        {/* ======================= */}
        {/* قسم القوائم والسجلات */}
        {/* ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الاختصارات */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#1a365d]">
                إجراءات سريعة
              </h2>
            </div>
            <div className="p-2 flex-1">
              <Link
                to="/customer_service/customer_followup"
                className="flex items-center justify-between p-3 mb-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 transition group"
              >
                <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a365d]">
                  متابعة موافقات العملاء
                </span>
                <span className="text-slate-400">◀</span>
              </Link>
              <Link
                to="/customer_service/pricing"
                className="flex items-center justify-between p-3 mb-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 transition group"
              >
                <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a365d]">
                  التسعير وعروض الأسعار
                </span>
                <span className="text-slate-400">◀</span>
              </Link>
              <Link
                to="/customer_service/brands"
                className="flex items-center justify-between p-3 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 transition group"
              >
                <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a365d]">
                  جميع البراندات
                </span>
                <span className="text-slate-400">◀</span>
              </Link>
            </div>
          </div>

          {/* سجل النظام */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-[#1a365d]">
                سجل النظام (System Logs)
              </h2>
              <button className="text-xs font-bold text-[#b91c1c] hover:underline">
                عرض السجل الكامل
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-0 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="relative pl-4 pr-10 pb-6 last:pb-0"
                  >
                    <div
                      className={`absolute right-2.5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${
                        log.type === "success"
                          ? "bg-emerald-500"
                          : log.type === "warning"
                            ? "bg-orange-500"
                            : "bg-[#1a365d]"
                      }`}
                    ></div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {log.title}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {log.date} - {log.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{log.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= */}
      {/* الـ Modal (تصميم جدولي احترافي) */}
      {/* ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* الهيدر */}
            <div className="flex justify-between items-center p-5 bg-[#1a365d] text-white">
              <h2 className="text-base font-bold">{modalTitle}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-[#b91c1c] text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* جدول البيانات */}
            <div className="overflow-y-auto flex-1 bg-slate-50 p-6">
              {filteredCollections.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-bold">البراند</th>
                        <th className="py-3 px-4 font-bold">الكولكشن</th>
                        <th className="py-3 px-4 font-bold">تاريخ الإنشاء</th>
                        <th className="py-3 px-4 font-bold">الحالة الحالية</th>
                        <th className="py-3 px-4 font-bold text-center">
                          إجراء
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCollections.map((col, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-[#1a365d]">
                            {col.brand}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {col.name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">
                            {col.date}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                col.status === "جاهزة لإصدار أمر التشغيل"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : col.status === "قيد انتظار العميل"
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {col.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link
                              to={`/customer_service/followup`}
                              className="text-[#1a365d] hover:text-[#b91c1c] text-xs font-bold underline transition-colors"
                            >
                              فتح الملف
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border border-slate-200 rounded-lg bg-white">
                  <p className="text-slate-500 text-sm font-bold">
                    لا توجد بيانات مطابقة في الوقت الحالي.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
