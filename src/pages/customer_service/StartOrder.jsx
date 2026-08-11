import React, { useState, useRef, useEffect } from "react";

import { supabase } from "../../../supabase";

import { Link, useParams, useNavigate } from "react-router-dom";

import { useReactToPrint } from "react-to-print";

import WorkOrderPDFTemplate from "../../components/WorkOrderPDFTemplate";
import ContractPDFTemplate from "../../components/ContractPDFTemplate";

import { handleIssueOrderToPlanning } from "../../services/collectionsService";

import { toast } from "sonner";

import { notificationService } from "../../services/notificationService";

import { sendForApproval } from "../../services/approvalsService";

/* ============================================================
   Helpers
============================================================ */

const normalizeToStrings = (value) => {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "string") {
    return value
      .split(/[,،/|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeToStrings(item));
  }

  if (typeof value === "object") {
    return Object.keys(value)
      .map((key) => String(key).trim())
      .filter(Boolean);
  }

  return [];
};

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return normalizeToStrings(value).join("، ");
  }

  if (typeof value === "object") {
    return Object.keys(value).join("، ");
  }

  return fallback;
};

/* ============================================================
   Extract Components
============================================================ */

/*
  الشكل المتوقع:

  [
    {
      part: "تيشيرت",
      color: "بينك"
    },
    {
      part: "بنطلون",
      color: "أسود"
    }
  ]

  أو لو عندنا Variants:

  [
    {
      variant: 1,
      part: "تيشيرت",
      color: "بينك"
    },
    {
      variant: 1,
      part: "بنطلون",
      color: "أسود"
    },
    {
      variant: 2,
      part: "تيشيرت",
      color: "رمادي"
    },
    {
      variant: 2,
      part: "بنطلون",
      color: "أبيض"
    }
  ]
*/

const extractComponents = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    /* ========================================================
       Array
    ======================================================== */

    if (Array.isArray(value)) {
      const result = [];

      value.forEach((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const color =
            item.color ?? item.colors ?? item.colour ?? item.color_name;

          const part =
            item.part ?? item.part_name ?? item.partName ?? item.type ?? "";

          const variant =
            item.variant ?? item.variant_key ?? item.variantKey ?? null;

          if (color !== undefined) {
            result.push({
              part: safeText(part, ""),
              color: safeText(color, ""),
              variant:
                variant !== null && variant !== undefined
                  ? Number(variant)
                  : null,
            });
          }
        } else if (typeof item === "string") {
          result.push({
            part: "",
            color: item,
            variant: null,
          });
        }
      });

      if (result.length > 0) {
        return result.filter((item) => item.color);
      }
    }

    /* ========================================================
       Object
    ======================================================== */

    if (typeof value === "object" && !Array.isArray(value)) {
      const directColor =
        value.color ?? value.colors ?? value.colour ?? value.color_name;

      const directPart =
        value.part ?? value.part_name ?? value.partName ?? value.type ?? "";

      const directVariant =
        value.variant ?? value.variant_key ?? value.variantKey ?? null;

      if (directColor !== undefined) {
        return [
          {
            part: safeText(directPart, ""),
            color: safeText(directColor, ""),
            variant:
              directVariant !== null && directVariant !== undefined
                ? Number(directVariant)
                : null,
          },
        ];
      }

      /*
        لو الـ object عبارة عن:

        {
          "تيشيرت": "بينك",
          "بنطلون": "أسود"
        }

        نحوله إلى Components.
      */

      const entries = Object.entries(value).filter(
        ([key]) =>
          ![
            "part",
            "parts",
            "type",
            "name",
            "color",
            "colors",
            "colour",
            "color_name",
            "variant",
            "variant_key",
            "variantKey",
          ].includes(String(key).trim().toLowerCase()),
      );

      if (entries.length > 0) {
        const result = entries
          .map(([part, color]) => ({
            part: String(part).trim(),
            color: safeText(color, "").trim(),
            variant: null,
          }))
          .filter((item) => item.color);

        if (result.length > 0) {
          return result;
        }
      }
    }

    /* ========================================================
       String
    ======================================================== */

    if (typeof value === "string") {
      const colors = normalizeToStrings(value);

      if (colors.length > 0) {
        return colors.map((color) => ({
          part: "",
          color,
          variant: null,
        }));
      }
    }
  }

  return [];
};

/* ============================================================
   Extract Sizes
============================================================ */

const extractSizes = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      const result = normalizeToStrings(value);

      if (result.length > 0) {
        return result;
      }
    }

    if (Array.isArray(value)) {
      const result = value.flatMap((item) => normalizeToStrings(item));

      if (result.length > 0) {
        return result;
      }
    }

    if (typeof value === "object") {
      const directSizes =
        value.sizes ?? value.size ?? value.size_range ?? value.range;

      if (directSizes !== undefined) {
        const result = normalizeToStrings(directSizes);

        if (result.length > 0) {
          return result;
        }
      }

      const keys = Object.keys(value)
        .map((key) => String(key).trim())
        .filter(Boolean);

      if (keys.length > 0) {
        return keys;
      }
    }
  }

  return [];
};

/* ============================================================
   Build Variants
============================================================ */

const buildVariants = (components) => {
  /*
    لو الداتا القديمة لا تحتوي variant:

    تيشيرت / بينك
    بنطلون / أسود

    نعتبرهم Variant واحد.

    لو الداتا تحتوي:

    variant: 1
    variant: 2

    نستخدمها كما هي.
  */

  const hasExplicitVariants = components.some(
    (component) =>
      component.variant !== null &&
      component.variant !== undefined &&
      Number.isFinite(Number(component.variant)),
  );

  const variantsMap = new Map();

  if (!hasExplicitVariants) {
    variantsMap.set(1, components);

    return [
      {
        variantKey: 1,
        components,
      },
    ];
  }

  components.forEach((component) => {
    const variantKey = Number(component.variant) || 1;

    if (!variantsMap.has(variantKey)) {
      variantsMap.set(variantKey, []);
    }

    variantsMap.get(variantKey).push(component);
  });

  return Array.from(variantsMap.entries()).map(
    ([variantKey, variantComponents]) => ({
      variantKey: Number(variantKey),
      components: variantComponents,
    }),
  );
};

/* ============================================================
   Component
============================================================ */

const StartOrder = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [collectionInfo, setCollectionInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSendingContract, setIsSendingApproval] = useState(false);

  /*
    الشكل الجديد:

    {
      modelId: {
        1: {
          S: 10,
          M: 15,
          L: 12
        },

        2: {
          S: 5,
          M: 8,
          L: 10
        }
      }
    }
  */

  const [seriesCounts, setSeriesCounts] = useState({});

  const workOrderRef = useRef(null);

  const contractRef = useRef(null);

  /* ============================================================
     Fetch Collection
  ============================================================ */

  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);

      try {
        const { data: orderData, error } = await supabase
          .from("collections")
          .select(
            `
                id,
                name,
                brands (
                  name_ar,
                  name_en
                ),
                models (
                  id,
                  model_number,
                  name,
                  image_url,
                  colors,
                  tech_packs (
                    content
                  ),
                  quotation_items (
                    selling_price
                  )
                )
              `,
          )
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        /* ======================================================
             تجهيز الموديلات
          ====================================================== */

        const formattedModels = (orderData.models || []).map((model, index) => {
          /* ================= Tech Pack ================= */

          const tpContent = Array.isArray(model.tech_packs)
            ? model.tech_packs[0]?.content
            : model.tech_packs?.content;

          const info = tpContent?.basic_info || tpContent || {};

          /* ================= Components ================= */

          let components = extractComponents(
            model.colors,
            info.colors,
            info.color,
          );

          components = components
            .map((component) => ({
              part: safeText(component.part, "").trim(),

              color: safeText(component.color, "").trim(),

              variant:
                component.variant !== null && component.variant !== undefined
                  ? Number(component.variant)
                  : null,
            }))
            .filter((component) => component.color);

          /*
                  لو مفيش Components
                */

          if (components.length === 0) {
            components = [
              {
                part: "",
                color: "غير محدد",
                variant: null,
              },
            ];
          }

          /* ================= Variants ================= */

          const variants = buildVariants(components);

          /* ================= Sizes ================= */

          let finalSizes = extractSizes(
            info.sizes,
            info.size_range,
            info.sizeRange,
          );

          finalSizes = finalSizes
            .map((size) => safeText(size, "").trim())
            .filter(Boolean);

          finalSizes = [...new Set(finalSizes)];

          if (finalSizes.length === 0) {
            finalSizes = ["M", "L", "XL"];
          }

          /* ================= Price ================= */

          const price =
            Array.isArray(model.quotation_items) &&
            model.quotation_items.length > 0
              ? Number(model.quotation_items[0]?.selling_price) || 0
              : 0;

          /* ================= Fabric ================= */

          const fabric = safeText(
            info.main_fabric || info.fabric_type || info.material,
            "غير محدد",
          );

          /* ================= Weight ================= */

          const weight = safeText(
            info.fabric_weight || info.weight,
            "غير محدد",
          );

          /* ================= Model ================= */

          const modelName = safeText(model.name, `موديل ${index + 1}`);

          const modelNumber = safeText(model.model_number, `MOD-${index + 1}`);

          return {
            real_id: model.id,

            id: modelNumber,

            model_number: modelNumber,

            name: modelName,

            image_url:
              typeof model.image_url === "string" ? model.image_url : null,

            components,

            variants,

            sizes: finalSizes,

            fabric,

            weight,

            approvedPrice: price,
          };
        });

        /* ======================================================
             Collection
          ====================================================== */

        const formattedData = {
          id: orderData.id,

          brandName: safeText(orderData.brands?.name_ar, "غير محدد"),

          brandCode:
            typeof orderData.brands?.name_en === "string"
              ? orderData.brands.name_en.substring(0, 3).toUpperCase()
              : "RKM",

          collectionName: safeText(orderData.name, "غير محدد"),

          models: formattedModels,
        };

        console.log("FINAL COLLECTION DATA:", formattedData);

        formattedData.models.forEach((model) => {
          console.log("MODEL:", model.name);

          console.log("VARIANTS:", model.variants);

          console.log("SIZES:", model.sizes);
        });

        setCollectionInfo(formattedData);

        /* ======================================================
             Initial Series
          ====================================================== */

        const initialCounts = {};

        formattedData.models.forEach((model) => {
          initialCounts[model.id] = {};

          model.variants.forEach((variant) => {
            initialCounts[model.id][variant.variantKey] = {};

            model.sizes.forEach((size) => {
              initialCounts[model.id][variant.variantKey][size] = 5;
            });
          });
        });

        setSeriesCounts(initialCounts);
      } catch (error) {
        console.error("خطأ في جلب بيانات أمر التشغيل:", error);

        toast.error("حدث خطأ في جلب بيانات أمر التشغيل.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRealData();
    }
  }, [id]);

  /* ============================================================
     Change Series
  ============================================================ */

  const handleSeriesChange = (modelId, variantKey, size, value) => {
    const parsedValue = Math.max(0, parseInt(value, 10) || 0);

    setSeriesCounts((prev) => ({
      ...prev,

      [modelId]: {
        ...(prev[modelId] || {}),

        [variantKey]: {
          ...(prev[modelId]?.[variantKey] || {}),

          [size]: parsedValue,
        },
      },
    }));
  };

  /* ============================================================
     Global Series
  ============================================================ */

  const handleGlobalSeriesChange = (value) => {
    const parsedValue = Math.max(0, Number(value) || 0);

    const newCounts = {};

    collectionInfo.models.forEach((model) => {
      newCounts[model.id] = {};

      model.variants.forEach((variant) => {
        newCounts[model.id][variant.variantKey] = {};

        model.sizes.forEach((size) => {
          newCounts[model.id][variant.variantKey][size] = parsedValue;
        });
      });
    });

    setSeriesCounts(newCounts);
  };

  /* ============================================================
     Variant Total
  ============================================================ */

  const getVariantTotal = (model, variantKey) => {
    return model.sizes.reduce((total, size) => {
      return (
        total + (Number(seriesCounts?.[model.id]?.[variantKey]?.[size]) || 0)
      );
    }, 0);
  };

  /* ============================================================
     Model Total
  ============================================================ */

  const getModelTotal = (model) => {
    return model.variants.reduce((total, variant) => {
      return total + getVariantTotal(model, variant.variantKey);
    }, 0);
  };

  /* ============================================================
     Grand Total
  ============================================================ */

  const grandTotalQty =
    collectionInfo?.models?.reduce((total, model) => {
      return total + getModelTotal(model);
    }, 0) || 0;

  /* ============================================================
     Validate Series
  ============================================================ */

  const hasInvalidSeries = () => {
    if (!collectionInfo?.models) {
      return true;
    }

    return collectionInfo.models.some((model) =>
      model.variants.some((variant) =>
        model.sizes.some((size) => {
          const series =
            Number(seriesCounts?.[model.id]?.[variant.variantKey]?.[size]) || 0;

          return series <= 0;
        }),
      ),
    );
  };

  /* ============================================================
     Print Work Order
  ============================================================ */

  const handlePrintWO = useReactToPrint({
    contentRef: workOrderRef,

    documentTitle: `أمر_تشغيل_${collectionInfo?.brandName || "فارغ"}`,
  });

  /* ============================================================
     Print Contract
  ============================================================ */

  const handlePrintContract = useReactToPrint({
    contentRef: contractRef,

    documentTitle: `عقد_تصنيع_${collectionInfo?.brandName || "فارغ"}`,
  });

  /* ============================================================
     Save And Issue
  ============================================================ */

  const handleSaveAndIssue = async () => {
    const confirmIssue = window.confirm(
      "هل أنت متأكد من حفظ وإصدار أمر التشغيل؟ ستتم إضافة البيانات لقسم التخطيط بشكل نهائي.",
    );

    if (!confirmIssue) {
      return;
    }

    if (hasInvalidSeries()) {
      toast.error("برجاء تحديد عدد سريهات أكبر من صفر لكل Variant ولكل مقاس.");

      return;
    }

    setIsSubmitting(true);

    try {
      await handleIssueOrderToPlanning(collectionInfo, seriesCounts);

      toast.success(
        "تم إصدار أمر التشغيل بنجاح! 🚀 تم تسجيل البيانات وإرسالها للمصنع.",
      );

      await notificationService.sendNotification(
        "planning",
        "أمر تشغيل جديد 🏭",
        `تم إصدار أمر تشغيل جديد لكولكشن: ${collectionInfo.collectionName}، بانتظار استلامك.`,
        id,
      );

      navigate("/customer_service/customer_followup");
    } catch (error) {
      console.error(error);

      toast.error(error.message || "حدث خطأ أثناء إصدار أمر التشغيل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     Loading
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600 font-bold">
        جاري تحميل بيانات الكولكشن...
      </div>
    );
  }

  /* ============================================================
     No Collection
  ============================================================ */

  if (!collectionInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-600 font-bold">
        لم يتم العثور على بيانات هذا الكولكشن.
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="space-y-6">
      {/* ======================================================
          PDF Templates
      ====================================================== */}

      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <WorkOrderPDFTemplate
          ref={workOrderRef}
          data={collectionInfo}
          seriesCount={seriesCounts}
        />

        <ContractPDFTemplate
          ref={contractRef}
          data={collectionInfo}
          seriesCount={seriesCounts}
        />
      </div>

      {/* ======================================================
          Back
      ====================================================== */}

      <div className="flex justify-end">
        <Link
          to="/customer_service/customer_followup"
          className="text-[#1a365d] border border-[#1a365d] bg-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
        >
          ◀ رجوع للمتابعة
        </Link>
      </div>

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
              إصدار أمر التشغيل لـ: {collectionInfo.brandName}
            </h1>

            <p className="text-sm text-slate-500">
              ({collectionInfo.collectionName}) - حدد عدد السريهات لكل Variant
              ولكل مقاس.
            </p>
          </div>

          <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200">
            جاهز للتشغيل ✓
          </span>
        </div>
      </div>

      {/* ======================================================
          Main Content
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ====================================================
            Global Series
        ==================================================== */}

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
              تطبيق عدد سريهات ثابت
            </h3>

            <p className="text-xs text-slate-500 mb-4 text-right">
              يمكنك تطبيق عدد موحد على جميع الـ Variants والمقاسات، أو تعديل كل
              مقاس بشكل منفصل.
            </p>

            <div className="flex flex-wrap gap-3 mb-5">
              {[1, 2, 3, 5, 10, 13, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => handleGlobalSeriesChange(num)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-colors border bg-slate-50 text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d] hover:bg-blue-50"
                >
                  {num} سري للكل
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500 font-medium">
                أو إدخال مخصص للكل:
              </span>

              <input
                type="number"
                min="1"
                onChange={(e) => handleGlobalSeriesChange(e.target.value)}
                placeholder="مثال: 15"
                className="w-24 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-[#1a365d] font-bold text-[#1a365d]"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            Models
        ==================================================== */}

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-[#1a365d] mb-6 text-right">
            توزيع الكميات والسريهات حسب التركيبة والمقاس
          </h3>

          <div className="space-y-6">
            {collectionInfo.models.map((model) => (
              <div
                key={model.id}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* ================= Model Header ================= */}

                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {model.image_url ? (
                        <img
                          src={model.image_url}
                          alt={safeText(model.name)}
                          className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400">
                          صورة
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-[#1a365d]">
                          {model.name}
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {model.model_number}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        إجمالي الموديل
                      </div>

                      <div className="font-black text-xl text-[#1a365d]">
                        {getModelTotal(model).toLocaleString()}

                        <span className="text-xs font-normal text-slate-500 mr-1">
                          قطعة
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= Variants ================= */}

                <div className="p-4 space-y-5">
                  {model.variants.map((variant) => (
                    <div
                      key={`${model.id}-variant-${variant.variantKey}`}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      {/* ================= Variant Header ================= */}

                      <div className="bg-[#1a365d] text-white p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <div className="font-bold">
                            تركيبة رقم {variant.variantKey}
                          </div>

                          <div className="text-sm">
                            إجمالي التركيبة:{" "}
                            <span className="font-black">
                              {getVariantTotal(
                                model,
                                variant.variantKey,
                              ).toLocaleString()}
                            </span>{" "}
                            قطعة
                          </div>
                        </div>

                        {/* Components */}

                        <div className="flex flex-wrap gap-2 mt-3">
                          {variant.components.map(
                            (component, componentIndex) => (
                              <span
                                key={`${component.part}-${component.color}-${componentIndex}`}
                                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-xs"
                              >
                                <span className="font-bold">
                                  {component.part || "الجزء"}
                                </span>

                                <span>→</span>

                                <span>{component.color}</span>
                              </span>
                            ),
                          )}
                        </div>
                      </div>

                      {/* ================= Sizes ================= */}

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center min-w-[650px]">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="py-3 px-4 font-semibold text-right text-[#1a365d]">
                                المقاس
                              </th>

                              <th className="py-3 px-4 font-semibold text-[#1a365d]">
                                عدد السريهات
                              </th>

                              <th className="py-3 px-4 font-semibold text-[#1a365d]">
                                الكمية
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-200">
                            {model.sizes.map((size) => {
                              const currentSeries =
                                Number(
                                  seriesCounts?.[model.id]?.[
                                    variant.variantKey
                                  ]?.[size],
                                ) || 0;

                              return (
                                <tr
                                  key={`${model.id}-${variant.variantKey}-${size}`}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="py-4 px-4 text-right">
                                    <span className="inline-flex min-w-[50px] justify-center px-3 py-2 rounded-lg bg-blue-50 text-[#1a365d] font-bold text-sm border border-blue-100">
                                      {size}
                                    </span>
                                  </td>

                                  <td className="py-4 px-4">
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentSeries}
                                      onChange={(e) =>
                                        handleSeriesChange(
                                          model.id,
                                          variant.variantKey,
                                          size,
                                          e.target.value,
                                        )
                                      }
                                      className="w-32 border border-slate-300 rounded-md p-2 text-center font-bold text-[#b91c1c] focus:outline-none focus:border-[#1a365d]"
                                    />
                                  </td>

                                  <td className="py-4 px-4 font-bold text-lg text-slate-800">
                                    {currentSeries.toLocaleString()}

                                    <span className="text-xs text-slate-500 font-normal mr-1">
                                      قطعة
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ==================================================
              Grand Total
          ================================================== */}

          <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-bold">
              الإجمالي الكلي للكميات المطلوب تشغيلها:
            </span>

            <span className="text-3xl font-black text-[#1a365d]">
              {grandTotalQty.toLocaleString()}

              <span className="text-sm font-normal text-slate-500 mr-1">
                قطعة
              </span>
            </span>
          </div>

          {/* ==================================================
              Buttons
          ================================================== */}

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-end gap-3">
            <button
              onClick={handlePrintWO}
              className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto"
            >
              طباعة ملف أمر التشغيل (PDF)
            </button>

            <button
              onClick={handlePrintContract}
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto"
            >
              إصدار عقد العمل (PDF)
            </button>

            <button
              onClick={handleSaveAndIssue}
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#b91c1c] hover:bg-red-800"
              } text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto`}
            >
              {isSubmitting ? "جاري الإصدار..." : "حفظ وإصدار للتخطيط"}
            </button>

            <button
              onClick={async () => {
                if (hasInvalidSeries()) {
                  toast.error(
                    "برجاء التأكد من تحديد عدد سريهات أكبر من صفر لكل Variant ولكل مقاس.",
                  );

                  return;
                }

                const hasUnpricedModels = collectionInfo.models.some(
                  (model) => !model.approvedPrice || model.approvedPrice <= 0,
                );

                if (hasUnpricedModels) {
                  toast.error(
                    "لا يمكن إرسال العقد! هناك موديلات لم يتم تسعيرها واعتمادها بعد.",
                  );

                  return;
                }

                setIsSendingApproval(true);

                try {
                  const contractDetails = `مطلوب اعتماد عقد تصنيع. إجمالي الكمية: ${grandTotalQty} قطعة.`;

                  await sendForApproval(id, "contract", contractDetails);

                  toast.success("تم إرسال العقد للمدير للاعتماد");
                } catch (error) {
                  toast.error(error.message || "حدث خطأ أثناء الإرسال");
                } finally {
                  setIsSendingApproval(false);
                }
              }}
              disabled={isSendingContract}
              className={`${
                isSendingContract
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto`}
            >
              {isSendingContract ? "جاري الإرسال..." : "إرسال العقد للاعتماد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartOrder;
