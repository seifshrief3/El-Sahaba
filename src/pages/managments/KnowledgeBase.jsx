import React, { useState } from "react";

const KnowledgeBase = () => {
  const [files, setFiles] = useState([
    { name: "سياسات التسعير 2026.pdf", date: "منذ يومين", size: "2.4 MB" },
    { name: "معايير الجودة والمقاسات.pdf", date: "منذ أسبوع", size: "1.1 MB" },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* الهيدر */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-right">
          <h1 className="text-2xl font-bold text-[#1a365d]">قاعدة المعرفة</h1>
          <p className="mt-1 text-sm text-slate-500">
            إدارة ملفات المصنع والمقالات الإرشادية التي يعتمد عليها الـ AI في
            الإجابة.
          </p>
        </div>

        {/* قسم رفع الملفات */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a365d] mb-4 text-right">
            رفع ملفات مرجعية للـ AI
          </h2>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer">
            <svg
              className="w-10 h-10 mx-auto text-slate-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-slate-600">
              اسحب الملفات هنا أو اضغط للرفع (PDF, Docx)
            </p>
          </div>

          {/* قائمة الملفات */}
          <div className="mt-6 space-y-3">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-bold text-xl">📄</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {file.date} • {file.size}
                    </p>
                  </div>
                </div>
                <button className="text-red-600 text-xs font-bold hover:underline">
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
