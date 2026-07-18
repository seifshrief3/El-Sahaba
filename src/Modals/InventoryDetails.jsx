import {
  X,
  Box,
  CheckCircle,
  Truck,
  Clock,
  FileText,
  Activity,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const InventoryDetails = ({ selectedItem, setSelectedItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  // لعمل تأثير الدخول السلس (Slide In)
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedItem(null), 300); // استنى الأنميشن يخلص قبل ما تقفل
  };

  // بيانات وهمية مؤقتة للمقاسات والحركات (لحد ما تربط بالباك إند)
  const sizes = { S: 60, M: 120, L: 150, XL: 90 };
  const historyLogs = [
    {
      id: 1,
      type: "receive",
      text: "تم استلام 500 قطعة من التخطيط",
      date: "منذ يومين",
      icon: <Box size={18} className="text-emerald-600" />,
    },
    {
      id: 2,
      type: "ship",
      text: "تم شحن 120 قطعة لفرع القاهرة",
      date: "منذ يوم",
      icon: <Truck size={18} className="text-blue-600" />,
    },
    {
      id: 3,
      type: "reserve",
      text: "تم حجز 80 قطعة لشحنة جديدة",
      date: "منذ 5 ساعات",
      icon: <Clock size={18} className="text-orange-600" />,
    },
  ];

  return (
    <div className="font-arabic" dir="rtl">
      {/* Overlay */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-md md:max-w-xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur p-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a365d]">
              {selectedItem.brand}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
              {selectedItem.collection}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-8 p-6 pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "إجمالي المستلم",
                value:
                  selectedItem.available +
                  selectedItem.reserved +
                  selectedItem.shipped,
                color: "text-slate-700",
                bg: "bg-slate-50",
              },
              {
                title: "المتاح حالياً",
                value: selectedItem.available,
                color: "text-emerald-700",
                bg: "bg-emerald-50",
              },
              {
                title: "المحجوز",
                value: selectedItem.reserved,
                color: "text-orange-700",
                bg: "bg-orange-50",
              },
              {
                title: "المشحون",
                value: selectedItem.shipped,
                color: "text-blue-700",
                bg: "bg-blue-50",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border border-slate-100 p-4 ${card.bg}`}
              >
                <p className="text-xs font-medium text-slate-600">
                  {card.title}
                </p>
                <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Model Basic Details */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Box size={18} className="text-slate-400" /> تفاصيل الموديل
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden text-sm">
              <div className="flex justify-between border-b border-slate-100 bg-white p-4">
                <span className="text-slate-500">اسم الموديل</span>
                <span className="font-bold text-slate-800">
                  {selectedItem.model}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 bg-slate-50 p-4">
                <span className="text-slate-500">اللون</span>
                <span className="font-bold text-slate-800">
                  {selectedItem.color}
                </span>
              </div>
              <div className="flex justify-between bg-white p-4">
                <span className="text-slate-500">عدد الكراتين (تقريبي)</span>
                <span className="font-bold text-slate-800">
                  {Math.ceil(selectedItem.available / 50)} كرتونة
                </span>
              </div>
            </div>
          </div>

          {/* Sizes Table */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-slate-400" /> تفصيل المقاسات
              للمتاح
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-center text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {Object.keys(sizes).map((size) => (
                      <th key={size} className="p-4">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100 font-bold text-[#1a365d] bg-white">
                    {Object.values(sizes).map((val, idx) => (
                      <td key={idx} className="p-4">
                        {val}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* History Timeline */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> آخر الحركات
              المخزنية
            </h3>
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`rounded-full p-2 ${
                      log.type === "receive"
                        ? "bg-emerald-100"
                        : log.type === "ship"
                          ? "bg-blue-100"
                          : "bg-orange-100"
                    }`}
                  >
                    {log.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {log.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute w-full border-t border-slate-200 bg-white p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button className="flex items-center gap-2 rounded-xl bg-red-50 text-red-700 border border-red-200 px-5 py-3 text-sm font-bold hover:bg-red-100 transition">
            <FileText size={18} />
            تحميل تقرير الجرد
          </button>
          <button
            onClick={closeModal}
            className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;
