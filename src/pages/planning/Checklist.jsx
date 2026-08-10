import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../supabase";
import { toast } from "sonner";

const Checklist = () => {
  const { id: collectionId } = useParams();

  const [orderInfo, setOrderInfo] = useState(null);
  const [stages, setStages] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      setIsLoading(true);

      try {
        // ==========================================
        // 1. جلب أمر التشغيل والكولكشن والموديلات
        // ==========================================

        const { data: poData, error: poError } = await supabase
          .from("production_orders")
          .select(
            `
              id,
              order_number,

              collections (
                name,
                brands (
                  name_ar
                ),

                models (
                  id,
                  name,
                  image_url,

                  model_materials (
                    id,
                    weight,
                    notes,

                    materials (
                      id,
                      name
                    )
                  )
                )
              ),

              production_order_items (
                id,
                model_id,
                color,
                total_quantity,

                production_order_item_sizes (
                  quantity,

                  sizes (
                    id,
                    name
                  )
                )
              )
            `,
          )
          .eq("collection_id", collectionId)
          .single();

        if (poError) throw poError;

        // ==========================================
        // 2. حساب إجمالي الكمية
        // ==========================================

        let totalQty = 0;

        poData.production_order_items?.forEach((item) => {
          totalQty += Number(item.total_quantity) || 0;
        });

        // ==========================================
        // 3. استخراج المقاسات
        // ==========================================

        const sizesSet = new Set();

        poData.production_order_items?.forEach((item) => {
          item.production_order_item_sizes?.forEach((sizeRow) => {
            const sizeName = sizeRow.sizes?.name;

            if (sizeName) {
              sizesSet.add(sizeName);
            }
          });
        });

        const uniqueSizes = Array.from(sizesSet);

        // ==========================================
        // 4. الموديلات
        // ==========================================

        const models = poData.collections?.models || [];

        // ==========================================
        // 5. تجهيز بيانات الخامات لكل موديل
        // ==========================================

        const modelsWithMaterials = models.map((model) => {
          const materials = (model.model_materials || []).map(
            (modelMaterial) => ({
              id: modelMaterial.id,
              name: modelMaterial.materials?.name || "خامة غير محددة",
              weight:
                modelMaterial.weight !== null &&
                modelMaterial.weight !== undefined
                  ? modelMaterial.weight
                  : null,
              notes: modelMaterial.notes || "",
            }),
          );

          return {
            ...model,
            materials,
          };
        });

        // ==========================================
        // 6. تجهيز كمية كل موديل + لون
        // ==========================================

        const modelColorQuantities = {};

        poData.production_order_items?.forEach((item) => {
          const modelId = item.model_id;
          const color = item.color || "لون غير محدد";
          const quantity = Number(item.total_quantity) || 0;

          if (!modelColorQuantities[modelId]) {
            modelColorQuantities[modelId] = {};
          }

          if (!modelColorQuantities[modelId][color]) {
            modelColorQuantities[modelId][color] = 0;
          }

          modelColorQuantities[modelId][color] += quantity;
        });

        // ==========================================
        // 7. إضافة الكميات لكل موديل
        // ==========================================

        const modelsWithQuantities = modelsWithMaterials.map((model) => ({
          ...model,
          colorQuantities: modelColorQuantities[model.id] || {},
        }));

        // ==========================================
        // 8. حفظ بيانات أمر التشغيل
        // ==========================================

        setOrderInfo({
          productionOrderId: poData.id,

          orderNumber: poData.order_number || poData.id.substring(0, 8),

          collectionName: poData.collections?.name || "غير محدد",

          brandName: poData.collections?.brands?.name_ar || "غير محدد",

          totalQty,

          sizes: uniqueSizes,

          models: modelsWithQuantities,
        });

        // ==========================================
        // 9. جلب مراحل الإنتاج
        // ==========================================

        const { data: stagesData, error: stagesError } = await supabase
          .from("production_stages")
          .select("*")
          .order("step_order", {
            ascending: true,
          });

        if (stagesError) throw stagesError;

        setStages(stagesData || []);

        // ==========================================
        // 10. جلب حالة التتبع
        // ==========================================

        const { data: trackingRecords, error: trackingError } = await supabase
          .from("order_tracking")
          .select("*")
          .eq("production_order_id", poData.id);

        if (trackingError) throw trackingError;

        const trackMap = {};

        trackingRecords?.forEach((record) => {
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

  // ==========================================
  // تحديث حالة المرحلة
  // ==========================================

  const handleStatusChange = async (stageId, newStatus) => {
    setTrackingData((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        status: newStatus,
        issue_notes:
          newStatus === "issue" ? prev[stageId]?.issue_notes || "" : "",
      },
    }));

    try {
      const { error } = await supabase.from("order_tracking").upsert(
        {
          production_order_id: orderInfo.productionOrderId,

          stage_id: stageId,

          status: newStatus,

          issue_notes:
            newStatus === "issue"
              ? trackingData[stageId]?.issue_notes || null
              : null,
        },
        {
          onConflict: "production_order_id, stage_id",
        },
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

  // ==========================================
  // تحديث نص المشكلة
  // ==========================================

  const handleIssueTextChange = (stageId, text) => {
    setTrackingData((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        issue_notes: text,
      },
    }));
  };

  // ==========================================
  // حفظ المشكلة
  // ==========================================

  const saveIssueNoteToDB = async (stageId) => {
    try {
      const { error } = await supabase
        .from("order_tracking")
        .update({
          issue_notes: trackingData[stageId]?.issue_notes || "",
        })
        .eq("production_order_id", orderInfo.productionOrderId)
        .eq("stage_id", stageId);

      if (error) throw error;

      toast.info("تم حفظ الملاحظة.");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px] text-[#1a365d] font-bold"
        dir="rtl"
      >
        جاري تحميل بيانات التتبع...
      </div>
    );
  }

  if (!orderInfo) {
    return null;
  }

  // ==========================================
  // حساب نسبة الإنجاز
  // ==========================================

  const completedStagesCount = stages.filter(
    (stage) => trackingData[stage.id]?.status === "completed",
  ).length;

  const progressPercentage =
    stages.length > 0
      ? Math.round((completedStagesCount / stages.length) * 100)
      : 0;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div dir="rtl">
      {/* ======================= */}
      {/* الهيدر */}
      {/* ======================= */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="text-right">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-[#1a365d]">
              أمر تشغيل: {orderInfo.collectionName}
            </h1>

            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {orderInfo.orderNumber}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            البراند:{" "}
            <span className="font-bold text-slate-700">
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

      {/* ======================= */}
      {/* المحتوى */}
      {/* ======================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================= */}
        {/* بيانات الكولكشن */}
        {/* ======================= */}

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-base font-bold text-[#1a365d] mb-4 border-b border-slate-100 pb-3">
              بيانات الكولكشن والموديلات
            </h2>

            {/* ======================= */}
            {/* صور الموديلات */}
            {/* ======================= */}

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

                  <div className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center p-1">
                    {model.name}
                  </div>
                </div>
              ))}
            </div>

            {/* ======================= */}
            {/* تفاصيل الأمر */}
            {/* ======================= */}

            <div className="space-y-5 text-sm text-right">
              {/* إجمالي الكمية */}

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  إجمالي الكمية المطلوبة
                </span>

                <span className="font-black text-2xl text-[#1a365d]">
                  {orderInfo.totalQty.toLocaleString()}{" "}
                  <span className="text-sm font-normal">قطعة</span>
                </span>
              </div>

              {/* ======================= */}
              {/* الكميات حسب الموديل واللون */}
              {/* ======================= */}

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  الكميات المطلوبة حسب الموديل واللون
                </span>

                <div className="space-y-2">
                  {orderInfo.models.map((model) => {
                    const colorQuantities = model.colorQuantities || {};

                    const colors = Object.entries(colorQuantities);

                    if (colors.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={model.id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        {/* اسم الموديل */}

                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                          <span className="font-black text-[#1a365d] text-sm">
                            {model.name}
                          </span>
                        </div>

                        {/* الألوان والكميات */}

                        <div className="divide-y divide-slate-100">
                          {colors.map(([color, quantity], index) => (
                            <div
                              key={`${model.id}-${color}-${index}`}
                              className="flex items-center justify-between px-3 py-2 bg-white"
                            >
                              <span className="text-xs font-bold text-slate-600">
                                {color}
                              </span>

                              <span className="text-xs font-black text-[#1a365d]">
                                {Number(quantity).toLocaleString()} قطعة
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ======================= */}
              {/* الخامات والأوزان */}
              {/* ======================= */}

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  الخامات والأوزان
                </span>

                <div className="space-y-2">
                  {orderInfo.models.some(
                    (model) => model.materials && model.materials.length > 0,
                  ) ? (
                    orderInfo.models.map((model) => {
                      if (!model.materials || model.materials.length === 0) {
                        return null;
                      }

                      return (
                        <div
                          key={model.id}
                          className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                        >
                          <div className="font-bold text-[#1a365d] mb-2">
                            {model.name}
                          </div>

                          <div className="space-y-1.5">
                            {model.materials.map((material, idx) => (
                              <span
                                key={material.id || idx}
                                className="font-bold text-slate-700 text-xs"
                              >
                                {material.name}
                                {idx < model.materials.length - 1 ? " + " : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-400">
                      لا توجد خامات مسجلة لهذا الأمر.
                    </div>
                  )}
                </div>
              </div>

              {/* ======================= */}
              {/* المقاسات */}
              {/* ======================= */}

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
        {/* مراحل الإنتاج */}
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

            {/* نسبة الإنجاز */}

            <div className="w-full sm:w-48">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#1a365d]">نسبة الإنجاز</span>

                <span className="text-[#1a365d]">{progressPercentage}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* قائمة المراحل */}

          <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {stages.map((stage) => {
                const currentStatus =
                  trackingData[stage.id]?.status || "pending";

                const currentIssue = trackingData[stage.id]?.issue_notes || "";

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

                      {/* أزرار التحكم */}

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
                          onClick={() => handleStatusChange(stage.id, "issue")}
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
                          وصف العطل أو المشكلة: (يتم الحفظ تلقائياً عند الانتهاء
                          من الكتابة)
                        </label>

                        <input
                          type="text"
                          value={currentIssue}
                          onChange={(e) =>
                            handleIssueTextChange(stage.id, e.target.value)
                          }
                          onBlur={() => saveIssueNoteToDB(stage.id)}
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
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(5px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
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
