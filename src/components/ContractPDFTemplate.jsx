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
    return Object.keys(value).join("، ");
  }
  return fallback;
};

/* ============================================================
   Variant Helpers
============================================================ */

const getVariantPart = (variant) => {
  if (!variant || !Array.isArray(variant.components)) return "موديل كامل";
  const parts = variant.components.map((c) => c.part).filter(Boolean);
  return parts.length > 0 ? parts.join(" + ") : "موديل كامل";
};

const getVariantColor = (variant) => {
  if (!variant || !Array.isArray(variant.components)) return "غير محدد";
  const colors = variant.components.map((c) => c.color).filter(Boolean);
  return colors.length > 0 ? colors.join(" + ") : "غير محدد";
};

/* ============================================================
   Get Model Total
============================================================ */

const getModelTotal = (model, seriesCount) => {
  if (!Array.isArray(model?.variants) || !Array.isArray(model?.sizes)) {
    return 0;
  }

  return model.variants.reduce((total, variant) => {
    return (
      total +
      model.sizes.reduce((sizeTotal, size) => {
        const qty =
          Number(seriesCount?.[model.id]?.[variant.variantKey]?.[size]) || 0;
        return sizeTotal + qty;
      }, 0)
    );
  }, 0);
};

/* ============================================================
   Component
============================================================ */

const ContractPDFTemplate = React.forwardRef(({ data, seriesCount }, ref) => {
  if (!data) return null;

  let grandTotalQty = 0;
  let grandTotalValue = 0;

  const allColors = new Set();
  const allSizes = new Set();

  /* ========================================================
       حساب الإجماليات
    ======================================================== */

  (data.models || []).forEach((model) => {
    const variants = Array.isArray(model.variants) ? model.variants : [];
    const sizes = Array.isArray(model.sizes) ? model.sizes : [];

    sizes.forEach((size) => {
      allSizes.add(safeText(size));
    });

    // 💡 إضافة الإجمالي الخاص بالموديل مباشرة لقيمة العقد الإجمالية
    grandTotalValue += Number(model.approvedPrice) || 0;

    variants.forEach((variant) => {
      const part = getVariantPart(variant);
      const color = getVariantColor(variant);

      if (color !== "غير محدد") {
        allColors.add(part !== "موديل كامل" ? `${part}: ${color}` : color);
      }

      sizes.forEach((size) => {
        const quantity =
          Number(seriesCount?.[model.id]?.[variant.variantKey]?.[size]) || 0;

        grandTotalQty += quantity;
      });
    });
  });

  const advancePayment = grandTotalValue / 2;
  const remainingPayment = grandTotalValue / 2;
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString("ar-EG", { weekday: "long" });
  const formattedDate = dateObj.toLocaleDateString("en-GB");

  /* ========================================================
       JSX
    ======================================================== */

  return (
    <div
      ref={ref}
      className="bg-white font-arabic p-8"
      style={{
        direction: "rtl",
        color: "#000",
      }}
    >
      <style>
        {`
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .page-break-avoid {
                page-break-inside: avoid;
              }
            }

            .main-text {
              font-size: 11px;
            }

            .blue-text {
              color: #1a365d;
            }

            .red-text {
              color: #b91c1c;
            }

            .table-bordered {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin-bottom: 12px;
            }

            .table-bordered th,
            .table-bordered td {
              border: 1px solid #cbd5e1;
              padding: 6px;
            }

            .table-products th {
              background-color: #1a365d;
              color: #fff;
              text-align: center;
            }

            .table-products td {
              text-align: center;
              font-weight: bold;
            }

            .table-products .val-cell {
              color: #1a365d;
            }

            .table-terms {
              margin-top: 15px;
            }

            .table-terms td {
              text-align: right;
              font-size: 10px;
              padding: 8px;
              line-height: 1.6;
            }

            .table-terms .term-title {
              background-color: #f8fafc;
              font-weight: bold;
              width: 16%;
              text-align: center;
              color: #1a365d;
            }
          `}
      </style>

      {/* ================= Header ================= */}

      <div className="flex justify-between items-center mb-3">
        <div className="w-24 flex justify-start">
          {/* 💡 لوجو البراند هيظهر هنا لو موجود في الداتا */}
          {data.brandLogo && (
            <img
              src={data.brandLogo}
              alt={safeText(data.brandName)}
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>

        <div className="flex-1 text-center">
          <h1 className="text-[16px] font-black blue-text mb-2 tracking-wide">
            عقد تصنيع وتوريد زي مدرسي — شركة الصحابة لإدارة وتصنيع الملابس
          </h1>

          <h2 className="text-[10px] font-bold red-text">
            العميل: {safeText(data.brandName)}
            {" | "}
            تاريخ العقد: {formattedDate}
            {" | "}
            مرجع الملف الفني: TP-{safeText(data.brandCode)}-U01/U02/U03
          </h2>
        </div>

        <div className="w-24 flex justify-end">
          <img
            src={logo}
            alt="الصحابة"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      <div className="border-t-[3px] border-[#1a365d] mb-4"></div>

      {/* ================= الديباجة ================= */}

      <div className="main-text mb-4">
        <p className="font-bold mb-2">
          إنه في يوم {dayName} الموافق {formattedDate}م، تم الاتفاق والتعاقد بين
          كل من:
        </p>

        <div className="border border-slate-300 p-2 mb-2 bg-slate-50 flex flex-col gap-2">
          <p>
            <span className="font-bold blue-text text-xs">الطرف الأول:</span>{" "}
            شركة الصحابة لإدارة وتصنيع الملابس، ويمثلها في توقيع هذا العقد
            السيد/ة:
            <span className="text-transparent"> ____________________</span>{" "}
            <span className="font-bold blue-text">بصفته/ا:</span>{" "}
            <span className="text-transparent">____________________</span>
          </p>

          <p>
            <span className="font-bold blue-text text-xs">الطرف الثاني:</span>{" "}
            {safeText(data.brandName)}، ويمثلها السيد/ة: أ. أحمد صبري{" "}
            <span className="font-bold blue-text">بصفته/ا:</span>{" "}
            <span className="text-transparent">____________________</span>،{" "}
            <span className="font-bold blue-text">سجل تجاري/رقم رسمي:</span>{" "}
            <span className="text-transparent">____________________</span>
          </p>
        </div>

        <p className="text-[9px] text-slate-500 font-bold mt-2">
          وقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة قانوناً، على الالتزام
          الكامل بكافة ما ورد في هذا العقد وملحقه الفني باعتبارها جزءاً لا يتجزأ
          منه، وذلك على النحو التالي:
        </p>
      </div>

      {/* ================= المنتجات ================= */}

      <table className="table-bordered table-products">
        <thead>
          <tr>
            <th colSpan="6" className="text-right px-3 py-1.5 text-xs">
              موضوع العقد — المنتجات والكميات والأسعار
            </th>
          </tr>

          <tr>
            <th className="w-20">كود الموديل</th>
            <th>المنتج</th>
            <th>الخامة</th>
            <th>الكمية (قطعة)</th>
            <th>سعر الوحدة (ج.م)</th>
            <th>الإجمالي (ج.م)</th>
          </tr>
        </thead>

        <tbody>
          {(data.models || []).map((model, idx) => {
            const qty = getModelTotal(model, seriesCount);

            // 💡 السعر الإجمالي اللي جاي من الداتابيز
            const total = Number(model.approvedPrice) || 0;
            // 💡 حساب متوسط سعر القطعة الواحدة
            const unitPrice = qty > 0 ? total / qty : total;

            return (
              <tr key={model.id || idx}>
                <td className="val-cell">{safeText(model.model_number)}</td>

                <td className="val-cell">{safeText(model.name)}</td>

                <td className="val-cell">
                  {safeText(model.fabric, "غير محدد")}{" "}
                  {safeText(model.weight, "")}
                </td>

                <td className="val-cell">{qty}</td>

                <td className="val-cell">
                  {unitPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="val-cell font-black">
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}

          <tr className="bg-[#fee2e2]">
            <td colSpan="5" className="text-center font-bold text-[#b91c1c]">
              الإجمالي — {grandTotalQty} قطعة
              {" | "}
              الأجزاء والألوان: {Array.from(allColors).join(" / ")}
              {" | "}
              المقاسات: {Array.from(allSizes).join(" - ")}
            </td>

            <td className="font-black text-[#b91c1c] text-[11px]">
              {grandTotalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= تفاصيل الموديلات ================= */}

      <div className="mb-4">
        <div className="bg-[#1a365d] text-white text-center font-bold text-xs p-2">
          تفاصيل الموديلات والأجزاء والألوان والكميات
        </div>

        {(data.models || []).map((model) => {
          const variants = Array.isArray(model.variants) ? model.variants : [];
          const sizes = Array.isArray(model.sizes) ? model.sizes : [];

          return (
            <div
              key={`details-${model.id}`}
              className="border border-[#1a365d] border-t-0"
            >
              <div className="bg-slate-50 p-2 font-bold text-[#1a365d] text-xs">
                موديل {safeText(model.model_number)}
                {" — "}
                {safeText(model.name)}
              </div>

              <table className="table-bordered mb-0">
                <thead>
                  <tr>
                    <th>الجزء</th>
                    <th>اللون</th>

                    {sizes.map((size) => (
                      <th key={safeText(size)}>{safeText(size)}</th>
                    ))}

                    <th>الإجمالي</th>
                  </tr>
                </thead>

                <tbody>
                  {variants.map((variant, index) => {
                    const part = getVariantPart(variant);
                    const color = getVariantColor(variant);

                    const rowTotal = sizes.reduce(
                      (total, size) =>
                        total +
                        (Number(
                          seriesCount?.[model.id]?.[variant.variantKey]?.[size],
                        ) || 0),
                      0,
                    );

                    return (
                      <tr key={`${model.id}-${variant.variantKey}-${index}`}>
                        <td className="val-cell">
                          {safeText(part, "موديل كامل")}
                        </td>

                        <td className="val-cell">
                          {safeText(color, "غير محدد")}
                        </td>

                        {sizes.map((size) => (
                          <td key={safeText(size)} className="val-cell">
                            {Number(
                              seriesCount?.[model.id]?.[variant.variantKey]?.[
                                size
                              ],
                            ) || 0}
                          </td>
                        ))}

                        <td className="font-black text-[#b91c1c]">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* ================= الشروط ================= */}

      <table className="table-bordered table-terms page-break-avoid">
        <tbody>
          <tr>
            <td className="term-title">موضوع العقد</td>

            <td>
              يتعهد الطرف الأول بتصنيع وتوريد الكمية والمواصفات الموضحة أعلاه
              للطرف الثاني، وفق آلية العمل المعتمدة لدى الشركة (اعتماد التصميم،
              العينة، الإنتاج، الجودة، التسليم)، والملف الفني المعتمد من الطرفين
              الملحق بهذا العقد ويُعد جزءاً لا يتجزأ منه.
            </td>
          </tr>

          <tr>
            <td className="term-title">الكميات</td>

            <td>
              يحق للطرف الأول تسليم الكمية المتعاقد عليها بنسبة سماحية زيادة أو
              نقصاً لا تتجاوز ±3%، مع إجراء التسوية المالية المقابلة وفقاً لسعر
              الوحدة أعلاه، ولا يُعد ذلك إخلالاً بالعقد.
            </td>
          </tr>

          <tr>
            <td className="term-title">السعر وطريقة السداد</td>

            <td>
              السعر الإجمالي{" "}
              {grandTotalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              جنيه مصري، يُسدد على دفعتين: 50% دفعة مقدمة (
              {advancePayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ج.م) عند التوقيع، و50% الباقي (
              {remainingPayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ج.م) قبل التسليم النهائي. لا يبدأ التنفيذ الفعلي إلا بعد استلام
              الدفعة المقدمة كاملة.
            </td>
          </tr>

          <tr>
            <td className="term-title">مدة التنفيذ والتسليم</td>

            <td>
              يلتزم الطرف الأول بتسليم الطلب كاملاً في الموعد المتفق عليه، وتبدأ
              مدة التنفيذ من تاريخ استلام الدفعة المقدمة واعتماد العينة
              والمقاسات معاً.
            </td>
          </tr>

          <tr>
            <td className="term-title">الضمان</td>

            <td>
              يضمن الطرف الأول سلامة القطع المصنعة من عيوب التصنيع فقط، لمدة
              ____ يوماً من تاريخ التسليم الفعلي.
            </td>
          </tr>

          <tr>
            <td className="term-title">الاستلام والاستبدال</td>

            <td>
              يوقع الطرفان عند التسليم على محضر استلام يثبت الكمية المسلمة
              وحالتها.
            </td>
          </tr>

          <tr>
            <td className="term-title">التعديلات</td>

            <td>
              أي طلب تعديل على المواصفات أو الكميات بعد اعتماد العينة و/أو بدء
              الإنتاج يُحتسب له تكلفة إضافية ويمدد أجل التنفيذ بما يلزم.
            </td>
          </tr>

          <tr>
            <td className="term-title">القوة القاهرة والسرية</td>

            <td>
              لا يُعد أي من الطرفين مخالفاً لالتزاماته حال تعذر التنفيذ لظروف
              قاهرة خارجة عن إرادته. ويلتزم الطرفان بسرية كافة المعلومات
              والتصاميم والأسعار.
            </td>
          </tr>

          <tr>
            <td className="term-title">القانون المختص ونسخ العقد</td>

            <td>
              يخضع الطرفان للقوانين المعمول بها في __________، وتختص بالفصل في
              أي نزاع محاكم __________.
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= التوقيعات ================= */}

      <table className="table-bordered page-break-avoid mt-4">
        <thead>
          <tr>
            <th className="bg-[#1a365d] text-white w-1/2 p-2">
              عن الطرف الثاني — {safeText(data.brandName)}
            </th>

            <th className="bg-[#1a365d] text-white w-1/2 p-2">
              عن الطرف الأول — شركة الصحابة لإدارة وتصنيع الملابس
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="text-right p-4 align-top">
              <div className="space-y-4 font-bold text-[11px] blue-text">
                <p>الاسم: أ. أحمد صبري</p>

                <p>
                  التوقيع والختم:
                  <span className="text-transparent">
                    {" "}
                    ______________________
                  </span>
                </p>

                <p>التاريخ: {formattedDate}</p>
              </div>
            </td>

            <td className="text-right p-4 align-top">
              <div className="space-y-4 font-bold text-[11px] blue-text">
                <p>
                  الاسم:
                  <span className="text-transparent">
                    {" "}
                    ______________________
                  </span>
                </p>

                <p>
                  التوقيع والختم:
                  <span className="text-transparent">
                    {" "}
                    ______________________
                  </span>
                </p>

                <p>التاريخ: {formattedDate}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

ContractPDFTemplate.displayName = "ContractPDFTemplate";

export default ContractPDFTemplate;
