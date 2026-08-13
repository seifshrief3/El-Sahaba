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
  const [modelNumber, setModelNumber] = useState(
    activeModel?.model_number || ""
  );
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
    setModelNumber(activeModel?.model_number || "");
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

    if (parsedSizesFromDesc.length > 0) {
      finalParsedSizes = parsedSizesFromDesc;
    } else if (
      activeModel?.model_sizes &&
      activeModel.model_sizes.length > 0
    ) {
      finalParsedSizes = activeModel.model_sizes
        .map((item) => item?.sizes?.name)
        .filter(Boolean);
    } else if (activeModel?.sizes?.length > 0) {
      finalParsedSizes = activeModel.sizes;
    } else if (activeModel?.selectedSizes?.length > 0) {
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

    e.target.value = "";
  };

  const removeCloseUpImage = (index) => {
    const preview = closeUpPreviews[index];

    if (!preview) return;

    // Existing Cloudinary URL
    if (
      typeof preview === "string" &&
      preview.startsWith("http")
    ) {
      setCloseUpPreviews((prev) =>
        prev.filter((_, i) => i !== index)
      );

      return;
    }

    // New local image
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

    e.target.value = "";
  };

  // ==========================================
  // 9. Image compression
  // ==========================================

  const compressImage = (
    file,
    {
      maxSizeMB = 8,
      maxWidthOrHeight = 3000,
      quality = 0.85,
    } = {}
  ) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("لم يتم اختيار ملف"));
        return;
      }

      // لو الصورة بالفعل أقل من الحد المطلوب
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();

      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);

          let width = img.width;
          let height = img.height;

          // تصغير الأبعاد مع الحفاظ على النسبة
          if (
            width > maxWidthOrHeight ||
            height > maxWidthOrHeight
          ) {
            const scale = Math.min(
              maxWidthOrHeight / width,
              maxWidthOrHeight / height
            );

            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(
              new Error(
                "تعذر إنشاء Canvas لضغط الصورة"
              )
            );
            return;
          }

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const convertToBlob = (currentQuality) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(
                    new Error(
                      "تعذر ضغط الصورة"
                    )
                  );
                  return;
                }

                // لو الحجم أصبح مناسب
                if (
                  blob.size <=
                  maxSizeMB * 1024 * 1024
                ) {
                  const compressedFile =
                    new File(
                      [blob],
                      file.name.replace(
                        /\.[^/.]+$/,
                        ".jpg"
                      ),
                      {
                        type: "image/jpeg",
                        lastModified:
                          Date.now(),
                      }
                    );

                  resolve(compressedFile);
                  return;
                }

                // نقلل الجودة تدريجيًا
                if (currentQuality > 0.4) {
                  convertToBlob(
                    currentQuality - 0.1
                  );
                  return;
                }

                // لو لسه كبير، نقلل الأبعاد
                const newWidth = Math.round(
                  canvas.width * 0.8
                );

                const newHeight = Math.round(
                  canvas.height * 0.8
                );

                canvas.width = newWidth;
                canvas.height = newHeight;

                const newCtx =
                  canvas.getContext("2d");

                newCtx.drawImage(
                  img,
                  0,
                  0,
                  newWidth,
                  newHeight
                );

                convertToBlob(0.8);
              },
              "image/jpeg",
              currentQuality
            );
          };

          convertToBlob(quality);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);

        reject(
          new Error(
            "تعذر قراءة الصورة لضغطها"
          )
        );
      };

      img.src = objectUrl;
    });
  };

  // ==========================================
  // 10. Cloudinary upload
  // ==========================================

  const uploadToCloudinary = async (file) => {
    if (!file) {
      throw new Error("لم يتم اختيار ملف");
    }

    console.log(
      "========== CLOUDINARY UPLOAD =========="
    );

    console.log("Original file:", {
      name: file.name,
      type: file.type,
      sizeMB: (
        file.size /
        1024 /
        1024
      ).toFixed(2),
    });

    // ضغط الصورة فقط إذا كانت أكبر من 8MB
    const compressedFile =
      await compressImage(file, {
        maxSizeMB: 8,
        maxWidthOrHeight: 3000,
        quality: 0.85,
      });

    console.log("File after compression:", {
      name: compressedFile.name,
      type: compressedFile.type,
      sizeMB: (
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2),
    });

    const formData = new FormData();

    formData.append(
      "file",
      compressedFile
    );

    formData.append(
      "upload_preset",
      import.meta.env.VITE_UPLOAD_PRESET
    );

    const cloudName =
      import.meta.env.VITE_CLOUD_NAME;

    if (!cloudName) {
      throw new Error(
        "VITE_CLOUD_NAME غير موجود"
      );
    }

    if (
      !import.meta.env.VITE_UPLOAD_PRESET
    ) {
      throw new Error(
        "VITE_UPLOAD_PRESET غير موجود"
      );
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseText =
      await response.text();

    console.log(
      "Cloudinary status:",
      response.status
    );

    console.log(
      "Cloudinary response:",
      responseText
    );

    if (!response.ok) {
      let cloudinaryError =
        responseText;

      try {
        const parsed =
          JSON.parse(responseText);

        cloudinaryError =
          parsed?.error?.message ||
          parsed?.error ||
          responseText;
      } catch { }

      throw new Error(
        `Cloudinary Error ${response.status}: ${cloudinaryError}`
      );
    }

    let data;

    try {
      data =
        JSON.parse(responseText);
    } catch {
      throw new Error(
        "Cloudinary رجع Response غير صالح"
      );
    }

    if (!data?.secure_url) {
      throw new Error(
        "Cloudinary لم يرجع secure_url"
      );
    }

    console.log(
      "Cloudinary upload successful:",
      data.secure_url
    );

    return data.secure_url;
  };

  // ==========================================
  // 11. Upload current images
  // ==========================================

  const uploadCurrentImages = async () => {
    let finalImageUrl =
      activeModel?.image_url || null;

    // Main image
    if (imageFile) {
      finalImageUrl =
        await uploadToCloudinary(
          imageFile
        );
    }

    // Existing Cloudinary URLs
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
  // 12. Create / Generate Tech Pack
  // ==========================================

  const handleSubmitAndGenerate =
    async () => {
      if (!modelName?.trim()) {
        toast.error(
          "برجاء إدخال اسم الموديل أولاً"
        );
        return;
      }

      setIsGenerating(true);

      try {
        toast.info(
          "جاري تجهيز وضغط الصور..."
        );

        const {
          finalImageUrl,
          finalCloseUpUrls,
        } =
          await uploadCurrentImages();

        const payload = {
          name: modelName.trim(),
          model_number: modelNumber,
          notes: notes || "",

          image_url:
            finalImageUrl || "",

          close_up_images:
            Array.isArray(
              finalCloseUpUrls
            )
              ? finalCloseUpUrls.filter(
                Boolean
              )
              : [],

          fabrics:
            Array.isArray(fabrics)
              ? fabrics.filter(
                (f) =>
                  f?.name?.trim()
              )
              : [],

          colors:
            Array.isArray(colors)
              ? colors.filter(
                (item) =>
                  item?.part?.trim() ||
                  item?.color?.trim()
              )
              : [],

          selectedSizes:
            Array.isArray(
              selectedSizes
            )
              ? selectedSizes.filter(
                Boolean
              )
              : [],

          brand_name:
            brandName || "",

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

        // UPDATE LOCAL STATE

        onModelChange(
          "tech_pack_status",
          "created"
        );

        onModelChange(
          "model_number",
          payload.model_number
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
            fabrics:
              payload.fabrics,
            colors:
              payload.colors,
            sizes:
              payload.selectedSizes,
          })
        );

        onModelChange(
          "hasError",
          false
        );

        // RESET UPLOADED FILES

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
          error?.message ||
          "حدث خطأ أثناء الإنشاء أو رفع الصور"
        );
      } finally {
        setIsGenerating(false);
      }
    };

  // ==========================================
  // 13. UPDATE TECH PACK
  // ==========================================

  const handleUpdateTechPack = async () => {
    if (!modelName?.trim()) {
      toast.error("برجاء إدخال اسم الموديل أولاً");
      return;
    }

    setIsGenerating(true);

    try {
      toast.info("جاري تجهيز وضغط الصور والتعديلات...");

      const { finalImageUrl, finalCloseUpUrls } = await uploadCurrentImages();

      // 💡 1. إضافة model_number للـ payload
      const payload = {
        name: modelName,
        model_number: modelNumber, // <--- السطر ده اتضاف
        notes,
        image_url: finalImageUrl,
        close_up_images: finalCloseUpUrls,
        fabrics: fabrics.filter((f) => f.name?.trim()),
        colors: colors.filter((item) => item.part?.trim() || item.color?.trim()),
        selectedSizes,
      };

      // 💡 2. تحديث جدول models بكود الموديل الجديد
      const { data: updatedModel, error: modelError } = await supabase
        .from("models")
        .update({
          name: payload.name,
          model_number: payload.model_number, // <--- السطر ده اتضاف
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

      if (modelError) {
        throw modelError;
      }

      // Fetch latest Tech Pack + relations
      const [_relationsResult, latestTechPackResult] = await Promise.all([
        handleUpdateModelRelations(
          activeModel.id,
          payload.fabrics,
          payload.selectedSizes
        ),
        supabase
          .from("tech_packs")
          .select("content, version")
          .eq("model_id", activeModel.id)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const { data: latestTechPack, error: techPackError } = latestTechPackResult;

      if (techPackError) {
        throw techPackError;
      }

      // Preserve old Tech Pack data
      const oldContent = latestTechPack?.content || {};

      // Create new Tech Pack content
      const techPackContent = {
        ...oldContent,
        basic_info: {
          ...(oldContent.basic_info || {}),
          product_name: updatedModel.name,
          model_number: payload.model_number, // 💡 3. تحديث الكود جوه الـ Tech Pack نفسه
          brand: brandName,
          main_fabric: payload.fabrics,
          size_range: payload.selectedSizes.join(" - "),
          colors: payload.colors,
          image_url: payload.image_url,
        },
        technical_description: {
          ...(oldContent.technical_description || {}),
          close_up_images: payload.close_up_images,
        },
      };

      // Insert new version
      const newVersion = (latestTechPack?.version || 0) + 1;

      const { error: insertError } = await supabase
        .from("tech_packs")
        .insert({
          model_id: activeModel.id,
          content: techPackContent,
          status: "generated",
          version: newVersion,
        });

      if (insertError) {
        throw insertError;
      }

      // 💡 4. تحديث الـ UI عشان يعرض الرقم الجديد فوراً
      onModelChange("name", payload.name);
      onModelChange("model_number", payload.model_number); // <--- السطر ده اتضاف
      onModelChange("customer_notes", payload.notes);
      onModelChange("image_url", payload.image_url);
      onModelChange("close_up_images", payload.close_up_images);
      onModelChange("colors", payload.colors);
      onModelChange("fabrics", payload.fabrics);
      onModelChange("sizes", payload.selectedSizes);
      onModelChange(
        "description",
        JSON.stringify({
          fabrics: payload.fabrics,
          colors: payload.colors,
          sizes: payload.selectedSizes,
        })
      );
      onModelChange("tech_pack_status", "created");
      onModelChange("updated_at", new Date().toISOString());

      // Clear pending files
      setImageFile(null);
      setCloseUpFiles([]);
      setImagePreview(payload.image_url);
      setCloseUpPreviews(payload.close_up_images);

      toast.success("تم تحديث الموديل والـ Tech Pack بنجاح ✅");
    } catch (error) {
      console.error("UPDATE TECH PACK ERROR:", error);
      toast.error(error?.message || "حدث خطأ أثناء تحديث الموديل والـ Tech Pack");
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

    modelNumber,
    setModelNumber,

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