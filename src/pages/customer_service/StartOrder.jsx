import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../../supabase";
import { Link, useParams, useNavigate } from "react-router-dom"; // 💡 تم إضافة useNavigate
import { useReactToPrint } from "react-to-print";
import WorkOrderPDFTemplate from "../../components/WorkOrderPDFTemplate";
import ContractPDFTemplate from "../../components/ContractPDFTemplate";
import {
  handleGetCollectionById,
  handleIssueOrderToPlanning,
} from "../../services/collectionsService"; // 💡 تم استيراد دالة الإصدار
import { pricingService } from "../../services/pricingService";
import { toast } from "sonner";

const StartOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 💡 تعريف الـ navigate

  const [collectionInfo, setCollectionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 💡 State لمنع تكرار الضغط
  const [seriesCount, setSeriesCount] = useState(5);

  // Refs للطباعة
  const workOrderRef = useRef(null);
  const contractRef = useRef(null);

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
            brands (name_ar, name_en),
            models (
              id,
              model_number,
              name,
              image_url,
              colors,
              tech_packs ( content ),
              quotation_items ( selling_price )
            )
          `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        const formattedData = {
          id: orderData.id,
          brandName: orderData.brands?.name_ar || "غير محدد",
          brandCode:
            orderData.brands?.name_en?.substring(0, 3).toUpperCase() || "RKM",
          collectionName: orderData.name,

          models: orderData.models.map((m, i) => {
            const tpContent = Array.isArray(m.tech_packs)
              ? m.tech_packs[0]?.content
              : m.tech_packs?.content;
            const info = tpContent?.basic_info || tpContent || {};

            let finalColors = ["كحلي", "أسود", "رمادي"];
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

            let finalSizes = ["M", "L", "XL"];
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

            const price =
              m.quotation_items && m.quotation_items.length > 0
                ? m.quotation_items[0].selling_price
                : 0;

            return {
              real_id: m.id, // 💡 ضروري جداً عشان دالة الإدخال في الداتابيز تلاقي الـ UUID
              id: m.model_number || `MOD-${i + 1}`,
              model_number: m.model_number || `MOD-${i + 1}`,
              name: m.name || `موديل ${i + 1}`,
              image_url: m.image_url,
              colors: finalColors,
              sizes: finalSizes,
              fabric:
                info.main_fabric ||
                info.fabric_type ||
                info.material ||
                "غير محدد",
              weight: info.fabric_weight || info.weight || "غير محدد",
              approvedPrice: price,
            };
          }),
        };

        setCollectionInfo(formattedData);
      } catch (error) {
        console.error("خطأ في جلب بيانات أمر التشغيل:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRealData();
    }
  }, [id]);

  // دالة طباعة أمر التشغيل
  const handlePrintWO = useReactToPrint({
    contentRef: workOrderRef,
    documentTitle: `أمر_تشغيل_${collectionInfo?.brandName || "فارغ"}`,
  });

  // دالة طباعة العقد
  const handlePrintContract = useReactToPrint({
    contentRef: contractRef,
    documentTitle: `عقد_تصنيع_${collectionInfo?.brandName || "فارغ"}`,
  });

  // 💡 دالة الحفظ والإصدار للتخطيط
  const handleSaveAndIssue = async () => {
    const confirmIssue = window.confirm(
      "هل أنت متأكد من حفظ وإصدار أمر التشغيل؟ ستتم إضافة البيانات لقسم التخطيط بشكل نهائي.",
    );
    if (!confirmIssue) return;

    setIsSubmitting(true);
    try {
      await handleIssueOrderToPlanning(collectionInfo, seriesCount);

      toast.success(
        "تم إصدار أمر التشغيل بنجاح! 🚀 تم تسجيل البيانات وإرسالها للمصنع.",
      );
      navigate("/customer_service/customer_followup");
    } catch (error) {
      console.error(error);
      toast.error(
        "حدث خطأ أثناء إصدار أمر التشغيل، يرجى مراجعة وحدة التحكم (Console).",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-xl font-bold text-[#1a365d]">
          جاري تحميل بيانات الكولكشن...
        </div>
      </div>
    );
  }

  if (!collectionInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-xl font-bold text-red-600">
          لم يتم العثور على بيانات هذا الكولكشن.
        </div>
      </div>
    );
  }

  const grandTotalQty = collectionInfo.models.reduce((acc, model) => {
    return acc + model.sizes.length * seriesCount * model.colors.length;
  }, 0);

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      {/* القوالب المخفية */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          display: "none",
        }}
      >
        <WorkOrderPDFTemplate
          ref={workOrderRef}
          data={collectionInfo}
          seriesCount={seriesCount}
        />
        <ContractPDFTemplate
          ref={contractRef}
          data={collectionInfo}
          seriesCount={seriesCount}
        />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex justify-end">
          <Link
            to="/customer_service/customer_followup"
            className="text-[#1a365d] border border-[#1a365d] bg-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ◀ رجوع للمتابعة
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                إصدار أمر التشغيل لـ: {collectionInfo.brandName}
              </h1>
              <p className="text-sm text-slate-500">
                ({collectionInfo.collectionName}) - حدد عدد السريهات ليقوم
                النظام بتوزيع الكميات وطباعة أمر التشغيل أو عقد العميل.
              </p>
            </div>
            <div>
              <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200">
                جاهز للتشغيل ✓
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
                عدد السريهات المطلوبة
              </h3>
              <p className="text-xs text-slate-500 mb-4 text-right">
                سيتم توزيع هذا العدد بالتساوي على المقاسات المعتمدة.
              </p>

              <div className="flex flex-wrap gap-3 mb-5">
                {[1, 2, 3, 5, 10, 13, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSeriesCount(num)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                      seriesCount === num
                        ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                        : "bg-slate-50 text-slate-600 border-slate-300 hover:border-[#b91c1c] hover:text-[#b91c1c]"
                    }`}
                  >
                    {num} سري
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500 font-medium">
                  أو إدخال مخصص:
                </span>
                <input
                  type="number"
                  min="1"
                  value={seriesCount}
                  onChange={(e) =>
                    setSeriesCount(parseInt(e.target.value) || 1)
                  }
                  className="w-24 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-[#1a365d] font-bold text-[#1a365d]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#1a365d] mb-6 text-right">
              توزيع الكميات والحسابات التلقائية
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-x-auto mb-6">
              <table className="w-full text-sm text-center min-w-[500px]">
                <thead className="bg-[#1a365d]">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-right text-white">
                      صورة الموديل
                    </th>
                    <th className="py-3 px-4 font-semibold text-right text-white">
                      الموديل
                    </th>
                    <th className="py-3 px-4 font-semibold text-right text-white">
                      الالوان
                    </th>
                    <th className="py-3 px-4 font-semibold text-white">
                      المقاسات
                    </th>
                    <th className="py-3 px-4 font-semibold text-white">
                      إجمالي الكمية للموديل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {collectionInfo.models.map((model) => {
                    const modelQty =
                      model.sizes.length * seriesCount * model.colors.length;
                    return (
                      <tr
                        key={model.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-right">
                          <img
                            src={model.image_url}
                            alt={model.name}
                            className="w-12 h-12 object-contain"
                          />
                        </td>
                        <td className="py-4 px-4 font-bold text-right text-[#1a365d]">
                          {model.name}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {model.colors.join("، ")}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {model.sizes.join("، ")}{" "}
                          <span className="text-[#b91c1c] font-bold">
                            ({seriesCount})
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-lg text-slate-800">
                          {modelQty}{" "}
                          <span className="text-xs text-slate-500 font-normal">
                            قطعة
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-slate-600 font-bold">
                الإجمالي الكلي للكميات المطلوب تشغيلها:
              </span>
              <span className="text-3xl font-black text-[#1a365d]">
                {grandTotalQty.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-500">قطعة</span>
              </span>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-end gap-3">
              <button
                onClick={handlePrintWO}
                className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                طباعة ملف أمر التشغيل (PDF)
              </button>

              <button
                onClick={handlePrintContract}
                className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto"
              >
                اصدار عقد العمل (PDF)
              </button>

              {/* 💡 تم ربط الزرار بالدالة مع تفعيل حالة التحميل */}
              <button
                onClick={handleSaveAndIssue}
                disabled={isSubmitting}
                className={`${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-[#b91c1c] hover:bg-red-800"} text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto`}
              >
                {isSubmitting ? "جاري الإصدار..." : "حفظ وإصدار للتخطيط"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartOrder;
