import { useState, useEffect } from "react";
import { toast } from "sonner";
import { handleUpdateModelAndGenerateTechPack, handleUpdateModelRelations } from "../services/modelService";
import { supabase } from "../../supabase";

export const useModelForm = (activeModel, onModelChange, brandName) => {
  // ==========================================
  // 1. States للبيانات الأساسية والصورة
  // ==========================================
  const [modelName, setModelName] = useState(activeModel?.name || "");
  const [notes, setNotes] = useState(activeModel?.customer_notes || "");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(activeModel?.image_url || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // States لصور التفاصيل
  const [closeUpFiles, setCloseUpFiles] = useState([]);
  const [closeUpPreviews, setCloseUpPreviews] = useState(activeModel?.close_up_images || []);

  // States للبيانات الفرعية
  const [fabrics, setFabrics] = useState([{ name: "", weight: "" }]);
  const [colors, setColors] = useState([
    {
      variant: 1,
      part: "",
      color: ""
    }
  ]); const [selectedSizes, setSelectedSizes] = useState([]);

  const sizesList = [
    "6 شهور", "9 شهور", "12 شهور", "18 شهور", "24 شهور", "2 سنوات",
    "3 سنوات", "4 سنوات", "5 سنوات", "6 سنوات", "7 سنوات", "8 سنوات",
    "10 سنوات", "12 سنة", "14 سنة", "16 سنة", "18 سنة", "20 سنة",
    "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
  ];

  // 💡 أهم تعديل: فك شفرة الداتا اللي جاية من الداتابيز لما نغير الموديل
  useEffect(() => {
    setModelName(activeModel?.name || "");
    setNotes(activeModel?.customer_notes || "");
    setImagePreview(activeModel?.image_url || null);
    setImageFile(null);
    setCloseUpFiles([]);
    setCloseUpPreviews(activeModel?.close_up_images || []);

    // 1. الألوان
    let parsedColors = [
      {
        variant: 1,
        part: "",
        color: ""
      }
    ];
    if (activeModel?.colors?.length > 0) {
      parsedColors = activeModel.colors.map((item) => {
        // دعم الداتا القديمة لو كانت ["أبيض", "أسود"]
        if (typeof item === "string") {
          return {
            variant: 1,
            part: "",
            color: item,
          };
        }

        return {
          variant: Number(item?.variant) || 1,
          part: item?.part || "",
          color: item?.color || "",
        };
      });
    }

    setColors(parsedColors);
    // 2. الخامات والمقاسات (مستخبية جوه الـ description)
    // 2. الخامات والمقاسات (مستخبية جوه الـ description)
    let parsedFabrics = [{ name: "", weight: "" }];
    let parsedSizesFromDesc = [];

    if (activeModel?.description) {
      try {
        const descData = JSON.parse(activeModel.description);

        // 💡 1. معالجة الخامات (حماية ضد غباء الـ AI)
        if (descData.fabrics && descData.fabrics.length > 0) {
          parsedFabrics = descData.fabrics.map(fabric => {
            // لو الـ AI رجعها نص مباشر بدل Object
            if (typeof fabric === 'string') {
              return { name: fabric, weight: "" };
            }
            // لو رجعها Object نضمن إن القيم مش undefined
            return {
              name: fabric.name || "",
              weight: fabric.weight || ""
            };
          });
        }

        // 💡 2. معالجة المقاسات (توحيد كلمة سنين لـ سنوات)
        if (descData.sizes && descData.sizes.length > 0) {
          parsedSizesFromDesc = descData.sizes.map(size => {
            // لو الـ AI كتب "سنين" نبدلها بـ "سنوات" عشان تطابق الزراير
            if (typeof size === 'string') {
              return size.replace("سنين", "سنوات");
            }
            return size;
          });
        }

      } catch (e) {
        console.error("تعذر فك شفرة البيانات من الـ description", e);
      }
    } else if (activeModel?.fabrics?.length > 0) {
      parsedFabrics = activeModel.fabrics;
    }

    setFabrics(parsedFabrics);

    // 3. دمج أو اختيار المقاسات الصحيحة
    let finalParsedSizes = [];

    // الأولوية للمقاسات اللي جاية من הـ description (زي ما ظاهر في الصورة)
    if (parsedSizesFromDesc.length > 0) {
      finalParsedSizes = parsedSizesFromDesc;
    }
    // بعدين نجرب العلاقات (model_sizes)
    else if (activeModel?.model_sizes && activeModel.model_sizes.length > 0) {
      finalParsedSizes = activeModel.model_sizes.map(item => item.sizes?.name).filter(Boolean);
    }
    // بعدين نجرب المصفوفات العادية
    else if (activeModel?.sizes?.length > 0) {
      finalParsedSizes = activeModel.sizes;
    } else if (activeModel?.selectedSizes?.length > 0) {
      finalParsedSizes = activeModel.selectedSizes;
    }

    setSelectedSizes(finalParsedSizes);

  }, [activeModel]);

  // ==========================================
  // دوال التعامل مع صور التفاصيل
  // ==========================================
  const handleCloseUpChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setCloseUpFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setCloseUpPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeCloseUpImage = (index) => {
    const isExistingUrl = typeof closeUpPreviews[index] === "string" && closeUpPreviews[index].startsWith("http");

    setCloseUpPreviews((prev) => prev.filter((_, i) => i !== index));

    if (!isExistingUrl) {
      const existingUrlsCount = closeUpPreviews.filter(p => typeof p === 'string' && p.startsWith('http')).length;
      const fileIndex = index - existingUrlsCount;
      if (fileIndex >= 0) {
        setCloseUpFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    }
  };

  // ==========================================
  // 2. إدارة الخامات وأوزانها
  // ==========================================
  const addFabric = () => setFabrics([...fabrics, { name: "", weight: "" }]);
  const updateFabric = (index, field, value) => {
    const updatedFabrics = [...fabrics];
    updatedFabrics[index][field] = value;
    setFabrics(updatedFabrics);
  };
  const removeFabric = (index) => {
    setFabrics(fabrics.filter((_, i) => i !== index));
  };

  // ==========================================
  // 3. إدارة الألوان
  // ==========================================
  const addColor = () => {
    const lastVariant =
      colors.length > 0
        ? Number(colors[colors.length - 1]?.variant) || 1
        : 1;

    setColors([
      ...colors,
      {
        variant: lastVariant,
        part: "",
        color: "",
      },
    ]);
  };

  const updateColor = (index, field, value) => {
    const updatedColors = [...colors];

    updatedColors[index] = {
      ...updatedColors[index],
      [field]: value,
    };

    setColors(updatedColors);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // ==========================================
  // 4. إدارة المقاسات
  // ==========================================
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // ==========================================
  // 5. دوال معالجة الصورة والتواصل مع السيرفر
  // ==========================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmitAndGenerate = async () => {
    if (!modelName) {
      toast.error("برجاء إدخال اسم الموديل أولاً");
      return;
    }

    setIsGenerating(true);
    let finalImageUrl = activeModel.image_url;
    let finalCloseUpUrls = closeUpPreviews.filter(p => typeof p === 'string' && p.startsWith("http"));

    try {
      if (imageFile) {
        toast.info("جاري رفع الصورة الرئيسية...");
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      if (closeUpFiles.length > 0) {
        toast.info("جاري رفع صور التفاصيل...");
        const uploadedCloseUps = await Promise.all(
          closeUpFiles.map((file) => uploadToCloudinary(file))
        );
        finalCloseUpUrls = [...finalCloseUpUrls, ...uploadedCloseUps];
      }

      toast.info("جاري حفظ بيانات الموديل وإرسالها للذكاء الاصطناعي 🤖...");

      const payload = {
        name: modelName,
        notes: notes,
        image_url: finalImageUrl,
        close_up_images: finalCloseUpUrls,
        fabrics: fabrics.filter(f => f.name !== ""),
        colors: colors.filter(
          (item) => item.part?.trim() || item.color?.trim()
        ),
        selectedSizes: selectedSizes,
        brand_name: brandName,
        collection_id: activeModel.collection_id
      };

      await handleUpdateModelAndGenerateTechPack(activeModel.id, payload);

      toast.info("جاري تحديث سجلات المقاسات والخامات...");
      await handleUpdateModelRelations(activeModel.id, payload.fabrics, payload.selectedSizes);

      // 💡 التحديث المحلي للواجهة الأم عشان الداتا تفضل محفوظة في الـ Tabs
      onModelChange("tech_pack_status", "created");
      onModelChange("image_url", finalImageUrl);
      onModelChange("close_up_images", finalCloseUpUrls);
      onModelChange("name", modelName);
      onModelChange("customer_notes", notes);
      onModelChange("fabrics", payload.fabrics);
      onModelChange("colors", payload.colors);
      onModelChange("sizes", payload.selectedSizes);
      // تحديث الـ description محلياً كمان كاحتياطي
      onModelChange("description", JSON.stringify({ fabrics: payload.fabrics, colors: payload.colors, sizes: payload.selectedSizes }));
      onModelChange("hasError", false);

      setCloseUpFiles([]);
      setCloseUpPreviews(finalCloseUpUrls);

      toast.success("تم الحفظ وإرسال الطلب بنجاح! جاري إنشاء الورقة الفنية 🎉");

    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الإنشاء أو الاتصال بالخادم");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateTechPack = async () => {
    try {
      setIsGenerating(true);

      // 1. البيانات الحالية التي عدلها المستخدم في الفورم
      const payload = {
        name: modelName,
        notes: notes,
        image_url: activeModel.image_url,
        close_up_images: closeUpPreviews.filter(
          (p) => typeof p === "string" && p.startsWith("http")
        ),
        fabrics: fabrics.filter((f) => f.name?.trim()),
        colors: colors.filter(
          (item) => item.part?.trim() || item.color?.trim()
        ),
        selectedSizes,
      };

      // 2. حفظ التعديلات في جدول models
      const { data: updatedModel, error: modelError } = await supabase
        .from("models")
        .update({
          name: payload.name,
          customer_notes: payload.notes,
          image_url: payload.image_url,
          close_up_images: payload.close_up_images,
          colors: payload.colors,

          description: JSON.stringify({
            fabrics: payload.fabrics,
            colors: payload.colors,
            sizes: payload.selectedSizes,
          }),

          updated_at: new Date().toISOString(),
        })
        .eq("id", activeModel.id)
        .select()
        .single();

      if (modelError) throw modelError;

      // 3. تحديث علاقات المقاسات والخامات
      await handleUpdateModelRelations(
        activeModel.id,
        payload.fabrics,
        payload.selectedSizes
      );

      // 4. هات آخر Tech Pack موجود
      const { data: latestTechPack, error: techPackError } = await supabase
        .from("tech_packs")
        .select("content")
        .eq("model_id", activeModel.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (techPackError) throw techPackError;

      // 5. احتفظ بكل بيانات الـ Tech Pack القديمة
      const oldContent = latestTechPack?.content || {};

      // 6. اعمل نسخة جديدة من الـ Tech Pack
      // ونغيّر فقط البيانات التي عدّلها المستخدم
      const techPackContent = {
        ...oldContent,

        basic_info: {
          ...(oldContent.basic_info || {}),

          product_name: updatedModel.name,
          brand: brandName,
          main_fabric: payload.fabrics,
          size_range: payload.selectedSizes.join(" - "),
          colors: payload.colors,
        },

        // مهم جدًا:
        // لا نلمس technical_description
        technical_description: {
          ...(oldContent.technical_description || {}),
        },
      };

      // 5. معرفة آخر Version
      const { data: oldTechPack, error: versionError } = await supabase
        .from("tech_packs")
        .select("version")
        .eq("model_id", activeModel.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionError) throw versionError;

      const newVersion = (oldTechPack?.version || 0) + 1;

      // 6. إنشاء نسخة Tech Pack جديدة
      const { error: insertError } = await supabase
        .from("tech_packs")
        .insert({
          model_id: activeModel.id,
          content: techPackContent,
          status: "generated",
          version: newVersion,
        });

      if (insertError) throw insertError;

      // 7. تحديث الـ UI المحلي
      onModelChange("colors", payload.colors);
      onModelChange("fabrics", payload.fabrics);
      onModelChange("sizes", payload.selectedSizes);
      onModelChange("description", JSON.stringify({
        fabrics: payload.fabrics,
        colors: payload.colors,
        sizes: payload.selectedSizes,
      }));
      onModelChange("tech_pack_status", "created");
      onModelChange("updated_at", new Date().toISOString());

      toast.success("تم تحديث الموديل والـ Tech Pack بنجاح ✅");

    } catch (error) {
      console.error("UPDATE TECH PACK ERROR:", error);
      toast.error("حدث خطأ أثناء تحديث الموديل والـ Tech Pack");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    modelName, setModelName,
    notes, setNotes,
    imageFile, imagePreview,
    isGenerating,
    sizesList,
    fabrics, addFabric, updateFabric, removeFabric,
    colors, addColor, updateColor, removeColor,
    selectedSizes, toggleSize,
    handleImageChange,
    handleSubmitAndGenerate,
    closeUpPreviews,
    handleCloseUpChange,
    removeCloseUpImage,
    handleUpdateTechPack
  };
};
