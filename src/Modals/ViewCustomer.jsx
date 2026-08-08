import { X, Building2, MapPin, Phone, StickyNote, Package } from "lucide-react";
import React, { useState, useEffect } from "react";

const ViewCustomer = ({ customer, setOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);

  // تأثير الدخول السلس
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setOpenModal(null), 300);
  };

  if (!customer) return null;

  return (
    <div className="font-arabic" dir="rtl">
      {/* Overlay */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 p-6 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="bg-[#1a365d]/10 p-2.5 rounded-xl text-[#1a365d]">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                بيانات العميل
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded-xl p-2.5 text-slate-400 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* البراند */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                البراند
              </p>
              <p className="font-bold text-[#1a365d] text-lg">
                {customer.brandName}
              </p>
            </div>

            {/* اسم العميل */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                اسم العميل / الفرع
              </p>
              <p className="font-bold text-slate-800 text-lg">
                {customer.name}
              </p>
            </div>

            {/* رقم الهاتف */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                  رقم الهاتف
                </p>
                <p className="font-bold text-slate-800" dir="ltr">
                  {customer.phone || "غير متوفر"}
                </p>
              </div>
              <Phone size={18} className="text-slate-300" />
            </div>

            {/* رقم الواتساب */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                  رقم الواتساب
                </p>
                <p className="font-bold text-emerald-600" dir="ltr">
                  {customer.whatsapp || "غير متوفر"}
                </p>
              </div>
              <Phone size={18} className="text-emerald-200" />
            </div>

            {/* المحافظة */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                المحافظة
              </p>
              <p className="font-bold text-slate-800">
                {customer.governorate || "غير متوفر"}
              </p>
            </div>

            {/* اسم المسؤول */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                اسم المسؤول
              </p>
              <p className="font-bold text-slate-800">
                {customer.contact_person || "غير متوفر"}
              </p>
            </div>

            {/* العنوان */}
            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex gap-3">
              <MapPin size={20} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-bold mb-1 uppercase">
                  العنوان بالتفصيل
                </p>
                <p className="font-semibold text-slate-700 leading-relaxed">
                  {customer.address || "لم يتم تسجيل عنوان مفصل."}
                </p>
              </div>
            </div>

            {/* ملاحظات التوصيل */}
            <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 shadow-sm flex gap-3">
              <StickyNote
                size={20}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs text-amber-600/70 font-bold mb-1 uppercase">
                  ملاحظات التوصيل
                </p>
                <p className="font-semibold text-amber-900 leading-relaxed">
                  {customer.delivery_notes || "لا توجد ملاحظات إضافية."}
                </p>
              </div>
            </div>

            {/* إحصائيات */}
            <div className="md:col-span-2 mt-2">
              <div className="flex items-center gap-3 p-4 bg-[#1a365d]/5 rounded-xl border border-[#1a365d]/10">
                <div className="bg-[#1a365d] text-white p-2 rounded-lg">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a365d]">
                    إجمالي عدد الشحنات المسجلة لهذا العميل
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    تم إنشاء{" "}
                    <span className="font-black text-[#1a365d] mx-1">
                      {customer.shipmentsCount}
                    </span>{" "}
                    شحنة حتى الآن.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-100 p-5 sm:p-6 bg-white rounded-b-[2rem]">
          <button
            onClick={closeModal}
            className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 transition shadow-sm"
          >
            إغلاق التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
