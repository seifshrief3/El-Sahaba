import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../../supabase";
import {
  handleGetCollections,
  handleUpdateCustomerApproval,
} from "../../services/collectionsService";

const CustomerFollowup = () => {
  const [collectionsFollowup, setCollectionsFollowup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("كل الحالات");

  const statusMapToDB = {
    "لم يتم الإرسال": "not_sent",
    "تم الإرسال": "sent",
    "طلب تعديل": "revision_requested",
    "تم التعديل": "revised",
    "تمت الموافقة": "approved",
  };

  const availableStatuses = Object.keys(statusMapToDB);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await handleGetCollections();

      const { data: ordersData, error: ordersError } = await supabase
        .from("production_orders")
        .select("id, collection_id, status");

      if (ordersError) throw ordersError;

      const formattedData = data.map((col) => {
        const arabicStatus =
          Object.keys(statusMapToDB).find(
            (key) => statusMapToDB[key] === col.customer_approval,
          ) || "لم يتم الإرسال";

        const prodOrder = ordersData?.find(
          (order) => order.collection_id === col.id,
        );

        return {
          id: col.id,
          brandName: col.brands?.name_ar || "غير محدد",
          brandCode: `BR-${col.id.substring(0, 4).toUpperCase()}`,
          collectionName: col.name,
          approvalStatus: arabicStatus,
          productionOrderId: prodOrder ? prodOrder.id : null,
          productionOrderStatus: prodOrder ? prodOrder.status : null,
        };
      });
      setCollectionsFollowup(formattedData);
    } catch (error) {
      console.error("خطأ في جلب بيانات المتابعة:", error);
      toast.error("حدث خطأ أثناء جلب البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleStatusChange = async (id, newArabicStatus) => {
    const dbStatus = statusMapToDB[newArabicStatus];

    setCollectionsFollowup((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, approvalStatus: newArabicStatus } : col,
      ),
    );

    try {
      await handleUpdateCustomerApproval(id, dbStatus);
      toast.success("تم تحديث حالة موافقة العميل بنجاح.");
    } catch (error) {
      console.error("Error updating customer approval:", error);
      toast.error("حدث خطأ أثناء تحديث الحالة، يرجى المحاولة مرة أخرى.");
      loadCollections();
    }
  };

  const handleCancelProduction = async (orderId) => {
    const confirmCancel = window.confirm(
      "هل أنت متأكد من إلغاء أمر التشغيل لهذا الكولكشن نهائياً؟",
    );
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from("production_orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("تم إلغاء أمر التشغيل بنجاح.");
      loadCollections();
    } catch (error) {
      console.error("Error cancelling production:", error);
      toast.error("حدث خطأ أثناء الإلغاء.");
    }
  };

  const handleTogglePauseProduction = async (orderId, currentStatus) => {
    const isCurrentlyPaused = currentStatus === "on_hold";
    const newStatus = isCurrentlyPaused ? "pending" : "on_hold";

    const confirmMsg = isCurrentlyPaused
      ? "هل تريد استئناف أمر التشغيل وإعادته للتخطيط؟"
      : "هل تريد إيقاف أمر التشغيل مؤقتاً؟";

    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from("production_orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success(
        isCurrentlyPaused
          ? "تم استئناف التشغيل بنجاح ▶️"
          : "تم إيقاف التشغيل مؤقتاً ⏸️",
      );
      loadCollections();
    } catch (error) {
      console.error("Error toggling production status:", error);
      toast.error(
        "حدث خطأ. تأكد من أن حالة 'on_hold' مسموحة في قاعدة البيانات.",
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "لم يتم الإرسال":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "تم الإرسال":
      case "تم التعديل":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "طلب تعديل":
        return "bg-red-50 text-red-700 border-red-200";
      case "تمت الموافقة":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const filteredCollections = collectionsFollowup.filter((col) => {
    const matchSearch =
      col.brandName.includes(searchTerm) ||
      col.collectionName.includes(searchTerm);
    const matchStatus =
      filterStatus === "كل الحالات"
        ? true
        : col.approvalStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-right">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                متابعة موافقات العملاء
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                تحديث حالة موافقة العميل على الـ Tech Pack وعرض السعر. يمكنك
                أيضاً فتح ملف التشغيل لطباعة الأوامر والعقود.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="ابحث باسم البراند أو الكولكشن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm text-slate-700 font-bold"
          >
            <option>كل الحالات</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-bold">
              جاري تحميل بيانات المتابعة...
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold">
              لا توجد كولكشنات متطابقة مع البحث.
            </div>
          ) : (
            filteredCollections.map((collection) => {
              const isCompleted =
                collection.productionOrderStatus === "completed";
              const isSentToPlanning =
                collection.productionOrderId &&
                collection.productionOrderStatus !== "cancelled";
              const isPaused = collection.productionOrderStatus === "on_hold";

              return (
                <div
                  key={collection.id}
                  className={`bg-white rounded-2xl border ${
                    collection.approvalStatus === "تمت الموافقة"
                      ? "border-emerald-300 shadow-md"
                      : "border-slate-200 shadow-sm"
                  } p-5 transition-all`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[#1a365d] text-lg">
                          {collection.brandName}
                        </h3>
                        <span className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {collection.brandCode}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mt-1">
                        كولكشن:{" "}
                        <span className="font-bold">
                          {collection.collectionName}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(
                          collection.approvalStatus,
                        )}`}
                      >
                        موافقة العميل: {collection.approvalStatus}
                      </span>

                      {/* البادچات الخاصة بالتخطيط */}
                      {isCompleted && (
                        <span className="bg-blue-50 text-blue-700 border-blue-200 inline-block px-4 py-1.5 rounded-full text-xs font-bold border">
                          تم الإنتاج والتسليم ✅
                        </span>
                      )}
                      {isSentToPlanning && !isPaused && !isCompleted && (
                        <span className="bg-purple-50 text-purple-700 border-purple-200 inline-block px-4 py-1.5 rounded-full text-xs font-bold border">
                          قيد التشغيل بالمصنع 🏭
                        </span>
                      )}
                      {isPaused && (
                        <span className="bg-orange-50 text-orange-700 border-orange-200 inline-block px-4 py-1.5 rounded-full text-xs font-bold border">
                          موقوف مؤقتاً ⏸️
                        </span>
                      )}
                      {collection.productionOrderStatus === "cancelled" && (
                        <span className="bg-red-50 text-red-700 border-red-200 inline-block px-4 py-1.5 rounded-full text-xs font-bold border">
                          التشغيل ملغي 🛑
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center">
                      <span className="text-xs font-bold text-slate-500 ml-2">
                        تحديث الحالة:
                      </span>
                      {availableStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusChange(collection.id, status)
                          }
                          disabled={isSentToPlanning}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            isSentToPlanning
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : collection.approvalStatus === status
                                ? "bg-[#1a365d] text-white border-[#1a365d]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="w-full xl:w-auto flex flex-col sm:flex-row justify-end gap-2">
                      {isSentToPlanning ? (
                        isCompleted ? (
                          // 💡 التعديل هنا: فتح ملف الأوردر للطباعة حتى لو كان مكتمل
                          <Link
                            to={`/customer_service/start_order/${collection.id}`}
                            className="bg-slate-800 text-white hover:bg-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold w-full xl:w-auto text-center border shadow-sm"
                          >
                            ملف التشغيل / طباعة 🖨️
                          </Link>
                        ) : (
                          <>
                            {/* 💡 التعديل هنا: فتح ملف الأوردر للطباعة وهو قيد التشغيل */}
                            <Link
                              to={`/customer_service/start_order/${collection.id}`}
                              className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full xl:w-auto text-center border"
                            >
                              ملف التشغيل / طباعة 🖨️
                            </Link>

                            <button
                              onClick={() =>
                                handleTogglePauseProduction(
                                  collection.productionOrderId,
                                  collection.productionOrderStatus,
                                )
                              }
                              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full xl:w-auto text-center border ${
                                isPaused
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100"
                              }`}
                            >
                              {isPaused ? "إكمال التشغيل ▶️" : "إيقاف مؤقت ⏸️"}
                            </button>

                            <button
                              onClick={() =>
                                handleCancelProduction(
                                  collection.productionOrderId,
                                )
                              }
                              className="bg-white border border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 text-red-600 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full xl:w-auto text-center"
                            >
                              إلغاء التشغيل 🛑
                            </button>
                          </>
                        )
                      ) : collection.approvalStatus === "تمت الموافقة" ? (
                        <Link
                          to={`/customer_service/start_order/${collection.id}`}
                          className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full xl:w-auto text-center flex items-center justify-center gap-2"
                        >
                          إصدار أمر التشغيل ◀
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="bg-slate-100 text-slate-400 cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-bold w-full xl:w-auto"
                        >
                          يتطلب موافقة أولاً
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFollowup;
