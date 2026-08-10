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

const getFirstValidArray = (...values) => {
  for (const value of values) {
    const result = normalizeToStrings(value);

    if (result.length > 0) {
      return result;
    }
  }

  return [];
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
    الشكل النهائي:

    {
      modelId: {
        "بينك": 5,
        "كحلي": 7,
        "بيج": 3
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

        const formattedModels = (orderData.models || []).map((m, index) => {
          /* ================= Tech Pack ================= */

          const tpContent = Array.isArray(m.tech_packs)
            ? m.tech_packs[0]?.content
            : m.tech_packs?.content;

          const info = tpContent?.basic_info || tpContent || {};

          /* ================= Colors ================= */

          let finalColors = getFirstValidArray(m.colors, info.colors);

          if (finalColors.length === 0) {
            finalColors = ["كحلي", "أسود", "رمادي"];
          }

          finalColors = finalColors
            .map((color) => safeText(color, ""))
            .filter(Boolean);

          /* ================= Sizes ================= */

          let finalSizes = getFirstValidArray(info.sizes, info.size_range);

          if (finalSizes.length === 0) {
            finalSizes = ["M", "L", "XL"];
          }

          finalSizes = finalSizes
            .map((size) => safeText(size, ""))
            .filter(Boolean);

          /* ================= Price ================= */

          const price =
            Array.isArray(m.quotation_items) && m.quotation_items.length > 0
              ? Number(m.quotation_items[0]?.selling_price) || 0
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

          const modelName = safeText(m.name, `موديل ${index + 1}`);

          const modelNumber = safeText(m.model_number, `MOD-${index + 1}`);

          return {
            real_id: m.id,

            id: modelNumber,

            model_number: modelNumber,

            name: modelName,

            image_url: typeof m.image_url === "string" ? m.image_url : null,

            colors: finalColors,

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
          console.log(
            "MODEL:",
            model.name,
            "COLORS:",
            model.colors,
            "SIZES:",
            model.sizes,
          );
        });

        setCollectionInfo(formattedData);

        /* ======================================================
           Initial Series

           كل لون له عدد سريهات مستقل
        ====================================================== */

        const initialCounts = {};

        formattedData.models.forEach((model) => {
          initialCounts[model.id] = {};

          model.colors.forEach((color) => {
            initialCounts[model.id][color] = 5;
          });
        });

        setSeriesCounts(initialCounts);
      } catch (error) {
        console.error("خطأ في جلب بيانات أمر التشغيل:", error);

        toast.error("حدث خطأ أثناء جلب بيانات أمر التشغيل.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRealData();
    }
  }, [id]);

  /* ============================================================
     Change Series For Color
  ============================================================ */

  const handleColorSeriesChange = (modelId, color, value) => {
    const parsedValue = Math.max(0, parseInt(value, 10) || 0);

    setSeriesCounts((prev) => ({
      ...prev,

      [modelId]: {
        ...(prev[modelId] || {}),

        [color]: parsedValue,
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

      model.colors.forEach((color) => {
        newCounts[model.id][color] = parsedValue;
      });
    });

    setSeriesCounts(newCounts);
  };

  /* ============================================================
     Model Total
  ============================================================ */

  const getModelTotal = (model) => {
    return model.colors.reduce((total, color) => {
      const series = Number(seriesCounts?.[model.id]?.[color]) || 0;

      return total + model.sizes.length * series;
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
      model.colors.some((color) => {
        const series = Number(seriesCounts?.[model.id]?.[color]) || 0;

        return series <= 0;
      }),
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
      toast.error(
        "برجاء تحديد عدد سريهات أكبر من صفر لكل لون في جميع الموديلات.",
      );

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
              إصدار أمر التشغيل لـ: {safeText(collectionInfo.brandName)}
            </h1>

            <p className="text-sm text-slate-500">
              ({safeText(collectionInfo.collectionName)}) - حدد عدد السريهات لكل
              لون ليقوم النظام بتوزيع الكميات تلقائيًا.
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
              يمكنك تطبيق عدد موحد على{" "}
              <span className="font-bold text-red-500">
                جميع الألوان والموديلات
              </span>
              ، أو تعديل كل لون بشكل منفصل من الجدول.
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
            توزيع الكميات والسريهات حسب اللون
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-x-auto mb-6">
            <table className="w-full text-sm text-center min-w-[750px]">
              <thead className="bg-[#1a365d]">
                <tr>
                  <th className="py-3 px-4 font-semibold text-right text-white">
                    الموديل
                  </th>

                  <th className="py-3 px-4 font-semibold text-white">اللون</th>

                  <th className="py-3 px-4 font-semibold text-white">
                    المقاسات
                  </th>

                  <th className="py-3 px-4 font-semibold text-white w-32">
                    عدد السريهات
                  </th>

                  <th className="py-3 px-4 font-semibold text-white">
                    إجمالي اللون
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-slate-700">
                {collectionInfo.models.map((model) =>
                  model.colors.map((color, colorIndex) => {
                    const currentSeries =
                      Number(seriesCounts?.[model.id]?.[color]) || 0;

                    const colorQty = model.sizes.length * currentSeries;

                    return (
                      <tr
                        key={`${model.id}-${color}`}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Model */}

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center gap-3">
                            {colorIndex === 0 ? (
                              <>
                                {model.image_url ? (
                                  <img
                                    src={model.image_url}
                                    alt={safeText(model.name)}
                                    className="w-10 h-10 object-contain rounded border"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                    صورة
                                  </div>
                                )}

                                <div>
                                  <div className="font-bold text-[#1a365d]">
                                    {safeText(model.name)}
                                  </div>

                                  <div className="text-[10px] text-slate-400">
                                    {safeText(model.model_number)}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 pr-14">
                                ↳ نفس الموديل
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Color */}

                        <td className="py-4 px-4">
                          <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-[#1a365d] font-bold text-xs">
                            {safeText(color)}
                          </span>
                        </td>

                        {/* Sizes */}

                        <td className="py-4 px-4 text-xs">
                          {model.sizes.map((size) => safeText(size)).join("، ")}
                        </td>

                        {/* Series */}

                        <td className="py-4 px-4">
                          <input
                            type="number"
                            min="0"
                            value={currentSeries}
                            onChange={(e) =>
                              handleColorSeriesChange(
                                model.id,
                                color,
                                e.target.value,
                              )
                            }
                            className="w-full border border-slate-300 rounded-md p-1.5 text-center font-bold text-[#b91c1c] focus:outline-none focus:border-[#1a365d]"
                          />
                        </td>

                        {/* Total */}

                        <td className="py-4 px-4 font-bold text-lg text-slate-800">
                          {colorQty.toLocaleString()}

                          <span className="text-xs text-slate-500 font-normal mr-1">
                            قطعة
                          </span>
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}

          <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
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

          {/* Buttons */}

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
                    "برجاء التأكد من تحديد عدد سريهات أكبر من صفر لكل لون.",
                  );

                  return;
                }

                const hasUnpricedModels = collectionInfo.models.some(
                  (m) => !m.approvedPrice || m.approvedPrice <= 0,
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
