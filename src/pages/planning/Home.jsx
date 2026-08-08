import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase"; // 💡 تأكد من مسار الاستيراد

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // States لحفظ البيانات المحسوبة
  const [kpis, setKpis] = useState({
    activeOrders: 0,
    completedStages: 0,
    issues: 0,
  });
  const [overview, setOverview] = useState({
    completed: 0,
    inProgress: 0,
    issue: 0,
  });
  const [recentCollections, setRecentCollections] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. جلب المراحل وأوامر التشغيل النشطة مع التتبع الخاص بها
        const [stagesRes, ordersRes] = await Promise.all([
          supabase
            .from("production_stages")
            .select("id, name, step_order")
            .order("step_order", { ascending: true }),

          supabase
            .from("production_orders")
            .select(
              `
              id,
              order_number,
              collection_id,
              collections (
                name,
                brands (name_ar)
              ),
              order_tracking (
                stage_id,
                status,
                created_at
              )
            `,
            )
            .eq("status", "in_progress"),
        ]);

        if (stagesRes.error) throw stagesRes.error;
        if (ordersRes.error) throw ordersRes.error;

        const stages = stagesRes.data || [];
        const orders = ordersRes.data || [];

        let totalCompleted = 0;
        let totalInProgress = 0;
        let totalIssues = 0;
        const allCompletedStagesList = []; // لتجميع المراحل المكتملة لعرضها في السجل الزمني

        // 2. معالجة بيانات كل كولكشن
        const processedOrders = orders.map((order) => {
          const tracking = order.order_tracking || [];

          let orderCompletedCount = 0;
          let currentStageName = "استلام الخامات";

          // حساب حالات المراحل لهذا الأوردر
          tracking.forEach((track) => {
            if (track.status === "completed") {
              orderCompletedCount++;
              totalCompleted++;

              // إضافة المرحلة المكتملة للسجل الزمني
              const stageInfo = stages.find((s) => s.id === track.stage_id);
              if (stageInfo) {
                allCompletedStagesList.push({
                  time: new Date(
                    track.created_at || new Date(),
                  ).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  stage: stageInfo.name,
                  collection: order.collections?.name || "غير محدد",
                  brand: order.collections?.brands?.name_ar || "غير محدد",
                  timestamp: new Date(track.created_at || new Date()).getTime(),
                });
              }
            }
            if (track.status === "in_progress") totalInProgress++;
            if (track.status === "issue") totalIssues++;
          });

          // تحديد المرحلة الحالية (أول مرحلة مش completed)
          const nextStage = stages.find((stage) => {
            const trackRecord = tracking.find((t) => t.stage_id === stage.id);
            return trackRecord ? trackRecord.status !== "completed" : true;
          });
          currentStageName = nextStage ? nextStage.name : "جاهز للتسليم 📦";

          // حساب نسبة الإنجاز للكولكشن ده بس
          const progressPercent =
            stages.length > 0
              ? Math.round((orderCompletedCount / stages.length) * 100)
              : 0;

          return {
            id: order.order_number || order.id.substring(0, 8),
            collection_id: order.collection_id,
            name: order.collections?.name || "غير محدد",
            brand: order.collections?.brands?.name_ar || "غير محدد",
            progress: progressPercent,
            currentStage: currentStageName,
            issueCount: tracking.filter((t) => t.status === "issue").length,
          };
        });

        // 3. تحديث مؤشرات الأداء (KPIs)
        setKpis({
          activeOrders: orders.length,
          completedStages: totalCompleted,
          issues: totalIssues,
        });

        // 4. حساب النسب المئوية للمصنع ككل (Overview)
        // إجمالي المراحل الممكنة = عدد الأوردرات النشطة × 17 مرحلة
        const totalPossibleStages = orders.length * (stages.length || 17);
        if (totalPossibleStages > 0) {
          setOverview({
            completed: Math.round((totalCompleted / totalPossibleStages) * 100),
            inProgress: Math.round(
              (totalInProgress / totalPossibleStages) * 100,
            ),
            issue: Math.round((totalIssues / totalPossibleStages) * 100),
          });
        }

        // 5. ترتيب الكولكشنات وعرض أحدث 4 (أو اللي فيهم مشاكل الأول)
        const sortedOrders = processedOrders.sort(
          (a, b) => b.issueCount - a.issueCount || b.progress - a.progress,
        );
        setRecentCollections(sortedOrders.slice(0, 4));

        // 6. ترتيب السجل الزمني للمراحل المكتملة وعرض أحدث 3
        const sortedCompleted = allCompletedStagesList.sort(
          (a, b) => b.timestamp - a.timestamp,
        );
        setRecentCompleted(sortedCompleted.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-[#1a365d] font-bold text-lg">
          جاري تجميع إحصائيات الإنتاج...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر العلوي */}
        {/* ======================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d] mb-1">
              لوحة تحكم الإنتاج
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              مرحباً بك. ملخص سريع ومباشر لحالة خطوط الإنتاج.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/planning/collections"
              className="w-full md:w-auto text-white text-center bg-[#b91c1c] hover:bg-red-800 px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
            >
              عرض كل الكولكشنات
            </Link>
          </div>
        </div>

        {/* ======================= */}
        {/* كروت المؤشرات الأساسية (KPIs) */}
        {/* ======================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* كارت 1: تحت التشغيل */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-[#1a365d]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-[#1a365d]">تحت التشغيل</h3>
              <div className="w-8 h-8 bg-[#1a365d]/10 rounded flex items-center justify-center text-[#1a365d]">
                <svg
                  className="w-4 h-4"
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
            <p className="text-3xl font-black text-[#1a365d]">
              {kpis.activeOrders}{" "}
              <span className="text-sm font-medium text-slate-400">
                كولكشنات
              </span>
            </p>
          </div>

          {/* كارت 2: مراحل تم إنجازها */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-emerald-600">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-emerald-800">
                إجمالي مراحل مكتملة
              </h3>
              <div className="w-8 h-8 bg-emerald-50 rounded flex items-center justify-center text-emerald-600">
                <svg
                  className="w-4 h-4"
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
            <p className="text-3xl font-black text-emerald-700">
              {kpis.completedStages}{" "}
              <span className="text-sm font-medium text-emerald-600/60">
                مرحلة
              </span>
            </p>
          </div>

          {/* كارت 3: عوائق ومشاكل (باللون الأحمر) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-[#b91c1c]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-[#b91c1c]">عوائق ومشاكل</h3>
              <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-[#b91c1c]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-[#b91c1c]">
              {kpis.issues}{" "}
              <span className="text-sm font-medium text-red-300">
                مرحلة متوقفة
              </span>
            </p>
          </div>
        </div>

        {/* ======================= */}
        {/* قسم الرسوم والإحصائيات المتوسطة */}
        {/* ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نظرة عامة على الإنتاج (النسب المئوية) */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-[#1a365d] mb-6">
              نظرة عامة على المصنع ككل
            </h2>

            <div className="space-y-5">
              {/* المراحل المكتملة */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-[#1a365d]">
                    مراحل مكتملة
                  </span>
                  <span className="text-sm font-bold text-[#1a365d]">
                    {overview.completed}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overview.completed}%` }}
                  ></div>
                </div>
              </div>

              {/* قيد التنفيذ */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">
                    قيد التنفيذ (جاري)
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {overview.inProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overview.inProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* فيها مشكلة */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-[#b91c1c]">
                    توجد ملاحظة / مشكلة
                  </span>
                  <span className="text-sm font-bold text-[#b91c1c]">
                    {overview.issue}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-[#b91c1c] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overview.issue}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* الكولكشنات النشطة */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-[#1a365d]">
                نشاط الكولكشنات الحالي
              </h2>
              <Link
                to="/planning/collections"
                className="text-xs font-bold text-[#b91c1c] hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            <div className="flex-1 space-y-4">
              {recentCollections.length > 0 ? (
                recentCollections.map((col, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-colors ${col.issueCount > 0 ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                      <div>
                        <h4 className="font-bold text-[#1a365d] text-sm mb-1">
                          {col.name}{" "}
                          <span className="text-xs text-slate-400 font-normal">
                            ({col.brand})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          المرحلة التالية:{" "}
                          <span
                            className={`font-bold ${col.issueCount > 0 ? "text-[#b91c1c]" : "text-[#1a365d]"}`}
                          >
                            {col.currentStage}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {col.issueCount > 0 && (
                          <span className="text-[10px] font-bold text-white bg-[#b91c1c] px-2 py-0.5 rounded">
                            {col.issueCount} توقف
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#1a365d] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {col.progress}% إنجاز
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${col.issueCount > 0 ? "bg-[#b91c1c]" : "bg-[#1a365d]"}`}
                        style={{ width: `${col.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 text-sm font-bold py-10">
                  لا توجد كولكشنات تحت التشغيل حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* قسم السجل الزمني (أحدث المراحل المكتملة) */}
        {/* ======================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-[#1a365d] mb-6">
            أحدث المراحل التي تم إنجازها
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCompleted.length > 0 ? (
              recentCompleted.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 border border-emerald-100 bg-emerald-50/30 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#1a365d]">
                        تم {item.stage}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      كولكشن:{" "}
                      <span className="font-bold text-[#1a365d]">
                        {item.collection}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      البراند: {item.brand}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-slate-500 text-sm font-bold py-6">
                لم يتم إنجاز أي مراحل مؤخراً.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
