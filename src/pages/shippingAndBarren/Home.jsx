import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase"; // تأكد من مسار الاستيراد الصحيح

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // State للإحصائيات
  const [dashboardStats, setDashboardStats] = useState([
    { title: "إجمالي المخزون", value: "0", sub: "قطعة متاحة" },
    { title: "استلامات اليوم", value: "0", sub: "من قسم التخطيط" },
    { title: "شحنات قيد التجهيز", value: "0", sub: "بانتظار الخروج" },
    { title: "تم شحنها اليوم", value: "0", sub: "شحنة" },
  ]);

  // State لآخر العمليات
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. تحديد بداية اليوم (لمعرفة عمليات اليوم فقط)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. جلب إجمالي المخزون
        const { data: inventoryData } = await supabase
          .from("inventory")
          .select("available_qty");

        const totalInventory =
          inventoryData?.reduce(
            (sum, item) => sum + (item.available_qty || 0),
            0,
          ) || 0;

        // 3. جلب الشحنات
        const { data: shipmentsData } = await supabase.from("shipments")
          .select(`
            id, created_at, status, shipment_number,
            customers ( name ),
            brands ( name_ar )
          `);

        let prepShipmentsCount = 0;
        let shippedTodayCount = 0;
        const shipmentActivities = [];

        shipmentsData?.forEach((ship) => {
          const shipDate = new Date(ship.created_at);

          if (ship.status === "preparing") prepShipmentsCount++;
          if (ship.status === "shipped" && shipDate >= today)
            shippedTodayCount++;

          shipmentActivities.push({
            type: "شحن",
            brand: ship.brands?.name_ar || "غير محدد",
            collection: `شحنة #${ship.shipment_number}`,
            details:
              ship.status === "preparing"
                ? `جاري تجهيز شحنة للعميل: ${ship.customers?.name || "غير محدد"}`
                : `تم خروج الشحنة للعميل: ${ship.customers?.name || "غير محدد"}`,
            color: "bg-blue-100 text-blue-700",
            dateObject: shipDate, // للاستخدام في الترتيب
            dateDisplay: shipDate.toLocaleDateString("ar-EG"),
          });
        });

        // 4. جلب الاستلامات (أوامر التشغيل المكتملة)
        const { data: receiptsData } = await supabase
          .from("production_orders")
          .select(
            `
            id, updated_at, created_at,
            collections ( name, brands ( name_ar ) ),
            production_order_items ( quantity )
          `,
          )
          .eq("status", "completed");

        let receiptsTodayCount = 0;
        const receiptActivities = [];

        receiptsData?.forEach((order) => {
          // نعتمد على تاريخ التحديث (updated_at) لأنه بيمثل وقت الاستلام الفعلي
          const ordDate = new Date(order.updated_at || order.created_at);
          if (ordDate >= today) receiptsTodayCount++;

          const totalQty =
            order.production_order_items?.reduce(
              (s, i) => s + (i.quantity || 0),
              0,
            ) || 0;

          receiptActivities.push({
            type: "استلام",
            brand: order.collections?.brands?.name_ar || "غير محدد",
            collection: order.collections?.name || "غير محدد",
            details: `تم استلام ${totalQty} قطعة من التخطيط`,
            color: "bg-emerald-100 text-emerald-700",
            dateObject: ordDate,
            dateDisplay: ordDate.toLocaleDateString("ar-EG"),
          });
        });

        // 5. دمج العمليات وترتيبها (الأحدث أولاً) ثم أخذ آخر 6 عمليات فقط
        const allActivities = [...shipmentActivities, ...receiptActivities]
          .sort((a, b) => b.dateObject - a.dateObject)
          .slice(0, 6);

        // 6. تحديث الواجهة
        setDashboardStats([
          {
            title: "إجمالي المخزون",
            value: totalInventory.toLocaleString(),
            sub: "قطعة متاحة",
          },
          {
            title: "استلامات اليوم",
            value: receiptsTodayCount.toString(),
            sub: "من قسم التخطيط",
          },
          {
            title: "شحنات قيد التجهيز",
            value: prepShipmentsCount.toString(),
            sub: "بانتظار الخروج",
          },
          {
            title: "تم شحنها اليوم",
            value: shippedTodayCount.toString(),
            sub: "شحنة",
          },
        ]);
        setRecentActivities(allActivities);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center font-arabic"
        dir="rtl"
      >
        <div className="text-lg font-bold text-[#1a365d]">
          جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          لوحة الشحن والمخزون
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          نظرة عامة على المخزون، الاستلامات، والشحنات.
        </p>
      </section>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <p className="mt-3 text-3xl font-bold text-[#1a365d]">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Latest Activities */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">آخر العمليات</h2>
        </div>

        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 font-medium">
              لا توجد عمليات مسجلة حتى الآن.
            </div>
          ) : (
            recentActivities.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100/70"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{item.brand}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${item.color}`}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.collection}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {item.details}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                    {item.dateDisplay}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
