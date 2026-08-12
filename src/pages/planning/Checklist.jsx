import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../supabase";
import { toast } from "sonner";
import { notificationService } from "../../services/notificationService";

const Checklist = () => {
  const { id: collectionId } = useParams();

  const [orderInfo, setOrderInfo] = useState(null);
  const [stages, setStages] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 💡 States لخاصية تسليم الدفعات
  // ==========================================
  const [orderItems, setOrderItems] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInputs, setDeliveryInputs] = useState({});
  const [isDelivering, setIsDelivering] = useState(false);

  // دالة لجلب البيانات
  const fetchOrderData = async () => {
    setIsLoading(true);
    try {
      const { data: poData, error: poError } = await supabase
        .from("production_orders")
        .select(
          `
            id,
            order_number,
            collections (
              id,
              name,
              brands (name_ar),
              models (
                id, name, image_url,
                model_materials ( id, weight, notes, materials ( id, name ) )
              )
            ),
            production_order_items (
              id,
              model_id,
              part,
              color,
              total_quantity,
              production_order_item_sizes (
                id,
                quantity,
                delivered_qty,
                remaining_qty,
                sizes ( id, name )
              )
            )
          `,
        )
        .eq("collection_id", collectionId)
        .single();

      if (poError) throw poError;

      setOrderItems(poData.production_order_items || []);

      let totalQty = 0;
      poData.production_order_items?.forEach((item) => {
        totalQty += Number(item.total_quantity) || 0;
      });

      const sizesSet = new Set();
      poData.production_order_items?.forEach((item) => {
        item.production_order_item_sizes?.forEach((sizeRow) => {
          if (sizeRow.sizes?.name) sizesSet.add(sizeRow.sizes.name);
        });
      });
      const uniqueSizes = Array.from(sizesSet);

      // 💡 قراءة الموديلات من جوه collections بشكل صحيح
      const models = poData.collections?.models || [];
      const modelsWithMaterials = models.map((model) => {
        const materials = (model.model_materials || []).map((mm) => ({
          id: mm.id,
          name: mm.materials?.name || "خامة غير محددة",
          weight: mm.weight !== null ? mm.weight : null,
          notes: mm.notes || "",
        }));
        return { ...model, materials };
      });

      const modelColorQuantities = {};
      poData.production_order_items?.forEach((item) => {
        const modelId = item.model_id;
        const color = item.color || "لون غير محدد";
        const quantity = Number(item.total_quantity) || 0;

        if (!modelColorQuantities[modelId]) modelColorQuantities[modelId] = {};
        if (!modelColorQuantities[modelId][color])
          modelColorQuantities[modelId][color] = 0;
        modelColorQuantities[modelId][color] += quantity;
      });

      const modelsWithQuantities = modelsWithMaterials.map((model) => ({
        ...model,
        colorQuantities: modelColorQuantities[model.id] || {},
      }));

      setOrderInfo({
        productionOrderId: poData.id,
        collectionId: poData.collections?.id,
        orderNumber: poData.order_number || poData.id.substring(0, 8),
        collectionName: poData.collections?.name || "غير محدد",
        brandName: poData.collections?.brands?.name_ar || "غير محدد",
        totalQty,
        sizes: uniqueSizes,
        models: modelsWithQuantities,
      });

      const { data: stagesData, error: stagesError } = await supabase
        .from("production_stages")
        .select("*")
        .order("step_order", { ascending: true });
      if (stagesError) throw stagesError;
      setStages(stagesData || []);

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
  useEffect(() => {
    if (collectionId) fetchOrderData();
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
        { onConflict: "production_order_id, stage_id" },
      );
      if (error) throw error;
      if (newStatus === "completed") toast.success("تم تحديث المرحلة بنجاح ✓");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل في حفظ الحالة، برجاء المحاولة مرة أخرى.");
    }
  };

  const handleIssueTextChange = (stageId, text) => {
    setTrackingData((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], issue_notes: text },
    }));
  };

  const saveIssueNoteToDB = async (stageId) => {
    try {
      const { error } = await supabase
        .from("order_tracking")
        .update({ issue_notes: trackingData[stageId]?.issue_notes || "" })
        .eq("production_order_id", orderInfo.productionOrderId)
        .eq("stage_id", stageId);
      if (error) throw error;
      toast.info("تم حفظ الملاحظة.");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // ==========================================
  // 💡 دوال التسليم (الجزئي والكلي)
  // ==========================================

  // دالة الإرسال الفعلية المشتركة في الداتابيز (النسخة السريعة)
  const executeDelivery = async (itemsToDeliver) => {
    setIsDelivering(true);
    try {
      const deliveryNumber = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. إنشاء الدفعة الأساسية
      const { data: deliveryRecord, error: deliveryError } = await supabase
        .from("production_deliveries")
        .insert({
          production_order_id: orderInfo.productionOrderId,
          delivery_number: deliveryNumber,
          status: "pending",
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // 2. إدراج كل العناصر دفعة واحدة (Bulk Insert) - دي أسرع من اللوب بكتير
      const deliveryItemsPayload = itemsToDeliver.map((item) => ({
        delivery_id: deliveryRecord.id,
        production_order_item_size_id: item.id,
        delivered_qty: item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("production_delivery_items")
        .insert(deliveryItemsPayload);

      if (itemsError) throw itemsError;

      // 3. تحديث الكميات في المقاسات (باستخدام Promise.all للتوازي) 🚀
      const updatePromises = itemsToDeliver.map((item) => {
        const currentSizeObj = orderItems
          .flatMap((i) => i.production_order_item_sizes)
          .find((s) => s.id === item.id);

        const newDeliveredQty = (currentSizeObj?.delivered_qty || 0) + item.qty;

        // بنرجع الـ Promise من غير ما نستناه هنا
        return supabase
          .from("production_order_item_sizes")
          .update({ delivered_qty: newDeliveredQty })
          .eq("id", item.id);
      });

      // بننفذ كل التحديثات في نفس اللحظة ونستنى نتيجتهم كلهم
      await Promise.all(updatePromises);

      // 4. إرسال الإشعار
      await notificationService.sendNotification(
        "inventory",
        "دفعة جديدة جاهزة للاستلام 📦",
        `قسم التخطيط أرسل دفعة رقم (${deliveryNumber}) من كولكشن ${orderInfo.collectionName}، في انتظار استلامكم.`,
        orderInfo.collectionId,
      );

      toast.success("تم إرسال الكميات للمخزن بنجاح!");
      setShowDeliveryModal(false);
      await fetchOrderData(); // تحديث الداتا بعد النجاح
    } catch (error) {
      console.error("Error creating delivery batch:", error);
      toast.error("حدث خطأ أثناء إرسال الدفعة للمخزن.");
    } finally {
      setIsDelivering(false);
    }
  };

  // تسليم دفعة يدوية بالمقاسات
  const submitDeliveryBatch = async () => {
    const itemsToDeliver = Object.entries(deliveryInputs)
      .map(([id, qty]) => ({ id, qty: Number(qty) }))
      .filter((item) => item.qty > 0);

    if (itemsToDeliver.length === 0) {
      toast.error("برجاء إدخال كمية لقطعة واحدة على الأقل قبل التسليم.");
      return;
    }

    await executeDelivery(itemsToDeliver);
  };

  // 💡 تسليم كل الكميات المتبقية مرة واحدة
  const handleDeliverAllRemaining = async () => {
    const confirmAll = window.confirm(
      "هل أنت متأكد من تسليم كافة الكميات المتبقية بالكامل للمخزن مرة واحدة؟",
    );
    if (!confirmAll) return;

    const itemsToDeliver = [];
    orderItems.forEach((item) => {
      item.production_order_item_sizes?.forEach((sizeObj) => {
        if (sizeObj.remaining_qty > 0) {
          itemsToDeliver.push({ id: sizeObj.id, qty: sizeObj.remaining_qty });
        }
      });
    });

    if (itemsToDeliver.length === 0) {
      toast.error("لا توجد كميات متبقية لتسليمها.");
      return;
    }

    await executeDelivery(itemsToDeliver);
  };

  const handleDeliveryInputChange = (sizeId, value, maxAllowed) => {
    const val = parseInt(value, 10);
    if (val < 0) return;
    if (val > maxAllowed) {
      toast.error(`الكمية المتبقية لهذا المقاس هي ${maxAllowed} قطعة فقط.`);
      return;
    }
    setDeliveryInputs((prev) => ({ ...prev, [sizeId]: val }));
  };

  const openDeliveryModal = () => {
    setDeliveryInputs({});
    setShowDeliveryModal(true);
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

  if (!orderInfo) return null;

  const completedStagesCount = stages.filter(
    (stage) => trackingData[stage.id]?.status === "completed",
  ).length;
  const progressPercentage =
    stages.length > 0
      ? Math.round((completedStagesCount / stages.length) * 100)
      : 0;

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

        <div className="flex gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* 💡 زرار تسليم الكولكشن بالكامل */}
          <button
            onClick={handleDeliverAllRemaining}
            className="flex-1 md:flex-none text-center bg-[#1a365d] text-white hover:bg-blue-900 px-5 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
          >
            تسليم الكولكشن بالكامل
          </button>

          {/* 💡 زرار إرسال الدفعة (يدوي) */}
          <button
            onClick={openDeliveryModal}
            className="flex-1 md:flex-none text-center bg-red-800 text-white hover:bg-red-900 px-5 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
          >
            تسليم دفعة (مخصص)
          </button>

          <Link
            to="/planning/collections"
            className="flex-1 md:flex-none text-center bg-white text-[#1a365d] border border-slate-300 hover:bg-slate-50 px-5 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
          >
            ◀ رجوع للوحة
          </Link>
        </div>
      </div>

      {/* ======================= */}
      {/* المحتوى */}
      {/* ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بيانات الكولكشن */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-base font-bold text-[#1a365d] mb-4 border-b border-slate-100 pb-3">
              بيانات الكولكشن والموديلات
            </h2>

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

            <div className="space-y-5 text-sm text-right">
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
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  الكميات المطلوبة حسب الموديل واللون
                </span>
                <div className="space-y-2">
                  {orderInfo.models.map((model) => {
                    const colors = Object.entries(model.colorQuantities || {});
                    if (colors.length === 0) return null;
                    return (
                      <div
                        key={model.id}
                        className="border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                          <span className="font-black text-[#1a365d] text-sm">
                            {model.name}
                          </span>
                        </div>
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
            </div>
          </div>
        </div>

        {/* مراحل الإنتاج */}
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
            <div className="w-full sm:w-48">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#1a365d]">نسبة الإنجاز</span>
                <span className="text-[#1a365d]">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

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
                          className={`text-sm font-bold ${currentStatus === "completed" ? "text-emerald-800 line-through opacity-70" : "text-[#1a365d]"}`}
                        >
                          {stage.name}
                        </h3>
                      </div>

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

      {/* ======================= */}
      {/* 💡 نافذة تسليم الدفعة للمخزن */}
      {/* ======================= */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-black text-[#1a365d] mb-2">
              تسليم دفعة جديدة للمخزن 📦
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              برجاء إدخال الكميات الجاهزة للتسليم الآن. الأرقام الموضحة هي
              الكميات <strong className="text-red-600">المتبقية فقط</strong>{" "}
              والتي لم يتم تسليمها بعد.
            </p>

            <div className="overflow-y-auto flex-1 pr-2 space-y-4 mb-6">
              {orderItems.map((item) => {
                const availableSizes =
                  item.production_order_item_sizes?.filter(
                    (s) => s.remaining_qty > 0,
                  ) || [];
                if (availableSizes.length === 0) return null;

                const modelName =
                  orderInfo.models.find((m) => m.id === item.model_id)?.name ||
                  "موديل غير محدد";

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-[#1a365d]">
                        {modelName}
                      </h3>
                      <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border">
                        {item.color || "بدون لون"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSizes.map((sizeObj) => (
                        <div
                          key={sizeObj.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-slate-700">
                              مقاس {sizeObj.sizes?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">
                              متبقي: {sizeObj.remaining_qty}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={sizeObj.remaining_qty}
                            value={deliveryInputs[sizeObj.id] || ""}
                            onChange={(e) =>
                              handleDeliveryInputChange(
                                sizeObj.id,
                                e.target.value,
                                sizeObj.remaining_qty,
                              )
                            }
                            placeholder="الكمية للتسليم..."
                            className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-red-800 text-center font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={submitDeliveryBatch}
                disabled={isDelivering}
                className="flex-1 bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition shadow-md disabled:opacity-50"
              >
                {isDelivering
                  ? "جاري الإرسال..."
                  : "تأكيد وإرسال الدفعة للمخزن"}
              </button>
              <button
                onClick={() => setShowDeliveryModal(false)}
                disabled={isDelivering}
                className="px-8 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition"
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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.2s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
};

export default Checklist;
