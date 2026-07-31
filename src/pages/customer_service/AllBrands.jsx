import React, { useState, useEffect, useRef } from "react";
import { handleGetBrandsDetailedReport } from "../../services/brandsService";
import BrandCard from "../../components/BrandCard";
import { supabase } from "../../../supabase";
import { useReactToPrint } from "react-to-print";
import AllBrandsOverviewTab from "../../components/AllBrandsOverviewTab";

const AllBrands = () => {
  const formatAiReportToHtml = (content) => {
    if (!content) return "";
    let html = content
      // 1. مسح أي نجوم أو شباك طايرة في سطر فاضي (اللي بتعمل الشكل الوحش)
      .replace(/^[#*]\s*$/gm, "")
      // 2. تنسيق العناوين (استخدمنا gm عشان يقرأ كل السطور مش أول سطر بس)
      .replace(
        /^###\s+(.*$)/gm,
        '<h4 class="text-base font-bold text-[#1a365d] mt-4 mb-1">$1</h4>',
      )
      .replace(
        /^##\s+(.*$)/gm,
        '<h3 class="text-lg font-black text-[#b91c1c] mt-6 mb-2 border-b border-slate-200 pb-2">$1</h3>',
      )
      .replace(
        /^#\s+(.*$)/gm,
        '<h2 class="text-xl font-black text-[#1a365d] mt-6 mb-3">$1</h2>',
      )
      // 3. تنسيق الخط العريض
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
      // 4. تنسيق النقط (البوليتس) اللي بتبدأ بـ نجمة أو شرطة
      .replace(
        /^[\*-]\s+(.*$)/gm,
        '<li class="mr-6 my-1 text-slate-700 list-disc">$1</li>',
      );

    // تحويل المسافات لسطور (مع منع المسافات المزدوجة بعد العناوين)
    html = html.replace(/\n/g, "<br/>");
    html = html.replace(/(<\/[hli][^>]*>)<br\/>/g, "$1"); // عشان مايعملش مسافة كبيرة تحت العنوان
    html = html.replace(/(<br\/>){2,}/g, "<br/><br/>");

    return html;
  };
  const [brandsData, setBrandsData] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [brandLogs, setBrandLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 💡 States جديدة للذكاء الاصطناعي والطباعة
  const printRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReportContent, setAiReportContent] = useState("");

  const getSafeDateObject = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "غير متوفر";
    return dateObj.toLocaleDateString("ar-EG");
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return "--:--";
    return dateObj.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const rawData = await handleGetBrandsDetailedReport();
        const entityToBrandMap = {};

        const formattedData = rawData.map((brand) => {
          entityToBrandMap[brand.id] = brand.id;

          const collections = brand.collections || [];
          const totalCollections = collections.length;
          const activeOrders = collections.filter(
            (c) => c.status === "active",
          ).length;

          const totalPieces = collections.reduce((sum, col) => {
            const ordersTotal = (col.production_orders || []).reduce(
              (oSum, o) => oSum + (o.total_quantity || 0),
              0,
            );
            return (
              sum + (ordersTotal > 0 ? ordersTotal : col.expected_quantity || 0)
            );
          }, 0);

          const history = collections.map((c) => {
            entityToBrandMap[c.id] = brand.id;
            (c.models || []).forEach(
              (m) => (entityToBrandMap[m.id] = brand.id),
            );
            (c.quotations || []).forEach(
              (q) => (entityToBrandMap[q.id] = brand.id),
            );
            (c.production_orders || []).forEach(
              (po) => (entityToBrandMap[po.id] = brand.id),
            );

            let statusAr = "مسودة";
            if (
              c.status === "active" ||
              c.customer_approval === "in_production"
            )
              statusAr = "جاري التنفيذ";
            else if (c.customer_approval === "approved")
              statusAr = "جاهز للتشغيل";
            else if (
              c.customer_approval === "sent" ||
              c.customer_approval === "revision_requested"
            )
              statusAr = "قيد انتظار العميل";

            if (c.status === "completed") statusAr = "تم التسليم";
            if (c.status === "cancelled") statusAr = "ملغي";

            return {
              id: c.id,
              name: c.name,
              date: formatDate(getSafeDateObject(c.created_at)),
              status: statusAr,
            };
          });

          return {
            ...brand,
            stats: { totalCollections, activeOrders, totalPieces },
            history,
            lastUpdates: [],
          };
        });

        const { data: recentLogs, error: logsError } = await supabase
          .from("system_logs")
          .select("title, created_at, entity_id")
          .order("created_at", { ascending: false })
          .limit(1000);

        if (!logsError && recentLogs) {
          recentLogs.forEach((log) => {
            const brandId = entityToBrandMap[log.entity_id];
            if (brandId) {
              const targetBrand = formattedData.find((b) => b.id === brandId);
              if (targetBrand && targetBrand.lastUpdates.length < 3) {
                targetBrand.lastUpdates.push({
                  date: formatDate(getSafeDateObject(log.created_at)),
                  text: log.title,
                });
              }
            }
          });
        }

        setBrandsData(formattedData);
        setFilteredBrands(formattedData);
      } catch (error) {
        console.error("Error fetching detailed brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredBrands(brandsData);
      return;
    }

    const filtered = brandsData.filter(
      (brand) =>
        (brand.name_ar && brand.name_ar.includes(value)) ||
        (brand.code && brand.code.includes(value)) ||
        (brand.client_name && brand.client_name.includes(value)),
    );
    setFilteredBrands(filtered);
  };

  const fetchBrandLogs = async (brand) => {
    setLoadingLogs(true);
    try {
      const entityIds = [brand.id];

      (brand.collections || []).forEach((col) => {
        entityIds.push(col.id);
        (col.models || []).forEach((mod) => entityIds.push(mod.id));
        (col.quotations || []).forEach((q) => entityIds.push(q.id));
        (col.production_orders || []).forEach((po) => entityIds.push(po.id));
      });

      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .in("entity_id", entityIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedLogs = data.map((log) => {
        const d = new Date(log.created_at);
        const isToday = d.toDateString() === new Date().toDateString();

        return {
          id: log.id,
          title: log.title,
          desc: log.description,
          time: formatTime(d),
          date: isToday ? "اليوم" : formatDate(d),
          type: log.action_type,
        };
      });

      setBrandLogs(formattedLogs);
    } catch (err) {
      console.error("Error fetching brand logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const openModal = (brand) => {
    setSelectedBrand(brand);
    setActiveTab("overview");
    setAiReportContent(""); // تصفير التقرير القديم
    setIsModalOpen(true);
    fetchBrandLogs(brand);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    setBrandLogs([]);
    setAiReportContent("");
  };

  // 💡 الحل الجذري لإيرور react-to-print باستخدام contentRef
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير_AI_${selectedBrand?.name_ar || "براند"}`,
    onBeforePrint: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      setIsAnalyzing(false);
    },
  });

  // 💡 دالة الاتصال بـ n8n لعمل التقرير ثم الطباعة
  const handleGenerateAndPrint = async () => {
    if (!selectedBrand) return;
    console.log(selectedBrand);
    setIsAnalyzing(true);
    try {
      // 1. إرسال الطلب لـ n8n
      // استبدل الرابط ده بالـ Webhook الخاص بيك في n8n اللي بيرد بـ Respond to Webhook Node
      const n8nWebhookUrl =
        "https://n8n.youssef.im/webhook/d56bde94-0a4f-4079-8157-6f8d2d5d1071";

      // 💡 تجميع تفاصيل الكولكشنات والموديلات (مع معالجة الأسماء المفقودة)
      const richCollections = (selectedBrand.collections || []).map((c) => ({
        name: c.name || "كولكشن غير مسمى",
        status: c.status,
        expected_quantity: c.expected_quantity || 0,
        models: (c.models || []).map((m) => {
          // هنا بنقوله لو ملقتش m.name دور في باقي الأسماء
          return {
            name:
              m.model_name ||
              m.name_ar ||
              m.name ||
              m.title ||
              "موديل (راجع اسم العمود بالداتابيز)",
            model_number:
              m.code || m.model_code || m.model_number || m.id || "---",
            colors: m.colors || m.color || [],
          };
        }),
        quotation_price:
          c.quotations?.[0]?.total_sales_price || "لم يتم التسعير بعد",
      }));

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: selectedBrand.name_ar,
          contact_person: selectedBrand.contact_person || "غير محدد",
          stats: selectedBrand.stats,
          collections_details: richCollections,
          recent_logs: brandLogs.slice(0, 15),
        }),
      });

      let aiInsights = "";

      if (response.ok) {
        const result = await response.json();
        // افترضنا إن n8n بيرجع النتيجة في متغير اسمه report
        aiInsights =
          result.report ||
          result.text ||
          "تم تحليل البيانات بنجاح ولكن لم يتم إرجاع نص التقرير.";
      } else {
        // لو الـ Webhook لسه مش شغال أو فشل، بنعمل تقرير محاكاة (Fallback) عشان السيستم ميعطلش
        console.warn("الـ Webhook غير متاح، تم استخدام تقرير افتراضي.");
        aiInsights = `بناءً على تحليل بيانات البراند "${selectedBrand.name_ar}"، يتبين أن هناك نشاط ملحوظ بإجمالي ${selectedBrand.stats.totalCollections} كولكشن وطلب لإنتاج ${selectedBrand.stats.totalPieces.toLocaleString()} قطعة. يُنصح بمتابعة الكولكشنات النشطة لضمان التسليم في الموعد المحدد وتحسين معدل استجابة العميل.`;
      }

      // 2. تخزين التقرير في الـ State
      setAiReportContent(aiInsights);

      // 3. ننتظر لحظة صغيرة عشان الـ React يعمل Render للتقرير جوه الـ Template المخفي، وبعدين نطبع
      setTimeout(() => {
        handlePrint();
      }, 500);
    } catch (err) {
      console.error("Error generating AI report:", err);
      alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
      setIsAnalyzing(false);
    }
  };

  const getTimelineIconStyle = (type) => {
    switch (type) {
      case "CREATE":
        return "bg-emerald-100 border-emerald-500 text-emerald-500";
      case "UPDATE":
        return "bg-orange-100 border-orange-500 text-orange-500";
      case "DELETE":
        return "bg-red-100 border-[#b91c1c] text-[#b91c1c]";
      case "STATUS_CHANGE":
        return "bg-blue-100 border-blue-500 text-blue-500";
      case "ACTION":
        return "bg-purple-100 border-purple-500 text-purple-500";
      default:
        return "bg-slate-100 border-slate-400 text-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-slate-50 font-arabic">
        <div className="w-10 h-10 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#1a365d] font-bold text-lg">
          جاري تحميل السجل...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 relative font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1">
              سجل البراندات
            </h1>
            <p className="text-sm text-slate-500">
              إدارة ومتابعة نشاط العملاء التفصيلي.
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="ابحث باسم البراند أو الكود..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.length === 0 ? (
            <div className="col-span-full text-center py-10 text-slate-500 font-bold bg-white rounded-xl border border-slate-200">
              لا توجد بيانات مطابقة للبحث.
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} openModal={openModal} />
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border border-slate-200">
            {/* الهيدر */}
            <div className="flex justify-between items-center p-5 sm:p-6 bg-[#1a365d] text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-xl font-black">
                  {selectedBrand.name_ar.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedBrand.name_ar}</h2>
                  <p className="text-xs text-blue-200 mt-1">
                    الكود:{" "}
                    <span className="font-mono">{selectedBrand.code}</span> |
                    النشاط: {selectedBrand.activity || "غير محدد"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-[#b91c1c] text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === "overview" ? "border-[#b91c1c] text-[#1a365d]" : "border-transparent text-slate-500 hover:text-[#1a365d]"}`}
              >
                نظرة عامة والكولكشنات
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === "timeline" ? "border-[#b91c1c] text-[#1a365d]" : "border-transparent text-slate-500 hover:text-[#1a365d]"}`}
              >
                السجل الزمني (الأنشطة)
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
              {activeTab === "overview" && (
                <AllBrandsOverviewTab selectedBrand={selectedBrand} />
              )}

              {activeTab === "timeline" && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in-up">
                  {loadingLogs ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 text-sm mt-3 font-bold">
                        جاري تحميل السجل الزمني...
                      </p>
                    </div>
                  ) : (
                    <div className="relative border-r-2 border-slate-100 pr-6 space-y-8">
                      {brandLogs.map((event, idx) => (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-[3px] bg-white ${getTimelineIconStyle(event.type)}`}
                          ></div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[#1a365d]">
                              {event.title}
                            </h4>
                            <div className="flex flex-col sm:items-end text-[11px] text-slate-400 font-medium">
                              <span>{event.date}</span>
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-2">
                            {event.desc}
                          </p>
                        </div>
                      ))}
                      {brandLogs.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                          لا توجد أنشطة مسجلة لهذا البراند.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* الفوتر وزر الطباعة الجديد */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex justify-end shrink-0">
              <button
                onClick={handleGenerateAndPrint}
                disabled={isAnalyzing || isPrinting || loadingLogs}
                className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm ${
                  isAnalyzing || isPrinting
                    ? "bg-slate-400 cursor-not-allowed text-white"
                    : "bg-[#1a365d] hover:bg-[#122645] text-white"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحليل والطباعة...
                  </>
                ) : (
                  "🤖 استخراج تقرير AI متكامل"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 💡 قالب التقرير المخفي للطباعة */}
      {/* ======================================= */}
      {selectedBrand && (
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
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.2s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
};

export default AllBrands;
