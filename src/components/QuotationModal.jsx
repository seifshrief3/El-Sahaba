import React from "react";

const QuotationModal = ({ selectedQuote, handleCloseModal, handlePrint }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in transition-all duration-300 font-arabic"
      dir="rtl"
    >
      {/* حاوية المودال الرئيسية */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-scale-in">
        {/* الهيدر */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl text-[#1a365d]">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#1a365d] tracking-tight">
                معاينة وتصدير عرض السعر
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                الرقم المرجعي:{" "}
                <span className="font-bold text-slate-700">
                  {selectedQuote.id}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-2.5 rounded-full border border-transparent hover:border-red-100"
            title="إغلاق"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 text-right">
          {/* ==================== ملخص البيانات الأساسية ==================== */}
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            البيانات المالية والحالة
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">
                  تاريخ الإصدار
                </div>
                <div className="font-bold text-base text-[#1a365d]">
                  {selectedQuote.date}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">
                  التكلفة الإجمالية
                </div>
                <div className="font-bold text-base text-[#1a365d]">
                  {Number(selectedQuote.totalCost).toLocaleString()} ج.م
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V17m0-1h.01"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">
                  سعر القطعة
                </div>
                <div className="font-extrabold text-lg text-emerald-600 tracking-tight">
                  {Number(selectedQuote.finalPrice).toLocaleString()} ج.م
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1 font-medium">
                  الحالة
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${
                    selectedQuote.status === "تم الاعتماد"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-red-50 text-[#b91c1c] border border-red-100"
                  }`}
                >
                  {selectedQuote.status}
                </span>
              </div>
            </div>
          </div>

          {/* ==================== المواصفات الفنية للمنتج ==================== */}
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            المواصفات الفنية
          </h4>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  البراند
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.brand}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  الكولكشن
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.collection}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  الفئة
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.category || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  نوع الخامة
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.main_fabric || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  وزن الخامة
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.fabric_weight || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  المقاسات
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.sizes || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  الحد الأدنى للتصنيع
                </div>
                <div className="font-bold text-[#1a365d]">
                  {selectedQuote.min_qty || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">
                  هامش الربح المسجل
                </div>
                <div className="font-bold text-emerald-600">
                  {selectedQuote.profitMargin}%
                </div>
              </div>
            </div>
          </div>

          {/* ==================== الموديلات المتضمنة ==================== */}
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            الموديلات المرفقة
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {selectedQuote.models && selectedQuote.models.length > 0 ? (
              selectedQuote.models.map((m, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-36 bg-slate-50 relative p-2">
                    <img
                      src={
                        m.image_url ||
                        "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+الموديل"
                      }
                      alt={`Model ${m.model_number}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+الموديل";
                      }}
                    />
                  </div>
                  <div className="p-2 text-center border-t border-slate-100 bg-slate-50">
                    <span className="text-xs font-bold text-[#1a365d]">
                      رقم: {m.model_number || `M-${i + 1}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 bg-white border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-bold">
                لا توجد صور موديلات مضافة في هذا العرض.
              </div>
            )}
          </div>
        </div>

        {/* منطقة الأكشن الـ (Footer) */}
        <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">
              عند الطباعة، يرجى اختيار{" "}
              <span className="font-bold">"حفظ بتنسيق PDF"</span>.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-[#1a365d] hover:bg-[#0f172a] text-white px-8 py-3 rounded-xl text-base font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            تصدير ملف PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;
