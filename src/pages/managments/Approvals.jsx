import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  ShieldCheck,
  Clock,
  Eye,
  FileText,
} from "lucide-react";
import { supabase } from "../../../supabase";
import { toast } from "sonner";
import { notificationService } from "../../services/notificationService";

// استدعاء القوالب (تأكد إن مساراتك صحيحة هنا)
import ContractPDFTemplate from "../../components/ContractPDFTemplate";
import TechPackTemplate from "../../components/TechPackTemplate";

const Approvals = () => {
  const [approvalsList, setApprovalsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // States للنافذة المنبثقة (Modal)
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("approvals")
        .select(
          `
          id,
          collection_id,
          model_id,
          approval_type,
          status,
          notes,
          created_at,
          collections ( name, brands ( name_ar, name_en ) ),
          models ( name, model_number )
        `,
        )
        .in("status", ["sent", "revised"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApprovalsList(data || []);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      toast.error("حدث خطأ أثناء جلب الموافقات المعلقة.");
    } finally {
      setIsLoading(false);
    }
  };

  const getApprovalTitle = (type) => {
    const types = {
      tech_pack: "اعتماد البطاقة الفنية (Tech Pack)",
      quotation: "اعتماد عرض السعر",
      contract: "اعتماد العقد",
    };
    return types[type] || "طلب اعتماد غير محدد";
  };

  // دالة المعاينة الشاملة لتجهيز الداتا بناءً على نوع الطلب
  const handlePreview = async (
    type,
    collectionId,
    collectionInfo,
    notes,
    modelId,
  ) => {
    setIsPreviewLoading(true);
    setIsModalOpen(true);

    setPreviewData({
      type,
      title: `معاينة ${getApprovalTitle(type)} لـ ${collectionInfo.name}`,
      brandName: collectionInfo.brands?.name_ar,
      details: null,
    });

    try {
      // 1. لو الطلب "عرض سعر"
      if (type === "quotation") {
        const { data: quoteData, error: quoteError } = await supabase
          .from("quotations")
          .select(
            `
            *,
            quotation_items (
              company_cost, profit_percentage, selling_price,
              models ( name, model_number, image_url )
            )
          `,
          )
          .eq("collection_id", collectionId)
          .single();

        if (quoteError) throw quoteError;
        setPreviewData((prev) => ({ ...prev, details: { quote: quoteData } }));
      }

      // 2. لو الطلب "عقد عمل"
      else if (type === "contract") {
        let seriesCount = 1;
        if (notes) {
          const match = notes.match(/\((\d+)\s*سري\)/);
          if (match && match[1]) seriesCount = parseInt(match[1]);
        }

        const { data: orderData, error: orderError } = await supabase
          .from("collections")
          .select(
            `
            id, name, brands (name_ar, name_en),
            models (
              id, model_number, name, image_url, colors,
              tech_packs ( content ),
              quotation_items ( selling_price )
            )
          `,
          )
          .eq("id", collectionId)
          .single();

        if (orderError) throw orderError;

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
              id: m.model_number || `MOD-${i + 1}`,
              model_number: m.model_number || `MOD-${i + 1}`,
              name: m.name || `موديل ${i + 1}`,
              colors: finalColors,
              sizes: finalSizes,
              fabric:
                info.main_fabric ||
                info.fabric_type ||
                info.material ||
                "غير محدد",
              approvedPrice: price,
            };
          }),
        };

        setPreviewData((prev) => ({
          ...prev,
          details: { collectionInfo: formattedData, seriesCount },
        }));
      }

      // 3. لو الطلب "بطاقة فنية (Tech Pack)"
      else if (type === "tech_pack" && modelId) {
        // 💡 التعديل هنا: استخدمنا (*) لجلب كل بيانات الموديل بما فيها الصور التفصيلية
        const { data: modelsData, error: modelsError } = await supabase
          .from("models")
          .select(
            `
            *, 
            tech_packs ( content )
          `,
          )
          .eq("id", modelId);

        if (modelsError) throw modelsError;

        const formattedModels = modelsData.map((m) => {
          let tpData = null;
          if (Array.isArray(m.tech_packs) && m.tech_packs.length > 0) {
            tpData = m.tech_packs[0].content;
          } else if (m.tech_packs && !Array.isArray(m.tech_packs)) {
            tpData = m.tech_packs.content;
          }
          return {
            ...m,
            techPackData: tpData,
          };
        });

        setPreviewData((prev) => ({
          ...prev,
          details: { models: formattedModels },
        }));
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("تعذر تحميل بعض تفاصيل المعاينة.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleAction = async (approvalId, collectionId, type, newStatus) => {
    const confirmMessage =
      newStatus === "approved"
        ? "هل أنت متأكد من الموافقة؟"
        : "هل أنت متأكد من الرفض؟";
    if (!window.confirm(confirmMessage)) return;

    setActionLoading(approvalId);
    try {
      const { error } = await supabase
        .from("approvals")
        .update({ status: newStatus, approved_at: new Date().toISOString() })
        .eq("id", approvalId);

      if (error) throw error;
      toast.success(
        newStatus === "approved" ? "تم الاعتماد بنجاح" : "تم رفض الطلب",
      );

      const statusAr =
        newStatus === "approved" ? "تم اعتماده ✅" : "تم رفضه ❌";
      const typeAr =
        type === "tech_pack"
          ? "البطاقة الفنية"
          : type === "quotation"
            ? "عرض السعر"
            : "عقد العمل";

      await notificationService.sendNotification(
        "customer_service",
        "رد على طلب الاعتماد",
        `الطلب الخاص بـ (${typeAr}) ${statusAr} من قبل الإدارة.`,
        collectionId,
      );

      setApprovalsList((prev) => prev.filter((item) => item.id !== approvalId));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Action error:", error);
      toast.error("حدث خطأ أثناء تنفيذ الإجراء.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* الهيدر */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1a233a]">الموافقات</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            جميع الطلبات التي تحتاج اعتماد المدير قبل تنفيذها في النظام.
          </p>
        </div>
      </div>

      <div className="space-y-4 min-h-[50vh]">
        {isLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#1a233a]" />
          </div>
        ) : approvalsList.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50">
            <ShieldCheck size={48} className="text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-500">
              لا توجد طلبات معلقة
            </p>
          </div>
        ) : (
          approvalsList.map((item) => {
            const collectionInfo = item.collections || {};

            return (
              <div
                key={item.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-[#1a233a]">
                        {getApprovalTitle(item.approval_type)}
                      </h2>
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        <Clock size={12} /> بانتظار الاعتماد
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400">
                          البراند:
                        </span>
                        <p className="font-bold text-slate-700">
                          {collectionInfo.brands?.name_ar || "---"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400">
                          الكولكشن:
                        </span>
                        <p className="font-bold text-slate-700">
                          {collectionInfo.name || "---"}
                        </p>
                      </div>

                      {/* 💡 إظهار اسم الموديل المخصص للـ Tech Pack */}
                      {item.approval_type === "tech_pack" && item.models && (
                        <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-1">
                          <span className="text-xs font-bold text-slate-400">
                            الموديل المطلوب اعتماده:
                          </span>
                          <p className="font-bold text-[#b91c1c] text-base">
                            {item.models.name} ({item.models.model_number})
                          </p>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <span className="font-bold text-[#1a233a]">
                          ملاحظات الطلب:{" "}
                        </span>
                        {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 xl:flex-col xl:min-w-[140px]">
                    {/* 💡 تمرير model_id للمعاينة */}
                    <button
                      onClick={() =>
                        handlePreview(
                          item.approval_type,
                          item.collection_id,
                          collectionInfo,
                          item.notes,
                          item.model_id,
                        )
                      }
                      className="flex flex-1 xl:w-full items-center justify-center gap-2 rounded-xl bg-blue-50 border-2 border-blue-500 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Eye size={18} /> معاينة التفاصيل
                    </button>

                    <button
                      onClick={() =>
                        handleAction(
                          item.id,
                          item.collection_id,
                          item.approval_type,
                          "approved",
                        )
                      }
                      disabled={actionLoading === item.id}
                      className="flex flex-1 xl:w-full items-center justify-center gap-2 rounded-xl bg-[#10b981] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {actionLoading === item.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}{" "}
                      اعتماد
                    </button>

                    <button
                      onClick={() =>
                        handleAction(
                          item.id,
                          item.collection_id,
                          item.approval_type,
                          "rejected",
                        )
                      }
                      disabled={actionLoading === item.id}
                      className="flex flex-1 xl:w-full items-center justify-center gap-2 rounded-xl bg-white border-2 border-[#cc0000] px-5 py-3 text-sm font-bold text-[#cc0000] transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {actionLoading === item.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <X size={18} />
                      )}{" "}
                      رفض
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* النافذة المنبثقة للمعاينة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-bold text-[#1a233a] flex items-center gap-2">
                <FileText size={20} /> {previewData?.title}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/50">
              {isPreviewLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="animate-spin h-8 w-8 text-[#1a365d]" />
                </div>
              ) : previewData?.details ? (
                <div className="space-y-6">
                  {/* ======================================================= */}
                  {/* 1. عرض تفاصيل التسعير (Quotation) بشكل احترافي */}
                  {/* ======================================================= */}
                  {previewData.type === "quotation" &&
                    previewData.details.quote && (
                      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto font-arabic">
                        <div className="flex justify-between items-end border-b-[3px] border-[#0f172a] pb-4 mb-6">
                          <div className="text-right">
                            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
                              عرض سعر مجمع
                            </h2>
                            <h3 className="text-lg font-bold text-[#b91c1c] mt-1">
                              كولكشن: {previewData.title.split(" لـ ")[1]}
                            </h3>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                              السادة / {previewData.brandName}
                            </p>
                          </div>
                          <div className="text-left text-sm text-slate-500 font-medium">
                            تاريخ:{" "}
                            {new Date(
                              previewData.details.quote.created_at,
                            ).toLocaleDateString("ar-EG")}
                          </div>
                        </div>

                        <div className="overflow-x-auto border-2 border-[#0f172a] rounded-lg mb-6">
                          <table className="w-full text-sm text-center">
                            <thead className="bg-[#0f172a] text-white">
                              <tr>
                                <th className="p-3 border-l border-slate-600">
                                  صورة
                                </th>
                                <th className="p-3 border-l border-slate-600">
                                  الموديل (الكود)
                                </th>
                                <th className="p-3 border-l border-slate-600">
                                  التكلفة (ج.م)
                                </th>
                                <th className="p-3 border-l border-slate-600">
                                  هامش الربح
                                </th>
                                <th className="p-3 bg-[#b91c1c] text-white font-black text-base">
                                  سعر البيع (ج.م)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0f172a]">
                              {previewData.details.quote.quotation_items?.map(
                                (item, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                    <td className="p-2 border-l border-[#0f172a]">
                                      {item.models?.image_url ? (
                                        <img
                                          src={item.models.image_url}
                                          alt="model"
                                          className="w-10 h-10 object-cover rounded mx-auto"
                                        />
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="p-3 font-bold text-slate-800 border-l border-[#0f172a]">
                                      {item.models?.name}{" "}
                                      <span className="text-slate-400 text-xs block mt-1">
                                        ({item.models?.model_number})
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-600 font-bold border-l border-[#0f172a]">
                                      {item.company_cost?.toLocaleString()}
                                    </td>
                                    <td className="p-3 font-bold border-l border-[#0f172a] text-slate-600">
                                      %{item.profit_percentage}
                                    </td>
                                    <td className="p-3 text-[#b91c1c] font-black text-lg bg-red-50/30">
                                      {item.selling_price?.toLocaleString()}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm p-4 border-2 border-[#0f172a] rounded-lg bg-slate-50">
                            <strong className="text-[#0f172a] block mb-2 text-base">
                              شروط التنفيذ والدفع:
                            </strong>
                            <p className="whitespace-pre-line text-slate-700 font-medium leading-relaxed">
                              {
                                previewData.details.quote
                                  .payment_execution_terms
                              }
                            </p>
                          </div>

                          <div className="border-2 border-[#0f172a] rounded-lg overflow-hidden flex flex-col">
                            <div className="bg-[#0f172a] text-white text-center py-2 font-bold text-sm">
                              إجمالي الكولكشن (للمرجعية)
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-center gap-3 bg-white">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="font-bold text-slate-500">
                                  إجمالي التكلفة
                                </span>
                                <span className="font-bold text-slate-800">
                                  {previewData.details.quote.total_cost?.toLocaleString()}{" "}
                                  ج.م
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-bold text-[#b91c1c]">
                                  إجمالي البيع المقترح
                                </span>
                                <span className="font-black text-xl text-[#b91c1c]">
                                  {previewData.details.quote.total_sales_price?.toLocaleString()}{" "}
                                  ج.م
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* ======================================================= */}
                  {/* 2. عرض العقد (Contract) باستخدام Template العقد */}
                  {/* ======================================================= */}
                  {previewData.type === "contract" &&
                    previewData.details.collectionInfo && (
                      <div
                        className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm p-2 sm:p-4 mx-auto"
                        style={{ maxWidth: "800px" }}
                      >
                        <ContractPDFTemplate
                          data={previewData.details.collectionInfo}
                          seriesCount={previewData.details.seriesCount}
                        />
                      </div>
                    )}

                  {/* ======================================================= */}
                  {/* 3. عرض البطاقة الفنية (Tech Pack) للموديل المحدد فقط */}
                  {/* ======================================================= */}
                  {previewData.type === "tech_pack" &&
                    previewData.details.models && (
                      <div
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 sm:p-4 overflow-x-auto mx-auto"
                        style={{ maxWidth: "800px" }}
                      >
                        {previewData.details.models[0]?.techPackData ? (
                          <TechPackTemplate
                            data={previewData.details.models[0].techPackData}
                            activeModel={previewData.details.models[0]}
                            brandName={previewData.brandName}
                          />
                        ) : (
                          <p className="p-10 text-center text-slate-500 font-bold">
                            لا توجد بيانات فنية مسجلة لهذا الموديل.
                          </p>
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-center text-slate-500">
                  لا توجد تفاصيل إضافية لعرضها.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 text-left flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
