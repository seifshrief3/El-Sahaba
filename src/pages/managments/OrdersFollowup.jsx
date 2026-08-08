import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase"; // تأكد من مسار الاستيراد
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const OrdersFollowup = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States للبحث والفلترة
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("كل المراحل");

  useEffect(() => {
    fetchOrders();
  }, []);

  // دالة لجلب البيانات من الداتابيز
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("production_orders")
        .select(
          `
          id,
          order_number,
          status,
          collections (
            name,
            brands ( name_ar )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // تهيئة البيانات وتنسيقها للواجهة
      const formattedOrders = (data || []).map((order) => {
        let phase = order.status || "قيد الانتظار";

        // ترجمة الحالات
        if (phase === "draft") phase = "مسودة";
        if (phase === "completed" || phase === "مكتمل") phase = "تم الانجاز";

        let healthStatus = "يسير حسب الخطة";

        // تحديد الحالة (Health Status) للون والتوضيح
        if (
          phase === "مسودة" ||
          phase.includes("انتظار") ||
          phase.includes("متوقف")
        ) {
          healthStatus = "متوقف";
        } else if (phase === "تم الانجاز") {
          healthStatus = "مكتمل";
        } else if (phase === "متأخر") {
          healthStatus = "عاجل";
        }

        return {
          id: order.id,
          orderNumber: order.order_number, // كود الطلب
          brand: order.collections?.brands?.name_ar || "غير محدد",
          collection: order.collections?.name || "غير محدد",
          phase: phase,
          healthStatus: healthStatus,
        };
      });

      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching follow-up orders:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الأوردرات");
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لتطبيق البحث والفلترة معاً
  useEffect(() => {
    let result = orders;

    // 1. تطبيق فلتر البحث (بالبراند أو كود الطلب)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.brand.toLowerCase().includes(lowerQuery) ||
          (order.orderNumber &&
            order.orderNumber.toLowerCase().includes(lowerQuery)),
      );
    }

    // 2. تطبيق فلتر المرحلة
    if (selectedPhase !== "كل المراحل") {
      result = result.filter((order) => order.phase === selectedPhase);
    }

    setFilteredOrders(result);
  }, [searchQuery, selectedPhase, orders]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* الهيدر */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a233a]">
              متابعة الأوردرات
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              عرض حالة التنفيذ الفعلي لكل أوردر.
            </p>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="بحث باسم البراند أو كود الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-[#1a233a] focus:ring-1 focus:ring-[#1a233a] transition-all bg-white shadow-sm"
          />
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="p-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#1a233a] focus:ring-1 focus:ring-[#1a233a] bg-white shadow-sm cursor-pointer min-w-[200px]"
          >
            <option value="كل المراحل">كل المراحل</option>
            <option value="مسودة">مسودة</option>
            <option value="القص والتنفيذ">القص والتنفيذ</option>
            <option value="الطباعة والتطريز">الطباعة والتطريز</option>
            <option value="الخياطة">الخياطة</option>
            <option value="الشحن">الشحن</option>
            <option value="في انتظار اعتماد السعر">
              في انتظار اعتماد السعر
            </option>
            <option value="تم الانجاز">تم الانجاز</option>
          </select>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[50vh]">
          {isLoading ? (
            <div className="flex h-full min-h-[40vh] items-center justify-center">
              <div className="flex flex-col items-center text-[#1a233a]">
                <Loader2 className="mb-4 h-10 w-10 animate-spin" />
                <h2 className="text-lg font-bold">جاري تحميل الأوردرات...</h2>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex h-full min-h-[40vh] items-center justify-center text-slate-500">
              <p className="font-medium text-lg">
                لا توجد أوردرات مطابقة للبحث أو الفلتر.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-[#1a233a] text-white">
                  <tr>
                    <th className="p-4 font-bold">كود الطلب</th>
                    <th className="p-4 font-bold">البراند</th>
                    <th className="p-4 font-bold">الكولكشن</th>
                    <th className="p-4 font-bold">المرحلة الحالية</th>
                    <th className="p-4 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-[#1a233a]">
                        #{order.orderNumber}
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {order.brand}
                      </td>
                      <td className="p-4 font-medium text-slate-500">
                        {order.collection}
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {order.phase}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm ${
                            order.healthStatus === "عاجل"
                              ? "bg-red-100 text-[#cc0000] border border-red-200"
                              : order.healthStatus === "متوقف"
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {order.healthStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersFollowup;
