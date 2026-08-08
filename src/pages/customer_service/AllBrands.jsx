import React, { useState, useEffect, useRef } from "react";
import { handleGetBrandsDetailedReport } from "../../services/brandsService";
import BrandCard from "../../components/BrandCard";
import { supabase } from "../../../supabase";
import { useReactToPrint } from "react-to-print";
import AllBrandsOverviewTab from "../../components/AllBrandsOverviewTab";
import AllBrandsTimeLineTab from "../../components/AllBrandsTimeLineTab";
import BrandTempleatePDF from "../../components/BrandTempleatePDF";

const AllBrands = () => {
  const formatAiReportToHtml = (content) => {
    if (!content) return "";
    let html = content
      .replace(/^[#*]\s*$/gm, "")
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
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
      .replace(
        /^[\*-]\s+(.*$)/gm,
        '<li class="mr-6 my-1 text-slate-700 list-disc">$1</li>',
      );

    html = html.replace(/\n/g, "<br/>");
    html = html.replace(/(<\/[hli][^>]*>)<br\/>/g, "$1");
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
    setAiReportContent("");
    setIsModalOpen(true);
    fetchBrandLogs(brand);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    setBrandLogs([]);
    setAiReportContent("");
  };

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

  const handleGenerateAndPrint = async () => {
    if (!selectedBrand) return;
    console.log(selectedBrand);
    setIsAnalyzing(true);
    try {
      const n8nWebhookUrl =
        "https://n8n.youssef.im/webhook/d56bde94-0a4f-4079-8157-6f8d2d5d1071";

      const richCollections = (selectedBrand.collections || []).map((c) => ({
        name: c.name || "كولكشن غير مسمى",
        status: c.status,
        expected_quantity: c.expected_quantity || 0,
        models: (c.models || []).map((m) => {
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
        aiInsights =
          result.report ||
          result.text ||
          "تم تحليل البيانات بنجاح ولكن لم يتم إرجاع نص التقرير.";
      } else {
        console.warn("الـ Webhook غير متاح، تم استخدام تقرير افتراضي.");
        aiInsights = `بناءً على تحليل بيانات البراند "${selectedBrand.name_ar}"، يتبين أن هناك نشاط ملحوظ بإجمالي ${selectedBrand.stats.totalCollections} كولكشن وطلب لإنتاج ${selectedBrand.stats.totalPieces.toLocaleString()} قطعة. يُنصح بمتابعة الكولكشنات النشطة لضمان التسليم في الموعد المحدد وتحسين معدل استجابة العميل.`;
      }

      setAiReportContent(aiInsights);

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
                <AllBrandsTimeLineTab
                  loadingLogs={loadingLogs}
                  brandLogs={brandLogs}
                  getTimelineIconStyle={getTimelineIconStyle}
                />
              )}
            </div>

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

      {selectedBrand && (
        <BrandTempleatePDF
          aiReportContent={aiReportContent}
          selectedBrand={selectedBrand}
          printRef={printRef}
          brandLogs={brandLogs}
          formatAiReportToHtml={formatAiReportToHtml}
        />
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
