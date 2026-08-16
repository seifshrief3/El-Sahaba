import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Eye,
  Download,
  Filter,
  Calendar,
  Clock,
  X,
  Printer,
  TrendingUp, // أيقونة جديدة لتقرير الأداء
} from "lucide-react";
import { supabase } from "../../../supabase";
import { toast } from "sonner";

// استيراد مكتبات الماركداون والطباعة
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/logo.jpeg";

export default function ShippingReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const [brands, setBrands] = useState([]);
  const [collections, setCollections] = useState([]);

  // Form State
  const [reportType, setReportType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal & Print State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const printRef = useRef();

  const reportsRequiringDates = [
    "inventory_report",
    "shipments_report",
    "performance_report",
  ];

  const isDateNeeded = reportsRequiringDates.includes(reportType);

  useEffect(() => {
    fetchFiltersData();
    fetchRecentReports();
  }, []);

  const fetchFiltersData = async () => {
    try {
      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name_ar");

      const { data: collectionsData } = await supabase
        .from("collections")
        .select("id, name, brand_id");

      if (brandsData) setBrands(brandsData);
      if (collectionsData) setCollections(collectionsData);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchRecentReports = async () => {
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
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error("يرجى اختيار نوع التقرير أولاً");
      return;
    }

    setIsLoading(true);
    toast.info(
      "جاري تحليل البيانات وتوليد التقرير بواسطة الذكاء الاصطناعي... ⏳",
    );

    try {
      const webhookUrl =
        "https://n8n.youssef.im/webhook/69a361f3-f1e9-46bb-ad8f-8e43f2c29be9";

      // 💡 التعديل هنا: إضافة توقيت بداية ونهاية اليوم للتواريخ
      const payload = {
        report_type: reportType,
        brand_id: selectedBrand || null,
        collection_id: selectedCollection || null,
        date_from: isDateNeeded && dateFrom ? `${dateFrom} 00:00:00` : null,
        date_to: isDateNeeded && dateTo ? `${dateTo} 23:59:59` : null,
      };

      // 1. إرسال الطلب لـ n8n
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 2. التحقق من الاستجابة (لو مسار الـ False اشتغل وn8n رجع 400)
      if (!response.ok) {
        let errorMessage = "حدث خطأ أثناء توليد التقرير.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.log("No JSON error returned");
        }
        throw new Error(errorMessage);
      }

      // 3. لو مسار الـ True اشتغل وn8n رجع 200 OK (التقرير اتعمل)
      toast.success("تم توليد التقرير بنجاح! ✨");
      fetchRecentReports(); // تحديث القائمة بالتقرير الجديد
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(
        error.message || "حدث خطأ، لا توجد بيانات كافية لتوليد التقرير.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-arabic" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a233a]">
            تقارير المصنع والتحليلات
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            إنشاء ومعاينة وتحميل تقارير الشحن والجرد وتحليلات الأداء المدعومة
            بالذكاء الاصطناعي.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-[#1a233a]">
            <Filter size={18} />
            <h2 className="font-bold">توليد تقرير ذكي (AI)</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-6">
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#1a233a] text-sm disabled:opacity-50"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedCollection("");
              }}
              // لو تقرير الأداء العام متحدد، نقفل اختيار البراند عشان يحلل المصنع كله
              disabled={reportType === "performance_report"}
            >
              <option value="">كل البراندات</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name_ar}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#1a233a] text-sm disabled:opacity-50"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              disabled={!selectedBrand || reportType === "performance_report"}
            >
              <option value="">كل الكولكشنات</option>
              {collections
                .filter((c) => c.brand_id === selectedBrand)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#1a233a] text-sm font-bold text-[#1a233a]"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                // تصفير البراند لو اختار تقرير الأداء العام
                if (e.target.value === "performance_report") {
                  setSelectedBrand("");
                  setSelectedCollection("");
                }
              }}
            >
              <option value="">نوع التقرير...</option>
              <option value="inventory_report">تقرير جرد المخزون</option>
              <option value="shipments_report">تقرير حركة الشحنات</option>
              {/* الخيار الجديد لتقرير الأداء */}
              <option value="performance_report">
                تقرير تحليل الأداء الشامل
              </option>
            </select>

            <div
              className={`relative transition-opacity duration-300 ${!isDateNeeded ? "opacity-50" : ""}`}
            >
              <Calendar
                size={16}
                className="absolute right-3 top-3 text-slate-400"
              />
              <input
                type="date"
                disabled={!isDateNeeded}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-[#1a233a] disabled:cursor-not-allowed"
              />
            </div>

            <div
              className={`relative transition-opacity duration-300 ${!isDateNeeded ? "opacity-50" : ""}`}
            >
              <Calendar
                size={16}
                className="absolute right-3 top-3 text-slate-400"
              />
              <input
                type="date"
                disabled={!isDateNeeded}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:border-[#1a233a] disabled:cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex justify-center items-center gap-2 rounded-xl bg-red-800 text-white font-bold p-2.5 hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? "جاري التوليد..." : <>توليد التقرير</>}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 p-6 bg-slate-50/50">
            <Clock size={18} className="text-[#1a233a]" />
            <h2 className="font-bold text-[#1a233a]">
              أرشيف التقارير الذكية (للإدارة)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-[#1a233a] text-white">
                <tr>
                  <th className="p-4 font-bold">اسم التقرير</th>
                  <th className="p-4 font-bold">نوع التقرير</th>
                  <th className="p-4 font-bold">البراند</th>
                  <th className="p-4 font-bold">تاريخ الإصدار</th>
                  <th className="p-4 text-center font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-slate-500 font-medium"
                    >
                      لا توجد تقارير مولدة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3 font-semibold text-slate-800">
                        <div className="bg-slate-100 p-2 rounded-lg text-[#1a233a]">
                          {/* تغيير الأيقونة حسب نوع التقرير */}
                          {r.report_type === "performance_report" ? (
                            <TrendingUp
                              size={16}
                              className="text-emerald-600"
                            />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        {r.title}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {r.report_type === "performance_report"
                          ? "تحليل أداء"
                          : r.report_type === "shipments_report"
                            ? "حركة شحنات"
                            : "جرد مخزون"}
                      </td>
                      <td className="p-4 text-slate-600">
                        {r.report_type === "performance_report"
                          ? "شامل (المصنع)"
                          : r.brands?.name_ar || "الكل"}
                      </td>
                      <td className="p-4 text-slate-500" dir="ltr">
                        {new Date(r.created_at).toLocaleString("ar-EG")}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewReport(r)}
                            className="rounded-lg bg-blue-50 text-blue-700 p-2 hover:bg-blue-100 transition shadow-sm"
                            title="عرض التقرير"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setIsModalOpen(true);
                              setTimeout(handlePrint, 100);
                            }}
                            className="rounded-lg bg-slate-100 text-slate-700 p-2 hover:bg-slate-200 transition shadow-sm"
                            title="تحميل PDF"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
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

            <div className="overflow-y-auto p-8 bg-white" ref={printRef}>
              {/* === ترويسة التقرير الرسمية للمصنع === */}
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
                </div>

                {/* جزء اللوجو واسم المصنع */}
                <img
                  src={logo}
                  alt="لوجو مصنع الصحابة"
                  className="h-[100px] object-contain rounded-md p-1"
                />
              </div>
              {/* ================================ */}

              {/* === محتوى التقرير (الذكاء الاصطناعي) === */}
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

              {/* === تذييل الصفحة (الفوتر) يظهر في الطباعة بس === */}
              <div className="hidden print:block mt-16 pt-4 border-t-2 border-[#1a233a] text-center text-sm font-medium text-slate-500">
                <span className="text-[#cc0000] font-bold">مصنع الصحابة</span> -
                هذا المستند تم إنشاؤه آلياً بواسطة النظام الذكي لإدارة أوردرات
                المصنع - {new Date().getFullYear()} ©
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
