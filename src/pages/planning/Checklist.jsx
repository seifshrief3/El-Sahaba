import React, { useState } from "react";
import { Link } from "react-router-dom";

const Checklist = () => {
  // بيانات وهمية للموديل اللي المخطط شغال عليه دلوقتي
  const modelInfo = {
    id: "M-101",
    collectionName: "الزي الشتوي 2026",
    brand: "مدرسة ستانفورد",
    name: "تيشيرت بولو شتوي كم طويل",
    fabric: "قطن بيكيه 100%",
    weight: "220 جرام",
    totalQty: 1500,
    sizes: ["6 سنوات", "8 سنوات", "10 سنوات", "12 سنة"],
    deliveryDate: "15 أغسطس 2026",
    notes: "برجاء الاهتمام بجودة تطريز اللوجو على الصدر.",
  };

  // الـ 17 مرحلة إنتاجية
  const stagesList = [
    "استلام الخامات",
    "فحص الخامات",
    "الباترون",
    "العينة المبدئية",
    "الفرد",
    "القص",
    "الترقيم",
    "الطباعة / التطريز",
    "التجميع المبدئي",
    "الخياطة",
    "العراوي والزراير",
    "التنظيف",
    "فحص الجودة المبدئي (QC)",
    "المكواة",
    "التعبئة والتغليف",
    "فحص الجودة النهائي",
    "تسليم للمخزن",
  ];

  // State لتتبع حالة كل مرحلة (لم يبدأ، جاري، تم، مشكلة)
  // القيمة الافتراضية لكل مرحلة: "pending"
  const [stagesStatus, setStagesStatus] = useState(
    stagesList.reduce((acc, stage) => ({ ...acc, [stage]: "pending" }), {}),
  );

  // State لتتبع الملاحظات لو فيه مشكلة في مرحلة معينة
  const [issues, setIssues] = useState({});

  // دالة تغيير حالة المرحلة
  const handleStatusChange = (stage, status) => {
    setStagesStatus((prev) => ({ ...prev, [stage]: status }));
    // لو غير الحالة من مشكلة لحاجة تانية، نمسح الملاحظة عشان النظافة
    if (status !== "issue") {
      setIssues((prev) => {
        const newIssues = { ...prev };
        delete newIssues[stage];
        return newIssues;
      });
    }
  };

  // دالة تحديث نص المشكلة
  const handleIssueChange = (stage, text) => {
    setIssues((prev) => ({ ...prev, [stage]: text }));
  };

  // حساب نسبة الإنجاز تلقائياً (بناءً على عدد المراحل اللي "تمت")
  const completedStagesCount = Object.values(stagesStatus).filter(
    (status) => status === "completed",
  ).length;
  const progressPercentage = Math.round(
    (completedStagesCount / stagesList.length) * 100,
  );

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* ======================= */}
        {/* الهيدر وزر الرجوع */}
        {/* ======================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#1a365d]">
                {modelInfo.name}
              </h1>
              <span className="bg-slate-100 text-slate-500 font-mono text-xs px-2 py-0.5 rounded border border-slate-200">
                {modelInfo.id}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              كولكشن: {modelInfo.collectionName} | البراند: {modelInfo.brand}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/planning/collections"
              className="flex-1 md:flex-none text-center bg-white text-[#1a365d] border border-slate-300 hover:bg-slate-50 px-6 py-2.5 rounded-md text-sm font-bold transition shadow-sm"
            >
              ◀ رجوع للوحة التشغيل
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ======================= */}
          {/* العمود الأيمن: دليل التشغيل (Tech Pack) */}
          {/* ======================= */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-[#1a365d] mb-4 border-b border-slate-100 pb-3">
                الورقة الفنية (مُعتمدة)
              </h2>

              {/* صورة الموديل */}
              <div className="w-full h-48 bg-slate-100 rounded-lg border border-slate-200 mb-6 flex items-center justify-center text-slate-400 text-sm font-bold">
                [صورة الموديل]
              </div>

              {/* تفاصيل الموديل (للقراءة فقط) */}
              <div className="space-y-4 text-sm text-right">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    إجمالي الكمية
                  </span>
                  <span className="font-black text-lg text-[#1a365d]">
                    {modelInfo.totalQty.toLocaleString()}{" "}
                    <span className="text-xs font-normal">قطعة</span>
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    الخامة والوزن
                  </span>
                  <span className="font-bold text-slate-700">
                    {modelInfo.fabric} - {modelInfo.weight}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    المقاسات المطلوبة
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modelInfo.sizes.map((size, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-4">
                  <span className="block text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                    ملاحظات العميل
                  </span>
                  <span className="font-medium text-amber-800 text-xs leading-relaxed">
                    {modelInfo.notes}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= */}
          {/* العمود الأيسر: قائمة المراحل (Checklist) */}
          {/* ======================= */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* هيدر قائمة المراحل ونسبة الإنجاز */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-[#1a365d]">
                  مراحل الإنتاج (Checklist)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  قم بتحديث الحالة بالضغط على الأزرار فقط.
                </p>
              </div>

              {/* شريط التقدم التلقائي */}
              <div className="w-full sm:w-48">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#1a365d]">نسبة الإنجاز</span>
                  <span className="text-[#1a365d]">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* قائمة المراحل */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {stagesList.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-colors ${
                      stagesStatus[stage] === "completed"
                        ? "bg-emerald-50 border-emerald-100"
                        : stagesStatus[stage] === "in_progress"
                          ? "bg-blue-50 border-blue-100"
                          : stagesStatus[stage] === "issue"
                            ? "bg-red-50 border-red-100"
                            : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* اسم المرحلة */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            stagesStatus[stage] === "completed"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {stagesStatus[stage] === "completed" ? "✓" : idx + 1}
                        </span>
                        <h3
                          className={`text-sm font-bold ${stagesStatus[stage] === "completed" ? "text-emerald-800 line-through opacity-70" : "text-[#1a365d]"}`}
                        >
                          {stage}
                        </h3>
                      </div>

                      {/* زراير التحكم بالحالة */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusChange(stage, "pending")}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                            stagesStatus[stage] === "pending"
                              ? "bg-slate-200 text-slate-700 border-slate-300"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          لم يبدأ
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(stage, "in_progress")
                          }
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                            stagesStatus[stage] === "in_progress"
                              ? "bg-blue-600 text-white border-blue-700"
                              : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          جاري
                        </button>
                        <button
                          onClick={() => handleStatusChange(stage, "completed")}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                            stagesStatus[stage] === "completed"
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          تم
                        </button>
                        <button
                          onClick={() => handleStatusChange(stage, "issue")}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
                            stagesStatus[stage] === "issue"
                              ? "bg-[#b91c1c] text-white border-[#b91c1c]"
                              : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                          }`}
                        >
                          مشكلة
                        </button>
                      </div>
                    </div>

                    {/* حقل المشكلة (يظهر فقط لو اختار "مشكلة") */}
                    {stagesStatus[stage] === "issue" && (
                      <div className="mt-4 pt-4 border-t border-red-100 flex flex-col gap-3 animate-fade-in-up">
                        <label className="text-xs font-bold text-red-800">
                          وصف العائق أو المشكلة:
                        </label>
                        <input
                          type="text"
                          value={issues[stage] || ""}
                          onChange={(e) =>
                            handleIssueChange(stage, e.target.value)
                          }
                          placeholder="اكتب باختصار سبب توقف هذه المرحلة..."
                          className="w-full border border-red-200 rounded p-2 text-sm focus:outline-none focus:border-red-400 bg-white"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            رفع صورة إثبات (اختياري)
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* الفوتر وزر الحفظ النهائي */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex justify-end">
              <button className="w-full sm:w-auto bg-[#1a365d] hover:bg-slate-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                حفظ التحديثات اليومية
              </button>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }
      `,
        }}
      />
    </div>
  );
};

export default Checklist;
