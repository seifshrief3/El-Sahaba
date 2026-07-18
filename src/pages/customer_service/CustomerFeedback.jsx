import React from "react";

const CustomerFeedback = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl flex flex-col gap-6">
        {/* الكارت العلوي (العنوان والوصف) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-right">
          <h1 className="text-xl font-bold text-[#1a365d] mb-2">
            ملاحظات العملاء
          </h1>
          <p className="text-sm text-slate-500">
            كل ملاحظات العملاء في مكان واحد — أي ملاحظة جديدة بتوصل كإشعار لقسم
            التخطيط تلقائيًا.
          </p>
        </div>

        {/* كارت إدخال الملاحظة */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-right">
          <h2 className="text-lg font-bold text-[#1a365d] mb-4">
            كولكشن 1 — مدرسة ستانفورد
          </h2>

          <textarea
            rows="4"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y mb-4"
            placeholder="اكتب ملاحظة العميل هنا..."
          ></textarea>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors"
            >
              إضافة الملاحظة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;
