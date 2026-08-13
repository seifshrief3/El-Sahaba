import { supabase } from "../../supabase";
import { addSystemLog } from "./systemLogService"; // 💡 تأكد من مسار ملف الـ Logs

export const handleGetModelsByCollectionId = async (collectionId) => {
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const handleUpdateModelAndGenerateTechPack = async (modelId, payload) => {
  console.log("Here is the Payload: ", payload);
  const { data, error } = await supabase
    .from("models")
    .update({
      name: payload.name,
      model_number: payload.model_number,
      customer_notes: payload.notes,
      image_url: payload.image_url,
      colors: payload.colors,
      description: JSON.stringify({
        fabrics: payload.fabrics,
        colors: payload.colors,
        sizes: payload.selectedSizes
      }),
      close_up_images: payload.close_up_images,
      tech_pack_status: "generating",
      updated_at: new Date().toISOString()
    })
    .eq("id", modelId)
    .select()
    .single();

  if (error) throw error;

  try {
    // 2. إرسال البيانات لـ n8n Webhook
    const n8nWebhookUrl = "https://n8n.youssef.im/webhook/7714f230-e254-4784-b599-9c4f6f0a410d";

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
        model_id: modelId,
        collection_id: payload.collection_id,
        brand_name: payload.brand_name,
        name: payload.name,
        image_url: payload.image_url,
        colors: payload.colors,
        close_up_images: payload.close_up_images,
        description: JSON.stringify({
          fabrics: payload.fabrics,
          sizes: payload.selectedSizes
        })
      })
    });

    if (!response.ok) {
      throw new Error("فشل الاتصال بـ n8n Webhook");
    }

    // 3. تحديث حالة الموديل إن الـ Tech Pack خلصت
    await supabase.from("models").update({ tech_pack_status: "created" }).eq("id", modelId);

    // 💡 تسجيل حدث طلب وإنشاء الـ Tech Pack
    await addSystemLog({
      module: "customer_service",
      action_type: "ACTION",
      entity_type: "model",
      entity_id: modelId,
      title: "توليد ملف فني (Tech Pack)",
      description: `تم تحديث بيانات الموديل "${payload.name}" وإرسال طلب توليد الـ Tech Pack بنجاح.`,
      details: { model_name: payload.name, brand: payload.brand_name }
    });

  } catch (err) {
    console.error("Error triggering n8n:", err);
    await supabase.from("models").update({ tech_pack_status: "error" }).eq("id", modelId);

    // 💡 تسجيل حدث فشل في توليد الـ Tech Pack
    await addSystemLog({
      module: "customer_service",
      action_type: "UPDATE",
      entity_type: "model",
      entity_id: modelId,
      title: "خطأ في توليد الملف الفني",
      description: `حدث خطأ أثناء محاولة توليد الـ Tech Pack للموديل "${payload.name}".`,
      details: { error_message: err.message }
    });

    throw err;
  }

  return data;
};

export const handleUpdateModelRelations = async (
  modelId,
  fabrics,
  selectedSizes
) => {
  try {
    console.log("========== UPDATE MODEL RELATIONS ==========");
    console.log("MODEL ID:", modelId);
    console.log("FABRICS:", fabrics);
    console.log("SELECTED SIZES:", selectedSizes);
    console.log("============================================");

    // ==========================================
    // 1. حذف العلاقات القديمة
    // ==========================================

    const { error: deleteSizesError } = await supabase
      .from("model_sizes")
      .delete()
      .eq("model_id", modelId);

    if (deleteSizesError) {
      console.error("❌ DELETE MODEL SIZES ERROR:", deleteSizesError);
      throw deleteSizesError;
    }

    const { error: deleteMaterialsError } = await supabase
      .from("model_materials")
      .delete()
      .eq("model_id", modelId);

    if (deleteMaterialsError) {
      console.error(
        "❌ DELETE MODEL MATERIALS ERROR:",
        deleteMaterialsError
      );

      throw deleteMaterialsError;
    }

    // ==========================================
    // 2. حفظ المقاسات
    // ==========================================

    if (selectedSizes && selectedSizes.length > 0) {
      for (const sizeName of selectedSizes) {
        if (!sizeName || !sizeName.trim()) continue;

        const cleanSize = sizeName.trim();

        // البحث عن المقاس
        const { data: sizeRecord, error: sizeSearchError } =
          await supabase
            .from("sizes")
            .select("id")
            .eq("name", cleanSize)
            .maybeSingle();

        if (sizeSearchError) {
          console.error("❌ SIZE SEARCH ERROR:", sizeSearchError);
          throw sizeSearchError;
        }

        let sizeId = sizeRecord?.id;

        // إنشاء المقاس لو مش موجود
        if (!sizeId) {
          const { data: newSize, error: createSizeError } =
            await supabase
              .from("sizes")
              .insert({
                name: cleanSize,
              })
              .select("id")
              .single();

          if (createSizeError) {
            console.error(
              "❌ CREATE SIZE ERROR:",
              createSizeError
            );

            throw createSizeError;
          }

          sizeId = newSize.id;
        }

        // إنشاء العلاقة
        const { error: relationError } = await supabase
          .from("model_sizes")
          .insert({
            model_id: modelId,
            size_id: sizeId,
          });

        if (relationError) {
          console.error(
            "❌ MODEL SIZE INSERT ERROR:",
            relationError
          );

          throw relationError;
        }
      }
    }

    // ==========================================
    // 3. حفظ الخامات
    // ==========================================

    if (fabrics && fabrics.length > 0) {
      for (const fabric of fabrics) {
        if (!fabric?.name || !fabric.name.trim()) {
          continue;
        }

        const cleanFabric = fabric.name.trim();

        console.log("================================");
        console.log("Processing Fabric:", fabric);
        console.log("Clean Fabric:", cleanFabric);

        // ------------------------------------------
        // البحث عن الخامة
        // ------------------------------------------

        const {
          data: materialRecord,
          error: materialSearchError,
        } = await supabase
          .from("materials")
          .select("id")
          .eq("name", cleanFabric)
          .maybeSingle();

        if (materialSearchError) {
          console.error(
            "❌ MATERIAL SEARCH ERROR:",
            materialSearchError
          );

          throw materialSearchError;
        }

        let materialId = materialRecord?.id;

        console.log("Existing MATERIAL ID:", materialId);

        // ------------------------------------------
        // إنشاء الخامة لو مش موجودة
        // ------------------------------------------

        if (!materialId) {
          const {
            data: newMaterial,
            error: createMaterialError,
          } = await supabase
            .from("materials")
            .insert({
              name: cleanFabric,
            })
            .select("id")
            .single();

          if (createMaterialError) {
            console.error(
              "❌ CREATE MATERIAL ERROR:",
              createMaterialError
            );

            throw createMaterialError;
          }

          materialId = newMaterial.id;

          console.log("Created MATERIAL ID:", materialId);
        }

        // ------------------------------------------
        // تحويل الوزن لرقم
        // ------------------------------------------

        let weight = null;

        if (fabric.weight) {
          const weightMatch = String(fabric.weight).match(
            /[\d.]+/
          );

          if (weightMatch) {
            weight = Number(weightMatch[0]);
          }
        }

        console.log("Weight:", weight);

        // ------------------------------------------
        // إنشاء العلاقة model_materials
        // ------------------------------------------

        console.log("MODEL ID:", modelId);
        console.log("MATERIAL ID:", materialId);

        const modelMaterialsQuery = supabase.from(
          "model_materials"
        );

        console.log(
          "model_materials query:",
          modelMaterialsQuery
        );

        if (!modelMaterialsQuery) {
          throw new Error(
            "supabase.from('model_materials') returned undefined"
          );
        }

        const {
          data: insertedRelation,
          error: relationError,
        } = await modelMaterialsQuery
          .insert({
            model_id: modelId,
            material_id: materialId,
            weight: weight,
            notes: null,
          })
          .select()
          .single();

        if (relationError) {
          console.error(
            "❌ MODEL MATERIAL INSERT ERROR:",
            relationError
          );

          throw relationError;
        }

        console.log(
          "✅ MODEL MATERIAL CREATED:",
          insertedRelation
        );
      }
    }

    // ==========================================
    // 4. تسجيل Log
    // ==========================================

    await addSystemLog({
      module: "customer_service",
      action_type: "UPDATE",
      entity_type: "model",
      entity_id: modelId,
      title: "تحديث روابط الموديل",
      description:
        "تم تحديث المقاسات والخامات المرتبطة بالموديل.",
      details: {
        sizes_count: selectedSizes?.length || 0,
        fabrics_count: fabrics?.length || 0,
      },
    });

    console.log(
      "✅ MODEL RELATIONS UPDATED SUCCESSFULLY"
    );
  } catch (error) {
    console.error(
      "❌ ERROR IN handleUpdateModelRelations:",
      error
    );

    throw error;
  }
};

export const fetchLatestTechPack = async (modelId) => {
  const { data, error } = await supabase
    .from('tech_packs')
    .select('content')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching tech pack:", error);
    return null;
  }

  return data ? data.content : null;
};

export const syncTechPackWithModels = async (modelId, techPackData) => {
  try {
    console.log("========== SYNC TECH PACK WITH MODEL ==========");
    console.log("MODEL ID:", modelId);
    console.log("TECH PACK DATA:", techPackData);

    // ==========================================
    // 1. استخراج الألوان والـ Variants
    // ==========================================

    const rawColors = Array.isArray(techPackData?.basic_info?.colors)
      ? techPackData.basic_info.colors
      : [];

    const newColors = rawColors
      .map((item) => {
        // لو الـ AI رجع String
        if (typeof item === "string") {
          return {
            part: "",
            color: item.trim(),
            variant: null,
          };
        }

        // لو الـ AI رجع Object
        return {
          part: item?.part || item?.part_name || item?.partName || "",
          color:
            item?.color ||
            item?.colors ||
            item?.colour ||
            item?.color_name ||
            "",
          variant:
            item?.variant !== undefined &&
              item?.variant !== null &&
              item?.variant !== ""
              ? Number(item.variant)
              : null,
        };
      })
      .filter((item) => item.color);

    console.log("NEW COLORS + VARIANTS:", newColors);

    // ==========================================
    // 2. استخراج المقاسات
    // ==========================================

    const sizesString =
      typeof techPackData?.basic_info?.size_range === "string"
        ? techPackData.basic_info.size_range
        : "";

    const newSizes = sizesString
      .split(/[،,-]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    console.log("NEW SIZES:", newSizes);

    // ==========================================
    // 3. استخراج الخامات
    // ==========================================

    const fabricsString =
      typeof techPackData?.basic_info?.main_fabric === "string"
        ? techPackData.basic_info.main_fabric
        : "";

    const newFabrics = fabricsString
      .split(/[،,و-]+/)
      .map((f) => ({
        name: f.trim(),
        weight: "",
      }))
      .filter((f) => f.name);

    console.log("NEW FABRICS:", newFabrics);

    // ==========================================
    // 4. تحديث الـ Models
    //    نحفظ الألوان + الـ Variants كما هي
    // ==========================================

    const { error: colorsUpdateError } = await supabase
      .from("models")
      .update({
        colors: newColors,
      })
      .eq("id", modelId);

    if (colorsUpdateError) {
      console.error(
        "❌ ERROR UPDATING MODEL COLORS:",
        colorsUpdateError
      );

      throw colorsUpdateError;
    }

    console.log("✅ MODEL COLORS UPDATED");

    // ==========================================
    // 5. تحديث المقاسات والخامات
    // ==========================================

    await handleUpdateModelRelations(
      modelId,
      newFabrics,
      newSizes
    );

    console.log("✅ MODEL RELATIONS UPDATED");

    // ==========================================
    // 6. تسجيل Log
    // ==========================================

    await addSystemLog({
      module: "customer_service",
      action_type: "UPDATE",
      entity_type: "model",
      entity_id: modelId,
      title: "مزامنة الملف الفني",
      description:
        "تمت مزامنة الألوان والـ Variants والمقاسات والخامات للموديل بناءً على أحدث Tech Pack تم توليده.",
      details: {
        colors_count: newColors.length,
        variants: [
          ...new Set(
            newColors
              .map((item) => item.variant)
              .filter(
                (variant) =>
                  variant !== null &&
                  variant !== undefined &&
                  Number.isFinite(Number(variant))
              )
          ),
        ],
        sizes_count: newSizes.length,
        fabrics_count: newFabrics.length,
      },
    });

    console.log(
      "✅ تم مزامنة تعديلات الـ Tech Pack مع بيانات الموديل بنجاح!"
    );

    return {
      success: true,
      colors: newColors,
      sizes: newSizes,
      fabrics: newFabrics,
    };
  } catch (err) {
    console.error(
      "❌ خطأ أثناء مزامنة Tech Pack:",
      err
    );

    throw err;
  }
};