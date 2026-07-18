import { X } from "lucide-react";
import React from "react";

const AddNewShipment = ({ setOpenModal }) => {
  return (
    <>
      <div
        onClick={() => setOpenModal(false)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              إنشاء شحنة جديدة
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              سيتم خصم الكميات من المخزن عند تأكيد خروج الشحنة.
            </p>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                البراند *
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366] bg-white">
                <option>اختر البراند</option>
                <option>Nike</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                العميل المستلم *
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366] bg-white">
                <option>اختر عميل البراند</option>
                <option>ستور القاهرة</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                الموديلات المطلوبة والكميات
              </label>
              <div className="w-full rounded-xl border border-slate-300 p-4 bg-slate-50 text-center text-slate-500 text-sm">
                + اضغط هنا لتحديد الموديلات، المقاسات، والألوان من الأرصدة
                المتاحة
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                عدد الكراتين
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="مثال: 5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                شركة الشحن / المندوب
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="أرامكس، بوسطة..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                رقم البوليصة
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                placeholder="AWB-12345678"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                حالة الشحنة المبدئية
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366] bg-white">
                <option>جاري التجهيز</option>
                <option>محجوزة من المخزن</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-6">
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button className="rounded-xl bg-[#002366] px-6 py-3 font-medium text-white hover:bg-[#001a4d]">
            إنشاء الشحنة
          </button>
        </div>
      </div>
    </>
  );
};

export default AddNewShipment;
