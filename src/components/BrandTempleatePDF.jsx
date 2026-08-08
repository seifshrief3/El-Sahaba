import React from "react";

const BrandTempleatePDF = ({
  selectedBrand,
  aiReportContent,
  printRef,
  brandLogs,
  formatAiReportToHtml,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "-9999px",
        right: "-9999px",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div
        ref={printRef}
        dir="rtl"
        className="p-10 font-arabic bg-white text-[#1a365d]"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <style>
          {`
                @page { size: A4 portrait; margin: 15mm; }
                @media print {
                  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  .page-break-before { page-break-before: always; }
                  .page-break-avoid { page-break-inside: avoid; }
                }
              `}
        </style>

        {/* الغلاف */}
        <div className="border-b-[6px] border-[#b91c1c] pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black mb-2 text-[#1a365d]">
              تقرير تحليل ذكاء اصطناعي (AI)
            </h1>
            <p className="text-xl font-bold text-slate-500">
              العميل / البراند: {selectedBrand.name_ar}
            </p>
            <p className="text-sm font-bold text-slate-400 mt-2">
              تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")} -{" "}
              {new Date().toLocaleTimeString("ar-EG")}
            </p>
          </div>
          <div className="w-20 h-20 bg-[#1a365d] text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg">
            {selectedBrand.name_ar.charAt(0)}
          </div>
        </div>

        {/* 🤖 قسم الـ AI بعد التنسيق */}
        {aiReportContent && (
          <div className="mb-10 bg-blue-50 border border-blue-200 p-6 rounded-xl relative">
            <div className="absolute top-[-14px] right-6 bg-[#1a365d] text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">
              موجز الذكاء الاصطناعي 🤖
            </div>
            <div
              className="text-slate-800 text-sm leading-relaxed mt-4"
              dangerouslySetInnerHTML={{
                __html: formatAiReportToHtml(aiReportContent),
              }}
            />
          </div>
        )}

        {/* 1. نظرة عامة */}
        <div className="mb-10">
          <h2 className="text-2xl font-black border-b-2 border-slate-200 pb-2 mb-4 text-[#b91c1c]">
            1. نظرة عامة والبيانات الأساسية
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                بيانات التواصل
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-slate-500 ml-2">الكود:</span>
                  <strong>{selectedBrand.code}</strong>
                </p>
                <p>
                  <span className="text-slate-500 ml-2">المسؤول:</span>
                  <strong>{selectedBrand.contact_person || "---"}</strong>
                </p>
                <p>
                  <span className="text-slate-500 ml-2">الهاتف:</span>
                  <strong dir="ltr">{selectedBrand.phone || "---"}</strong>
                </p>
                <p>
                  <span className="text-slate-500 ml-2">العنوان:</span>
                  <strong>{selectedBrand.address || "---"}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                إحصائيات التشغيل
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-slate-500 ml-2">
                    إجمالي الكولكشنات:
                  </span>
                  <strong>{selectedBrand.stats.totalCollections}</strong>
                </p>
                <p>
                  <span className="text-slate-500 ml-2">
                    الكولكشنات النشطة للتصنيع:
                  </span>
                  <strong className="text-[#b91c1c]">
                    {selectedBrand.stats.activeOrders}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500 ml-2">
                    إجمالي القطع المطلوبة:
                  </span>
                  <strong>
                    {selectedBrand.stats.totalPieces.toLocaleString()} قطعة
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. سجل الكولكشنات */}
        <div className="mb-10 page-break-avoid">
          <h2 className="text-2xl font-black border-b-2 border-slate-200 pb-2 mb-4 text-[#b91c1c]">
            2. سجل الكولكشنات والطلبيات
          </h2>
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="py-3 px-4 border border-slate-200 font-bold">
                  اسم الكولكشن
                </th>
                <th className="py-3 px-4 border border-slate-200 font-bold">
                  تاريخ الإنشاء
                </th>
                <th className="py-3 px-4 border border-slate-200 font-bold">
                  الحالة الحالية
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedBrand.history.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 border border-slate-200"
                  >
                    لا يوجد كولكشنات مسجلة
                  </td>
                </tr>
              ) : (
                selectedBrand.history.map((col, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-3 px-4 border border-slate-200 font-bold">
                      {col.name}
                    </td>
                    <td className="py-3 px-4 border border-slate-200 text-sm">
                      {col.date}
                    </td>
                    <td className="py-3 px-4 border border-slate-200 text-sm font-bold">
                      {col.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. السجل الزمني التفصيلي (الأنشطة) */}
        <div className="page-break-before">
          <h2 className="text-2xl font-black border-b-2 border-slate-200 pb-2 mb-6 text-[#b91c1c]">
            3. السجل الزمني للأحداث (Audit Trail)
          </h2>
          <div className="border-r-4 border-slate-200 pr-6 space-y-6">
            {brandLogs.map((log, idx) => (
              <div key={idx} className="relative page-break-avoid">
                <div className="absolute -right-[34px] top-1.5 w-5 h-5 rounded-full border-4 border-white bg-[#1a365d] shadow-sm"></div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-black text-[#1a365d]">
                      {log.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      {log.date} | {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    {log.desc}
                  </p>
                </div>
              </div>
            ))}
            {brandLogs.length === 0 && (
              <p className="text-center text-slate-500 font-bold py-10">
                لا توجد أنشطة مسجلة في السجل الزمني.
              </p>
            )}
          </div>
        </div>

        <div className="text-center mt-12 pt-6 border-t border-slate-200 text-xs font-bold text-slate-400">
          تم استخراج التقرير آلياً - نظام الصحابة لإدارة العمليات
        </div>
      </div>
    </div>
  );
};

export default BrandTempleatePDF;
