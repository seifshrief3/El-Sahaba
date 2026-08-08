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
    let grandTotalQty = 0;
    let grandTotalAmount = 0;

    // 1. حساب الإجماليات الأول
    collectionInfo.models.forEach((model) => {
      const modelQty = model.sizes.length * model.colors.length * seriesCount;
      grandTotalQty += modelQty;
      grandTotalAmount += modelQty * (model.approvedPrice || 0);
    });

    // 2. تحديث أمر التشغيل الرئيسي (production_orders) بالكميات والفلوس
    const { data: orderData, error: orderError } = await supabase
      .from("production_orders")
      .upsert({
        collection_id: collectionInfo.id,
        status: "pending",
        total_quantity: grandTotalQty,
        total_amount: grandTotalAmount,
        order_number: `PO-${collectionInfo.brandCode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      }, { onConflict: "collection_id" })
      .select()
      .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // 3. إدخال تفاصيل الموديلات والألوان (production_order_items)
    for (const model of collectionInfo.models) {
      for (const color of model.colors) {
        // كمية اللون ده = عدد المقاسات × السريهات
        const colorQty = model.sizes.length * seriesCount;

        const { data: itemData, error: itemError } = await supabase
          .from("production_order_items")
          .insert({
            production_order_id: orderId,
            model_id: model.real_id || model.id,
            color: color,
            total_quantity: colorQty,
            selling_price: model.approvedPrice || 0
          })
          .select()
          .single();

        if (itemError) throw itemError;
        const itemId = itemData.id;

        // 4. إدخال المقاسات في جدولها (production_order_item_sizes)
        // ⚠️ ملاحظة مهمة: بناءً على صورتك عمود المقاس اسمه size_id (لو هو بياخد نص زي 'M' أو 'L' الكود هيشتغل)
        // لو الداتابيز رافضة عشان نوعه UUID، غير نوع العمود في Supabase لـ Text وسميه size
        const sizesData = model.sizes.map((size) => ({
          production_order_item_id: itemId,
          size_id: size,
          quantity: seriesCount
        }));

        const { error: sizesError } = await supabase
          .from("production_order_item_sizes")
          .insert(sizesData);

        if (sizesError) throw sizesError;
      }
    }

    return orderData;
  } catch (error) {
    console.error("Error issuing order to planning:", error);
    throw error;
  }
};