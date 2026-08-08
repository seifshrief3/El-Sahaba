import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  Download,
  MessageCircle,
  FileText,
  Loader2,
  Printer,
  X,
  Calendar,
} from "lucide-react";
import { supabase } from "../../../supabase"; // مسار supabase بتاعك
import { toast } from "sonner";

// استيراد مكتبات الماركداون والطباعة
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/logo.jpeg"; // تأكد من مسار اللوجو

const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States الخاصة بالمودال والطباعة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchReports();
  }, []);

  // جلب كل التقارير من الداتابيز
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          id,
          title,
          report_type,
          content,
          created_at,
          brands ( name_ar ),
          collections ( name )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReportsList(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("حدث خطأ أثناء جلب التقارير");
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لترجمة نوع التقرير
  const getReportTypeName = (type) => {
    const types = {
      inventory_report: "تقرير جرد مخزون",
      shipments_report: "تقرير حركة شحنات",
      brand_report: "تقرير براند",
      collection_report: "تقرير كولكشن",
      performance_report: "تقرير أداء",
    };
    return types[type] || "تقرير نظام";
  };

  // دالة لفتح المعاينة
  const handleView = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // دالة الطباعة وتوليد الـ PDF
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedReport?.title || "تقرير_الصحابة",
    pageStyle: `
      @media print {
        body { direction: rtl; font-family: 'Tajawal', sans-serif; }
        @page { margin: 15mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  });

  // دالة المشاركة عبر واتساب
  const handleWhatsAppShare = (report) => {
    // تجهيز رسالة مختصرة
    const message = `مرحباً، يرجى مراجعة التقرير التالي على نظام الصحابة:\nعنوان التقرير: *${report.title}*\nالبراند: ${report.brands?.name_ar || "الكل"}\nتاريخ الإصدار: ${new Date(report.created_at).toLocaleDateString("ar-EG")}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1a233a]">
          أرشيف التقارير الذكية
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          استعراض جميع التقارير المولدة بواسطة الذكاء الاصطناعي لكافة أقسام
          المصنع والبراندات، مع إمكانية المعاينة والطباعة.
        </p>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center text-[#1a233a]">
            <Loader2 className="mb-4 h-10 w-10 animate-spin" />
            <h2 className="text-lg font-bold">جاري تحميل أرشيف التقارير...</h2>
          </div>
        </div>
      ) : reportsList.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <p className="text-lg font-medium text-slate-500">
            لا توجد تقارير مسجلة في النظام حتى الآن.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reportsList.map((report) => (
            <div
              key={report.id}
              className="flex flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700">
                    <FileText size={16} />
                    <span className="text-xs font-bold">
                      {getReportTypeName(report.report_type)}
                    </span>
                  </div>
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400"
                    dir="ltr"
                  >
                    {new Date(report.created_at).toLocaleDateString("ar-EG")}{" "}
                    <Calendar size={12} />
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#1a233a] leading-relaxed">
                  {report.title}
                </h2>

                <div className="mt-4 space-y-2">
                  <div className="flex text-sm">
                    <span className="w-20 font-bold text-slate-500">
                      البراند:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {report.brands?.name_ar || "عام (الكل)"}
                    </span>
                  </div>
                  <div className="flex text-sm">
                    <span className="w-20 font-bold text-slate-500">
                      الكولكشن:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {report.collections?.name || "عام (الكل)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleView(report)}
                  className="flex flex-1 justify-center items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#1a233a] transition hover:bg-slate-200"
                >
                  <Eye size={16} />
                  معاينة
                </button>

                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setIsModalOpen(true);
                    setTimeout(handlePrint, 100);
                  }}
                  className="flex flex-1 justify-center items-center gap-2 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-900"
                >
                  <Download size={16} />
                  PDF
                </button>

                <button
                  onClick={() => handleWhatsAppShare(report)}
                  className="flex w-full justify-center items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-100 mt-1"
                >
                  <MessageCircle size={16} />
                  مشاركة واتساب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال معاينة التقرير والطباعة */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* رأس المودال */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xl font-bold text-[#1a233a] flex items-center gap-2">
                <FileText size={20} />
                معاينة التقرير
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-[#1a233a] text-white px-4 py-2 text-sm font-bold hover:bg-[#121828] transition"
                >
                  <Printer size={16} /> طباعة / PDF
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-200 p-2 text-slate-600 hover:bg-red-100 hover:text-[#cc0000] transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* محتوى التقرير للطباعة والمعاينة */}
            <div className="overflow-y-auto p-8 bg-white" ref={printRef}>
              {/* ترويسة التقرير الرسمية للمصنع */}
              <div className="mb-8 flex items-end justify-between border-b-4 border-[#1a233a] pb-6 relative">
                <div>
                  <h1 className="text-3xl font-bold text-[#1a233a]">
                    {selectedReport.title}
                  </h1>
                  <p className="mt-2 text-slate-500 font-medium">
                    تاريخ الإصدار:{" "}
                    {new Date(selectedReport.created_at).toLocaleString(
                      "ar-EG",
                    )}
                  </p>
                  <div className="mt-2 flex gap-4 text-sm font-bold text-slate-700">
                    <p>
                      البراند:{" "}
                      <span className="text-[#cc0000]">
                        {selectedReport.brands?.name_ar || "الكل"}
                      </span>
                    </p>
                    <p>
                      الكولكشن:{" "}
                      <span className="text-[#cc0000]">
                        {selectedReport.collections?.name || "الكل"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* لوجو المصنع */}
                <div className="flex flex-col items-center">
                  <img
                    src={logo}
                    alt="لوجو مصنع الصحابة"
                    className="h-16 w-auto object-contain rounded-md mb-2 shadow-sm border border-slate-100 p-1"
                  />
                  <span className="text-sm font-bold text-[#1a233a]">
                    مصنع الصحابة
                  </span>
                </div>
              </div>

              {/* محتوى التقرير (الذكاء الاصطناعي) */}
              <div
                className="
                print:text-black
                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-[#1a233a] [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:border-b [&>h1]:border-slate-200 [&>h1]:pb-2
                [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-[#1a233a] [&>h2]:mt-6 [&>h2]:mb-3
                [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-700 [&>h3]:mt-4 [&>h3]:mb-2
                [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-4
                [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-4 [&>ul>li]:mb-2 [&>ul>li]:text-slate-800
                [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:mb-4 [&>ol>li]:mb-2
                
                /* تنسيقات الجدول الاحترافية */
                [&>table]:w-full [&>table]:border-collapse [&>table]:mb-8 [&>table]:overflow-hidden [&>table]:rounded-lg [&>table]:shadow-sm
                [&>table>thead>tr>th]:bg-[#1a233a] [&>table>thead>tr>th]:text-white [&>table>thead>tr>th]:p-4 [&>table>thead>tr>th]:text-right
                [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-slate-200 [&>table>tbody>tr>td]:p-3 [&>table>tbody>tr>td]:text-slate-800
                [&>table>tbody>tr:nth-child(even)]:bg-slate-50
                [&>strong]:text-[#cc0000] [&>strong]:font-bold
              "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedReport.content}
                </ReactMarkdown>
              </div>

              {/* تذييل الصفحة (الفوتر) يظهر في الطباعة بس */}
              <div className="hidden print:block mt-16 pt-4 border-t-2 border-[#1a233a] text-center text-sm font-medium text-slate-500">
                <span className="text-[#cc0000] font-bold">مصنع الصحابة</span> -
                هذا المستند تم إنشاؤه آلياً بواسطة الذكاء الاصطناعي -{" "}
                {new Date().getFullYear()} ©
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
