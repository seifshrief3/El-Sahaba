import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  handleUpdateModelAndGenerateTechPack,
  handleUpdateModelRelations,
} from "../services/modelService";
import { supabase } from "../../supabase";

export const useModelForm = (activeModel, onModelChange, brandName) => {
  // ==========================================
  // 1. States
  // ==========================================

  const [modelName, setModelName] = useState(activeModel?.name || "");
  const [notes, setNotes] = useState(activeModel?.customer_notes || "");

  // Main image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    activeModel?.image_url || null
  );

  const [isGenerating, setIsGenerating] = useState(false);

  // Close-up images
  const [closeUpFiles, setCloseUpFiles] = useState([]);
  const [closeUpPreviews, setCloseUpPreviews] = useState(
    activeModel?.close_up_images || []
  );

  // ==========================================
  // 2. Form data
  // ==========================================

  const [fabrics, setFabrics] = useState([
    {
      name: "",
      weight: "",
    },
  ]);

  const [colors, setColors] = useState([
    {
      variant: 1,
      part: "",
      color: "",
    },
  ]);

  const [selectedSizes, setSelectedSizes] = useState([]);

  const sizesList = [
    "6 شهور",
    "9 شهور",
    "12 شهور",
    "18 شهور",
    "24 شهور",
    "2 سنوات",
    "3 سنوات",
    "4 سنوات",
    "5 سنوات",
    "6 سنوات",
    "7 سنوات",
    "8 سنوات",
    "10 سنوات",
    "12 سنة",
    "14 سنة",
    "16 سنة",
    "18 سنة",
    "20 سنة",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
  ];

  // ==========================================
  // 3. Load active model
  // ==========================================

  useEffect(() => {
    setModelName(activeModel?.name || "");
    setNotes(activeModel?.customer_notes || "");

    // Main image
    setImagePreview(activeModel?.image_url || null);
    setImageFile(null);

    // Close-up images
    setCloseUpFiles([]);
    setCloseUpPreviews(activeModel?.close_up_images || []);

    // ==========================================
    // Colors
    // ==========================================

    let parsedColors = [
      {
        variant: 1,
        part: "",
        color: "",
      },
    ];

    if (activeModel?.colors?.length > 0) {
      parsedColors = activeModel.colors.map((item) => {
        // Old format:
        // ["أبيض", "أسود"]

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

    // ==========================================
    // Fabrics + Sizes
    // ==========================================

    let parsedFabrics = [
      {
        name: "",
        weight: "",
      },
    ];

    let parsedSizesFromDesc = [];

    if (activeModel?.description) {
      try {
        const descData = JSON.parse(activeModel.description);

        // Fabrics
        if (descData?.fabrics?.length > 0) {
          parsedFabrics = descData.fabrics.map((fabric) => {
            if (typeof fabric === "string") {
              return {
                name: fabric,
                weight: "",
              };
            }

            return {
              name: fabric?.name || "",
              weight: fabric?.weight || "",
            };
          });
        }

        // Sizes
        if (descData?.sizes?.length > 0) {
          parsedSizesFromDesc = descData.sizes.map((size) => {
            if (typeof size === "string") {
              return size.replace("سنين", "سنوات");
            }

            return size;
          });
        }
      } catch (error) {
        console.error(
          "تعذر فك شفرة البيانات من الـ description",
          error
        );
      }
    } else if (activeModel?.fabrics?.length > 0) {
      parsedFabrics = activeModel.fabrics;
    }

    setFabrics(parsedFabrics);

    // ==========================================
    // Sizes priority
    // ==========================================

    let finalParsedSizes = [];

    // 1. description
    if (parsedSizesFromDesc.length > 0) {
      finalParsedSizes = parsedSizesFromDesc;
    }

    // 2. model_sizes relation
    else if (
      activeModel?.model_sizes &&
      activeModel.model_sizes.length > 0
    ) {
      finalParsedSizes = activeModel.model_sizes
        .map((item) => item?.sizes?.name)
        .filter(Boolean);
    }

    // 3. sizes
    else if (activeModel?.sizes?.length > 0) {
      finalParsedSizes = activeModel.sizes;
    }

    // 4. selectedSizes
    else if (activeModel?.selectedSizes?.length > 0) {
      finalParsedSizes = activeModel.selectedSizes;
    }

    setSelectedSizes(finalParsedSizes);
  }, [activeModel]);

  // ==========================================
  // 4. Close-up images
  // ==========================================

  const handleCloseUpChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const remainingSlots = 8 - closeUpPreviews.length;

    if (remainingSlots <= 0) {
      toast.error("يمكنك رفع 8 صور تفاصيل كحد أقصى");
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setCloseUpFiles((prev) => [
      ...prev,
      ...selectedFiles,
    ]);

    setCloseUpPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    // مهم جدًا:
    // يسمح باختيار نفس الصورة مرة أخرى
    e.target.value = "";
  };

  const removeCloseUpImage = (index) => {
    const preview = closeUpPreviews[index];

    if (!preview) return;

    // ==========================================
    // Existing Cloudinary URL
    // ==========================================

    if (
      typeof preview === "string" &&
      preview.startsWith("http")
    ) {
      setCloseUpPreviews((prev) =>
        prev.filter((_, i) => i !== index)
      );

      return;
    }

    // ==========================================
    // New local image
    // ==========================================

    // نحدد كل الصور المحلية قبل الصورة الحالية
    const localImagesBeforeCurrent =
      closeUpPreviews
        .slice(0, index)
        .filter(
          (item) =>
            typeof item === "string" &&
            !item.startsWith("http")
        ).length;

    const fileIndex = localImagesBeforeCurrent;

    setCloseUpFiles((prev) =>
      prev.filter((_, i) => i !== fileIndex)
    );

    // إلغاء الـ object URL
    try {
      URL.revokeObjectURL(preview);
    } catch (error) {
      console.warn(
        "Could not revoke object URL:",
        error
      );
    }

    setCloseUpPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==========================================
  // 5. Fabrics
  // ==========================================

  const addFabric = () => {
    setFabrics((prev) => [
      ...prev,
      {
        name: "",
        weight: "",
      },
    ]);
  };

  const updateFabric = (index, field, value) => {
    setFabrics((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const removeFabric = (index) => {
    setFabrics((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==========================================
  // 6. Colors
  // ==========================================

  const addColor = () => {
    const lastVariant =
      colors.length > 0
        ? Number(colors[colors.length - 1]?.variant) || 1
        : 1;

    setColors((prev) => [
      ...prev,
      {
        variant: lastVariant,
        part: "",
        color: "",
      },
    ]);
  };

  const updateColor = (index, field, value) => {
    setColors((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const removeColor = (index) => {
    setColors((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==========================================
  // 7. Sizes
  // ==========================================

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.filter((s) => s !== size);
      }

      return [...prev, size];
    });
  };

  // ==========================================
  // 8. Main image
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // تنظيف الـ preview القديم لو كان local
    if (
      imagePreview &&
      typeof imagePreview === "string" &&
      imagePreview.startsWith("blob:")
    ) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch { }
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // يسمح باختيار نفس الصورة مرة أخرى
    e.target.value = "";
  };

  // ==========================================
  // 9. Cloudinary upload
  // ==========================================

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_UPLOAD_PRESET
    );

    const cloudName =
      import.meta.env.VITE_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cloudinary upload failed: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data?.secure_url) {
      throw new Error(
        "Cloudinary did not return secure_url"
      );
    }

    return data.secure_url;
  };

  // ==========================================
  // 10. Upload current images
  // ==========================================

  const uploadCurrentImages = async () => {
    let finalImageUrl =
      activeModel?.image_url || null;

    // ==========================================
    // Main image
    // ==========================================

    if (imageFile) {
      finalImageUrl = await uploadToCloudinary(
        imageFile
      );
    }

    // ==========================================
    // Close-up images
    // ==========================================

    const existingCloseUpUrls =
      closeUpPreviews.filter(
        (preview) =>
          typeof preview === "string" &&
          preview.startsWith("http")
      );

    let uploadedCloseUpUrls = [];

    if (closeUpFiles.length > 0) {
      uploadedCloseUpUrls =
        await Promise.all(
          closeUpFiles.map((file) =>
            uploadToCloudinary(file)
          )
        );
    }

    const finalCloseUpUrls = [
      ...existingCloseUpUrls,
      ...uploadedCloseUpUrls,
    ];

    return {
      finalImageUrl,
      finalCloseUpUrls,
    };
  };

  // ==========================================
  // 11. Create / Generate Tech Pack
  // ==========================================

  const handleSubmitAndGenerate = async () => {
    if (!modelName?.trim()) {
      toast.error("برجاء إدخال اسم الموديل أولاً");
      return;
    }

    setIsGenerating(true);

    try {
      toast.info("جاري تجهيز الصور...");

      const {
        finalImageUrl,
        finalCloseUpUrls,
      } = await uploadCurrentImages();

      const payload = {
        name: modelName.trim(),
        notes: notes || "",

        image_url: finalImageUrl || "",

        close_up_images: Array.isArray(finalCloseUpUrls)
          ? finalCloseUpUrls.filter(Boolean)
          : [],

        fabrics: Array.isArray(fabrics)
          ? fabrics.filter((f) => f?.name?.trim())
          : [],

        colors: Array.isArray(colors)
          ? colors.filter(
            (item) =>
              item?.part?.trim() ||
              item?.color?.trim()
          )
          : [],

        selectedSizes: Array.isArray(selectedSizes)
          ? selectedSizes.filter(Boolean)
          : [],

        brand_name: brandName || "",

        collection_id:
          activeModel?.collection_id,
      };

      toast.info(
        "جاري حفظ بيانات الموديل وإرسالها للذكاء الاصطناعي 🤖..."
      );

      await handleUpdateModelAndGenerateTechPack(
        activeModel.id,
        payload
      );

      await handleUpdateModelRelations(
        activeModel.id,
        payload.fabrics,
        payload.selectedSizes
      );

      // ==========================================
      // UPDATE LOCAL STATE
      // ==========================================

      onModelChange(
        "tech_pack_status",
        "created"
      );

      onModelChange(
        "image_url",
        finalImageUrl
      );

      onModelChange(
        "close_up_images",
        payload.close_up_images
      );

      onModelChange(
        "name",
        payload.name
      );

      onModelChange(
        "customer_notes",
        payload.notes
      );

      onModelChange(
        "fabrics",
        payload.fabrics
      );

      onModelChange(
        "colors",
        payload.colors
      );

      onModelChange(
        "sizes",
        payload.selectedSizes
      );

      onModelChange(
        "description",
        JSON.stringify({
          fabrics: payload.fabrics,
          colors: payload.colors,
          sizes: payload.selectedSizes,
        })
      );

      onModelChange(
        "hasError",
        false
      );

      // ==========================================
      // RESET UPLOADED FILES
      // ==========================================

      setImageFile(null);
      setCloseUpFiles([]);

      setImagePreview(
        finalImageUrl || ""
      );

      setCloseUpPreviews(
        payload.close_up_images
      );

      toast.success(
        "تم الحفظ وإرسال الطلب بنجاح! 🎉"
      );
    } catch (error) {
      console.error(
        "CREATE TECH PACK ERROR:",
        error
      );

      toast.error(
        "حدث خطأ أثناء الإنشاء أو رفع الصور"
      );
    } finally {
      setIsGenerating(false);
    }
  };
  // ==========================================
  // 12. UPDATE TECH PACK
  // ==========================================

  const handleUpdateTechPack = async () => {
    if (!modelName?.trim()) {
      toast.error(
        "برجاء إدخال اسم الموديل أولاً"
      );
      return;
    }

    setIsGenerating(true);

    try {
      // ==========================================
      // STEP 1
      // Upload only new images
      // ==========================================

      toast.info(
        "جاري تجهيز الصور والتعديلات..."
      );

      const {
        finalImageUrl,
        finalCloseUpUrls,
      } = await uploadCurrentImages();

      // ==========================================
      // STEP 2
      // Prepare payload
      // ==========================================

      const payload = {
        name: modelName,
        notes,

        image_url: finalImageUrl,

        close_up_images:
          finalCloseUpUrls,

        fabrics: fabrics.filter(
          (f) => f.name?.trim()
        ),

        colors: colors.filter(
          (item) =>
            item.part?.trim() ||
            item.color?.trim()
        ),

        selectedSizes,
      };

      // ==========================================
      // STEP 3
      // Update model
      // ==========================================

      const { data: updatedModel, error: modelError } =
        await supabase
          .from("models")
          .update({
            name: payload.name,

            customer_notes:
              payload.notes,

            image_url:
              payload.image_url,

            close_up_images:
              payload.close_up_images,

            colors:
              payload.colors,

            description:
              JSON.stringify({
                fabrics:
                  payload.fabrics,

                colors:
                  payload.colors,

                sizes:
                  payload.selectedSizes,
              }),

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", activeModel.id)
          .select()
          .single();

      if (modelError) {
        throw modelError;
      }

      // ==========================================
      // STEP 4
      // Fetch latest Tech Pack + relations
      // IN PARALLEL
      // ==========================================

      const [
        _relationsResult,
        latestTechPackResult,
      ] = await Promise.all([
        handleUpdateModelRelations(
          activeModel.id,
          payload.fabrics,
          payload.selectedSizes
        ),

        supabase
          .from("tech_packs")
          .select("content, version")
          .eq(
            "model_id",
            activeModel.id
          )
          .order("version", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),
      ]);

      const {
        data: latestTechPack,
        error: techPackError,
      } = latestTechPackResult;

      if (techPackError) {
        throw techPackError;
      }

      // ==========================================
      // STEP 5
      // Preserve old Tech Pack data
      // ==========================================

      const oldContent =
        latestTechPack?.content || {};

      // ==========================================
      // STEP 6
      // Create new Tech Pack content
      // ==========================================

      const techPackContent = {
        ...oldContent,

        basic_info: {
          ...(oldContent.basic_info || {}),

          product_name:
            updatedModel.name,

          brand:
            brandName,

          main_fabric:
            payload.fabrics,

          size_range:
            payload.selectedSizes.join(
              " - "
            ),

          colors:
            payload.colors,

          // NEW MAIN IMAGE
          image_url:
            payload.image_url,
        },

        technical_description: {
          ...(oldContent.technical_description ||
            {}),

          // NEW CLOSE-UP IMAGES
          close_up_images:
            payload.close_up_images,
        },
      };

      // ==========================================
      // STEP 7
      // Insert new version
      // ==========================================

      const newVersion =
        (latestTechPack?.version || 0) + 1;

      const {
        error: insertError,
      } = await supabase
        .from("tech_packs")
        .insert({
          model_id:
            activeModel.id,

          content:
            techPackContent,

          status:
            "generated",

          version:
            newVersion,
        });

      if (insertError) {
        throw insertError;
      }

      // ==========================================
      // STEP 8
      // Update local UI
      // ==========================================

      onModelChange(
        "name",
        payload.name
      );

      onModelChange(
        "customer_notes",
        payload.notes
      );

      onModelChange(
        "image_url",
        payload.image_url
      );

      onModelChange(
        "close_up_images",
        payload.close_up_images
      );

      onModelChange(
        "colors",
        payload.colors
      );

      onModelChange(
        "fabrics",
        payload.fabrics
      );

      onModelChange(
        "sizes",
        payload.selectedSizes
      );

      onModelChange(
        "description",
        JSON.stringify({
          fabrics:
            payload.fabrics,

          colors:
            payload.colors,

          sizes:
            payload.selectedSizes,
        })
      );

      onModelChange(
        "tech_pack_status",
        "created"
      );

      onModelChange(
        "updated_at",
        new Date().toISOString()
      );

      // ==========================================
      // STEP 9
      // Clear pending files
      // ==========================================

      setImageFile(null);
      setCloseUpFiles([]);

      setImagePreview(
        payload.image_url
      );

      setCloseUpPreviews(
        payload.close_up_images
      );

      toast.success(
        "تم تحديث الموديل والـ Tech Pack بنجاح ✅"
      );
    } catch (error) {
      console.error(
        "UPDATE TECH PACK ERROR:",
        error
      );

      toast.error(
        error?.message ||
        "حدث خطأ أثناء تحديث الموديل والـ Tech Pack"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // Return
  // ==========================================

  return {
    modelName,
    setModelName,

    notes,
    setNotes,

    imageFile,
    imagePreview,

    isGenerating,

    sizesList,

    fabrics,
    addFabric,
    updateFabric,
    removeFabric,

    colors,
    addColor,
    updateColor,
    removeColor,

    selectedSizes,
    toggleSize,

    handleImageChange,

    handleSubmitAndGenerate,

    closeUpFiles,
    closeUpPreviews,

    handleCloseUpChange,
    removeCloseUpImage,

    handleUpdateTechPack,
  };
};