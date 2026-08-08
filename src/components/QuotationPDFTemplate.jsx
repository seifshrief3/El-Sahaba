import React from "react";
import logoImage from "../assets/logo.jpeg";

const QuotationPDFTemplate = React.forwardRef(({ data }, ref) => {
  if (!data) return null;
  console.log(data);
  const models = data.models && data.models.length > 0 ? data.models : [];
  const finalPrice = data.finalPrice || 0;
  const brandName = data.brand || "---";
  const collectionName = data.collection || "---";

  const category =
    data.category && data.category !== "-" && data.category.trim() !== ""
      ? data.category
      : "أولادي";

  const mainFabric =
    data.main_fabric &&
    data.main_fabric !== "-" &&
    data.main_fabric.trim() !== ""
      ? data.main_fabric
      : "ميلتون مكستر";

  const fabricWeight =
    data.fabric_weight &&
    data.fabric_weight !== "-" &&
    data.fabric_weight.trim() !== ""
      ? data.fabric_weight
      : "330 جرام";

  const sizes =
    data.sizes && data.sizes !== "-" && data.sizes.trim() !== ""
      ? data.sizes
      : "6 / 8 / 10 / 12 / 14";

  const minQty = data.min_qty || data.expected_quantity || "500 قطعة";

  return (
    <div
      ref={ref}
      className="bg-white font-arabic relative"
      style={{ direction: "rtl", color: "#0f172a" }}
    >
      <style>
        {`
          @page { size: A4 portrait; margin: 0mm; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; }
            .pdf-container { width: 210mm; height: 297mm; padding: 8mm; box-sizing: border-box; overflow: hidden; }
          }
        `}
      </style>

      <div
        className="pdf-container mx-auto"
        // 💡 التعديل هنا: تحديد الطول الصارم ومنع التمدد لصفحة تانية
        style={{
          width: "210mm",
          height: "297mm",
          padding: "8mm",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div className="border-[3px] border-[#0f172a] h-full p-1 flex flex-col">
          <div className="border border-[#0f172a] h-full p-4 flex flex-col relative">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center border-b-[3px] border-[#0f172a] pb-3 mb-4">
              <div className="w-32 flex flex-col items-center">
                <img
                  src={logoImage}
                  alt="الصحابة"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="text-center flex-1">
                <h1 className="text-4xl font-black text-[#0f172a] mb-1 tracking-wide">
                  عرض سعر
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-8 bg-[#b91c1c]"></div>
                  <h2 className="text-[#b91c1c] font-bold text-sm">
                    شركة الصحابة لتصنيع وتصدير الملابس
                  </h2>
                  <div className="h-px w-8 bg-[#b91c1c]"></div>
                </div>
              </div>
              <div className="w-32 flex flex-col items-center justify-center">
                <div className="text-xl font-black text-[#4338ca] text-center leading-tight">
                  {brandName}
                </div>
              </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              {/* قسم بيانات المنتج (يمين) */}
              <div className="col-span-5">
                <div className="bg-[#0f172a] text-white text-center py-1.5 font-bold text-sm border-2 border-[#0f172a]">
                  بيانات المنتج
                </div>
                <table className="w-full border-collapse border-2 border-[#0f172a] text-center text-sm">
                  <tbody>
                    {[
                      // 1. اسم المنتج هياخد اللي متسجل في التيك باك (زي كلمة هودي)
                      {
                        label: "اسم المنتج",
                        value: data.category || "منتج مجمع",
                      },

                      { label: "رقم الموديل", value: "-" },
                      { label: "اسم البراند", value: brandName },

                      // 💡 2. الفئة هنا هتقرأ المتغير اللي جبناه من جدول collections
                      { label: "الفئة", value: data.department || "غير محدد" },

                      { label: "نوع الخامة", value: mainFabric },
                      { label: "وزن الخامة", value: fabricWeight },
                      { label: "المقاسات", value: sizes },
                      { label: "الحد الأدنى للتصنيع", value: "-" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-[#0f172a]">
                        <th className="border-l border-[#0f172a] py-1.5 px-2 bg-slate-50 text-[#0f172a] w-1/3">
                          {row.label}
                        </th>
                        <td className="py-1.5 px-2 font-bold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* قسم صور الموديلات (يسار) */}
              <div className="col-span-7 flex flex-col border-2 border-[#0f172a]">
                <div className="bg-[#0f172a] text-white text-center py-1.5 font-bold text-sm">
                  صورة الموديلات
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 p-2 bg-white">
                  {models.slice(0, 4).map((m, i) => {
                    const imgSrc =
                      m.image_url && m.image_url.trim() !== ""
                        ? m.image_url
                        : "https://placehold.co/400x600/f8fafc/1e293b?text=صورة+الموديل";

                    return (
                      <div
                        key={i}
                        // 💡 تقليل ارتفاع الصور قليلاً لضمان عدم الخروج من الصفحة
                        className="border border-slate-200 h-[120px] flex items-center justify-center p-1 bg-slate-50 overflow-hidden"
                      >
                        <img
                          src={imgSrc}
                          alt={`Model ${m.model_number || i}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/400x600/f8fafc/1e293b?text=خطأ+في+الصورة";
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ================= PRICE BADGE ================= */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <div className="bg-[#b91c1c] text-white font-bold px-10 py-1.5 rounded-t-lg z-10 -mb-1 text-lg">
                سعر القطعة
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -right-8 h-full flex flex-col justify-center gap-1">
                  <div className="w-6 h-full bg-[#b91c1c] clip-chevron-right absolute -right-2"></div>
                  <div className="w-6 h-full bg-[#0f172a] clip-chevron-right absolute right-0"></div>
                </div>
                <div className="bg-[#0f172a] border-[5px] border-[#b91c1c] outline outline-4 outline-white px-20 py-5 z-0 flex items-center justify-center shadow-lg relative min-w-[300px]">
                  <span className="text-white text-5xl font-black tracking-tighter leading-none">
                    {Number(finalPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="absolute -left-8 h-full flex flex-col justify-center gap-1">
                  <div className="w-6 h-full bg-[#b91c1c] clip-chevron-left absolute -left-2"></div>
                  <div className="w-6 h-full bg-[#0f172a] clip-chevron-left absolute left-0"></div>
                </div>
              </div>
              <div className="bg-[#b91c1c] text-white font-bold px-10 py-1 rounded-b-lg z-10 -mt-1 text-base">
                جنيه
              </div>
            </div>

            {/* ================= NOTES ================= */}
            <div className="mt-4 relative border-2 border-[#0f172a] rounded-xl p-5 pt-6">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white px-8 py-1 font-bold rounded-full text-sm">
                ملاحظات
              </div>
              <ul className="list-none p-0 m-0 space-y-2 text-sm font-bold text-slate-800">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#b91c1c]"></div>مدة
                  التنفيذ تبدأ بعد اعتماد العينة وسداد الدفعة المقدمة.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#b91c1c]"></div>جميع
                  الأسعار قابلة للمراجعة حسب الخامات والكميات.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#b91c1c]"></div>السعر
                  النهائي يعتمد بعد مراجعة الملف الفني.
                </li>
              </ul>
            </div>

            <div className="mt-3 flex border-2 border-dashed border-[#b91c1c] bg-red-50/50 rounded-lg overflow-hidden">
              <div className="bg-[#b91c1c] text-white flex items-center justify-center px-6 font-bold text-lg">
                ملحوظة:
              </div>
              <div className="p-3 text-sm font-bold text-[#b91c1c] text-center flex-1 leading-relaxed">
                تم احتساب أسعار هذا الموديل وفق أسعار الخامات وتكاليف الإنتاج
                السارية بتاريخ إصدار هذا العرض، ونظراً للتغير المستمر في
                الأسعار، فإن أي تأخير في اعتماد الطلب أو بدء التنفيذ قد يستلزم
                إعادة مراجعة وتحديث السعر وفق الأسعار السارية وقت التنفيذ.
              </div>
            </div>

            <div className="flex-1"></div>

            {/* ================= FOOTER ================= */}
            <div className="bg-[#0f172a] text-white text-center py-2 mt-2 rounded-b flex flex-col items-center justify-center shrink-0">
              <div className="font-bold text-sm mb-0.5">
                شركة الصحابة لتصنيع وتصدير الملابس
              </div>
              <div className="text-xs text-slate-300">
                لأن نجاح البراند يبدأ من جودة التصنيع.
              </div>
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .clip-chevron-right { clip-path: polygon(100% 0, 0 50%, 100% 100%, 70% 100%, -30% 50%, 70% 0); }
          .clip-chevron-left { clip-path: polygon(0 0, 100% 50%, 0 100%, 30% 100%, 130% 50%, 30% 0); }
        `,
          }}
        />
      </div>
    </div>
  );
});

QuotationPDFTemplate.displayName = "QuotationPDFTemplate";
export default QuotationPDFTemplate;
