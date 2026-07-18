import { X, FileText, Send } from "lucide-react";
import React from "react";

const ViewShipment = ({ shipment, setOpenModal }) => {
  if (!shipment) return null;

  return (
    <>
      <div
        onClick={() => setOpenModal(false)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              بوليصة: {shipment.id}
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {shipment.status}
            </span>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">البراند</p>
              <p className="font-semibold">{shipment.brand}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">العميل المستلم</p>
              <p className="font-semibold">{shipment.client}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">شركة الشحن</p>
              <p className="font-semibold">{shipment.courier}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">عدد الكراتين</p>
              <p className="font-semibold">{shipment.cartons} كرتونة</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-3">
              الموديلات المشحونة
            </h3>
            <table className="w-full text-sm text-right border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 border-b border-slate-200">الموديل</th>
                  <th className="p-3 border-b border-slate-200">
                    اللون/المقاس
                  </th>
                  <th className="p-3 border-b border-slate-200">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b border-slate-100">
                    تيشيرت صيفي - M1024
                  </td>
                  <td className="p-3 border-b border-slate-100">أسود / L</td>
                  <td className="p-3 border-b border-slate-100">50 قطعة</td>
                </tr>
                <tr>
                  <td className="p-3">بنطلون جينز - M1025</td>
                  <td className="p-3">أزرق / XL</td>
                  <td className="p-3">30 قطعة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions (PDF / WhatsApp) */}
        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 p-6">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">
              <FileText size={18} /> تحميل PDF
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-green-600 text-green-700 px-5 py-3 text-sm font-bold bg-green-50 hover:bg-green-100">
              <Send size={18} /> إرسال واتساب
            </button>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl bg-slate-900 px-8 py-3 font-medium text-white hover:bg-slate-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewShipment;
