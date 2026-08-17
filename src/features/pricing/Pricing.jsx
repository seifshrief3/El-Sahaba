import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { pricingService } from "../../services/pricingService";
import { sendForApproval } from "../../services/approvalsService";
const Pricing = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");

  // 1. States لإدارة البيانات
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 💡 State لزرار الحذف
  const [isSendingApproval, setIsSendingApproval] = useState(false);
  // State لمعرفة إحنا بنعمل Create ولا Update
  const [existingQuotationId, setExistingQuotationId] = useState(null);

  // States لبيانات نموذج عرض السعر
  const [costs, setCosts] = useState({});
  const [profitMargin, setProfitMargin] = useState(15);
  const [paymentTerms, setPaymentTerms] = useState(
    "50% مقدمًا عند الاعتماد، والباقي عند التسليم.",
  );
  const [notes, setNotes] = useState("");

  // 2. جلب الكولكشنات
  const loadCollections = async () => {
    setIsLoading(true);
    const data = await pricingService.fetchCollections();
    setCollections(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // 3. جلب الموديلات وبيانات التسعير القديمة
  useEffect(() => {
    const loadModelsAndQuote = async () => {
      if (!selectedCollectionId) {
        setModels([]);
        setExistingQuotationId(null);
        return;
      }

      const modelsData =
        await pricingService.fetchModelsByCollection(selectedCollectionId);
      setModels(modelsData);

      const oldQuote =
        await pricingService.fetchQuotationByCollection(selectedCollectionId);

      if (oldQuote) {
        setExistingQuotationId(oldQuote.id);
        setPaymentTerms(oldQuote.payment_execution_terms || "");
        setNotes(oldQuote.notes || "");

        const oldCosts = {};
        let oldProfitMargin = 15;

        if (oldQuote.quotation_items && oldQuote.quotation_items.length > 0) {
          oldQuote.quotation_items.forEach((item) => {
            oldCosts[item.model_id] = item.company_cost;
          });
          oldProfitMargin = oldQuote.quotation_items[0].profit_percentage;
        }

        setCosts(oldCosts);
        setProfitMargin(oldProfitMargin);
      } else {
        setExistingQuotationId(null);
        setCosts({});
        setProfitMargin(15);
        setPaymentTerms("50% مقدمًا عند الاعتماد، والباقي عند التسليم.");
        setNotes("");
      }
    };

    loadModelsAndQuote();
  }, [selectedCollectionId]);

  // 4. العمليات الحسابية التلقائية
  const handleCostChange = (id, value) => {
    const numValue = parseFloat(value) || 0;
    setCosts({ ...costs, [id]: numValue });
  };

  const totalCost = models.reduce(
    (acc, curr) => acc + (costs[curr.id] || 0),
    0,
  );
  const averageCost = models.length > 0 ? totalCost / models.length : 0;
  const finalSellingPrice = totalCost + (totalCost * profitMargin) / 100;

  const activeCollection = collections.find(
    (c) => c.id === selectedCollectionId,
  );

  // 5. حفظ أو تحديث عرض السعر (بدون إرسال تلقائي)
  const handleSaveQuotation = async () => {
    if (!selectedCollectionId) {
      toast.error("برجاء اختيار كولكشن أولاً");
      return;
    }

    const unpricedModels = models.filter(
      (m) => !costs[m.id] || costs[m.id] <= 0,
    );
    if (unpricedModels.length > 0) {
      toast.error("برجاء إدخال التكلفة لجميع الموديلات");
      return;
    }

    setIsSubmitting(true);
    toast.info(
      existingQuotationId
        ? "جاري تحديث عرض السعر..."
        : "جاري إنشاء عرض السعر...",
    );

    try {
      const quotationData = {
        collection_id: selectedCollectionId,
        total_cost: totalCost,
        total_sales_price: finalSellingPrice,
        payment_execution_terms: paymentTerms,
        notes: notes,
      };

      const itemsData = models.map((m) => {
        const cost = costs[m.id] || 0;
        const sellingPrice = cost + (cost * profitMargin) / 100;
        return {
          model_id: m.id,
          company_cost: cost,
          profit_percentage: profitMargin,
          selling_price: sellingPrice,
        };
      });

      if (existingQuotationId) {
        await pricingService.updateQuotation(
          existingQuotationId,
          quotationData,
          itemsData,
        );
        toast.success("تم تحديث عرض السعر بنجاح! 🔄");
      } else {
        await pricingService.createQuotation(quotationData, itemsData);
        toast.success(
          "تم إنشاء وحفظ عرض السعر بنجاح! 🎉 الآن يمكنك إرساله للإدارة.",
        );

        // إعادة تحميل البيانات عشان السيستم يلقط الـ ID الجديد ويفعل زرار الإرسال
        const oldQuote =
          await pricingService.fetchQuotationByCollection(selectedCollectionId);
        if (oldQuote) setExistingQuotationId(oldQuote.id);
      }

      // 💡 تم إزالة كود الإرسال التلقائي من هنا
      // 💡 وتم إزالة الـ navigate عشان الموظف يفضل في الصفحة ويدوس إرسال براحته
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ عرض السعر");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. 💡 دالة حذف التسعير
  const handleDeleteQuotation = async (collectionId) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف عرض السعر لهذا الكولكشن بالكامل؟ لا يمكن التراجع عن هذا الإجراء.",
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // بنجيب الـ quote القديم الأول عشان نعرف الـ ID بتاعه
      const oldQuote =
        await pricingService.fetchQuotationByCollection(collectionId);
      if (oldQuote && oldQuote.id) {
        await pricingService.deleteQuotation(oldQuote.id);
        toast.success("تم حذف عرض السعر بنجاح!");
        // نعيد تحميل الكولكشنات عشان يتحدث شكل الزرار
        await loadCollections();
      } else {
        toast.error("لم يتم العثور على عرض السعر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف عرض السعر");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      {view === "list" && (
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 border-b border-slate-100 pb-5 sm:pb-6 mb-5 sm:mb-6">
              <div className="text-right">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                  التسعير وعروض الأسعار
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  إنشاء عرض سعر بناءً على التكلفة المباشرة للموديلات وتحديد هامش
                  الربح.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link
                  to="/customer_service/quotations"
                  className="w-full sm:w-auto bg-slate-50 text-[#1a365d] border border-slate-200 hover:border-[#1a365d] hover:bg-[#1a365d] hover:text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                >
                  عرض كل الأسعار
                </Link>
                <button
                  onClick={() => setView("form")}
                  className="w-full sm:w-auto bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                >
                  + عرض سعر جديد
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-slate-500 font-bold">
                جاري تحميل البيانات...
              </div>
            ) : (
              <div className="space-y-4">
                {collections
                  .filter((col) => col.is_priced)
                  .map((col) => (
                    <div
                      key={col.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6"
                    >
                      <div className="text-right w-full md:flex-1">
                        <h2 className="text-lg font-bold text-[#1a365d] mb-2">
                          {col.name} — {col.brand_name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mb-3">
                          تم الإنشاء في:{" "}
                          {new Date(col.created_at).toLocaleDateString("ar-EG")}
                        </p>
                        {col.is_priced ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold inline-block">
                            تم التسعير ✓
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold inline-block">
                            متاح للتسعير
                          </span>
                        )}
                      </div>

                      {/* 💡 زراير التعديل والحذف هنا */}
                      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        {col.is_priced && (
                          <button
                            onClick={() => handleDeleteQuotation(col.id)}
                            disabled={isDeleting}
                            className="bg-red-50 text-[#b91c1c] border border-red-100 hover:bg-red-100 hover:border-red-200 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto disabled:opacity-50"
                          >
                            حذف التسعير
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCollectionId(col.id);
                            setView("form");
                          }}
                          className={`${
                            col.is_priced
                              ? "bg-slate-700 hover:bg-slate-800"
                              : "bg-[#b91c1c] hover:bg-red-800"
                          } text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto`}
                        >
                          {col.is_priced ? "تعديل التسعير" : "فتح وتسعير"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ... باقي الكود الخاص بـ view === "form" زي ما هو بدون تغيير ... */}
      {view === "form" && (
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setView("list");
                setSelectedCollectionId("");
              }}
              className="text-[#1a365d] border border-[#1a365d] bg-white px-5 sm:px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              ◀ العودة للكولكشنات
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
            {!selectedCollectionId && (
              <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <h3 className="text-base sm:text-lg font-bold text-[#1a365d] mb-4">
                  اختار الكولكشن لإنشاء عرض السعر
                </h3>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full md:w-1/2 mx-auto border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">— اختار كولكشن —</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} — {col.brand_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedCollectionId && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-slate-100 pb-5 sm:pb-6">
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d]">
                      {existingQuotationId ? "تعديل عرض سعر" : "إنشاء عرض سعر"}{" "}
                      — {activeCollection?.name}
                    </h2>
                  </div>
                  <div>
                    <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                      {existingQuotationId ? "مسعر مسبقاً" : "قيد التسعير"}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto mb-8">
                  <table className="w-full text-sm text-center min-w-[500px]">
                    <thead className="bg-[#1a365d] text-white">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-1/2 text-right">
                          الموديل
                        </th>
                        <th className="py-3 px-4 font-semibold w-1/2">
                          التكلفة على الشركة (ج.م)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {models.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 text-slate-700 font-medium text-right whitespace-nowrap">
                            {item.name || "بدون اسم"}{" "}
                            <span className="text-slate-400 text-xs">
                              #{item.model_number}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              placeholder="أدخل التكلفة"
                              value={costs[item.id] || ""}
                              onChange={(e) =>
                                handleCostChange(item.id, e.target.value)
                              }
                              className="w-32 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
                    حساب التسعير التلقائي
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-6">
                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">
                        إجمالي التكلفة
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        {totalCost.toLocaleString()} ج.م
                      </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">
                        متوسط التكلفة
                      </p>
                      <p className="text-xl font-bold text-slate-800">
                        {averageCost.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        ج.م
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 text-right">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      اختر نسبة الربح المستهدفة:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[10, 15, 20, 25, 30].map((marginValue) => (
                        <button
                          key={marginValue}
                          onClick={() => setProfitMargin(marginValue)}
                          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors border ${
                            profitMargin === marginValue
                              ? "bg-[#1a365d] text-white border-[#1a365d]"
                              : "bg-white text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
                          }`}
                        >
                          {marginValue}%
                        </button>
                      ))}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">أو نسبة:</span>
                        <input
                          type="number"
                          value={profitMargin}
                          onChange={(e) =>
                            setProfitMargin(parseFloat(e.target.value) || 0)
                          }
                          className="w-20 border border-slate-300 rounded-lg p-2 text-center focus:outline-none focus:border-blue-500 bg-white text-sm"
                        />{" "}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a365d] text-white p-5 rounded-lg text-center flex flex-col md:flex-row justify-between items-center">
                    <p className="text-lg font-medium mb-2 md:mb-0">
                      سعر البيع النهائي المقترح
                    </p>
                    <p className="text-2xl font-bold">
                      {finalSellingPrice.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      ج.م
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 text-right mb-6 sm:mb-8">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                      شروط الدفع والتنفيذ
                    </label>
                    <textarea
                      rows="3"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                      ملاحظات العرض
                    </label>
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 pt-5 sm:pt-6">
                  <button
                    disabled={models.length === 0 || isSubmitting}
                    onClick={handleSaveQuotation}
                    className={`${
                      existingQuotationId
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-[#b91c1c] hover:bg-red-800"
                    } disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto`}
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : existingQuotationId
                        ? "تحديث عرض السعر"
                        : "انشاء وحفظ عرض السعر"}
                  </button>

                  {/* 💡 زرار الإرسال للإدارة - مش هيشتغل غير لو existingQuotationId موجود (يعني متسجل في الداتابيز) */}
                  <button
                    disabled={!existingQuotationId || isSendingApproval}
                    onClick={async () => {
                      setIsSendingApproval(true);
                      try {
                        await sendForApproval(
                          selectedCollectionId,
                          "quotation",
                          "برجاء مراجعة عرض السعر واعتماده",
                        );
                        toast.success("تم إرسال عرض السعر للمدير للاعتماد");
                      } catch (error) {
                        toast.error(error.message || "حدث خطأ أثناء الإرسال");
                      } finally {
                        setIsSendingApproval(false);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
                  >
                    {isSendingApproval
                      ? "جاري الإرسال..."
                      : "إرسال للمدير للاعتماد"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
