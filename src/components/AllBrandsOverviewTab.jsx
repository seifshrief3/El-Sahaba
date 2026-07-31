import React from "react";

const AllBrandsOverviewTab = ({ selectedBrand }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">
            إجمالي الكولكشنات
          </p>
          <p className="text-2xl font-black text-[#1a365d]">
            {selectedBrand.stats.totalCollections}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">كولكشنات نشطة</p>
          <p className="text-2xl font-black text-[#b91c1c]">
            {selectedBrand.stats.activeOrders}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">
            إجمالي القطع المطلوبة
          </p>
          <p className="text-2xl font-black text-[#1a365d]">
            {selectedBrand.stats.totalPieces.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
          بيانات التواصل
        </h3>
        <div className="space-y-4 text-sm text-right">
          <div>
            <span className="block text-slate-400 text-[11px] mb-1">
              المسؤول
            </span>
            <span className="font-bold text-slate-700">
              {selectedBrand.contact_person || "غير مسجل"}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 text-[11px] mb-1">
              الهاتف / واتساب
            </span>
            <span className="font-bold text-slate-700" dir="ltr">
              {selectedBrand.phone || "غير مسجل"}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 text-[11px] mb-1">
              العنوان
            </span>
            <span className="font-bold text-slate-700">
              {selectedBrand.address || "غير مسجل"}
            </span>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
          سجل الكولكشنات
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">الكولكشن</th>
                <th className="py-3 px-3 font-semibold">التاريخ</th>
                <th className="py-3 px-3 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedBrand.history.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-slate-400">
                    لا يوجد كولكشنات حالياً
                  </td>
                </tr>
              ) : (
                selectedBrand.history.map((col, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-bold text-[#1a365d]">
                      {col.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs">
                      {col.date}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${col.status === "تم التسليم" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : col.status === "جاري التنفيذ" ? "bg-slate-50 text-[#1a365d] border-slate-200" : col.status === "جاهز للتشغيل" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
                      >
                        {col.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBrandsOverviewTab;
