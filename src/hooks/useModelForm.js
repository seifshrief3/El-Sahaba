import { useState, useEffect } from "react";
import { toast } from "sonner";
import { handleUpdateModelAndGenerateTechPack, handleUpdateModelRelations } from "../services/modelService";

export const useModelForm = (activeModel, onModelChange, brandName) => {
  // ==========================================
  // 1. States للبيانات الأساسية والصورة
  // ==========================================
  console.log(activeModel)
  const [modelName, setModelName] = useState(activeModel?.name || "");
  const [notes, setNotes] = useState(activeModel?.customer_notes || "");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(activeModel?.image_url || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // States لصور التفاصيل
  const [closeUpFiles, setCloseUpFiles] = useState([]);
  const [closeUpPreviews, setCloseUpPreviews] = useState(activeModel?.close_up_images || []);

  // States للبيانات الفرعية
  const [fabrics, setFabrics] = useState([{ name: "", weight: "" }]);
  const [colors, setColors] = useState([""]);
  const [selectedSizes, setSelectedSizes] = useState([]);

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
    setColors(activeModel?.colors?.length > 0 ? activeModel.colors : [""]);

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
  const addColor = () => setColors([...colors, ""]);
  const updateColor = (index, value) => {
    const updatedColors = [...colors];
    updatedColors[index] = value;
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
        colors: colors.filter(c => c !== ""),
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
      onModelChange("description", JSON.stringify({ fabrics: payload.fabrics, colors: payload.colors }));
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
    removeCloseUpImage
  };
};