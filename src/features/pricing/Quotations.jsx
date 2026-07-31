import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { pricingService } from "../../services/pricingService";
import QuotationPDFTemplate from "../../components/QuotationPDFTemplate";
import QuotationModal from "../../components/QuotationModal";

const Quotations = () => {
  const [quotationsData, setQuotationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // 1. Ref واحد فقط للقالب المخفي الذي سيتم طباعته
  const contentRef = useRef(null);

  useEffect(() => {
    const loadQuotations = async () => {
      setIsLoading(true);
      try {
        const data = await pricingService.fetchQuotations();
        setQuotationsData(data);
      } catch (error) {
        console.error("خطأ في جلب عروض الأسعار:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuotations();
  }, []);

  // خريطة الحالات لربط الواجهة بالداتابيز
  const statusMapToDB = {
    مسودة: "draft",
    "بانتظار رد العميل": "sent",
    "مرفوض / يحتاج تعديل": "revision_requested",
    "تم التعديل": "revised",
    "تم الاعتماد": "approved",
    "مرفوض نهائياً": "rejected",
  };
  const availableStatuses = Object.keys(statusMapToDB);

  // 💡 دالة تغيير حالة عرض السعر من الجدول مباشرة
  const handleStatusChangeRow = async (realId, newArabicStatus) => {
    const dbStatus = statusMapToDB[newArabicStatus];

    // تغيير فوري في الواجهة (Optimistic Update)
    setQuotationsData((prev) =>
      prev.map((quote) =>
        quote.real_id === realId
          ? { ...quote, status: newArabicStatus }
          : quote,
      ),
    );

    try {
      // إرسال التحديث للداتابيز
      await pricingService.updateQuotationStatus(realId, dbStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث الحالة في قاعدة البيانات.");
    }
  };

  const filteredQuotations = quotationsData.filter((quote) => {
    const matchSearch =
      quote.brand.includes(searchTerm) ||
      quote.collection.includes(searchTerm) ||
      quote.id.includes(searchTerm);
    const matchStatus =
      filterStatus === "الكل" ? true : quote.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "تم الاعتماد":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "بانتظار رد العميل":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "مرفوض / يحتاج تعديل":
        return "bg-red-50 text-[#b91c1c] border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleOpenModal = async (quote) => {
    setIsFetchingDetails(true);
    try {
      const details = await pricingService.fetchQuotationDetailsForPDF(
        quote.collection_id,
      );

      const fullQuoteData = {
        ...quote,
        models: details.models,
        category: details.category,
        main_fabric: details.main_fabric,
        fabric_weight: details.fabric_weight,
        sizes: details.sizes,
        min_qty: quote.expected_quantity || "500 قطعة",
      };

      setSelectedQuote(fullQuoteData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("خطأ في جلب تفاصيل العرض:", error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `عرض_سعر_${selectedQuote?.id || "جديد"}`,
    pageStyle: "@page { size: A4 portrait; margin: 0mm; }",
  });

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      {/* قالب الـ PDF المخفي */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          display: "none",
        }}
      >
        <QuotationPDFTemplate ref={contentRef} data={selectedQuote} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a365d] mb-1">
              سجل عروض الأسعار
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              أرشيف لجميع عروض الأسعار التي تم إنشاؤها، مع متابعة حالات
              الاعتماد.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/customer_service/pricing"
              className="flex-1 sm:flex-none bg-slate-50 text-[#1a365d] border border-slate-200 hover:border-[#1a365d] hover:bg-slate-100 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center text-center"
            >
              ◀ العودة للتسعير
            </Link>
            <Link
              to="/customer_service/pricing"
              className="flex-1 sm:flex-none bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center text-center"
            >
              + إنشاء عرض سعر
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="ابحث برقم العرض، اسم البراند، أو الكولكشن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-56 border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm font-bold text-[#1a365d]"
          >
            <option value="الكل">جميع الحالات</option>
            <option value="تم الاعتماد">تم الاعتماد ✓</option>
            <option value="بانتظار رد العميل">بانتظار رد العميل ⏳</option>
            <option value="مسودة">مسودة 📝</option>
            <option value="مرفوض / يحتاج تعديل">مرفوض / يحتاج تعديل ✕</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-right">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    رقم العرض
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    البراند / الكولكشن
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    التكلفة والربح
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    سعر البيع النهائي
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    إجراءات وتحديث الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="text-slate-500 font-bold text-sm">
                        جاري تحميل عروض الأسعار...
                      </div>
                    </td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="text-slate-500 text-sm font-bold">
                        لا توجد عروض أسعار متاحة حالياً.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-bold text-[#1a365d]">
                          {quote.id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-sm">
                          {quote.brand}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {quote.collection}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                        {quote.date}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-500 mb-1">
                          تكلفة:{" "}
                          <span className="font-bold text-slate-700">
                            {Number(quote.totalCost).toLocaleString()} ج
                          </span>
                        </div>
                        <div className="text-[10px] font-bold bg-[#1a365d]/10 text-[#1a365d] inline-block px-1.5 py-0.5 rounded">
                          هامش {quote.profitMargin}%
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-base font-black text-[#1a365d]">
                          {Number(quote.finalPrice).toLocaleString()}{" "}
                          <span className="text-xs font-medium text-slate-500">
                            ج.م
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusStyle(quote.status)}`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 💡 القائمة المنسدلة لتغيير الحالة */}
                          <select
                            value={quote.status}
                            onChange={(e) =>
                              handleStatusChangeRow(
                                quote.real_id,
                                e.target.value,
                              )
                            }
                            className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white text-slate-700 font-bold focus:outline-none focus:border-[#1a365d] cursor-pointer"
                            title="تحديث حالة العرض"
                          >
                            {availableStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleOpenModal(quote)}
                            className="text-slate-400 hover:text-[#1a365d] transition-colors p-1.5 rounded hover:bg-slate-100"
                            title="فتح العرض"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              ></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenModal(quote)}
                            disabled={isFetchingDetails}
                            className="text-sm font-bold text-[#1a365d] hover:text-[#b91c1c] transition-colors px-1 py-1 underline disabled:opacity-50 whitespace-nowrap"
                          >
                            {isFetchingDetails ? "جاري..." : "فتح العرض"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* المودال */}
      {isModalOpen && selectedQuote && (
        <QuotationModal
          selectedQuote={selectedQuote}
          handlePrint={handlePrint}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Quotations;
