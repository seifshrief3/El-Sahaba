import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
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

  // ==========================================
  // ترجمة حالة الـ Production Order
  // ==========================================
  const translateOrderStatus = (status) => {
    switch (status) {
      case "draft":
        return "مسودة";

      case "pending":
        return "قيد الانتظار";

      case "in_progress":
        return "جاري التنفيذ";

      case "completed":
        return "تم الإنجاز";

      case "cancelled":
        return "ملغي";

      case "paused":
        return "متوقف";

      default:
        return "غير محدد";
    }
  };

  // ==========================================
  // تحديد الحالة العامة للأوردر
  // ==========================================
  const getHealthStatus = (status) => {
    switch (status) {
      case "draft":
        return "متوقف";

      case "pending":
        return "يسير حسب الخطة";

      case "in_progress":
        return "يسير حسب الخطة";

      case "completed":
        return "مكتمل";

      case "cancelled":
        return "متوقف";

      case "paused":
        return "متوقف";

      default:
        return "يسير حسب الخطة";
    }
  };

  // ==========================================
  // جلب الأوردرات
  // ==========================================
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
            brands (
              name_ar
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedOrders = (data || []).map((order) => {
        const currentPhase = translateOrderStatus(order.status);
        const healthStatus = getHealthStatus(order.status);

        return {
          id: order.id,

          orderNumber: order.order_number,

          brand: order.collections?.brands?.name_ar || "غير محدد",

          collection: order.collections?.name || "غير محدد",

          // المرحلة الحالية
          phase: currentPhase,

          // الحالة العامة
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

  // ==========================================
  // البحث والفلترة
  // ==========================================
  useEffect(() => {
    let result = [...orders];

    // البحث بالبراند أو كود الطلب
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();

      result = result.filter(
        (order) =>
          order.brand.toLowerCase().includes(lowerQuery) ||
          (order.orderNumber &&
            order.orderNumber.toLowerCase().includes(lowerQuery)),
      );
    }

    // فلترة المرحلة
    if (selectedPhase !== "كل المراحل") {
      result = result.filter((order) => order.phase === selectedPhase);
    }

    setFilteredOrders(result);
  }, [searchQuery, selectedPhase, orders]);

  // ==========================================
  // البحث
  // ==========================================
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // ==========================================
  // الفلترة
  // ==========================================
  const handleFilter = (e) => {
    setSelectedPhase(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* ========================================
          Header
      ======================================== */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a233a]">متابعة الأوردرات</h1>

        <p className="mt-2 text-sm text-slate-500">
          عرض حالة التنفيذ الفعلي لكل أوردر.
        </p>
      </div>

      {/* ========================================
          Filters
      ======================================== */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="بحث باسم البراند أو كود الطلب..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1 p-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-[#1a233a] focus:ring-1 focus:ring-[#1a233a] transition-all bg-white shadow-sm"
        />

        <select
          value={selectedPhase}
          onChange={handleFilter}
          className="p-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#1a233a] focus:ring-1 focus:ring-[#1a233a] bg-white shadow-sm cursor-pointer min-w-[200px]"
        >
          <option value="كل المراحل">كل المراحل</option>

          <option value="مسودة">مسودة</option>

          <option value="قيد الانتظار">قيد الانتظار</option>

          <option value="جاري التنفيذ">جاري التنفيذ</option>

          <option value="تم الإنجاز">تم الإنجاز</option>

          <option value="متوقف">متوقف</option>

          <option value="ملغي">ملغي</option>
        </select>
      </div>

      {/* ========================================
          Table
      ======================================== */}
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

                  {/* الحالة قبل المرحلة الحالية */}
                  <th className="p-4 font-bold">الحالة</th>

                  <th className="p-4 font-bold">المرحلة الحالية</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* كود الطلب */}
                    <td className="p-4 font-bold text-[#1a233a]">
                      #{order.orderNumber}
                    </td>

                    {/* البراند */}
                    <td className="p-4 font-bold text-slate-700">
                      {order.brand}
                    </td>

                    {/* الكولكشن */}
                    <td className="p-4 font-medium text-slate-500">
                      {order.collection}
                    </td>

                    {/* الحالة */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm ${
                          order.healthStatus === "عاجل"
                            ? "bg-red-100 text-[#cc0000] border border-red-200"
                            : order.healthStatus === "متوقف"
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : order.healthStatus === "مكتمل"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {order.healthStatus}
                      </span>
                    </td>

                    {/* المرحلة الحالية */}
                    <td className="p-4 font-medium text-slate-600">
                      {order.phase}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersFollowup;
