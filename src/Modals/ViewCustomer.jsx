import { X } from "lucide-react";
import React from "react";

const ViewCustomer = ({ customer, setOpenModal }) => {
  if (!customer) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpenModal(null)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            تفاصيل العميل
          </h2>
          <button
            onClick={() => setOpenModal(null)}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* عرض البيانات في كروت صغيرة ومنظمة */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">البراند</p>
              <p className="font-semibold">{customer.brand}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">اسم العميل</p>
              <p className="font-semibold">{customer.name}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">رقم الهاتف</p>
              <p className="font-semibold">{customer.phone}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">رقم الواتساب</p>
              <p className="font-semibold">{customer.phone || "غير متوفر"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">المحافظة</p>
              <p className="font-semibold">{customer.governorate}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">اسم المسؤول</p>
              <p className="font-semibold">{customer.manager}</p>
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">العنوان</p>
              <p className="font-semibold">
                العنوان بالكامل سيظهر هنا في حالة ربطه بالـ Backend
              </p>
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">ملاحظات التوصيل</p>
              <p className="font-semibold text-slate-700">
                لا توجد ملاحظات إضافية.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 p-6">
          <button
            onClick={() => setOpenModal(null)}
            className="rounded-xl bg-red-800 px-8 py-3 font-medium text-white hover:bg-red-900 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewCustomer;
