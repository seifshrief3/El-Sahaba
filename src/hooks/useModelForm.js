import { useState, useEffect } from "react";
import { toast } from "sonner";
import { handleUpdateModelAndGenerateTechPack, handleUpdateModelRelations } from "../services/modelService";

export const useModelForm = (activeModel, onModelChange, brandName) => {
  // ==========================================
  // 1. States للبيانات الأساسية والصورة
  // ==========================================
  const [modelName, setModelName] = useState(activeModel?.name || "");
  const [notes, setNotes] = useState(activeModel?.customer_notes || "");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(activeModel?.image_url || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // States لصور التفاصيل
  const [closeUpFiles, setCloseUpFiles] = useState([]);
  const [closeUpPreviews, setCloseUpPreviews] = useState(activeModel?.close_up_images || []);

  useEffect(() => {
    setCloseUpFiles([]);
    setCloseUpPreviews(activeModel?.close_up_images || []);
  }, [activeModel]);

  // دوال التعامل مع صور التفاصيل
  const handleCloseUpChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setCloseUpFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setCloseUpPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeCloseUpImage = (index) => {
    // لو الصورة دي رابط من الداتابيز، هنسيب الفايلز زي ما هي ونشيل الرابط
    const isExistingUrl = typeof closeUpPreviews[index] === "string" && closeUpPreviews[index].startsWith("http");

    setCloseUpPreviews((prev) => prev.filter((_, i) => i !== index));

    if (!isExistingUrl) {
      // حساب الإندكس الحقيقي في مصفوفة الملفات الجديدة
      const existingUrlsCount = closeUpPreviews.filter(p => typeof p === 'string' && p.startsWith('http')).length;
      const fileIndex = index - existingUrlsCount;
      if (fileIndex >= 0) {
        setCloseUpFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    }
  };

  useEffect(() => {
    setModelName(activeModel?.name || "");
    setNotes(activeModel?.customer_notes || "");
    setImagePreview(activeModel?.image_url || null);
    setImageFile(null);
  }, [activeModel]);

  const sizesList = [
    "6 شهور", "9 شهور", "12 شهور", "18 شهور", "24 شهور", "2 سنوات",
    "3 سنوات", "4 سنوات", "5 سنوات", "6 سنوات", "7 سنوات", "8 سنوات",
    "10 سنوات", "12 سنة", "14 سنة", "16 سنة", "18 سنة", "20 سنة",
    "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
  ];

  // ==========================================
  // 2. إدارة الخامات وأوزانها
  // ==========================================
  const [fabrics, setFabrics] = useState([{ name: "", weight: "" }]);
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
  const [colors, setColors] = useState([""]);
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
  const [selectedSizes, setSelectedSizes] = useState([]);
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

    // فلترة الصور القديمة المرفوعة مسبقاً
    let finalCloseUpUrls = closeUpPreviews.filter(p => typeof p === 'string' && p.startsWith("http"));

    try {
      if (imageFile) {
        toast.info("جاري رفع الصورة الرئيسية...");
        finalImageUrl = await uploadToCloudinary(imageFile);
      }

      // 💡 رفع صور التفاصيل الجديدة (Close-ups)
      if (closeUpFiles.length > 0) {
        toast.info("جاري رفع صور التفاصيل...");
        const uploadedCloseUps = await Promise.all(
          closeUpFiles.map((file) => uploadToCloudinary(file))
        );
        // دمج الروابط القديمة مع الروابط الجديدة اللي لسه مرفوعة
        finalCloseUpUrls = [...finalCloseUpUrls, ...uploadedCloseUps];
      }

      toast.info("جاري حفظ بيانات الموديل وإرسالها للذكاء الاصطناعي 🤖...");

      const payload = {
        name: modelName,
        notes: notes,
        image_url: finalImageUrl,
        close_up_images: finalCloseUpUrls, // 💡 إضافة صور التفاصيل للـ Payload
        fabrics: fabrics.filter(f => f.name !== ""),
        colors: colors.filter(c => c !== ""),
        selectedSizes: selectedSizes,
        brand_name: brandName
      };

      // 1. الدالة دي هتحفظ في الداتابيز وكمان هتبعت الـ Request لـ n8n
      await handleUpdateModelAndGenerateTechPack(activeModel.id, payload);

      toast.info("جاري تحديث سجلات المقاسات والخامات...");
      await handleUpdateModelRelations(activeModel.id, payload.fabrics, payload.selectedSizes);

      // تحديث الواجهة محلياً
      onModelChange("tech_pack_status", "created");
      onModelChange("image_url", finalImageUrl);
      onModelChange("close_up_images", finalCloseUpUrls); // تحديث الصور محلياً
      onModelChange("name", modelName);
      onModelChange("hasError", false);

      // تفريغ الفايلات بعد الرفع الناجح
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
    // 💡 تصدير متغيرات ودوال صور التفاصيل عشان الواجهة تقرأها
    closeUpPreviews,
    handleCloseUpChange,
    removeCloseUpImage
  };
};