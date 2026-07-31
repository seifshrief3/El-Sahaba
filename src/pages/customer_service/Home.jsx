import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase";

// ==========================================
// 1. مكونات فرعية (Sub-components)
// ==========================================

const StatCard = ({ title, count, icon, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-5 rounded-lg border-t-4 border-slate-200 border-x border-b shadow-sm hover:shadow transition-all cursor-pointer group flex items-start justify-between ${colorClass}`}
  >
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <p className="text-3xl font-black">{count}</p>
    </div>
    <div className="text-slate-300 transition-colors group-hover:currentColor">
      {icon}
    </div>
  </div>
);

const QuickActionLink = ({ to, label }) => (
  <Link
    to={to}
    className="flex items-center justify-between p-3 mb-1 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 transition group"
  >
    <span className="font-bold text-sm text-slate-700 group-hover:text-[#1a365d]">
      {label}
    </span>
    <span className="text-slate-400">◀</span>
  </Link>
);

const LogItem = ({ log }) => {
  const badgeColors = {
    success: "bg-emerald-500", // للإنشاء CREATE
    warning: "bg-orange-500", // للتعديل UPDATE
    error: "bg-[#b91c1c]", // للحذف DELETE
    info: "bg-[#1a365d]", // لتغيير الحالة STATUS_CHANGE
    action: "bg-purple-500", // لأي إجراءات أخرى ACTION
  };

  return (
    <div className="relative pl-4 pr-10 pb-6 last:pb-0">
      <div
        className={`absolute right-2.5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${badgeColors[log.type] || badgeColors.info}`}
      ></div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
        <h4 className="text-sm font-bold text-slate-800">{log.title}</h4>
        <span className="text-[11px] font-bold text-slate-400">
          {log.date} - {log.time}
        </span>
      </div>
      <p className="text-sm text-slate-600">{log.desc}</p>
    </div>
  );
};

// ==========================================
// 2. المكون الأساسي (Main Component)
// ==========================================

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);

  const [collectionsData, setCollectionsData] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUiStatus = (status, customer_approval) => {
    if (status === "draft" || customer_approval === "not_sent") return "مسودة";
    if (
      customer_approval === "sent" ||
      customer_approval === "revision_requested"
    )
      return "قيد انتظار العميل";
    if (customer_approval === "approved" && status !== "active")
      return "جاهزة لإصدار أمر التشغيل";
    if (customer_approval === "in_production" || status === "active")
      return "تم الإصدار للتصنيع";
    return "غير معروف";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // 💡 جلب جماعي (Parallel Fetch) للكولكشنات (للإحصائيات) واللوجز الخاصة بقسم خدمة العملاء فقط
        const [colsRes, logsRes] = await Promise.all([
          supabase
            .from("collections")
            .select(
              `id, name, status, customer_approval, created_at, updated_at, brands (name_ar)`,
            ),
          supabase
            .from("system_logs")
            .select("*")
            .eq("module", "customer_service") // 💡 الفلترة هنا: إحضار سجلات خدمة العملاء فقط
            .order("created_at", { ascending: false })
            .limit(20), // بنجيب أحدث 20 حركة في السيستم
        ]);

        if (colsRes.error) throw colsRes.error;
        if (logsRes.error) console.error("Error fetching logs:", logsRes.error);

        // 1. تجهيز بيانات الكولكشنات للإحصائيات والجداول
        const formattedCollections = colsRes.data.map((c) => ({
          id: c.id,
          brand: c.brands?.name_ar || "غير محدد",
          name: c.name,
          status: getUiStatus(c.status, c.customer_approval),
          date: new Date(c.created_at).toLocaleDateString("ar-EG"),
        }));

        setCollectionsData(formattedCollections);

        // 2. تجهيز بيانات سجل النظام الحقيقي
        if (logsRes.data) {
          const formattedLogs = logsRes.data.map((log) => {
            const d = new Date(log.created_at);
            const isToday = d.toDateString() === new Date().toDateString();

            // ربط الـ action_type باللون المناسب في الواجهة
            let logTypeColor = "info";
            if (log.action_type === "CREATE") logTypeColor = "success";
            else if (log.action_type === "UPDATE") logTypeColor = "warning";
            else if (log.action_type === "DELETE") logTypeColor = "error";
            else if (log.action_type === "ACTION") logTypeColor = "action";

            return {
              id: log.id,
              title: log.title,
              desc: log.description,
              time: d.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: isToday ? "اليوم" : d.toLocaleDateString("ar-EG"),
              type: logTypeColor,
            };
          });

          setSystemLogs(formattedLogs);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    const data =
      statusFilter === "الكل"
        ? collectionsData
        : collectionsData.filter((c) => c.status === statusFilter);
    setModalTitle(title);
    setFilteredCollections(data);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-xl font-bold text-[#1a365d] flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
          جاري تحميل لوحة التحكم الشاملة...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 relative font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* الهيدر العلوي */}
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

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الكولكشنات"
            count={stats.total}
            colorClass="hover:border-t-[#1a365d] text-[#1a365d]"
            onClick={() => handleCardClick("سجل الكولكشنات الكامل", "الكل")}
            icon={
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
            }
          />
          <StatCard
            title="مسودات (لم تبدأ)"
            count={stats.notStarted}
            colorClass="hover:border-t-slate-500 text-slate-700"
            onClick={() => handleCardClick("مسودات النظام (لم تبدأ)", "مسودة")}
            icon={
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
            }
          />
          <StatCard
            title="قيد انتظار العميل"
            count={stats.waitingClient}
            colorClass="hover:border-t-orange-500 text-orange-600"
            onClick={() =>
              handleCardClick("كولكشنات قيد الانتظار", "قيد انتظار العميل")
            }
            icon={
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
            }
          />
          <StatCard
            title="جاهزة للتشغيل"
            count={stats.readyToStart}
            colorClass="hover:border-t-emerald-600 text-emerald-600"
            onClick={() =>
              handleCardClick(
                "كولكشنات جاهزة للتشغيل",
                "جاهزة لإصدار أمر التشغيل",
              )
            }
            icon={
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
            }
          />
        </div>

        {/* القوائم والسجلات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#1a365d]">
                إجراءات سريعة
              </h2>
            </div>
            <div className="p-2 flex-1">
              <QuickActionLink
                to="/customer_service/customer_followup"
                label="متابعة موافقات العملاء"
              />
              <QuickActionLink
                to="/customer_service/pricing"
                label="التسعير وعروض الأسعار"
              />
              <QuickActionLink
                to="/customer_service/brands"
                label="جميع البراندات"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-[#1a365d]">
                سجل نشاط قسم خدمة العملاء (Activities)
              </h2>
            </div>
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {systemLogs.length > 0 ? (
                <div className="space-y-0 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {systemLogs.map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 text-sm font-bold text-center">
                    لا توجد أنشطة مسجلة في قاعدة البيانات حتى الآن.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الـ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-5 bg-[#1a365d] text-white">
              <h2 className="text-base font-bold">{modalTitle}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-[#b91c1c] transition-colors"
              >
                ✕
              </button>
            </div>

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
                              className={`px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap ${
                                col.status === "جاهزة لإصدار أمر التشغيل"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : col.status === "قيد انتظار العميل"
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : col.status === "تم الإصدار للتصنيع"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {col.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link
                              to={`/customer_service/customer_followup`}
                              className="text-[#1a365d] hover:text-[#b91c1c] text-xs font-bold underline transition-colors"
                            >
                              متابعة الملف
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
};

export default Home;
