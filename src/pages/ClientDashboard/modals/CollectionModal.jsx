import React, { useState } from "react";
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
  Calculator,
  Banknote,
  ClipboardList,
  AlertCircle,
  Truck,
  Image as ImageIcon,
} from "lucide-react";

import { formatNumber } from "../utils";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

const CollectionModal = ({ collection, onClose }) => {
  const [openTechPack, setOpenTechPack] = useState(null);

  if (!collection) return null;

  /* =========================================================
     Helpers
  ========================================================= */

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

  const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    return `${number.toLocaleString("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} جنيه`;
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
    تحويل أسماء الـ keys لشكل مفهوم للمستخدم
    بدون تغيير البيانات الأصلية.
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

  const isImageUrl = (value) => {
    if (typeof value !== "string") return false;

    return (
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("blob:")) &&
      (/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(value) ||
        value.includes("cloudinary.com") ||
        value.includes("image/upload"))
    );
  };

  const isUrl = (value) => {
    if (typeof value !== "string") return false;

    return value.startsWith("http://") || value.startsWith("https://");
  };

  /*
    تحديد إذا كانت الـ key مرتبطة بصورة.
  */
  const isImageKey = (key) => {
    const normalized = String(key).toLowerCase();

    return (
      normalized.includes("image") ||
      normalized.includes("photo") ||
      normalized.includes("picture")
    );
  };

  /* =========================================================
     Generic Tech Pack Renderer
     
     IMPORTANT:
     إحنا هنا لا نفترض شكل معين للـ content.
     أي حاجة موجودة في content هتظهر.
  ========================================================= */

  const renderTechPackValue = (value, key = "", level = 0) => {
    /*
      Null / Undefined
    */
    if (value === null || value === undefined || value === "") {
      return <span className="text-slate-400">-</span>;
    }

    /*
      Boolean
    */
    if (typeof value === "boolean") {
      return (
        <span
          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
            value
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {value ? "نعم" : "لا"}
        </span>
      );
    }

    /*
      Number
    */
    if (typeof value === "number") {
      return (
        <span className="font-bold text-slate-700">{formatNumber(value)}</span>
      );
    }

    /*
      String
    */
    if (typeof value === "string") {
      /*
        صورة
      */
      if (isImageKey(key) && isUrl(value)) {
        return (
          <div className="mt-2">
            <img
              src={value}
              alt=""
              className="max-w-full max-h-[320px] rounded-xl object-contain border border-slate-200 bg-white"
            />
          </div>
        );
      }

      /*
        URL عادي
      */
      if (isUrl(value)) {
        return (
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
        Text
      */
      return (
        <span className="text-sm leading-7 text-slate-700 whitespace-pre-wrap break-words">
          {value}
        </span>
      );
    }

    /*
      Array
    */
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-400 text-sm">لا توجد بيانات</span>;
      }

      /*
        Array صور
      */
      const allImages = value.every(
        (item) => typeof item === "string" && isUrl(item),
      );

      if (allImages) {
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {value.map((item, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden border border-slate-200 bg-white"
              >
                <img src={item} alt="" className="w-full h-36 object-cover" />
              </div>
            ))}
          </div>
        );
      }

      /*
        Array primitive values
        مثل:
        ["S", "M", "L"]
        ["بينك", "أسود"]
      */
      const allPrimitive = value.every(
        (item) =>
          item === null || item === undefined || typeof item !== "object",
      );

      if (allPrimitive) {
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
              >
                {getValue(item)}
              </span>
            ))}
          </div>
        );
      }

      /*
        Array of Objects
      */
      return (
        <div className="space-y-3 mt-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              {typeof item === "object" && item !== null ? (
                <div className="space-y-3">
                  {Object.entries(item).map(([childKey, childValue]) => (
                    <div
                      key={childKey}
                      className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2"
                    >
                      <div className="text-[11px] text-slate-400 font-bold">
                        {formatKey(childKey)}
                      </div>

                      <div>
                        {renderTechPackValue(childValue, childKey, level + 1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderTechPackValue(item, key, level + 1)
              )}
            </div>
          ))}
        </div>
      );
    }

    /*
      Object
    */
    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);

      if (entries.length === 0) {
        return <span className="text-slate-400">لا توجد بيانات</span>;
      }

      return (
        <div className={`space-y-3 ${level > 0 ? "mt-2" : ""}`}>
          {entries.map(([childKey, childValue]) => (
            <div
              key={childKey}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="text-xs font-black text-[#0D2748] mb-2">
                {formatKey(childKey)}
              </div>

              {renderTechPackValue(childValue, childKey, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-sm text-slate-700">{String(value)}</span>;
  };

  /* =========================================================
     Models
  ========================================================= */

  const collectionModels = Array.isArray(collection.models)
    ? collection.models
    : [];

  /* =========================================================
     Production Order Items

     المصدر:
     production_order_items
  ========================================================= */

  const collectionOrderItems = Array.isArray(collection.orderItems)
    ? collection.orderItems
    : [];

  /*
    حساب كمية الموديل

    لو quantity موجودة في الـ items:
    نجمع quantity.

    لو quantity غير موجودة:
    نستخدم total_quantity كـ fallback.
  */
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

  /*
    إجمالي كمية الكولكشن
  */
  const calculatedTotalQuantity = collectionModels.reduce(
    (sum, model) => sum + getModelQuantity(model.id),
    0,
  );

  /* =========================================================
     Inventory
  ========================================================= */

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

  /* =========================================================
     Tech Packs

     collection.techPacks:
     {
       modelId: techPack
     }
  ========================================================= */

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

  /* =========================================================
     Tech Pack Content

     IMPORTANT:
     content هو المصدر الوحيد.
     file_url يتم تجاهله.
  ========================================================= */

  const getTechPackContent = (techPack) => {
    if (!techPack?.content) {
      return {};
    }

    return safeObject(techPack.content);
  };

  /* =========================================================
     Quotation
  ========================================================= */

  const quotation = collection.quotation || null;

  const quotationItems = Array.isArray(quotation?.quotation_items)
    ? quotation.quotation_items
    : [];

  const quotationExists = !!quotation;

  const quotationStatus = quotation?.status || null;

  const quotationStatusText = {
    draft: "مسودة",
    sent: "تم الإرسال",
    revision_requested: "مطلوب تعديل",
    revised: "تم التعديل",
    approved: "معتمد",
    rejected: "مرفوض",
  };

  /* =========================================================
     Get quotation item
  ========================================================= */

  const getQuotationItem = (modelId) => {
    return quotationItems.find((item) => item.model_id === modelId) || null;
  };

  /* =========================================================
     Model Price
  ========================================================= */

  const getModelSellingPrice = (modelId) => {
    const item = getQuotationItem(modelId);

    if (!item) {
      return 0;
    }

    return Number(item.selling_price) || 0;
  };

  /*
    Model Total =
    Selling Price × Production Quantity
  */
  const getModelTotalPrice = (modelId) => {
    const quantity = getModelQuantity(modelId);

    const sellingPrice = getModelSellingPrice(modelId);

    return quantity * sellingPrice;
  };

  /*
    Collection Total =
    SUM(Model Total)
  */
  const calculatedQuotationTotal = quotation
    ? collectionModels.reduce(
        (sum, model) => sum + getModelTotalPrice(model.id),
        0,
      )
    : 0;

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden bg-white rounded-[2rem] shadow-2xl flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            Header
        ===================================================== */}

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

        {/* =====================================================
            Body
        ===================================================== */}

        <div className="overflow-y-auto p-4 md:p-7 space-y-7">
          {/* ===================================================
              Collection Summary
          =================================================== */}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Boxes size={19} className="text-[#0D2748]" />

              <h3 className="text-lg font-black">ملخص الكولكشن</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Quantity */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Package size={15} />
                  إجمالي القطع
                </div>

                <div className="font-black text-xl mt-2 text-[#0D2748]">
                  {formatNumber(calculatedTotalQuantity)}
                </div>
              </div>

              {/* Available */}

              <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <PackageCheck size={15} />
                  بالمخزن
                </div>

                <div className="font-black text-xl mt-2 text-blue-700">
                  {formatNumber(collection.availableQuantity ?? totalInventory)}
                </div>
              </div>

              {/* Shipped */}

              <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <Truck size={15} />
                  تم الشحن
                </div>

                <div className="font-black text-xl mt-2 text-emerald-700">
                  {formatNumber(collection.shippedQuantity ?? totalShipped)}
                </div>
              </div>

              {/* Reserved */}

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

          {/* ===================================================
              Models
          =================================================== */}

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

                  const quotationItem = getQuotationItem(model.id);

                  const quantity = getModelQuantity(model.id);

                  const sellingPrice = getModelSellingPrice(model.id);

                  const modelTotal = quantity * sellingPrice;

                  const isTechPackOpen = openTechPack === model.id;

                  const content = getTechPackContent(techPack);

                  const hasTechPackContent =
                    techPack && Object.keys(content).length > 0;

                  return (
                    <div
                      key={model.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
                    >
                      {/* =============================================
                            Model Header
                        ============================================= */}

                      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        {/* Model Info */}

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

                        {/* =============================================
                              Model Data
                          ============================================= */}

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Quantity */}

                          <div className="h-10 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-black flex items-center gap-2">
                            <Package size={15} />
                            {formatNumber(quantity)} قطعة
                          </div>

                          {/* Tech Pack */}

                          {techPack ? (
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
                          ) : (
                            <span className="h-10 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-2">
                              <FileText size={15} />
                              لا يوجد تيك باك
                            </span>
                          )}

                          {/* Unit Price */}

                          {quotationItem && (
                            <div className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black flex items-center gap-2">
                              <Banknote size={15} />

                              {formatMoney(sellingPrice)}
                            </div>
                          )}

                          {/* Model Total */}

                          {quotationItem && (
                            <div className="h-10 px-4 rounded-xl bg-green-100 text-green-800 text-xs font-black flex items-center gap-2">
                              <Calculator size={15} />

                              {formatMoney(modelTotal)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =============================================
                            Tech Pack Content
                            
                            IMPORTANT:
                            هنا بنعرض content نفسه بالكامل.
                            file_url غير مستخدم.
                        ============================================= */}

                      {techPack && isTechPackOpen && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 md:p-5">
                          <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="text-[#0D2748]" />

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
                                  {/* Section Header */}

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

                                  {/* Section Content */}

                                  <div className="p-4">
                                    {renderTechPackValue(value, key, 0)}
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

          {/* ===================================================
              Quotation
          =================================================== */}

          <section>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator size={19} className="text-[#0D2748]" />

                <h3 className="text-lg font-black">عرض السعر</h3>
              </div>

              {quotationStatus && <StatusBadge status={quotationStatus} />}
            </div>

            {!quotationExists ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
                <AlertCircle
                  size={30}
                  className="mx-auto text-slate-300 mb-3"
                />

                <h4 className="font-black text-slate-600">لا يوجد عرض سعر</h4>

                <p className="text-xs text-slate-400 mt-1">
                  لم يتم إنشاء عرض سعر لهذا الكولكشن بعد.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* =============================================
                    Quotation Header
                ============================================= */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Quotation Number */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="text-xs text-slate-400">رقم عرض السعر</div>

                    <div className="font-black mt-2">
                      {quotation.quotation_number || "-"}
                    </div>
                  </div>

                  {/* Status */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="text-xs text-slate-400">حالة العرض</div>

                    <div className="font-black mt-2">
                      {quotationStatusText[quotation.status] ||
                        quotation.status ||
                        "-"}
                    </div>
                  </div>

                  {/* Total */}

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <div className="text-xs text-emerald-600">
                      إجمالي سعر البيع
                    </div>

                    <div className="font-black text-xl text-emerald-700 mt-2">
                      {formatMoney(calculatedQuotationTotal)}
                    </div>
                  </div>
                </div>

                {/* =============================================
                    Model Prices
                ============================================= */}

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-4 bg-[#0D2748] text-white">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={18} />

                      <h4 className="font-black">أسعار الموديلات</h4>
                    </div>
                  </div>

                  {quotationItems.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      لا توجد تفاصيل أسعار للموديلات.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-right">الموديل</th>

                            <th className="px-4 py-3 text-center">الكمية</th>

                            <th className="px-4 py-3 text-center">
                              سعر القطعة
                            </th>

                            <th className="px-4 py-3 text-center">الإجمالي</th>
                          </tr>
                        </thead>

                        <tbody>
                          {collectionModels.map((model) => {
                            const item = getQuotationItem(model.id);

                            if (!item) {
                              return null;
                            }

                            const quantity = getModelQuantity(model.id);

                            const sellingPrice =
                              Number(item.selling_price) || 0;

                            const total = quantity * sellingPrice;

                            return (
                              <tr
                                key={model.id}
                                className="border-b border-slate-100"
                              >
                                {/* Model */}

                                <td className="px-4 py-4 font-black">
                                  {model.name || "غير محدد"}
                                </td>

                                {/* Quantity */}

                                <td className="px-4 py-4 text-center font-bold">
                                  {formatNumber(quantity)}
                                </td>

                                {/* Unit Price */}

                                <td className="px-4 py-4 text-center font-bold text-[#0D2748]">
                                  {formatMoney(sellingPrice)}
                                </td>

                                {/* Model Total */}

                                <td className="px-4 py-4 text-center font-black text-emerald-700">
                                  {formatMoney(total)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {/* =========================================
                            Collection Total
                        ========================================= */}

                        <tfoot>
                          <tr className="bg-emerald-50">
                            <td
                              colSpan="3"
                              className="px-4 py-4 text-right font-black"
                            >
                              إجمالي عرض السعر
                            </td>

                            <td className="px-4 py-4 text-center font-black text-emerald-700">
                              {formatMoney(calculatedQuotationTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* =============================================
                    Terms
                ============================================= */}

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

                {/* =============================================
                    Notes
                ============================================= */}

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
            )}
          </section>
        </div>

        {/* =====================================================
            Footer
        ===================================================== */}

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
  );
};

export default CollectionModal;
