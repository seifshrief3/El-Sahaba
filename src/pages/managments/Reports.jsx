import React from "react";
import { Eye, FileText, MessageCircle } from "lucide-react";

const reports = [
  {
    title: "تقرير تقدم التشغيل",
    description:
      "يعرض حالة الكولكشنات ونسبة الإنجاز والمراحل الحالية داخل المصنع.",
  },
  {
    title: "تقرير جرد البراند",
    description:
      "يوضح الكميات الموجودة بالمخزن والكميات المشحونة والمتبقية لكل براند.",
  },
  {
    title: "تقرير الشحنات",
    description: "يعرض جميع الشحنات الحالية وحالتها وأرقام البوليصات.",
  },
  {
    title: "تقرير التأخيرات",
    description: "يعرض الكولكشنات أو الموديلات المتأخرة والأسباب المسجلة.",
  },
  {
    title: "تقرير الأداء",
    description: "ملخص عام عن أداء الأقسام والإنتاج خلال الفترة المحددة.",
  },
  {
    title: "تقرير المدير",
    description: "ملخص تنفيذي يشمل أهم المؤشرات والإحصائيات الخاصة بالمصنع.",
  },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">التقارير</h1>
        <p className="mt-2 text-sm text-slate-500">
          استعراض وإنشاء التقارير الخاصة بالمصنع مع إمكانية المعاينة والطباعة
          والإرسال.
        </p>
      </div>

      {/* Reports */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <div
            key={report.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {report.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {report.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100">
                <Eye size={16} />
                معاينة
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-red-800 px-4 py-2 text-sm text-white hover:opacity-90">
                <FileText size={16} />
                PDF
              </button>

              <button className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100">
                <MessageCircle size={16} />
                واتساب
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
