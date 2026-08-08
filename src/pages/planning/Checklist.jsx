import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../supabase";
import { toast } from "sonner"; // 💡 استيراد الإشعارات المنبثقة

const Checklist = () => {
  const { id: collectionId } = useParams(); // بناخد الـ ID من الرابط

  const [orderInfo, setOrderInfo] = useState(null);
  const [stages, setStages] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        // 1. جلب بيانات أمر التشغيل والكولكشن والموديلات
        const { data: poData, error: poError } = await supabase
          .from("production_orders")
          .select(
            `
            id,
            order_number,
            collections (
              name,
              brands (name_ar),
              models (
                id,
                name,
                image_url,
                tech_packs (content)
              )
            ),
            production_order_items (
              size,
              quantity
            )
          `,
          )
          .eq("collection_id", collectionId)
          .single();

        if (poError) throw poError;

        // حساب إجمالي الكمية واستخراج المقاسات
        const totalQty = poData.production_order_items.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );
        const uniqueSizes = [
          ...new Set(poData.production_order_items.map((i) => i.size)),
        ];
        const models = poData.collections?.models || [];

        // محاولة استخراج الخامة من أول موديل كمثال
        let fabricInfo = "غير محدد";
        let weightInfo = "غير محدد";
        if (models.length > 0 && models[0].tech_packs?.length > 0) {
          const tp =
            models[0].tech_packs[0].content?.basic_info ||
            models[0].tech_packs[0].content;
          fabricInfo = tp?.main_fabric || tp?.fabric_type || "غير محدد";
          weightInfo = tp?.fabric_weight || tp?.weight || "غير محدد";
        }

        setOrderInfo({
          productionOrderId: poData.id,
          orderNumber: poData.order_number || poData.id.substring(0, 8),
          collectionName: poData.collections?.name || "غير محدد",
          brandName: poData.collections?.brands?.name_ar || "غير محدد",
          totalQty,
          sizes: uniqueSizes,
          models,
          fabric: fabricInfo,
          weight: weightInfo,
        });

        // 2. جلب الـ 17 مرحلة الأساسيين من جدول production_stages
        const { data: stagesData, error: stagesError } = await supabase
          .from("production_stages")
          .select("*")
          .order("step_order", { ascending: true });

        if (stagesError) throw stagesError;
        setStages(stagesData);

        // 3. جلب حالة التتبع الحالية من جدول order_tracking
        const { data: trackingRecords, error: trackingError } = await supabase
          .from("order_tracking")
          .select("*")
          .eq("production_order_id", poData.id);

        if (trackingError) throw trackingError;

        // تحويل داتا التتبع لشكل يسهل قراءته في الـ UI
        const trackMap = {};
        trackingRecords.forEach((record) => {
          trackMap[record.stage_id] = {
            status: record.status,
            issue_notes: record.issue_notes || "",
          };
        });
        setTrackingData(trackMap);
      } catch (error) {
        console.error("Error fetching checklist data:", error);
        toast.error("حدث خطأ أثناء تحميل بيانات أمر التشغيل.");
      } finally {
        setIsLoading(false);
      }
    };

    if (collectionId) {
      fetchOrderData();
    }
  }, [collectionId]);

  // 💡 دالة تحديث الحالة في الداتابيز (تشتغل فوراً عند الضغط)
  const handleStatusChange = async (stageId, newStatus) => {
    // 1. تحديث الـ UI فوراً عشان المستخدم ميحسش بتأخير (Optimistic Update)
    setTrackingData((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        status: newStatus,
        issue_notes: newStatus === "issue" ? prev[stageId]?.issue_notes : "", // مسح الملاحظة لو الحالة اتغيرت من مشكلة
      },
    }));

    try {
      // 2. تحديث جدول order_tracking في الداتابيز
      const { error } = await supabase.from("order_tracking").upsert(
        {
          production_order_id: orderInfo.productionOrderId,
          stage_id: stageId,
          status: newStatus,
          issue_notes:
            newStatus === "issue" ? trackingData[stageId]?.issue_notes : null,
        },
        { onConflict: "production_order_id, stage_id" }, // مهم جداً عشان يعمل Update بدل ما يكرر
      );

      if (error) throw error;
      if (newStatus === "completed") {
        toast.success("تم تحديث المرحلة بنجاح ✓");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل في حفظ الحالة، برجاء المحاولة مرة أخرى.");
    }
  };

  // دالة تحديث نص المشكلة في الـ State (مش بتبعت للداتابيز غير لما يخلص كتابة)
  const handleIssueTextChange = (stageId, text) => {
    setTrackingData((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], issue_notes: text },
    }));
  };

  // 💡 دالة حفظ نص المشكلة للداتابيز (بتشتغل لما الموظف يضغط برا مربع النص onBlur)
  const saveIssueNoteToDB = async (stageId) => {
    try {
      await supabase
        .from("order_tracking")
        .update({ issue_notes: trackingData[stageId].issue_notes })
        .eq("production_order_id", orderInfo.productionOrderId)
        .eq("stage_id", stageId);
      toast.info("تم حفظ الملاحظة.");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-xl font-bold text-[#1a365d]">
          جاري تحميل بيانات التتبع...
        </div>
      </div>
    );
  }

  if (!orderInfo) return null;

  // حساب نسبة الإنجاز
  const completedStagesCount = stages.filter(
    (stage) => trackingData[stage.id]?.status === "completed",
  ).length;
  const progressPercentage =
    stages.length > 0
      ? Math.round((completedStagesCount / stages.length) * 100)
      : 0;

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر وزر الرجوع */}
        {/* ======================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#1a365d]">
                أمر تشغيل: {orderInfo.collectionName}
              </h1>
              <span className="bg-slate-100 text-slate-500 font-mono text-xs px-2 py-0.5 rounded border border-slate-200">
                {orderInfo.orderNumber}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              البراند:{" "}
              <span className="font-bold text-[#1a365d]">
                {orderInfo.brandName}
              </span>
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/planning/collections"
              className="flex-1 md:flex-none text-center bg-white text-[#1a365d] border border-slate-300 hover:bg-slate-50 px-6 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
            >
              ◀ رجوع للوحة التشغيل
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ======================= */}
          {/* العمود الأيمن: بيانات الكولكشن والصور */}
          {/* ======================= */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-base font-bold text-[#1a365d] mb-4 border-b border-slate-100 pb-3">
                بيانات الكولكشن والموديلات
              </h2>

              {/* 💡 عرض صور الموديلات الحقيقية */}
              <div className="flex flex-wrap gap-2 mb-6">
                {orderInfo.models.map((model) => (
                  <div
                    key={model.id}
                    className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 relative group"
                  >
                    {model.image_url ? (
                      <img
                        src={model.image_url}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        بدون صورة
                      </div>
                    )}
                    {/* Tooltip صغير لاسم الموديل */}
                    <div className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center p-1">
                      {model.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* تفاصيل الموديل (للقراءة فقط) */}
              <div className="space-y-4 text-sm text-right">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    إجمالي الكمية المطلوبة
                  </span>
                  <span className="font-black text-2xl text-[#1a365d]">
                    {orderInfo.totalQty.toLocaleString()}{" "}
                    <span className="text-sm font-normal">قطعة</span>
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    الخامة والوزن (الأساسي)
                  </span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                    {orderInfo.fabric} - {orderInfo.weight}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    المقاسات المطلوبة في القص
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {orderInfo.sizes.length > 0 ? (
                      orderInfo.sizes.map((size, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-50 border border-slate-200 text-[#1a365d] px-2 py-1 rounded text-xs font-bold"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">
                        لا يوجد مقاسات
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= */}
          {/* العمود الأيسر: قائمة المراحل الحقيقية */}
          {/* ======================= */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-[#1a365d]">
                  مراحل الإنتاج (تحديث لحظي)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  الضغط على الزر يقوم بتحديث الداتابيز وإشعار الأقسام الأخرى
                  تلقائياً.
                </p>
              </div>

              {/* شريط التقدم التلقائي */}
              <div className="w-full sm:w-48">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#1a365d]">نسبة الإنجاز</span>
                  <span className="text-[#1a365d]">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* قائمة المراحل المربوطة بالداتابيز */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {stages.map((stage, idx) => {
                  const currentStatus =
                    trackingData[stage.id]?.status || "pending";
                  const currentIssue =
                    trackingData[stage.id]?.issue_notes || "";

                  return (
                    <div
                      key={stage.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        currentStatus === "completed"
                          ? "bg-emerald-50 border-emerald-100"
                          : currentStatus === "in_progress"
                            ? "bg-blue-50 border-blue-100"
                            : currentStatus === "issue"
                              ? "bg-red-50 border-red-100"
                              : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              currentStatus === "completed"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {currentStatus === "completed"
                              ? "✓"
                              : stage.step_order}
                          </span>
                          <h3
                            className={`text-sm font-bold ${
                              currentStatus === "completed"
                                ? "text-emerald-800 line-through opacity-70"
                                : "text-[#1a365d]"
                            }`}
                          >
                            {stage.name}
                          </h3>
                        </div>

                        {/* 💡 زراير التحكم (بتكلم الداتابيز فوراً) */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() =>
                              handleStatusChange(stage.id, "pending")
                            }
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                              currentStatus === "pending"
                                ? "bg-slate-200 text-slate-700 border-slate-300"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            لم يبدأ
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(stage.id, "in_progress")
                            }
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                              currentStatus === "in_progress"
                                ? "bg-blue-600 text-white border-blue-700"
                                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            جاري
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(stage.id, "completed")
                            }
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                              currentStatus === "completed"
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            }`}
                          >
                            تم
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(stage.id, "issue")
                            }
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                              currentStatus === "issue"
                                ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                                : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                            }`}
                          >
                            عطل/مشكلة
                          </button>
                        </div>
                      </div>

                      {/* حقل المشكلة */}
                      {currentStatus === "issue" && (
                        <div className="mt-4 pt-4 border-t border-red-100 flex flex-col gap-3 animate-fade-in-up">
                          <label className="text-xs font-bold text-red-800">
                            وصف العطل أو المشكلة: (يتم الحفظ تلقائياً عند
                            الانتهاء من الكتابة)
                          </label>
                          <input
                            type="text"
                            value={currentIssue}
                            onChange={(e) =>
                              handleIssueTextChange(stage.id, e.target.value)
                            }
                            onBlur={() => saveIssueNoteToDB(stage.id)} // بيحفظ في الداتابيز لما يخلص كتابة ويضغط برا
                            placeholder="اكتب سبب توقف المرحلة هنا..."
                            className="w-full border border-red-200 rounded p-2 text-sm focus:outline-none focus:border-red-400 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 💡 تم إزالة الفوتر وزرار الحفظ كما طلبت */}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }
      `,
        }}
      />
    </div>
  );
};

export default Checklist;
