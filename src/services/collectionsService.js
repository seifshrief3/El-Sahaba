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
    // 1. جلب المقاسات
    // ============================================================

    const { data: dbSizes, error: fetchSizesError } = await supabase
      .from("sizes")
      .select("id, name");

    if (fetchSizesError) {
      throw fetchSizesError;
    }

    // ============================================================
    // Helpers
    // ============================================================

    const getComponentVariantKey = (component, fallbackIndex = 1) => {
      if (component && typeof component === "object") {
        return Number(
          component.variant_key ??
          component.variant ??
          component.variantKey ??
          fallbackIndex
        );
      }
      return fallbackIndex;
    };

    const getComponentPart = (component) => {
      if (!component || typeof component !== "object") {
        return "";
      }
      return (
        component.part ??
        component.part_name ??
        component.partName ??
        component.type ??
        ""
      );
    };

    const getComponentColor = (component) => {
      if (typeof component === "string") {
        return component;
      }
      if (!component || typeof component !== "object") {
        return "";
      }
      return (
        component.color ??
        component.colors ??
        component.colour ??
        component.color_name ??
        ""
      );
    };

    // ============================================================
    // 2. تجهيز Variants لكل موديل
    // ============================================================

    const preparedModels = collectionInfo.models.map((model) => {
      // 💡 التعديل هنا: لو الداتا جاية بالهيكل الجديد (Variants جاهزة) نستخدمها مباشرة
      if (Array.isArray(model.variants) && model.variants.length > 0) {
        return model;
      }

      // دعم رجعي للهيكل القديم (لو مفيش Variants بنبنيها إحنا)
      const components = Array.isArray(model.components)
        ? model.components
        : Array.isArray(model.colors)
          ? model.colors
          : [];

      const variantsMap = new Map();

      components.forEach((component, index) => {
        const variantKey = getComponentVariantKey(component, 1);
        const part = getComponentPart(component);
        const color = getComponentColor(component);

        if (!color) {
          return;
        }

        if (!variantsMap.has(variantKey)) {
          variantsMap.set(variantKey, []);
        }

        variantsMap.get(variantKey).push({
          ...component,
          variantKey: variantKey, // توحيد اسم المفتاح
          part,
          color: String(color).trim(),
        });
      });

      if (variantsMap.size === 0) {
        variantsMap.set(1, [
          {
            variantKey: 1,
            part: "",
            color: "غير محدد",
          },
        ]);
      }

      return {
        ...model,
        variants: Array.from(variantsMap.entries()).map(
          ([variantKey, variantComponents]) => ({
            variantKey: Number(variantKey),
            components: variantComponents,
          })
        ),
      };
    });

    // ============================================================
    // 3. التحقق + حساب إجماليات الـ Variants
    // ============================================================

    for (const model of preparedModels) {
      for (const variant of model.variants) {
        let variantQty = 0;

        for (const size of model.sizes) {
          const series =
            Number(
              seriesCounts?.[model.id]?.[variant.variantKey]?.[size]
            ) || 0;

          if (series <= 0) {
            const componentNames = variant.components
              .map((component) => {
                const part = component.part;
                const color = component.color;
                return part ? `${part} - ${color}` : color;
              })
              .join(" + ");

            throw new Error(
              `عدد السريهات للموديل "${model.name}" - ${componentNames} - المقاس "${size}" يجب أن يكون أكبر من صفر.`
            );
          }

          variantQty += series;
        }

        grandTotalQty += variantQty;

        grandTotalAmount +=
          variantQty * (Number(model.approvedPrice) || 0);
      }
    }

    // ============================================================
    // 4. البحث عن أمر تشغيل موجود
    // ============================================================

    const {
      data: existingOrder,
      error: checkError,
    } = await supabase
      .from("production_orders")
      .select("id")
      .eq("collection_id", collectionInfo.id)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    let orderId;

    // ============================================================
    // 5. تحديث أو إنشاء أمر التشغيل
    // ============================================================

    if (existingOrder) {
      orderId = existingOrder.id;

      const { error: updateError } = await supabase
        .from("production_orders")
        .update({
          status: "pending",
          total_quantity: grandTotalQty,
          total_amount: grandTotalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        throw updateError;
      }

      const { error: deleteError } = await supabase
        .from("production_order_items")
        .delete()
        .eq("production_order_id", orderId);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      const { data: newOrder, error: insertError } =
        await supabase
          .from("production_orders")
          .insert({
            collection_id: collectionInfo.id,
            status: "pending",
            total_quantity: grandTotalQty,
            total_amount: grandTotalAmount,
            order_number: `PO-${collectionInfo.brandCode}-${new Date().getFullYear()}-${Math.floor(
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
    // 6. إنشاء Production Order Items
    // 💡 التعديل: دمج أجزاء الـ Variant في سطر واحد لتجنب تكرار الكميات
    // ============================================================

    for (const model of preparedModels) {
      for (const variant of model.variants) {

        let variantQty = 0;

        // حساب كمية الطقم (الـ Variant) بالكامل
        for (const size of model.sizes) {
          const series =
            Number(
              seriesCounts?.[model.id]?.[variant.variantKey]?.[size]
            ) || 0;
          variantQty += series;
        }

        // 💡 تجميع أسماء الأجزاء والألوان في نص واحد (مثال: تيشيرت + بنطلون / بينك + كحلي)
        const combinedParts = variant.components
          .map((c) => c.part)
          .filter(Boolean)
          .join(" + ") || "موديل كامل";

        const combinedColors = variant.components
          .map((c) => c.color)
          .filter(Boolean)
          .join(" + ") || "غير محدد";

        // تسجيل الـ Variant بالكامل كسطر واحد في الداتابيز
        const { data: itemData, error: itemError } = await supabase
          .from("production_order_items")
          .insert({
            production_order_id: orderId,
            model_id: model.real_id || model.id,
            variant_key: variant.variantKey,
            selling_price: Number(model.approvedPrice) || 0,
            total_quantity: variantQty, // 👈 الكمية هتتحط مرة واحدة بس للطقم
            part: combinedParts,        // 👈 مثال: سويت شيرت + ليجن
            color: combinedColors,      // 👈 مثال: بينك + كحلي
            size: null,
            quantity: null,
          })
          .select()
          .single();

        if (itemError) {
          throw itemError;
        }

        const itemId = itemData.id;

        // ======================================================
        // 7. حفظ المقاسات للـ Variant المدمج
        // ======================================================

        const sizesData = model.sizes.map((sizeName) => {
          const matchedSize = dbSizes.find(
            (dbSize) =>
              String(dbSize.name).trim().toLowerCase() ===
              String(sizeName).trim().toLowerCase()
          );

          if (!matchedSize) {
            throw new Error(
              `المقاس "${sizeName}" غير مسجل في جدول المقاسات.`
            );
          }

          const quantity =
            Number(
              seriesCounts?.[model.id]?.[variant.variantKey]?.[sizeName]
            ) || 0;

          return {
            production_order_item_id: itemId,
            size_id: matchedSize.id,
            quantity,
          };
        });

        const { error: sizesError } = await supabase
          .from("production_order_item_sizes")
          .insert(sizesData);

        if (sizesError) {
          throw sizesError;
        }
      }
    }

    // ============================================================
    // 8. System Log
    // ============================================================

    await addSystemLog({
      module: "customer_service",
      action_type: "CREATE",
      entity_type: "production_order",
      entity_id: orderId,
      title: "إصدار أمر تشغيل",
      description: `تم إصدار أمر تشغيل للكولكشن "${collectionInfo.collectionName}".`,
      details: {
        total_quantity: grandTotalQty,
        total_amount: grandTotalAmount,
      },
    });

    // ============================================================
    // 9. Return
    // ============================================================

    return {
      id: orderId,
      totalQuantity: grandTotalQty,
      totalAmount: grandTotalAmount,
    };
  } catch (error) {
    console.error("Error issuing order to planning:", error);
    throw error;
  }
};