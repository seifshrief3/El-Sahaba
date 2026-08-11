import React from "react";
import logo from "../assets/logo.jpeg";

/* ============================================================
   Helpers
============================================================ */

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
    return value
      .map((item) => safeText(item, ""))
      .filter(Boolean)
      .join("، ");
  }
  if (typeof value === "object") {
    return Object.keys(value)
      .map((key) => String(key))
      .join("، ");
  }
  return fallback;
};

/* ============================================================
   Variant Helper
============================================================ */
const getVariantName = (variant) => {
  if (!variant || !Array.isArray(variant.components)) return "غير محدد";
  return variant.components
    .map((c) => {
      const partStr = c.part ? `${c.part}: ` : "";
      return `${partStr}${c.color}`;
    })
    .join(" + ");
};

/* ============================================================
   Component
============================================================ */

const WorkOrderPDFTemplate = React.forwardRef(({ data, seriesCount }, ref) => {
  if (!data) return null;

  const models = Array.isArray(data.models) ? data.models : [];
  let grandTotal = 0;
  const modelTotals = {};
  const variantTotals = {}; // بديل للـ colorTotals القديمة

  /* ========================================================
       Calculate Totals
    ======================================================== */

  models.forEach((model) => {
    const variants = Array.isArray(model.variants) ? model.variants : [];
    const sizes = Array.isArray(model.sizes) ? model.sizes : [];

    let modelTotal = 0;

    variants.forEach((variant) => {
      let variantQty = 0;

      sizes.forEach((size) => {
        const series =
          Number(seriesCount?.[model.id]?.[variant.variantKey]?.[size]) || 0;
        variantQty += series;
        modelTotal += series;
        grandTotal += series;
      });

      const vName = getVariantName(variant);
      variantTotals[vName] = (variantTotals[vName] || 0) + variantQty;
    });

    modelTotals[model.id] = modelTotal;
  });

  /* ========================================================
       Render
    ======================================================== */

  return (
    <div
      ref={ref}
      className="bg-white font-arabic p-6"
      style={{
        direction: "rtl",
        color: "#1a365d",
      }}
    >
      <style>
        {`
            @page {
              size: A4 portrait;
              margin: 5mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .page-break-avoid {
                page-break-inside: avoid;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                text-align: center;
              }
              th, td {
                border: 1.5px solid #1a365d;
                padding: 4px;
                font-size: 11px;
                font-weight: bold;
              }
              th {
                background-color: #1a365d;
                color: white;
              }
            }
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: center;
            }
            th, td {
              border: 1.5px solid #1a365d;
              padding: 4px;
              font-size: 11px;
              font-weight: bold;
            }
            th {
              background-color: #1a365d;
              color: white;
            }
          `}
      </style>

      {/* ================= Header ================= */}
      <div className="flex justify-between items-center border-b-2 border-[#1a365d] pb-2 mb-4">
        <div className="flex-1 text-sm font-bold leading-relaxed text-[#1a365d]">
          <div>
            رقم أمر التشغيل: WO-{safeText(data.brandCode)}-
            {safeText(data.id).substring(0, 4).toUpperCase()}-01
          </div>
          <div>تاريخ الإصدار: {new Date().toLocaleDateString("en-GB")}</div>
          <div>
            تاريخ التسليم المطلوب:{" "}
            <span className="text-[#b91c1c]">يحدد لاحقاً</span>
          </div>
          <div>الإصدار: 01</div>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-black mb-1 text-[#1a365d]">
            أمر تشغيل إنتاج
          </h1>
          <h2 className="text-sm font-bold bg-[#1a365d]/10 text-[#1a365d] inline-block px-4 py-1 border border-[#1a365d] rounded-md">
            موجه إلى قسم التخطيط
          </h2>
          <div className="text-[11px] text-[#b91c1c] font-bold mt-2">
            موعد التسليم النهائي ملزم
          </div>
        </div>
        <div className="flex-1 flex flex-col items-end text-center">
          <img
            src={logo}
            alt="لوجو الشركة"
            className="max-w-[150px] max-h-[150px] object-contain z-10"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* ================= بيانات الأمر ================= */}
      <div className="mb-4">
        <table className="mb-2">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الفئة</th>
              <th>الموسم</th>
              <th>عدد الموديلات</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[#b91c1c] font-black">
                {safeText(data.brandName)}
              </td>
              <td>{safeText(data.collectionName)}</td>
              <td>خريف / شتاء</td>
              <td>{models.length} موديلات</td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>تاريخ الإصدار</th>
              <th>مرجع الأوراق الفنية</th>
              <th>القسم المسؤول</th>
              <th>حالة الأمر</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{new Date().toLocaleDateString("en-GB")}</td>
              <td className="text-[10px]">TP-{safeText(data.brandCode)}-01</td>
              <td>قسم التخطيط</td>
              <td className="text-emerald-700 font-bold">
                قيد التنفيذ - بانتظار خطة الإنتاج
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= الموديلات ================= */}
      {models.map((model) => {
        const variants = Array.isArray(model.variants) ? model.variants : [];
        const sizes = Array.isArray(model.sizes) ? model.sizes : [];
        const modelTotal = modelTotals[model.id] || 0;

        return (
          <div
            key={model.id}
            className="page-break-avoid border-2 border-[#1a365d] p-2 mb-4 rounded-md"
          >
            {/* Model Header */}
            <div className="grid grid-cols-2 gap-2 mb-2 bg-[#1a365d]/5 p-2 border border-[#1a365d]/30 rounded">
              <div>
                <div className="text-sm font-black text-[#b91c1c] mb-1">
                  موديل {safeText(model.model_number)} | {safeText(model.name)}
                </div>
                <div className="text-xs font-bold text-[#1a365d]">
                  عدد التركيبات: {variants.length}
                </div>
              </div>
              <div className="text-left text-xs font-bold leading-relaxed text-[#1a365d]">
                <div>الخامة: {safeText(model.fabric, "غير محدد")}</div>
                <div>وزن الخامة: {safeText(model.weight, "غير محدد")}</div>
                <div>الموسم: خريف / شتاء</div>
              </div>
            </div>

            {/* Product Image */}
            <div className="mb-3">
              <div className="bg-[#1a365d] text-white text-center text-xs font-bold p-1 mb-1 rounded-t-sm">
                مناظير المنتج (أمامي / خلفي / جانبي) - مرجع{" "}
                {safeText(model.model_number)}
              </div>
              <div className="border border-[#1a365d] flex flex-col items-center bg-white p-1 relative rounded-sm h-40">
                <img
                  src={model.image_url || ""}
                  alt={`مناظير موديل ${safeText(model.model_number)}`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute bottom-0 w-full text-center bg-white/90 text-[10px] font-bold border-t border-[#1a365d] text-[#1a365d] py-0.5">
                  المنتج متاح بـ {variants.length} تركيبات
                </div>
              </div>
            </div>

            {/* Variants / Sizes */}
            <table>
              <thead>
                <tr>
                  <th className="w-40">التركيبة (الجزء / اللون)</th>
                  {sizes.map((size) => (
                    <th key={safeText(size)}>{safeText(size)}</th>
                  ))}
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, vIdx) => {
                  let variantQty = 0;
                  return (
                    <tr key={`${model.id}-${variant.variantKey}-${vIdx}`}>
                      <td className="text-[#1a365d] font-bold text-xs">
                        {getVariantName(variant)}
                      </td>
                      {sizes.map((size) => {
                        const series =
                          Number(
                            seriesCount?.[model.id]?.[variant.variantKey]?.[
                              size
                            ],
                          ) || 0;
                        variantQty += series;
                        return (
                          <td key={safeText(size)} className="text-[#1a365d]">
                            {series}
                          </td>
                        );
                      })}
                      <td className="text-[#b91c1c] font-black">
                        {variantQty}
                      </td>
                    </tr>
                  );
                })}
                {/* Model Total */}
                <tr>
                  <td
                    colSpan={sizes.length + 1}
                    className="text-left px-2 bg-[#1a365d]/5 text-[#1a365d]"
                  >
                    إجمالي موديل - {safeText(model.model_number)}
                  </td>
                  <td className="bg-[#1a365d]/10 text-[#b91c1c] text-sm font-black">
                    {modelTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {/* ================= ملخص الكميات ================= */}
      <div className="page-break-avoid border-2 border-[#1a365d] p-2 mb-4 rounded-md">
        <div className="bg-[#1a365d] text-white text-center font-bold text-sm p-1.5 mb-2 rounded-t-sm">
          ملخص إجمالي الكميات المطلوبة
        </div>
        <table className="border-0">
          <tbody>
            {models.map((model) => (
              <tr key={`sum-${model.id}`}>
                <td className="text-right border-0 border-b border-dashed border-[#1a365d]/30 text-[#1a365d] py-1">
                  إجمالي موديل - {safeText(model.model_number)} (
                  {safeText(model.name)})
                </td>
                <td className="border-0 border-b border-dashed border-[#1a365d]/30 w-32 text-[#1a365d] py-1">
                  {modelTotals[model.id] || 0} قطعة
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="border-0 h-3" />
            </tr>
            {Object.entries(variantTotals).map(([label, total]) => (
              <tr key={`vsum-${label}`}>
                <td className="text-right border-0 border-b border-dashed border-[#1a365d]/30 text-slate-600 py-1">
                  إجمالي "{safeText(label)}" على مستوى الكولكشن
                </td>
                <td className="border-0 border-b border-dashed border-[#1a365d]/30 text-slate-600 py-1">
                  {total} قطعة
                </td>
              </tr>
            ))}
            <tr>
              <td className="text-left font-black text-sm pt-3 border-0 text-[#1a365d]">
                الإجمالي الكلي للكميات المطلوب تشغيلها
              </td>
              <td className="font-black text-lg text-[#b91c1c] pt-3 border-0 bg-[#1a365d]/5">
                {grandTotal} قطعة
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= الملاحظات ================= */}
      <div className="page-break-avoid border-2 border-[#1a365d] p-3 rounded-md">
        <h4 className="font-bold underline text-[#b91c1c] text-sm mb-2">
          تعليمات وملاحظات لقسم التخطيط:
        </h4>
        <ul className="list-disc list-inside text-[11px] font-bold space-y-1 mb-6 text-[#1a365d]">
          <li>
            إعداد خطة القص والخياطة بناءً على الكميات الموضحة أعلاه لكل موديل
            وتركيبة ومقاس.
          </li>
          <li>
            الالتزام بمواصفات الخامة والمقاسات ونقاط الفحص الواردة في الأوراق
            الفنية المرجعية.
          </li>
          <li>
            تحديد أولوية التشغيل بما يضمن الالتزام بتاريخ التسليم المحدد أعلاه.
          </li>
          <li>التنسيق مع قسم الجودة لتنفيذ نقاط الفحص قبل التسليم.</li>
          <li>
            أي تعديل على الكميات يتطلب اعتماد قسم التخطيط قبل بدء التنفيذ.
          </li>
        </ul>
        <div className="grid grid-cols-4 gap-2 text-center mt-8">
          <div className="border-t-2 border-[#1a365d] pt-1 font-bold text-xs text-[#1a365d]">
            إعداد - قسم التخطيط
          </div>
          <div className="border-t-2 border-[#1a365d] pt-1 font-bold text-xs text-[#1a365d]">
            مراجعة - قسم الجودة
          </div>
          <div className="border-t-2 border-[#1a365d] pt-1 font-bold text-xs text-[#1a365d]">
            اعتماد - مدير الإنتاج
          </div>
          <div className="border-t-2 border-[#1a365d] pt-1 font-bold text-xs text-[#1a365d]">
            استلام - قسم التخطيط
          </div>
        </div>
        <div className="text-center text-[10px] mt-4 text-[#1a365d]/60 font-bold">
          صادر من قسم التخطيط والجودة - شركة الصحابة لإدارة وتصنيع الملابس
        </div>
      </div>
    </div>
  );
});

WorkOrderPDFTemplate.displayName = "WorkOrderPDFTemplate";
export default WorkOrderPDFTemplate;
