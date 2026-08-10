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

export const handleUpdateModelRelations = async (modelId, fabrics, selectedSizes) => {
  // 1. تنظيف العلاقات القديمة 
  await supabase.from('model_sizes').delete().eq('model_id', modelId);
  await supabase.from('model_materials').delete().eq('model_id', modelId);

  // 2. معالجة وحفظ المقاسات
  if (selectedSizes && selectedSizes.length > 0) {
    for (const sizeName of selectedSizes) {
      let cleanSize = sizeName.trim(); // 👈 تأمين
      let { data: sizeRecord } = await supabase.from('sizes').select('id').eq('name', cleanSize).single();
      let sizeId = sizeRecord ? sizeRecord.id : (await supabase.from('sizes').insert({ name: cleanSize }).select().single()).data.id;
      await supabase.from('model_sizes').insert({ model_id: modelId, size_id: sizeId });
    }
  }

  // 3. معالجة وحفظ الخامات
  if (fabrics && fabrics.length > 0) {
    for (const fabric of fabrics) {
      if (!fabric.name || fabric.name.trim() === "") continue;

      let cleanFabric = fabric.name.trim(); // 👈 تأمين ضد المسافات
      let { data: materialRecord } = await supabase.from('materials').select('id').eq('name', cleanFabric).single();
      let materialId = materialRecord ? materialRecord.id : (await supabase.from('materials').insert({ name: cleanFabric }).select().single()).data.id;

      await supabase.from('model_materials').insert({
        model_id: modelId,
        material_id: materialId,
        weight: fabric.weight ? fabric.weight.trim() : null,
        notes: null
      });
    }
  }

  await addSystemLog({
    module: "customer_service",
    action_type: "UPDATE",
    entity_type: "model",
    entity_id: modelId,
    title: "تحديث روابط الموديل",
    description: `تم تحديث المقاسات والخامات المرتبطة بالموديل.`,
    details: { sizes_count: selectedSizes?.length || 0, fabrics_count: fabrics?.length || 0 }
  });
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
    // 1. استخراج الألوان
    const newColors = Array.isArray(techPackData?.basic_info?.colors)
      ? techPackData.basic_info.colors
      : [];

    // 2. استخراج المقاسات وتفكيكها لمصفوفة
    const sizesString = typeof techPackData?.basic_info?.size_range === "string"
      ? techPackData.basic_info.size_range
      : "";
    const newSizes = sizesString.split(/[،,-]+/).map(s => s.trim()).filter(Boolean);

    // 3. استخراج الخامات وتفكيكها
    const fabricsString = typeof techPackData?.basic_info?.main_fabric === "string"
      ? techPackData.basic_info.main_fabric
      : "";
    const newFabrics = fabricsString.split(/[،,و-]+/).map(f => ({ name: f.trim(), weight: "" })).filter(f => f.name);

    // 4. تحديث الألوان في جدول models الأساسي
    await supabase.from("models").update({ colors: newColors }).eq("id", modelId);

    // 5. استدعاء الدالة عشان تمسح المقاسات/الخامات القديمة وتحط الجديدة
    await handleUpdateModelRelations(modelId, newFabrics, newSizes);

    // 💡 تسجيل مزامنة الموديل مع بيانات الملف الفني
    await addSystemLog({
      module: "customer_service",
      action_type: "UPDATE",
      entity_type: "model",
      entity_id: modelId,
      title: "مزامنة الملف الفني",
      description: `تمت مزامنة الألوان، المقاسات، والخامات للموديل بناءً على أحدث Tech Pack تم توليده.`,
    });

    console.log("تم مزامنة التعديلات مع جداول قواعد البيانات بنجاح!");
  } catch (err) {
    console.error("خطأ أثناء المزامنة:", err);
  }
};