import React, { useRef, useState } from "react";
import {
  X,
  Boxes,
  Package,
  PackageCheck,
  PackageX,
  Layers3,
  FileText,
  ChevronDown,
  ChevronUp,
  Truck,
  Printer,
  ClipboardList,
  Image as ImageIcon,
} from "lucide-react";

import { useReactToPrint } from "react-to-print";

import { formatNumber } from "../utils";
import EmptyState from "../ui/EmptyState";

const CollectionModal = ({ collection, onClose }) => {
  const [openTechPack, setOpenTechPack] = useState(null);

  /*
    Tech Pack المراد طباعته
  */
  const [printingTechPack, setPrintingTechPack] = useState(null);

  /*
    Ref الخاص بمحتوى الـ PDF
  */
  const techPackPrintRef = useRef(null);

  /*
    =========================================================
    PRINT
    =========================================================
  */

  const handlePrintTechPack = useReactToPrint({
    contentRef: techPackPrintRef,

    documentTitle: printingTechPack
      ? `Tech_Pack_${printingTechPack.model?.model_number || "Model"}`
      : "Tech_Pack",

    onAfterPrint: () => {
      setPrintingTechPack(null);
    },
  });

  /*
    =========================================================
    Helpers
    =========================================================
  */

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  const safeObject = (value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return {};
      }
    }

    return {};
  };

  const getValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "نعم" : "لا";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return "-";
      }
    }

    return String(value);
  };

  /*
    =========================================================
    Key Labels
    =========================================================
  */

  const formatKey = (key) => {
    const labels = {
      basic_info: "البيانات الأساسية",
      technical_description: "الوصف الفني",

      product_name: "اسم المنتج",
      model_name: "اسم الموديل",
      model_number: "كود الموديل",

      brand: "البراند",
      brand_name: "اسم البراند",

      name: "الاسم",
      description: "الوصف",
      notes: "الملاحظات",
      customer_notes: "ملاحظات العميل",

      fabrics: "الخامات",
      fabric: "الخامة",
      materials: "الخامات",
      main_fabric: "الخامة الأساسية",

      colors: "الألوان",
      color: "اللون",

      sizes: "المقاسات",
      size: "المقاس",
      size_range: "المقاسات",

      image_url: "الصورة الرئيسية",
      image: "الصورة",
      main_image: "الصورة الرئيسية",

      close_up_images: "صور التفاصيل",
      images: "الصور",

      technical_details: "التفاصيل الفنية",
      measurements: "المقاسات والتفاصيل",
      measurement: "المقاس",

      construction: "التنفيذ",
      stitching: "الخياطة",
      printing: "الطباعة",
      embroidery: "التطريز",

      accessories: "الإكسسوارات",
      trims: "الإكسسوارات",

      care_instructions: "تعليمات العناية",
      washing_instructions: "تعليمات الغسيل",

      packaging: "التغليف",

      bom: "قائمة الخامات والمكونات",

      quantity: "الكمية",
      weight: "الوزن",
      type: "النوع",

      part: "الجزء",
      variant: "الاختلاف",

      front: "الأمام",
      back: "الخلف",
      side: "الجانب",

      collar: "الياقة",
      sleeve: "الكم",
      pocket: "الجيب",

      fabric_type: "نوع الخامة",
      fabric_weight: "وزن الخامة",

      status: "الحالة",
      version: "الإصدار",

      created_at: "تاريخ الإنشاء",
      updated_at: "آخر تحديث",
    };

    if (labels[key]) {
      return labels[key];
    }

    return String(key)
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  /*
    =========================================================
    URL / Images
    =========================================================
  */

  const isUrl = (value) => {
    if (typeof value !== "string") return false;

    return value.startsWith("http://") || value.startsWith("https://");
  };

  const isImageUrl = (value) => {
    if (typeof value !== "string") return false;

    return (
      isUrl(value) &&
      (/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(value) ||
        value.includes("cloudinary.com") ||
        value.includes("image/upload"))
    );
  };

  const isImageKey = (key) => {
    const normalized = String(key).toLowerCase();

    return (
      normalized.includes("image") ||
      normalized.includes("photo") ||
      normalized.includes("picture")
    );
  };

  /*
    =========================================================
    TECH PACK VALUE RENDERER
    =========================================================
  */

  const renderTechPackValue = (value, key = "", level = 0, isPrint = false) => {
    /*
      NULL
    */
    if (value === null || value === undefined || value === "") {
      return (
        <span className={isPrint ? "tp-print-muted" : "text-slate-400"}>-</span>
      );
    }

    /*
      BOOLEAN
    */
    if (typeof value === "boolean") {
      return (
        <span
          className={
            isPrint
              ? `tp-print-badge ${
                  value ? "tp-print-success" : "tp-print-muted-badge"
                }`
              : `inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                  value
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`
          }
        >
          {value ? "نعم" : "لا"}
        </span>
      );
    }

    /*
      NUMBER
    */
    if (typeof value === "number") {
      return (
        <span
          className={
            isPrint
              ? "tp-print-value tp-print-number"
              : "font-bold text-slate-700"
          }
        >
          {formatNumber(value)}
        </span>
      );
    }

    /*
      STRING
    */
    if (typeof value === "string") {
      /*
        IMAGE
      */
      if (isImageKey(key) && isUrl(value)) {
        return (
          <div className={isPrint ? "tp-print-image-wrapper" : "mt-2"}>
            <img
              src={value}
              alt=""
              className={
                isPrint
                  ? "tp-print-image"
                  : "max-w-full max-h-[320px] rounded-xl object-contain border border-slate-200 bg-white"
              }
            />
          </div>
        );
      }

      /*
        URL
      */
      if (isUrl(value)) {
        return isPrint ? (
          <span className="tp-print-value tp-print-url">{value}</span>
        ) : (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
          >
            {value}
          </a>
        );
      }

      /*
        TEXT
      */
      return (
        <span
          className={
            isPrint
              ? "tp-print-value tp-print-text"
              : "text-sm leading-7 text-slate-700 whitespace-pre-wrap break-words"
          }
        >
          {value}
        </span>
      );
    }

    /*
      ARRAY
    */
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <span
            className={isPrint ? "tp-print-muted" : "text-slate-400 text-sm"}
          >
            لا توجد بيانات
          </span>
        );
      }

      /*
        Array Images
      */
      const allImages = value.every(
        (item) => typeof item === "string" && isUrl(item),
      );

      if (allImages) {
        return (
          <div
            className={
              isPrint
                ? "tp-print-images-grid"
                : "grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
            }
          >
            {value.map((item, index) => (
              <div
                key={index}
                className={
                  isPrint
                    ? "tp-print-image-card"
                    : "rounded-xl overflow-hidden border border-slate-200 bg-white"
                }
              >
                <img
                  src={item}
                  alt=""
                  className={
                    isPrint ? "tp-print-grid-image" : "w-full h-36 object-cover"
                  }
                />
              </div>
            ))}
          </div>
        );
      }

      /*
        Primitive Array
      */
      const allPrimitive = value.every(
        (item) =>
          item === null || item === undefined || typeof item !== "object",
      );

      if (allPrimitive) {
        return (
          <div
            className={isPrint ? "tp-print-tags" : "flex flex-wrap gap-2 mt-2"}
          >
            {value.map((item, index) => (
              <span
                key={index}
                className={
                  isPrint
                    ? "tp-print-tag"
                    : "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
                }
              >
                {getValue(item)}
              </span>
            ))}
          </div>
        );
      }

      /*
        Array Objects
      */
      return (
        <div className={isPrint ? "tp-print-object-list" : "space-y-3 mt-2"}>
          {value.map((item, index) => (
            <div
              key={index}
              className={
                isPrint
                  ? "tp-print-object-card"
                  : "rounded-xl border border-slate-200 bg-white p-4"
              }
            >
              {typeof item === "object" && item !== null ? (
                <div
                  className={isPrint ? "tp-print-object-fields" : "space-y-3"}
                >
                  {Object.entries(item).map(([childKey, childValue]) => (
                    <div
                      key={childKey}
                      className={
                        isPrint
                          ? "tp-print-field-row"
                          : "grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2"
                      }
                    >
                      <div
                        className={
                          isPrint
                            ? "tp-print-label"
                            : "text-[11px] text-slate-400 font-bold"
                        }
                      >
                        {formatKey(childKey)}
                      </div>

                      <div>
                        {renderTechPackValue(
                          childValue,
                          childKey,
                          level + 1,
                          isPrint,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderTechPackValue(item, key, level + 1, isPrint)
              )}
            </div>
          ))}
        </div>
      );
    }

    /*
      OBJECT
    */
    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);

      if (entries.length === 0) {
        return (
          <span className={isPrint ? "tp-print-muted" : "text-slate-400"}>
            لا توجد بيانات
          </span>
        );
      }

      return (
        <div
          className={
            isPrint
              ? "tp-print-object-list"
              : `space-y-3 ${level > 0 ? "mt-2" : ""}`
          }
        >
          {entries.map(([childKey, childValue]) => (
            <div
              key={childKey}
              className={
                isPrint
                  ? "tp-print-object-card"
                  : "rounded-xl border border-slate-200 bg-white p-4"
              }
            >
              <div
                className={
                  isPrint
                    ? "tp-print-object-title"
                    : "text-xs font-black text-[#0D2748] mb-2"
                }
              >
                {formatKey(childKey)}
              </div>

              {renderTechPackValue(childValue, childKey, level + 1, isPrint)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <span className={isPrint ? "tp-print-value" : "text-sm text-slate-700"}>
        {String(value)}
      </span>
    );
  };

  /*
    =========================================================
    MODELS
    =========================================================
  */

  const collectionModels = Array.isArray(collection.models)
    ? collection.models
    : [];

  /*
    =========================================================
    PRODUCTION ORDER ITEMS
    =========================================================
  */

  const collectionOrderItems = Array.isArray(collection.orderItems)
    ? collection.orderItems
    : [];

  const getModelQuantity = (modelId) => {
    const modelItems = collectionOrderItems.filter(
      (item) => item.model_id === modelId,
    );

    if (modelItems.length === 0) {
      return 0;
    }

    const hasQuantity = modelItems.some(
      (item) => item.quantity !== null && item.quantity !== undefined,
    );

    if (hasQuantity) {
      return modelItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      );
    }

    return modelItems.reduce(
      (sum, item) => sum + (Number(item.total_quantity) || 0),
      0,
    );
  };

  const calculatedTotalQuantity = collectionModels.reduce(
    (sum, model) => sum + getModelQuantity(model.id),
    0,
  );

  /*
    =========================================================
    INVENTORY
    =========================================================
  */

  const inventory = Array.isArray(collection.inventory)
    ? collection.inventory
    : [];

  const collectionModelIds = collectionModels.map((model) => model.id);

  const collectionInventory = inventory.filter((item) =>
    collectionModelIds.includes(item.model_id),
  );

  const totalInventory = collectionInventory.reduce(
    (sum, item) => sum + (Number(item.available_qty) || 0),
    0,
  );

  const totalShipped = collectionInventory.reduce(
    (sum, item) => sum + (Number(item.shipped_qty) || 0),
    0,
  );

  const totalReserved = collectionInventory.reduce(
    (sum, item) => sum + (Number(item.reserved_qty) || 0),
    0,
  );

  /*
    =========================================================
    TECH PACKS
    =========================================================
  */

  const collectionTechPacks = collection.techPacks || {};

  const getTechPackForModel = (modelId) => {
    if (
      collectionTechPacks &&
      !Array.isArray(collectionTechPacks) &&
      collectionTechPacks[modelId]
    ) {
      return collectionTechPacks[modelId];
    }

    if (Array.isArray(collectionTechPacks)) {
      return (
        collectionTechPacks.find((pack) => pack.model_id === modelId) || null
      );
    }

    return null;
  };

  /*
    content فقط
    file_url غير مستخدم
  */

  const getTechPackContent = (techPack) => {
    if (!techPack?.content) {
      return {};
    }

    return safeObject(techPack.content);
  };

  /*
    =========================================================
    QUOTATION
    =========================================================
  */

  const quotation = collection.quotation || null;

  const quotationItems = Array.isArray(quotation?.quotation_items)
    ? quotation.quotation_items
    : [];

  const getQuotationItem = (modelId) => {
    return quotationItems.find((item) => item.model_id === modelId) || null;
  };

  const getModelSellingPrice = (modelId) => {
    const item = getQuotationItem(modelId);

    if (!item) {
      return 0;
    }

    return Number(item.selling_price) || 0;
  };

  /*
    =========================================================
    START PRINT
    =========================================================
  */

  const startPrintingTechPack = (model, techPack) => {
    const content = getTechPackContent(techPack);

    if (!techPack || Object.keys(content).length === 0) {
      return;
    }

    setPrintingTechPack({
      model,
      techPack,
      content,
    });

    /*
      ننتظر الـDOM يترسم قبل الطباعة
    */
    setTimeout(() => {
      handlePrintTechPack();
    }, 150);
  };

  if (!collection) return null;

  /*
    =========================================================
    RENDER
    =========================================================
  */

  return (
    <>
      {/* =====================================================
          PRINT STYLES
          لا نستخدم pageStyle
      ===================================================== */}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');

          @media print {

            html,
            body {
              direction: rtl !important;
              font-family: "Rubik", Arial, sans-serif !important;
              background: white !important;
              color: #102A43 !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            * {
              font-family: "Rubik", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            @page {
              size: A4;
              margin: 10mm;
            }

            body > * {
              background: white !important;
            }

            .tp-print-root {
              display: block !important;
              width: 100% !important;
              direction: rtl !important;
              font-family: "Rubik", Arial, sans-serif !important;
              color: #102A43 !important;
            }

            .tp-print-header {
              background: #0D2748 !important;
              color: white !important;
              padding: 22px !important;
              border-radius: 0 !important;
              margin-bottom: 20px !important;
              text-align: center !important;
            }

            .tp-print-logo-title {
              font-size: 27px !important;
              font-weight: 900 !important;
              margin: 0 !important;
            }

            .tp-print-subtitle {
              font-size: 14px !important;
              margin-top: 6px !important;
              color: #dbeafe !important;
            }

            .tp-print-model-info {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 10px !important;
              margin-bottom: 20px !important;
            }

            .tp-print-info-card {
              border: 1.5px solid #d7dee8 !important;
              border-radius: 8px !important;
              padding: 12px !important;
              background: #f8fafc !important;
            }

            .tp-print-info-label {
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #64748b !important;
              margin-bottom: 4px !important;
            }

            .tp-print-info-value {
              font-size: 16px !important;
              font-weight: 800 !important;
              color: #0D2748 !important;
            }

            .tp-print-section {
              margin-bottom: 18px !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .tp-print-section-header {
              background: #0D2748 !important;
              color: white !important;
              padding: 11px 14px !important;
              font-size: 17px !important;
              font-weight: 800 !important;
              border-right: 6px solid #C62828 !important;
              margin-bottom: 0 !important;
              break-after: avoid !important;
            }

            .tp-print-section-content {
              border: 1px solid #d7dee8 !important;
              border-top: 0 !important;
              padding: 13px !important;
              background: white !important;
            }

            .tp-print-object-list {
              display: block !important;
            }

            .tp-print-object-card {
              border: 1px solid #d7dee8 !important;
              border-radius: 7px !important;
              padding: 11px !important;
              margin-bottom: 9px !important;
              background: #ffffff !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .tp-print-object-title {
              font-size: 14px !important;
              font-weight: 800 !important;
              color: #0D2748 !important;
              border-bottom: 2px solid #C62828 !important;
              padding-bottom: 5px !important;
              margin-bottom: 8px !important;
            }

            .tp-print-field-row {
              display: grid !important;
              grid-template-columns: 150px 1fr !important;
              gap: 12px !important;
              align-items: start !important;
              padding: 6px 0 !important;
              border-bottom: 1px solid #edf1f5 !important;
            }

            .tp-print-field-row:last-child {
              border-bottom: none !important;
            }

            .tp-print-label {
              font-size: 13px !important;
              font-weight: 700 !important;
              color: #64748b !important;
            }

            .tp-print-value {
              font-size: 15px !important;
              line-height: 1.8 !important;
              color: #1e293b !important;
              font-weight: 500 !important;
              white-space: pre-wrap !important;
              overflow-wrap: anywhere !important;
            }

            .tp-print-number {
              font-weight: 800 !important;
              color: #0D2748 !important;
            }

            .tp-print-text {
              font-weight: 500 !important;
            }

            .tp-print-url {
              font-size: 11px !important;
              direction: ltr !important;
              text-align: left !important;
            }

            .tp-print-muted {
              color: #94a3b8 !important;
              font-size: 14px !important;
            }

            .tp-print-badge {
              display: inline-block !important;
              padding: 4px 9px !important;
              border-radius: 5px !important;
              font-size: 12px !important;
              font-weight: 800 !important;
            }

            .tp-print-success {
              background: #dcfce7 !important;
              color: #166534 !important;
            }

            .tp-print-muted-badge {
              background: #f1f5f9 !important;
              color: #64748b !important;
            }

            .tp-print-tags {
              display: flex !important;
              flex-wrap: wrap !important;
              gap: 7px !important;
            }

            .tp-print-tag {
              display: inline-block !important;
              padding: 6px 11px !important;
              border: 1px solid #cbd5e1 !important;
              border-right: 3px solid #C62828 !important;
              border-radius: 6px !important;
              background: #f8fafc !important;
              color: #0D2748 !important;
              font-size: 13px !important;
              font-weight: 700 !important;
            }

            .tp-print-image-wrapper {
              margin-top: 8px !important;
              text-align: center !important;
            }

            .tp-print-image {
              max-width: 100% !important;
              max-height: 320px !important;
              object-fit: contain !important;
              border: 1px solid #d7dee8 !important;
              border-radius: 8px !important;
            }

            .tp-print-images-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
            }

            .tp-print-image-card {
              border: 1px solid #d7dee8 !important;
              border-radius: 7px !important;
              overflow: hidden !important;
              break-inside: avoid !important;
            }

            .tp-print-grid-image {
              width: 100% !important;
              height: 150px !important;
              object-fit: cover !important;
            }

            .tp-print-footer {
              margin-top: 25px !important;
              padding-top: 12px !important;
              border-top: 2px solid #0D2748 !important;
              display: flex !important;
              justify-content: space-between !important;
              font-size: 11px !important;
              color: #64748b !important;
            }

            .tp-print-footer-brand {
              color: #0D2748 !important;
              font-size: 13px !important;
              font-weight: 900 !important;
            }

            /*
              إخفاء كل حاجة غير محتوى الـTech Pack
            */

            body > * {
              visibility: hidden !important;
            }

            .tp-print-root,
            .tp-print-root * {
              visibility: visible !important;
            }

            .tp-print-root {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
            }
          }

          /*
            على الشاشة:
            عنصر الطباعة مخفي تمامًا
          */

          .tp-print-root {
            display: none;
          }
        `}
      </style>

      {/* =====================================================
          MAIN MODAL
      ===================================================== */}

      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
        dir="rtl"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden bg-white rounded-[2rem] shadow-2xl flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="shrink-0 bg-[#0D2748] text-white px-5 md:px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Boxes size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-black">
                      {collection.name || "الكولكشن"}
                    </h2>

                    <p className="text-blue-100/70 text-xs mt-1">
                      تفاصيل الكولكشن والموديلات والتيك باك وعرض السعر
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="overflow-y-auto p-4 md:p-7 space-y-7">
            {/* =================================================
                COLLECTION SUMMARY
            ================================================= */}

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Boxes size={19} className="text-[#0D2748]" />

                <h3 className="text-lg font-black">ملخص الكولكشن</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Package size={15} />
                    إجمالي القطع
                  </div>

                  <div className="font-black text-xl mt-2 text-[#0D2748]">
                    {formatNumber(calculatedTotalQuantity)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-blue-500">
                    <PackageCheck size={15} />
                    بالمخزن
                  </div>

                  <div className="font-black text-xl mt-2 text-blue-700">
                    {formatNumber(
                      collection.availableQuantity ?? totalInventory,
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <Truck size={15} />
                    تم الشحن
                  </div>

                  <div className="font-black text-xl mt-2 text-emerald-700">
                    {formatNumber(collection.shippedQuantity ?? totalShipped)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <PackageX size={15} />
                    محجوز
                  </div>

                  <div className="font-black text-xl mt-2 text-orange-700">
                    {formatNumber(collection.reservedQuantity ?? totalReserved)}
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                MODELS
            ================================================= */}

            <section>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Layers3 size={19} className="text-[#0D2748]" />

                  <h3 className="text-lg font-black">موديلات الكولكشن</h3>
                </div>

                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                  {collectionModels.length} موديل
                </span>
              </div>

              {collectionModels.length === 0 ? (
                <EmptyState
                  icon={Layers3}
                  title="لا توجد موديلات"
                  description="لا توجد موديلات مرتبطة بهذا الكولكشن."
                />
              ) : (
                <div className="space-y-3">
                  {collectionModels.map((model) => {
                    const techPack = getTechPackForModel(model.id);

                    const quantity = getModelQuantity(model.id);

                    const isTechPackOpen = openTechPack === model.id;

                    const content = getTechPackContent(techPack);

                    const hasTechPackContent =
                      techPack && Object.keys(content).length > 0;

                    return (
                      <div
                        key={model.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
                      >
                        {/* MODEL HEADER */}

                        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              {model.image_url ? (
                                <img
                                  src={model.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Boxes size={25} className="text-slate-300" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-black text-base">
                                {model.name || "موديل بدون اسم"}
                              </h4>

                              <p className="text-xs text-slate-400 mt-1">
                                كود الموديل:{" "}
                                <span className="font-bold text-slate-600">
                                  {model.model_number || "-"}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* MODEL BUTTONS */}

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="h-10 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-black flex items-center gap-2">
                              <Package size={15} />
                              {formatNumber(quantity)} قطعة
                            </div>

                            {techPack ? (
                              <>
                                {/* VIEW */}

                                <button
                                  onClick={() =>
                                    setOpenTechPack(
                                      isTechPackOpen ? null : model.id,
                                    )
                                  }
                                  className="h-10 px-4 rounded-xl bg-[#0D2748] hover:bg-[#163A65] text-white text-xs font-black flex items-center justify-center gap-2 transition"
                                >
                                  <FileText size={15} />

                                  {isTechPackOpen
                                    ? "إخفاء التيك باك"
                                    : "عرض التيك باك"}

                                  {isTechPackOpen ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                </button>

                                {/* PRINT */}

                                {hasTechPackContent && (
                                  <button
                                    onClick={() =>
                                      startPrintingTechPack(model, techPack)
                                    }
                                    className="h-10 px-4 rounded-xl bg-[#C62828] hover:bg-[#A91F1F] text-white text-xs font-black flex items-center justify-center gap-2 transition"
                                  >
                                    <Printer size={15} />
                                    طباعة / PDF
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="h-10 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-2">
                                <FileText size={15} />
                                لا يوجد تيك باك
                              </span>
                            )}
                          </div>
                        </div>

                        {/* =================================================
                              TECH PACK VIEW
                          ================================================= */}

                        {techPack && isTechPackOpen && (
                          <div className="border-t border-slate-200 bg-slate-50 p-4 md:p-5">
                            <div className="flex items-center justify-between gap-3 mb-5">
                              <div className="flex items-center gap-2">
                                <FileText
                                  size={18}
                                  className="text-[#0D2748]"
                                />

                                <h5 className="font-black text-base">
                                  بيانات التيك باك
                                </h5>
                              </div>

                              {techPack.version && (
                                <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500">
                                  الإصدار {techPack.version}
                                </span>
                              )}
                            </div>

                            {!hasTechPackContent ? (
                              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                                <FileText
                                  size={35}
                                  className="mx-auto text-slate-300 mb-3"
                                />

                                <h4 className="font-black text-slate-600">
                                  لا توجد بيانات للتيك باك
                                </h4>

                                <p className="text-xs text-slate-400 mt-1">
                                  لا يوجد محتوى محفوظ في عمود content.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {Object.entries(content).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                                  >
                                    <div className="px-5 py-4 bg-[#0D2748] text-white flex items-center gap-2">
                                      {isImageKey(key) ? (
                                        <ImageIcon size={17} />
                                      ) : (
                                        <ClipboardList size={17} />
                                      )}

                                      <h6 className="font-black text-sm">
                                        {formatKey(key)}
                                      </h6>
                                    </div>

                                    <div className="p-4">
                                      {renderTechPackValue(
                                        value,
                                        key,
                                        0,
                                        false,
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* =================================================
                QUOTATION
            ================================================= */}

            {quotation && (
              <section>
                <div className="space-y-4">
                  {quotation.payment_execution_terms && (
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={17} className="text-[#0D2748]" />

                        <h4 className="font-black">شروط الدفع والتنفيذ</h4>
                      </div>

                      <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                        {quotation.payment_execution_terms}
                      </p>
                    </div>
                  )}

                  {quotation.notes && (
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={17} className="text-[#0D2748]" />

                        <h4 className="font-black">ملاحظات</h4>
                      </div>

                      <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                        {quotation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="shrink-0 border-t border-slate-200 bg-white px-5 md:px-7 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="h-11 px-6 rounded-xl bg-[#0D2748] hover:bg-[#163A65] text-white font-black text-sm transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          HIDDEN PRINT CONTENT
          ===================================================== */}

      {printingTechPack && (
        <div ref={techPackPrintRef} className="tp-print-root" dir="rtl">
          {/* HEADER */}

          <div className="tp-print-header">
            <h1 className="tp-print-logo-title">الصحابة</h1>

            <div className="tp-print-subtitle">ملف فني للمنتج — Tech Pack</div>
          </div>

          {/* MODEL INFO */}

          <div className="tp-print-model-info">
            <div className="tp-print-info-card">
              <div className="tp-print-info-label">اسم الموديل</div>

              <div className="tp-print-info-value">
                {printingTechPack.model?.name || "-"}
              </div>
            </div>

            <div className="tp-print-info-card">
              <div className="tp-print-info-label">كود الموديل</div>

              <div className="tp-print-info-value">
                {printingTechPack.model?.model_number || "-"}
              </div>
            </div>

            <div className="tp-print-info-card">
              <div className="tp-print-info-label">إصدار التيك باك</div>

              <div className="tp-print-info-value">
                {printingTechPack.techPack?.version || "-"}
              </div>
            </div>

            <div className="tp-print-info-card">
              <div className="tp-print-info-label">تاريخ الإنشاء</div>

              <div className="tp-print-info-value">
                {printingTechPack.techPack?.created_at
                  ? new Date(
                      printingTechPack.techPack.created_at,
                    ).toLocaleDateString("ar-EG")
                  : "-"}
              </div>
            </div>
          </div>

          {/* MAIN IMAGE */}

          {printingTechPack.model?.image_url && (
            <div className="tp-print-section">
              <div className="tp-print-section-header">الصورة الرئيسية</div>

              <div className="tp-print-section-content">
                <div className="tp-print-image-wrapper">
                  <img
                    src={printingTechPack.model.image_url}
                    alt=""
                    className="tp-print-image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TECH PACK CONTENT */}

          {Object.entries(printingTechPack.content).map(([key, value]) => (
            <div key={key} className="tp-print-section">
              <div className="tp-print-section-header">{formatKey(key)}</div>

              <div className="tp-print-section-content">
                {renderTechPackValue(value, key, 0, true)}
              </div>
            </div>
          ))}

          {/* FOOTER */}

          <div className="tp-print-footer">
            <span className="tp-print-footer-brand">الصحابة</span>

            <span>
              Tech Pack — {printingTechPack.model?.model_number || ""}
            </span>

            <span>{new Date().toLocaleDateString("ar-EG")}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectionModal;
