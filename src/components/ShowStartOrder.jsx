import React from "react";

const ShowStartOrder = () => {
  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-5 sm:p-6 mt-2 flex flex-col gap-5 shadow-inner">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-2 font-medium">
            موعد التسليم المتفق عليه *
          </label>
          <input
            type="date"
            defaultValue="2026-05-08"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-[#1a365d]"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-2 font-medium">
            أولوية الأوردر
          </label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-[#1a365d]">
            <option>عادي</option>
            <option>عاجل</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2 font-medium">
          ملاحظات العميل
        </label>
        <textarea
          rows="3"
          className="w-full border border-slate-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:border-[#1a365d] resize-none"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-2 font-medium">
          ملاحظة داخلية
        </label>
        <textarea
          rows="3"
          className="w-full border border-slate-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:border-[#1a365d] resize-none"
        ></textarea>
      </div>

      {/* شريط اكتمال البيانات الأساسية */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium p-3 rounded-lg flex items-center justify-start mt-2 gap-2">
        <span>اكتمال البيانات الأساسية:</span>
        <span className="font-bold">✓ مكتملة</span>
      </div>

      {/* زر تأكيد الإصدار - مائل لليسار في RTL */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          className="bg-[#b91c1c] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-red-800 transition w-full sm:w-auto"
        >
          تأكيد إصدار أمر البدء
        </button>
      </div>
    </div>
  );
};

export default ShowStartOrder;
