import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../supabase";
import logo from "../assets/logo.jpeg";

const DownloadPDFButton = ({ collection }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [detailedCollection, setDetailedCollection] = useState(null);
  const pdfTemplateRef = useRef(null);

  const translatePriority = (priority) => {
    const map = { normal: "عادية", high: "عالية", urgent: "عاجلة جداً" };
    return map[priority] || priority || "---";
  };

  const translateStatus = (status) => {
    const map = {
      active: "نشط",
      draft: "مسودة",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return map[status] || status || "---";
  };

  const translateApproval = (status) => {
    const map = {
      not_sent: "لم يتم الإرسال",
      sent: "تم الإرسال",
      approved: "تمت الموافقة",
      revision_requested: "طلب تعديل",
    };
    return map[status] || status || "---";
  };

  const bomTranslations = {
    rib: "الريب (Rib)",
    threads: "الخيوط",
    accessories: "الإكسسوارات",
    main_fabric: "الخامة الأساسية",
    printing_embroidery: "الطباعة/التطريز",
    zippers_and_buttons: "السحابات والأزرار",
  };

  const handlePrint = useReactToPrint({
    contentRef: pdfTemplateRef,
    documentTitle: `ملف_كولكشن_${collection.name || "بدون_اسم"}`,
    onAfterPrint: () => setIsDownloading(false),
  });

  const handleFetchAndPrint = async () => {
    if (detailedCollection) {
      setIsDownloading(true);
      setTimeout(() => handlePrint(), 100);
      return;
    }

    setIsDownloading(true);
    try {
      const { data: orderData, error } = await supabase
        .from("collections")
        .select(
          `
          *,
          brands (*),
          models (
            id,
            model_number,
            name,
            image_url,
            colors,
            tech_pack_status,
            description,
            customer_notes,
            created_at,
            tech_packs ( content )
          )
        `,
        )
        .eq("id", collection.id)
        .single();

      if (error) throw error;

      const formattedModels = (orderData.models || []).map((m) => {
        let tpContent = Array.isArray(m.tech_packs)
          ? m.tech_packs[0]?.content
          : m.tech_packs?.content;
        if (typeof tpContent === "string") {
          try {
            tpContent = JSON.parse(tpContent);
          } catch (e) {}
        }
        const info = tpContent?.basic_info || tpContent || {};

        let finalColors = [];
        if (m.colors && m.colors !== "-") {
          finalColors = Array.isArray(m.colors)
            ? m.colors
            : String(m.colors)
                .split(/[,،/-]/)
                .map((c) => c.trim())
                .filter(Boolean);
        } else if (info.colors && info.colors !== "-") {
          finalColors = Array.isArray(info.colors)
            ? info.colors
            : String(info.colors)
                .split(/[,،/-]/)
                .map((c) => c.trim())
                .filter(Boolean);
        }

        let finalSizes = [];
        if (info.sizes && info.sizes !== "-") {
          finalSizes = Array.isArray(info.sizes)
            ? info.sizes
            : String(info.sizes)
                .split(/[,،/-]/)
                .map((s) => s.trim())
                .filter(Boolean);
        } else if (info.size_range && info.size_range !== "-") {
          finalSizes = Array.isArray(info.size_range)
            ? info.size_range
            : String(info.size_range)
                .split(/[,،/-]/)
                .map((s) => s.trim())
                .filter(Boolean);
        }

        const bom = tpContent?.bill_of_materials_BOM || {};
        const techDesc = tpContent?.technical_description || {};
        const qualityChecks = Array.isArray(tpContent?.quality_check_points)
          ? tpContent.quality_check_points
          : [];
        const careInstructions = Array.isArray(tpContent?.care_instructions)
          ? tpContent.care_instructions
          : [];
        const techComments = tpContent?.technical_comments || "";

        return {
          ...m,
          extractedColors: finalColors,
          extractedSizes: finalSizes,
          fabric:
            info.main_fabric || info.fabric_type || info.material || "غير محدد",
          weight: info.fabric_weight || info.weight || "غير محدد",
          bom,
          techDesc,
          qualityChecks,
          careInstructions,
          techComments,
        };
      });

      setDetailedCollection({ ...orderData, models: formattedModels });

      setTimeout(() => {
        handlePrint();
      }, 500);
    } catch (error) {
      console.error("خطأ في جلب بيانات الكولكشن:", error);
      alert("حدث خطأ أثناء جلب التفاصيل، يرجى المحاولة مرة أخرى.");
      setIsDownloading(false);
    }
  };

  const displayData = detailedCollection || collection;
  const brand = displayData.brands || {};
  const models = displayData.models || [];

  return (
    <>
      <button
        onClick={handleFetchAndPrint}
        disabled={isDownloading}
        className={`flex-1 lg:flex-none rounded-lg border px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition text-center flex items-center justify-center gap-2 ${
          isDownloading
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : "bg-white text-[#1a365d] border-[#1a365d] hover:bg-[#1a365d] hover:text-white shadow-sm"
        }`}
      >
        {isDownloading ? "جاري التجهيز..." : "🖨️ طباعة / تحميل PDF"}
      </button>

      <div style={{ display: "none" }}>
        <div
          ref={pdfTemplateRef}
          dir="rtl"
          className="bg-white font-arabic text-[#1a365d]"
          style={{ padding: "0" }}
        >
          <style>
            {`
              @page { size: A4 portrait; margin: 10mm; }
              @media print {
                html, body { margin: 0 !important; padding: 0 !important; background: white; }
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .page-break-avoid { page-break-inside: avoid; break-inside: avoid; }
                .page-break-before { page-break-before: always; break-before: page; }
              }
            `}
          </style>

          {/* الصفحة الأولى: الغلاف والملخص */}
          <div className="bg-white pb-10 flex flex-col min-h-[90vh]">
            <div className="bg-[#1a365d] text-white p-10 border-b-[6px] border-[#b91c1c] flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black mb-2">
                  ملف تفاصيل الكولكشن
                </h1>
                <p className="text-xl text-blue-200 font-bold">
                  {displayData.name}{" "}
                  {displayData.season
                    ? `- ${displayData.season} ${displayData.year || ""}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-col items-center bg-white/10 p-3 rounded-xl border border-white/20 min-w-[150px]">
                <img
                  src={logo}
                  alt="لوجو الشركة"
                  className="w-16 h-16 object-contain mb-2 bg-white rounded-md p-1"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <h2 className="text-lg font-black tracking-wider">
                  مصنع الصحابة
                </h2>
              </div>
            </div>

            <div className="p-10 flex-1">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#b91c1c] border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <span className="bg-[#b91c1c] w-2 h-6 rounded-full inline-block"></span>
                  بيانات العميل
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      الاسم (عربي)
                    </p>
                    <p className="text-base font-black text-[#1a365d]">
                      {brand.name_ar || "---"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      الاسم (انجليزي)
                    </p>
                    <p
                      className="text-base font-black text-[#1a365d]"
                      dir="ltr"
                    >
                      {brand.name_en || "---"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#b91c1c] border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <span className="bg-[#b91c1c] w-2 h-6 rounded-full inline-block"></span>
                  المواصفات الفنية للطلبية
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      كود الكولكشن
                    </p>
                    <p className="text-sm font-black text-[#b91c1c]">
                      {displayData.code || "---"}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      القسم
                    </p>
                    <p className="text-lg font-black text-[#b91c1c]">
                      {displayData.department || "---"}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      نوع المنتج
                    </p>
                    <p className="text-lg font-black text-[#b91c1c]">
                      {displayData.product_type || "---"}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      الموسم
                    </p>
                    <p className="text-lg font-black text-[#b91c1c]">
                      {displayData.season || "---"} {displayData.year}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      الكمية المتوقعة
                    </p>
                    <p className="text-xl font-black text-[#b91c1c]">
                      {displayData.expected_quantity || 0}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      عدد الموديلات
                    </p>
                    <p className="text-xl font-black text-[#b91c1c]">
                      {displayData.models_count || 0}
                    </p>
                  </div>
                  <div className="bg-[#1a365d]/5 p-4 rounded-xl border border-[#1a365d]/20 text-center col-span-2">
                    <p className="text-xs text-[#1a365d] mb-1 font-bold">
                      تاريخ التسليم المستهدف
                    </p>
                    <p className="text-xl font-black text-[#b91c1c]">
                      {displayData.delivery_date || "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#b91c1c] border-b-2 border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <span className="bg-[#b91c1c] w-2 h-6 rounded-full inline-block"></span>
                  حالة التشغيل والموافقات
                </h3>
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      أولوية التشغيل
                    </p>
                    <p className="text-sm font-black text-[#1a365d]">
                      {translatePriority(displayData.priority)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      الحالة الداخلية
                    </p>
                    <p className="text-sm font-black text-[#1a365d]">
                      {translateStatus(displayData.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      نسبة العربون
                    </p>
                    <p className="text-sm font-black text-[#1a365d]">
                      {displayData.deposit_percentage
                        ? `${displayData.deposit_percentage}%`
                        : "---"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      موافقة العميل
                    </p>
                    <p className="text-sm font-black text-[#1a365d]">
                      {translateApproval(displayData.customer_approval)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      موافقة البيانات الفنية
                    </p>
                    <p className="text-sm font-black text-[#1a365d]">
                      {displayData.data_approval_status === "approved"
                        ? "معتمد"
                        : "غير معتمد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-bold">
                      تاريخ الإنشاء
                    </p>
                    <p className="text-sm font-black text-[#1a365d]" dir="ltr">
                      {new Date(displayData.created_at).toLocaleDateString(
                        "en-GB",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-4 text-center text-xs font-bold text-slate-400">
                تم استخراج هذا الملف من نظام الصحابة ERP بتاريخ{" "}
                {new Date().toLocaleDateString("ar-EG")}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* التفاصيل العميقة للموديلات (بدون تقييد الطول لتجنب الصفحات الفارغة) */}
          {/* ------------------------------------------------ */}
          {models.length > 0 && (
            <div className="page-break-before bg-white">
              <div className="bg-[#1a365d] text-white py-6 px-10 border-b-[4px] border-[#b91c1c]">
                <h2 className="text-2xl font-black">
                  التفاصيل الفنية العميقة (Tech Pack)
                </h2>
              </div>

              <div className="p-10">
                {models.map((model, index) => (
                  <div
                    key={index}
                    // 💡 تم إزالة page-break-avoid من الحاوية الرئيسية لعدم إجبار الصفحة على الانقسام المبكر
                    className="mb-10 bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex justify-between items-center page-break-avoid">
                      <h3 className="text-lg font-black text-[#1a365d]">
                        موديل رقم:{" "}
                        <span className="text-[#b91c1c] ml-2">
                          {model.model_number || index + 1}
                        </span>
                      </h3>
                      <span className="bg-[#1a365d] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        {model.name || "بدون اسم"}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-48 h-64 bg-white border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 relative shadow-sm page-break-avoid">
                        {model.image_url ? (
                          <img
                            src={model.image_url}
                            alt={model.name}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+غير+متاحة";
                            }}
                          />
                        ) : (
                          <span className="text-slate-400 text-sm font-bold">
                            لا توجد صورة
                          </span>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-[#1a365d]">
                          {model.tech_pack_status === "approved"
                            ? "✓ معتمد"
                            : "⏳ مسودة"}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3 page-break-avoid">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-[11px] text-slate-500 block mb-1">
                              الخامة الأساسية:
                            </span>
                            <span className="text-sm font-black text-[#1a365d]">
                              {model.fabric}{" "}
                              {model.weight && `(${model.weight})`}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-[11px] text-slate-500 block mb-1">
                              الألوان / المقاسات:
                            </span>
                            <span className="text-[11px] font-bold text-[#1a365d] block leading-tight">
                              ألوان:{" "}
                              {model.extractedColors?.length > 0
                                ? model.extractedColors.join("، ")
                                : "---"}
                              <br />
                              مقاسات:{" "}
                              {model.extractedSizes?.length > 0
                                ? model.extractedSizes.join("، ")
                                : "---"}
                            </span>
                          </div>
                        </div>

                        {model.techDesc &&
                          Object.keys(model.techDesc).length > 0 && (
                            <div className="border-t border-slate-200 pt-3 page-break-avoid">
                              <p className="text-[13px] text-[#b91c1c] font-black mb-1">
                                الوصف الفني والتصنيع:
                              </p>
                              <p className="text-[12px] text-slate-700 leading-relaxed mb-2 font-medium">
                                {model.techDesc.short_description}{" "}
                                {model.techDesc.production_notes}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {model.techDesc.stitching_type && (
                                  <span className="text-[11px] text-slate-600">
                                    <strong className="text-[#1a365d]">
                                      الخياطة:
                                    </strong>{" "}
                                    {model.techDesc.stitching_type}
                                  </span>
                                )}
                                {model.techDesc.stitch_details && (
                                  <span className="text-[11px] text-slate-600">
                                    <strong className="text-[#1a365d]">
                                      الغرز:
                                    </strong>{" "}
                                    {model.techDesc.stitch_details}
                                  </span>
                                )}
                                {model.techDesc.finishing && (
                                  <span className="text-[11px] text-slate-600">
                                    <strong className="text-[#1a365d]">
                                      التشطيب:
                                    </strong>{" "}
                                    {model.techDesc.finishing}
                                  </span>
                                )}
                                {model.techDesc.reinforcement_areas && (
                                  <span className="text-[11px] text-slate-600">
                                    <strong className="text-[#1a365d]">
                                      مناطق التدعيم:
                                    </strong>{" "}
                                    {model.techDesc.reinforcement_areas}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {model.bom && Object.keys(model.bom).length > 0 && (
                          <div className="border-t border-slate-200 pt-3 page-break-avoid">
                            <p className="text-[13px] text-[#b91c1c] font-black mb-2">
                              المستلزمات وقائمة الخامات (BOM):
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(model.bom).map(([key, value]) => {
                                if (
                                  value &&
                                  value !== "غير محدد" &&
                                  value.trim() !== ""
                                ) {
                                  return (
                                    <div
                                      key={key}
                                      className="bg-slate-50 px-2 py-1.5 border border-slate-100 rounded text-[11px]"
                                    >
                                      <span className="text-slate-500 block mb-0.5">
                                        {bomTranslations[key] || key}:
                                      </span>
                                      <span className="font-bold text-[#1a365d]">
                                        {value}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 page-break-avoid">
                          {model.qualityChecks?.length > 0 && (
                            <div>
                              <p className="text-[12px] text-[#b91c1c] font-black mb-1">
                                نقاط فحص الجودة:
                              </p>
                              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 font-medium">
                                {model.qualityChecks.map((q, i) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {model.careInstructions?.length > 0 && (
                            <div>
                              <p className="text-[12px] text-[#b91c1c] font-black mb-1">
                                تعليمات العناية (Care Label):
                              </p>
                              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 font-medium">
                                {model.careInstructions.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {model.techComments && (
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-1 page-break-avoid">
                            <p className="text-[11px] text-amber-800 font-black mb-1">
                              ملاحظات تقنية من مهندس التخطيط:
                            </p>
                            <p className="text-[11px] text-amber-900 font-medium">
                              {model.techComments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DownloadPDFButton;
