import { X } from "lucide-react";
import React from "react";

const AddNewCustomer = ({ setOpenModal }) => {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpenModal(false)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl bg-white shadow-2xl">
        {/* Header - ثابت */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5 sm:p-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              إضافة عميل جديد
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              سيتم استخدام بيانات العميل عند إنشاء الشحنات.
            </p>
          </div>

          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl p-2 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - سكرول داخلي */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">البراند</label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]">
                <option>اختر البراند</option>
                <option>Nike</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                اسم العميل
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="اسم العميل"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                رقم الهاتف
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">واتساب</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">المحافظة</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="القاهرة"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                اسم المسؤول
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="اسم المسؤول"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">العنوان</label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="العنوان بالكامل..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                ملاحظات التوصيل
              </label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="أي ملاحظات خاصة بالتوصيل..."
              />
            </div>
          </div>
        </div>

        {/* Footer - ثابت */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-5 sm:p-6">
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
          <button className="rounded-xl bg-red-800 px-5 py-3 font-medium text-white hover:bg-red-900 transition-colors">
            حفظ العميل
          </button>
        </div>
      </div>
    </>
  );
};

export default AddNewCustomer;
