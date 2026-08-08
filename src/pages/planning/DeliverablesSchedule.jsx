import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase";

const DeliverablesSchedule = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // حالات البحث والترتيب
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("الأقرب تسليماً");

  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoading(true);
      try {
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
              status,
              collections (
                name,
                delivery_date,
                brands (name_ar)
              ),
              order_tracking (
                stage_id,
                status
              )
            `,
            )
            .eq("status", "in_progress"),
        ]);

        if (stagesRes.error) throw stagesRes.error;
        if (ordersRes.error) throw ordersRes.error;

        const stages = stagesRes.data || [];
        const orders = ordersRes.data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // تصفير الوقت عشان الحساب يكون دقيق بالأيام

        const formattedData = orders.map((order) => {
          // 1. حساب الأيام المتبقية
          let daysLeft = null;
          let deliveryDateStr = "غير محدد";

          if (order.collections?.delivery_date) {
            const deliveryDate = new Date(order.collections.delivery_date);
            const diffTime = deliveryDate - today;
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // تنسيق التاريخ للعرض
            deliveryDateStr = deliveryDate.toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          }

          // 2. تحديد المرحلة الحالية
          let currentStageName = "استلام الخامات";
          if (stages.length > 0) {
            const nextStage = stages.find((stage) => {
              const trackRecord = order.order_tracking?.find(
                (t) => t.stage_id === stage.id,
              );
              return trackRecord ? trackRecord.status !== "completed" : true;
            });
            currentStageName = nextStage ? nextStage.name : "جاهز للتسليم 📦";
          }

          return {
            db_id: order.id,
            collection_id: order.collection_id,
            id: order.order_number || order.id.substring(0, 8),
            collectionName: order.collections?.name || "غير محدد",
            brand: order.collections?.brands?.name_ar || "غير محدد",
            dueDate: deliveryDateStr,
            daysLeft: daysLeft,
            currentStage: currentStageName,
          };
        });

        // ترتيب مبدئي (الأقرب تسليماً)
        formattedData.sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999));

        setScheduleData(formattedData);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // 💡 تطبيق البحث والترتيب والفلترة
  let displayedData = scheduleData.filter((item) => {
    // البحث باسم الكولكشن أو البراند
    const searchMatch =
      item.collectionName.includes(searchTerm) ||
      item.brand.includes(searchTerm);

    // فلترة "متأخر فقط" (لو الأيام المتبقية 0 أو أقل)
    if (sortOption === "فلترة: متأخر فقط") {
      return searchMatch && item.daysLeft !== null && item.daysLeft <= 0;
    }
    return searchMatch;
  });

  // الترتيب
  if (sortOption === "ترتيب: الأقرب تسليماً") {
    displayedData.sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999));
  } else if (sortOption === "ترتيب: الأبعد تسليماً") {
    displayedData.sort((a, b) => (b.daysLeft || -999) - (a.daysLeft || -999));
  }

  // دالة لتحديد لون شارة (Badge) الأيام المتبقية
  const getDaysBadgeStyle = (days) => {
    if (days === null) return "bg-slate-50 text-slate-500 border-slate-200"; // لو مفيش تاريخ
    if (days <= 0) return "bg-[#b91c1c] text-white border-[#b91c1c]"; // متأخر (أحمر غامق)
    if (days <= 3) return "bg-red-50 text-[#b91c1c] border-red-200"; // حرج جداً
    if (days <= 7) return "bg-orange-50 text-orange-600 border-orange-200"; // تحذير
    return "bg-emerald-50 text-emerald-700 border-emerald-200"; // آمن
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر العلوي */}
        {/* ======================= */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a365d] mb-1">
              جدول التسليمات والأولويات
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              عرض وترتيب أوامر التشغيل بناءً على مواعيد التسليم لضمان الالتزام
              بالخطط.
            </p>
          </div>
        </div>

        {/* ======================= */}
        {/* شريط البحث والفلترة */}
        {/* ======================= */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الكولكشن أو البراند..."
            className="w-full sm:flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full sm:w-48 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm font-bold text-[#1a365d]"
          >
            <option>ترتيب: الأقرب تسليماً</option>
            <option>ترتيب: الأبعد تسليماً</option>
            <option>فلترة: متأخر فقط</option>
          </select>
        </div>

        {/* ======================= */}
        {/* كارت الجدول */}
        {/* ======================= */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-[#1a365d] font-bold">
              جاري تحميل جدول التسليمات...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      الكولكشن
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      البراند
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      موعد التسليم
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      الأيام المتبقية
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      المرحلة التالية
                    </th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                      إجراء
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayedData.map((item) => (
                    <tr
                      key={item.db_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#1a365d] text-sm">
                          {item.collectionName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.id}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {item.brand}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                        {item.dueDate}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-bold border ${getDaysBadgeStyle(item.daysLeft)}`}
                        >
                          {item.daysLeft === null
                            ? "غير محدد"
                            : item.daysLeft < 0
                              ? `متأخر ${Math.abs(item.daysLeft)} يوم`
                              : item.daysLeft === 0
                                ? "اليوم"
                                : `${item.daysLeft} أيام`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {item.currentStage}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          to={`/planning/checklist/${item.collection_id}`}
                          className="text-[#1a365d] hover:text-[#b91c1c] text-xs font-bold transition-colors underline"
                        >
                          تحديث المراحل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* رسالة في حالة عدم وجود داتا */}
              {displayedData.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm font-bold">
                    لا توجد تسليمات متطابقة مع بحثك حالياً.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliverablesSchedule;
