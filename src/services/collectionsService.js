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

export const handleIssueOrderToPlanning = async (
  collectionInfo,
  seriesCounts
) => {
  try {
    let grandTotalQty = 0;
    let grandTotalAmount = 0;

    // ============================================================
    // 1. جلب المقاسات من قاعدة البيانات
    // ============================================================

    const {
      data: dbSizes,
      error: fetchSizesError,
    } = await supabase
      .from("sizes")
      .select("id, name");

    if (fetchSizesError) {
      throw fetchSizesError;
    }

    // ============================================================
    // 2. حساب الإجماليات
    //
    // كل لون له عدد سريهات مختلف
    // ============================================================

    for (const model of collectionInfo.models) {
      for (const color of model.colors) {
        const colorSeries =
          Number(
            seriesCounts?.[model.id]?.[color]
          ) || 0;

        if (colorSeries <= 0) {
          throw new Error(
            `عدد السريهات للون "${color}" في الموديل "${model.name}" يجب أن يكون أكبر من صفر.`
          );
        }

        const colorQty =
          model.sizes.length * colorSeries;

        grandTotalQty += colorQty;

        grandTotalAmount +=
          colorQty *
          (Number(model.approvedPrice) || 0);
      }
    }

    // ============================================================
    // 3. البحث عن أمر تشغيل موجود
    // ============================================================

    const {
      data: existingOrder,
      error: checkError,
    } = await supabase
      .from("production_orders")
      .select("id")
      .eq(
        "collection_id",
        collectionInfo.id
      )
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    let orderId;

    // ============================================================
    // 4. تحديث أمر موجود أو إنشاء أمر جديد
    // ============================================================

    if (existingOrder) {
      orderId = existingOrder.id;

      const {
        error: updateError,
      } = await supabase
        .from("production_orders")
        .update({
          status: "pending",
          total_quantity: grandTotalQty,
          total_amount: grandTotalAmount,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        throw updateError;
      }

      // حذف العناصر القديمة
      const {
        error: deleteError,
      } = await supabase
        .from("production_order_items")
        .delete()
        .eq(
          "production_order_id",
          orderId
        );

      if (deleteError) {
        throw deleteError;
      }
    } else {
      const {
        data: newOrder,
        error: insertError,
      } = await supabase
        .from("production_orders")
        .insert({
          collection_id:
            collectionInfo.id,

          status: "pending",

          total_quantity:
            grandTotalQty,

          total_amount:
            grandTotalAmount,

          order_number:
            `PO-${collectionInfo.brandCode}-${new Date().getFullYear()}-${Math.floor(
              1000 + Math.random() * 9000
            )}`,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      orderId = newOrder.id;
    }

    // ============================================================
    // 5. إنشاء Production Order Item لكل موديل + لون
    // ============================================================

    for (const model of collectionInfo.models) {
      for (const color of model.colors) {
        // ========================================================
        // عدد السريهات الخاص بهذا اللون تحديدًا
        // ========================================================

        const colorSeries =
          Number(
            seriesCounts?.[model.id]?.[color]
          ) || 0;

        if (colorSeries <= 0) {
          throw new Error(
            `عدد السريهات للون "${color}" في الموديل "${model.name}" يجب أن يكون أكبر من صفر.`
          );
        }

        // ========================================================
        // إجمالي هذا اللون
        //
        // مثال:
        // S M L XL = 4 مقاسات
        // 3 سريهات
        //
        // 4 × 3 = 12 قطعة
        // ========================================================

        const colorQty =
          model.sizes.length *
          colorSeries;

        // ========================================================
        // إنشاء item مستقل للون
        // ========================================================

        const {
          data: itemData,
          error: itemError,
        } = await supabase
          .from("production_order_items")
          .insert({
            production_order_id:
              orderId,

            model_id:
              model.real_id ||
              model.id,

            color: color,

            total_quantity:
              colorQty,

            selling_price:
              Number(
                model.approvedPrice
              ) || 0,
          })
          .select()
          .single();

        if (itemError) {
          throw itemError;
        }

        const itemId = itemData.id;

        // ========================================================
        // 6. ربط المقاسات بالـ item
        //
        // كل مقاس يأخذ عدد السريهات الخاص باللون
        // ========================================================

        const sizesData =
          model.sizes.map(
            (sizeName) => {

              const matchedSize =
                dbSizes.find(
                  (dbSize) =>
                    String(
                      dbSize.name
                    )
                      .trim()
                      .toLowerCase() ===
                    String(
                      sizeName
                    )
                      .trim()
                      .toLowerCase()
                );

              if (!matchedSize) {
                throw new Error(
                  `المقاس "${sizeName}" غير مسجل في جدول المقاسات بالداتابيز.`
                );
              }

              return {
                production_order_item_id:
                  itemId,

                size_id:
                  matchedSize.id,

                quantity:
                  colorSeries,
              };
            }
          );

        // ========================================================
        // 7. حفظ المقاسات
        // ========================================================

        const {
          error: sizesError,
        } = await supabase
          .from(
            "production_order_item_sizes"
          )
          .insert(sizesData);

        if (sizesError) {
          throw sizesError;
        }
      }
    }

    // ============================================================
    // 8. إرجاع النتيجة
    // ============================================================

    return {
      id: orderId,
      totalQuantity:
        grandTotalQty,
      totalAmount:
        grandTotalAmount,
    };

  } catch (error) {

    console.error(
      "Error issuing order to planning:",
      error
    );

    throw error;
  }
};