import { supabase } from "../../supabase";
import { addSystemLog } from "./systemLogService"; // 💡 تأكد من مسار ملف الـ Logs

export const handleAddNewCollection = async (collection) => {
  const { data: newCollection, error: collectionError } = await supabase
    .from("collections")
    .insert([collection])
    .select()
    .single();

  if (collectionError) {
    throw collectionError;
  }

  // إنشاء الموديلات التلقائية إذا لزم الأمر
  if (newCollection.models_count && newCollection.models_count > 0) {
    const modelsToInsert = Array.from({ length: newCollection.models_count }).map((_, index) => ({
      collection_id: newCollection.id,
      model_number: `MOD-${index + 1}`,
      name: `موديل ${index + 1}`
    }));

    const { error: modelsError } = await supabase
      .from("models")
      .insert(modelsToInsert);

    if (modelsError) {
      console.error("حصل خطأ أثناء إنشاء الموديلات التلقائية:", modelsError);
    }
  }

  // 💡 تسجيل حدث إنشاء الكولكشن
  await addSystemLog({
    module: "customer_service",
    action_type: "CREATE",
    entity_type: "collection",
    entity_id: newCollection.id,
    title: "إنشاء كولكشن جديد",
    description: `تم إنشاء كولكشن جديد باسم "${newCollection.name}" بعدد ${newCollection.models_count || 0} موديل.`,
    details: { code: newCollection.code, season: newCollection.season }
  });

  return newCollection;
}

export const handleGetCollections = async () => {
  const { data, error } = await supabase
    .from("collections")
    .select("*, brands(id, name_ar, name_en)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export const handleGetCollectionById = async (id) => {
  const { data, error } = await supabase
    .from("collections")
    .select("*, brands(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const handleUpdateCollection = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("collections")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // 💡 تسجيل حدث تعديل بيانات الكولكشن
  await addSystemLog({
    module: "customer_service",
    action_type: "UPDATE",
    entity_type: "collection",
    entity_id: id,
    title: "تعديل بيانات كولكشن",
    description: `تم تحديث البيانات الأساسية للكولكشن "${data.name}".`,
    details: updatedData
  });

  return data;
};

export const handleUpdateCustomerApproval = async (collectionId, approvalStatus) => {
  const { data, error } = await supabase
    .from("collections")
    .update({ customer_approval: approvalStatus })
    .eq("id", collectionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // ترجمة الحالة عشان تظهر بشكل مقروء في السجل
  const approvalMap = {
    not_sent: "لم يتم الإرسال",
    sent: "تم الإرسال (قيد الانتظار)",
    approved: "تمت الموافقة",
    revision_requested: "مطلوب تعديل",
    in_production: "جاري التصنيع"
  };

  // 💡 تسجيل حدث تغيير موافقة العميل
  await addSystemLog({
    module: "customer_service",
    action_type: "STATUS_CHANGE",
    entity_type: "collection",
    entity_id: collectionId,
    title: "تحديث موافقة العميل",
    description: `تم تغيير حالة موافقة العميل للكولكشن "${data.name}" إلى: ${approvalMap[approvalStatus] || approvalStatus}.`,
    details: { new_status: approvalStatus }
  });

  return data;
};

export const handleIssueOrderToPlanning = async (collectionInfo, seriesCount) => {
  try {
    // 1. تحديث حالة الكولكشن
    await supabase
      .from("collections")
      .update({
        customer_approval: "in_production",
        status: "active"
      })
      .eq("id", collectionInfo.id);

    // 2. حساب الإجماليات
    let grandTotalQty = 0;
    let grandTotalValue = 0;
    collectionInfo.models.forEach(m => {
      const qty = m.sizes.length * m.colors.length * seriesCount;
      grandTotalQty += qty;
      grandTotalValue += qty * m.approvedPrice;
    });

    // 3. إنشاء أمر التشغيل الرئيسي
    const orderNumber = `PO-${collectionInfo.brandCode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: productionOrder, error: poError } = await supabase
      .from("production_orders")
      .insert({
        collection_id: collectionInfo.id,
        order_number: orderNumber,
        status: 'sent_to_planning',
        total_quantity: grandTotalQty,
        total_amount: grandTotalValue,
        sent_to_planning_at: new Date().toISOString()
      })
      .select()
      .single();

    if (poError) throw poError;

    // 4. جلب المقاسات من الداتابيز
    const { data: dbSizes, error: sizesError } = await supabase.from("sizes").select("id, name");
    if (sizesError) throw sizesError;

    // 5. إدخال الموديلات والمقاسات التفصيلية
    for (const model of collectionInfo.models) {
      const modelQty = model.sizes.length * model.colors.length * seriesCount;

      const { data: poItem, error: itemError } = await supabase
        .from("production_order_items")
        .insert({
          production_order_id: productionOrder.id,
          model_id: model.real_id,
          selling_price: model.approvedPrice,
          total_quantity: modelQty
        })
        .select()
        .single();

      if (itemError) throw itemError;

      const itemSizesToInsert = [];
      const qtyPerSize = seriesCount * model.colors.length;

      for (const sizeName of model.sizes) {
        const matchedSize = dbSizes.find(s => s.name.toLowerCase() === sizeName.toLowerCase());

        if (matchedSize) {
          itemSizesToInsert.push({
            production_order_item_id: poItem.id,
            size_id: matchedSize.id,
            quantity: qtyPerSize
          });
        } else {
          console.warn(`المقاس ${sizeName} غير موجود في جدول sizes بقاعدة البيانات!`);
        }
      }

      if (itemSizesToInsert.length > 0) {
        const { error: itemSizesError } = await supabase
          .from("production_order_item_sizes")
          .insert(itemSizesToInsert);

        if (itemSizesError) throw itemSizesError;
      }
    }

    // 💡 تسجيل حدث إصدار أمر التشغيل (أكشن مهم جداً)
    await addSystemLog({
      module: "customer_service", // أو "planning" حسب ما تحب تصنفها
      action_type: "STATUS_CHANGE",
      entity_type: "production_order",
      entity_id: productionOrder.id,
      title: "إصدار أمر تشغيل",
      description: `تم إصدار أمر تشغيل رقم (${orderNumber}) للكولكشن "${collectionInfo.collectionName}" وإرساله للتخطيط والمصنع.`,
      details: {
        order_number: orderNumber,
        total_quantity: grandTotalQty,
        series_count: seriesCount
      }
    });

    return productionOrder;
  } catch (error) {
    console.error("Error issuing order to planning:", error);
    throw error;
  }
};