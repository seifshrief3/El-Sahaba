import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print"; // 💡 استدعينا المكتبة الجديدة
import TechPackTemplate from "./TechPackTemplate";
import {
  fetchLatestTechPack,
  syncTechPackWithModels,
} from "../services/modelService";

const TechPackSection = ({
  activeModel,
  isGenerating,
  handleSubmitAndGenerate,
  brandName,
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [techPackData, setTechPackData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const componentRef = useRef();

  useEffect(() => {
    const loadTechPackData = async () => {
      if (
        activeModel?.tech_pack_status === "created" ||
        activeModel?.tech_pack_status === "approved"
      ) {
        const data = await fetchLatestTechPack(activeModel.id);
        if (data) {
          setTechPackData(data);
        }
      }
    };
    loadTechPackData();
  }, [activeModel?.id, activeModel?.tech_pack_status]);

  // 💡 دالة الطباعة الخاصة بـ react-to-print
  const handlePrint = useReactToPrint({
    // 💡 التعديل هنا: استخدام contentRef وتمرير المتغير مباشرة
    contentRef: componentRef,
    documentTitle: `TechPack_${activeModel?.model_number || activeModel?.name || "Model"}`,
    onAfterPrint: () => {
      setIsDownloading(false);
      toast.success("تمت العملية بنجاح!");
    },
    onPrintError: () => {
      setIsDownloading(false);
      toast.error("حدث خطأ أثناء الطباعة");
    },
  });

  // 💡 تعديل دالة التحميل عشان تتأكد من الداتا وتستدعي دالة الطباعة
  const handleDownloadPDF = () => {
    if (!techPackData) {
      toast.error(
        "بيانات الورقة الفنية غير مكتملة بعد، يرجى الانتظار أو إعادة التحميل.",
      );
      return;
    }

    setIsDownloading(true);
    toast.info("جاري التجهيز... (برجاء اختيار Save as PDF من نافذة الطباعة)");

    // تشغيل نافذة الطباعة الأصلية
    handlePrint();
  };

  const handleModifyTechPack = async () => {
    if (!chatMessage.trim()) return;

    setIsModifying(true);
    try {
      await fetch(
        "https://n8n.youssef.im/webhook/7714f230-e254-4784-b599-9c4f6f0a410d",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_id: activeModel.id,
            prompt: chatMessage,
            action: "modify",
            current_data: techPackData, // 💡 ضفنا السطر ده عشان نبعت الداتا الحالية
          }),
        },
      );

      // ... باقي الكود ...
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedData = await fetchLatestTechPack(activeModel.id);
      if (updatedData) {
        setTechPackData(updatedData);

        // 💡 السطر الجديد: مزامنة التعديلات مع كل الجداول في الخلفية
        await syncTechPackWithModels(activeModel.id, updatedData);
      }

      toast.success("تم تحديث الورقة الفنية بناءً على طلبك!");
      setChatMessage("");
      // ... باقي الكود ...
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء إرسال التعديل");
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between flex-wrap gap-5 items-center mb-6">
        <div style={{ textAlign: "right" }}>
          <h4 className="text-base font-bold text-[#1a365d] mb-1">
            الورقة الفنية (Tech Pack)
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            سيقوم الذكاء الاصطناعي بكتابة وتعديل التفاصيل الفنية بناءً على
            طلباتك.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {activeModel.tech_pack_status !== "created" &&
            activeModel.tech_pack_status !== "approved" && (
              <button
                type="button"
                onClick={handleSubmitAndGenerate}
                disabled={isGenerating}
                className={`font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-sm ${
                  isGenerating
                    ? "bg-slate-400 text-white"
                    : "bg-[#b91c1c] hover:bg-red-800 text-white"
                }`}
              >
                {isGenerating ? "🤖 جاري التوليد..." : "إنشاء الـ Tech Pack"}
              </button>
            )}

          {(activeModel.tech_pack_status === "created" ||
            activeModel.tech_pack_status === "approved") && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading || !techPackData}
              className={`font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2 ${
                isDownloading || !techPackData
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-[#1a365d] hover:bg-slate-800 text-white"
              }`}
            >
              {isDownloading ? "⏳ جاري التجهيز..." : "⬇ طباعة / تحميل (PDF)"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p
          className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-2"
          style={{ textAlign: "right" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          المساعد الذكي: اطلب أي تعديل على التصميم، المقاسات، أو الخامات...
        </p>

        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {activeModel.tech_pack_status === "created" ? (
            <p
              className="text-xs text-[#1a365d] bg-blue-50 border border-blue-100 rounded-lg p-4 font-medium"
              style={{ textAlign: "right" }}
            >
              الورقة الفنية جاهزة. يمكنك طباعتها الآن أو كتابة أي تعديلات إضافية
              بالأسفل ليقوم النظام بتحديثها فوراً.
            </p>
          ) : (
            <p
              className="text-xs text-slate-400 py-6 font-medium"
              style={{ textAlign: "right" }}
            >
              لم يتم إنشاء الورقة الفنية بعد.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleModifyTechPack()}
            disabled={isModifying || isGenerating}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1a365d] bg-slate-50"
            placeholder="مثال: استبدل الزراير العادية بسوستة مخفية..."
            style={{ textAlign: "right" }}
          />
          <button
            type="button"
            onClick={handleModifyTechPack}
            disabled={isModifying || isGenerating || !chatMessage.trim()}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition ${
              isModifying || !chatMessage.trim()
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-[#1a365d] hover:bg-slate-800 text-white"
            }`}
          >
            {isModifying ? "جاري التعديل..." : "إرسال التعديل"}
          </button>
        </div>
      </div>

      {/* 💡 محتفظين بالديف المخفي عشان التمبلت يفضل في الخلفية والـ ref يمسكه صح */}
      {/* 💡 التعديل هنا: شيلنا display: "none" واستخدمنا إخفاء عن طريق الخروج من الشاشة */}
      <div
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          overflow: "hidden",
        }}
      >
        <TechPackTemplate
          ref={componentRef}
          data={techPackData}
          activeModel={activeModel}
          brandName={brandName}
        />
      </div>
    </div>
  );
};

export default TechPackSection;
