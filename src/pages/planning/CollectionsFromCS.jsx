import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase";
import { toast } from "sonner";
import { notificationService } from "../../services/notificationService";

const CollectionsFromCS = () => {
  const [collectionsData, setCollectionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("الكل");
  const [isDelivering, setIsDelivering] = useState(false);

  // 💡 States الخاصة بنافذة إدخال عدد الكراتين
  const [showCartonModal, setShowCartonModal] = useState(false);
  const [selectedColForDelivery, setSelectedColForDelivery] = useState(null);
  const [cartonsCount, setCartonsCount] = useState("");

  useEffect(() => {
    const fetchInProgressOrders = async () => {
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

        const formattedData = orders.map((order) => {
          let nextStageName = "استلام الخامات";
          let currentStatus = "يسير حسب الخطة";
          let isReadyForDelivery = false;

          if (stages.length > 0) {
            const nextStage = stages.find((stage) => {
              const trackRecord = order.order_tracking?.find(
                (t) => t.stage_id === stage.id,
              );
              const status = trackRecord ? trackRecord.status : "pending";
              if (status === "issue") currentStatus = "يوجد ملاحظة";
              return status !== "completed";
            });

            if (nextStage) {
              nextStageName = nextStage.name;
              isReadyForDelivery = false;
            } else {
              nextStageName = "جاهز للتسليم 📦";
              isReadyForDelivery = true;
            }
          }

          return {
            db_id: order.id,
            collection_id: order.collection_id,
            id: order.order_number || order.id.substring(0, 8),
            brand: order.collections?.brands?.name_ar || "غير محدد",
            collectionName: order.collections?.name || "غير محدد",
            nextStage: nextStageName,
            deliveryDate: order.collections?.delivery_date || "غير محدد",
            status: currentStatus,
            isReadyForDelivery,
          };
        });

        setCollectionsData(formattedData);
      } catch (error) {
        console.error("خطأ في جلب بيانات التخطيط:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInProgressOrders();
  }, []);

  // 💡 1. دالة فتح النافذة لما يدوس تسليم
  const handleOpenDeliveryModal = (col) => {
    setSelectedColForDelivery(col);
    setCartonsCount(""); // تصفير الحقل
    setShowCartonModal(true);
  };

  // 💡 2. دالة تأكيد التسليم بعد كتابة عدد الكراتين
  const confirmDeliveryToWarehouse = async () => {
    if (!cartonsCount || isNaN(cartonsCount) || Number(cartonsCount) <= 0) {
      toast.error("برجاء إدخال عدد كراتين صحيح وموجب.");
      return;
    }

    setIsDelivering(true);
    try {
      // تغيير الحالة وتحديث عدد الكراتين
      const { error } = await supabase
        .from("production_orders")
        .update({
          status: "pending_warehouse_receipt",
          cartons_count: Number(cartonsCount), // 💡 حفظ عدد الكراتين
        })
        .eq("id", selectedColForDelivery.db_id);

      if (error) throw error;

      // إرسال الإشعار للمخزن وفيه عدد الكراتين
      await notificationService.sendNotification(
        "inventory",
        "كولكشن جاهز للاستلام 📦",
        `قسم التخطيط انتهى من ${selectedColForDelivery.collectionName} وتمت التعبئة في (${cartonsCount} كرتونة)، في انتظار استلامكم.`,
        selectedColForDelivery.collection_id,
      );

      toast.success("تم إرسال الكولكشن للمخزن بنجاح!");
      setCollectionsData((prev) =>
        prev.filter((item) => item.db_id !== selectedColForDelivery.db_id),
      );
      setShowCartonModal(false);
    } catch (error) {
      console.error("Error delivering to warehouse:", error);
      toast.error("حدث خطأ أثناء إرسال الكولكشن للمخزن.");
    } finally {
      setIsDelivering(false);
    }
  };

  const filteredCollections = collectionsData.filter((col) => {
    if (filter === "الكل") return true;
    return col.status === filter;
  });

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-[#1a365d] mb-1">
              الكولكشنات تحت التشغيل
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              متابعة أوامر التشغيل النشطة والمراحل الحالية.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="ابحث باسم البراند أو الكولكشن..."
              className="w-full sm:w-64 border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[#1a365d] bg-slate-50"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-40 border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:border-[#1a365d] bg-white font-bold text-[#1a365d]"
            >
              <option value="الكل">كل الحالات</option>
              <option value="يسير حسب الخطة">حسب الخطة</option>
              <option value="يوجد ملاحظة">يوجد ملاحظة</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#1a365d] font-bold text-lg">
              جاري تحميل البيانات...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((col) => (
              <div
                key={col.db_id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${col.status === "يوجد ملاحظة" ? "bg-orange-500" : "bg-emerald-500"}`}
                ></div>
                <div className="p-6 flex flex-col flex-1 mt-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1a365d] mb-1">
                        {col.brand}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                        {col.id}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold border ${col.status === "يوجد ملاحظة" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}
                    >
                      {col.status}
                    </span>
                  </div>
                  <hr className="border-slate-100 mb-4" />
                  <div className="mb-6 flex-1 space-y-4">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        الكولكشن
                      </span>
                      <p className="text-sm font-bold text-slate-700">
                        {col.collectionName}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        المرحلة التالية
                      </span>
                      <p
                        className={`text-sm font-bold ${col.status === "يوجد ملاحظة" ? "text-orange-600" : "text-[#1a365d]"}`}
                      >
                        {col.nextStage}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/planning/checklist/${col.collection_id}`}
                    className="w-full bg-slate-50 text-[#1a365d] border border-slate-200 hover:bg-[#1a365d] hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-center gap-2 mt-auto"
                  >
                    فتح وتحديث المراحل ◀
                  </Link>

                  {/* 💡 تعديل الزرار ليفتح الـ Popup */}
                  <button
                    onClick={() => handleOpenDeliveryModal(col)}
                    disabled={!col.isReadyForDelivery}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-2 ${
                      col.isReadyForDelivery
                        ? "bg-red-800 cursor-pointer text-white hover:bg-red-900 shadow-sm"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                    }`}
                  >
                    تسليم الكولكشن للمخزن ◀
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================= */}
      {/* 💡 نافذة إدخال عدد الكراتين */}
      {/* ======================= */}
      {showCartonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-[#1a365d] mb-2">
              تسليم الكولكشن للمخزن
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              أنت على وشك تسليم كولكشن{" "}
              <strong className="text-slate-800">
                {selectedColForDelivery?.collectionName}
              </strong>{" "}
              إلى قسم المخازن. برجاء إدخال عدد الكراتين الفعلي.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                إجمالي عدد الكراتين:
              </label>
              <input
                type="number"
                min="1"
                value={cartonsCount}
                onChange={(e) => setCartonsCount(e.target.value)}
                placeholder="مثال: 15"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-[#1a365d] text-lg font-bold"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDeliveryToWarehouse}
                disabled={isDelivering || !cartonsCount}
                className="flex-1 bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition disabled:opacity-50"
              >
                {isDelivering ? "جاري الإرسال..." : "تأكيد وإرسال للمخزن"}
              </button>
              <button
                onClick={() => setShowCartonModal(false)}
                disabled={isDelivering}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.2s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
};

export default CollectionsFromCS;
