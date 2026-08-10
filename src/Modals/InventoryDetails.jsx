import { X, Box, Truck, Clock, FileText, Activity } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../supabase"; // 💡 ضفنا الاستيراد ده (تأكد من مسار ملف supabase)

const InventoryDetails = ({ selectedItem, setSelectedItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sizeMap, setSizeMap] = useState({}); // 💡 state جديد لتخزين أسماء المقاسات للترجمة
  const printRef = useRef(null);

  // لعمل تأثير الدخول السلس (Slide In) وجلب أسماء المقاسات
  useEffect(() => {
    setIsOpen(true);

    // 💡 دالة لجلب قاموس المقاسات من الداتابيز عشان نترجم الـ ID للاسم
    const fetchSizes = async () => {
      try {
        const { data, error } = await supabase.from("sizes").select("id, name");
        if (!error && data) {
          const map = {};
          data.forEach((s) => {
            map[s.id] = s.name; // ربط الـ ID بالاسم
          });
          setSizeMap(map);
        }
      } catch (err) {
        console.error("Error fetching sizes:", err);
      }
    };

    fetchSizes();
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedItem(null), 300); // استنى الأنميشن يخلص قبل ما تقفل
  };

  // إعداد دالة الطباعة لطباعة القالب المخفي فقط
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تفاصيل_مخزون_${selectedItem?.model}_${selectedItem?.color}`,
  });

  // تجميع المقاسات عشان لو في أكتر من صف لنفس المقاس في الداتابيز يتجمعوا صح
  const aggregatedSizes =
    selectedItem?.sizes?.reduce((acc, curr) => {
      const rawSize = curr.size || "بدون مقاس";

      // 💡 هنا بنترجم الـ ID للاسم الحقيقي لو موجود، لو مش موجود (زي كلمة 'غير محدد') بيفضل زي ما هو
      const sizeName = sizeMap[rawSize] || rawSize;

      if (!acc[sizeName]) {
        acc[sizeName] = { available: 0, reserved: 0, shipped: 0 };
      }
      acc[sizeName].available += curr.available || 0;
      acc[sizeName].reserved += curr.reserved || 0;
      acc[sizeName].shipped += curr.shipped || 0;
      return acc;
    }, {}) || {};

  if (!selectedItem) return null;

  return (
    <div className="font-arabic" dir="rtl">
      {/* Overlay */}
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer (واجهة المستخدم العادية) */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 md:max-w-xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a365d]">
              {selectedItem.brand}
            </h2>
            <p className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
              {selectedItem.collection}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Box size={18} className="text-slate-400" /> تفاصيل الموديل
            </h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 text-sm">
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
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <Activity size={18} className="text-slate-400" /> تفصيل المقاسات
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-center text-sm">
                <thead className="bg-[#1a365d] text-white">
                  <tr>
                    <th className="p-3 font-bold">المقاس</th>
                    <th className="p-3 font-bold">متاح</th>
                    <th className="p-3 font-bold">محجوز</th>
                    <th className="p-3 font-bold">مشحون</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(aggregatedSizes).map(([size, qty], idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{size}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {qty.available}
                      </td>
                      <td className="p-3 font-bold text-orange-500">
                        {qty.reserved}
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        {qty.shipped}
                      </td>
                    </tr>
                  ))}
                  {Object.keys(aggregatedSizes).length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-slate-500">
                        لا توجد مقاسات مسجلة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-end gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              <FileText size={18} />
              تحميل التقرير
            </button>
            <button
              onClick={closeModal}
              className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💡 قالب الطباعة المخفي */}
      {/* ========================================================= */}
      <div style={{ display: "none" }}>
        <div
          ref={printRef}
          className="p-10 font-arabic bg-white text-slate-900"
          dir="rtl"
        >
          <style>
            {`
              @page { size: A4 portrait; margin: 15mm; }
              @media print {
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}
          </style>

          {/* Header */}
          <div className="border-b-4 border-[#1a365d] pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#1a365d] mb-2">
                تقرير تفصيلي لمخزون موديل
              </h1>
              <p className="text-lg font-bold text-slate-600">
                البراند: {selectedItem.brand} | الكولكشن:{" "}
                {selectedItem.collection}
              </p>
            </div>
            <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-500 mb-1">
                تاريخ الإصدار
              </p>
              <p className="text-sm font-black text-[#1a365d]">
                {new Date().toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          {/* Model Info */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="block text-xs font-bold text-slate-500 mb-1">
                الموديل
              </span>
              <span className="text-xl font-bold text-[#1a365d]">
                {selectedItem.model}
              </span>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="block text-xs font-bold text-slate-500 mb-1">
                اللون
              </span>
              <span className="text-xl font-bold text-[#1a365d]">
                {selectedItem.color}
              </span>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="block text-xs font-bold text-slate-500 mb-1">
                عدد الكراتين التقريبي
              </span>
              <span className="text-xl font-bold text-[#1a365d]">
                {Math.ceil(selectedItem.available / 50)} كرتونة
              </span>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 border-r-4 border-r-slate-600 text-center">
              <p className="text-xs font-bold text-slate-500">إجمالي المستلم</p>
              <p className="text-2xl font-black text-slate-700 mt-2">
                {(
                  selectedItem.available +
                  selectedItem.reserved +
                  selectedItem.shipped
                ).toLocaleString()}
              </p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl bg-emerald-50 border-r-4 border-r-emerald-600 text-center">
              <p className="text-xs font-bold text-emerald-700">
                المتاح (رصيد فعلي)
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-2">
                {selectedItem.available.toLocaleString()}
              </p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl bg-orange-50 border-r-4 border-r-orange-600 text-center">
              <p className="text-xs font-bold text-orange-700">المحجوز للشحن</p>
              <p className="text-2xl font-black text-orange-700 mt-2">
                {selectedItem.reserved.toLocaleString()}
              </p>
            </div>
            <div className="border border-slate-200 p-4 rounded-xl bg-blue-50 border-r-4 border-r-blue-600 text-center">
              <p className="text-xs font-bold text-blue-700">تم شحنه</p>
              <p className="text-2xl font-black text-blue-700 mt-2">
                {selectedItem.shipped.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Detailed Sizes Table */}
          <div>
            <h3 className="font-bold text-lg text-[#1a365d] mb-4 border-b-2 border-slate-100 pb-2">
              تفصيل المقاسات والكميات
            </h3>
            <table className="w-full text-center text-sm border-collapse border border-slate-300">
              <thead className="bg-[#1a365d] text-white">
                <tr>
                  <th className="border border-slate-300 p-3">المقاس</th>
                  <th className="border border-slate-300 p-3">المتاح الفعلي</th>
                  <th className="border border-slate-300 p-3">
                    محجوز للأوردرات
                  </th>
                  <th className="border border-slate-300 p-3">
                    تم خروجه (شحن)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(aggregatedSizes).map(([size, qty], idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="border border-slate-300 p-3 font-bold text-slate-800 text-lg">
                      {size}
                    </td>
                    <td className="border border-slate-300 p-3 font-bold text-emerald-700 text-lg">
                      {qty.available}
                    </td>
                    <td className="border border-slate-300 p-3 font-bold text-orange-600 text-lg">
                      {qty.reserved}
                    </td>
                    <td className="border border-slate-300 p-3 font-bold text-blue-700 text-lg">
                      {qty.shipped}
                    </td>
                  </tr>
                ))}
                {Object.keys(aggregatedSizes).length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="border border-slate-300 p-6 text-slate-500 font-bold"
                    >
                      لا توجد مقاسات مسجلة لهذا الموديل.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-4 border-t-2 border-slate-200 flex justify-between items-center text-xs text-slate-500 font-bold">
            <p>نظام إدارة أوردرات المصنع - الصحابة لتصنيع وتصدير الملابس</p>
            <p>توقيع أمين المخزن: ........................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;
