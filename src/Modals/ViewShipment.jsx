import {
  X,
  FileText,
  Send,
  Truck,
  PackageCheck,
  Box,
  RefreshCw,
  Printer,
} from "lucide-react";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../supabase";
import { toast } from "sonner";
import logoImage from "../assets/logo.jpeg"; // 💡 تأكد من مسار اللوجو الصحيح

const ViewShipment = ({ shipment, setOpenModal, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 💡 Ref لعنصر الطباعة الخاص بالشحنة
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `بوليصة_شحن_${shipmentDetails?.shipment_number || "الصحابة"}`,
  });

  const statusToDisplay = {
    preparing: "جاري التجهيز",
    shipped: "خرجت للشحن",
    delivered: "تم التسليم",
  };

  const statusColors = {
    preparing: "bg-amber-100 text-amber-700 border-amber-200",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  useEffect(() => {
    setIsOpen(true);
    if (shipment?.db_id) {
      fetchShipmentDetails();
    }
  }, [shipment]);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setOpenModal(false), 300);
  };

  const fetchShipmentDetails = async () => {
    setIsLoading(true);
    try {
      // 💡 1. سحب المقاسات عشان نعمل قاموس الترجمة
      const { data: sizesData } = await supabase
        .from("sizes")
        .select("id, name");
      const sizeMap = {};
      if (sizesData) {
        sizesData.forEach((s) => {
          sizeMap[s.id] = s.name; // ربط الـ UUID بالاسم
        });
      }

      // 2. سحب بيانات الشحنة
      const { data, error } = await supabase
        .from("shipments")
        .select(
          `
  id,
  shipment_number,
  status,
  shipping_company,
  tracking_number,
  created_at,
  customers ( name, phone, governorate, address ),
  brands ( name_ar ),
  shipment_items (
    quantity,
    inventory_id,
    inventory (
      size,
      color,
      models (name)
    )
  )
`,
        )
        .eq("id", shipment.db_id)
        .single();

      if (error) throw error;

      // 💡 3. ترجمة المقاسات جوه الداتا قبل ما نعرضها
      if (data && data.shipment_items) {
        data.shipment_items = data.shipment_items.map((item) => {
          if (item.inventory) {
            // إضافة خاصية جديدة فيها الاسم الحقيقي للمقاس
            item.inventory.realSizeName =
              sizeMap[item.inventory.size] || item.inventory.size;
          }
          return item;
        });
      }

      setShipmentDetails(data);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      toast.error("حدث خطأ أثناء جلب تفاصيل الشحنة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ status: newStatus })
        .eq("id", shipment.db_id);

      if (error) throw error;

      if (
        shipmentDetails.status === "preparing" &&
        (newStatus === "shipped" || newStatus === "delivered")
      ) {
        for (const item of shipmentDetails.shipment_items) {
          const { data: invData } = await supabase
            .from("inventory")
            .select("reserved_qty, shipped_qty")
            .eq("id", item.inventory_id)
            .single();

          if (invData) {
            await supabase
              .from("inventory")
              .update({
                reserved_qty: Math.max(0, invData.reserved_qty - item.quantity),
                shipped_qty: invData.shipped_qty + item.quantity,
              })
              .eq("id", item.inventory_id);
          }
        }
      }

      toast.success("تم تحديث حالة الشحنة بنجاح!");
      setShipmentDetails({ ...shipmentDetails, status: newStatus });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("حدث خطأ أثناء تحديث الحالة.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!shipment) return null;

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
        className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6 bg-slate-50 rounded-t-[2rem]">
          <div className="flex items-center gap-4">
            <div className="bg-[#1a365d]/10 p-3 rounded-xl text-[#1a365d]">
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 font-mono">
                  #{shipmentDetails?.shipment_number || shipment.shipmentNumber}
                </h2>
                {shipmentDetails && (
                  <span
                    className={`px-3 py-1 border rounded-md text-xs font-bold ${statusColors[shipmentDetails.status]}`}
                  >
                    {statusToDisplay[shipmentDetails.status]}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">
                تفاصيل الشحنة والموديلات المرفقة بها.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded-xl p-2.5 bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-[#1a365d] font-bold">
              <RefreshCw className="animate-spin ml-2" size={20} /> جاري تحميل
              التفاصيل...
            </div>
          ) : (
            <>
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-1">
                    البراند
                  </p>
                  <p className="font-bold text-[#1a365d]">
                    {shipmentDetails?.brands?.name_ar}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-1">
                    العميل المستلم
                  </p>
                  <p className="font-bold text-slate-800">
                    {shipmentDetails?.customers?.name}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold mb-1">
                    شركة الشحن
                  </p>
                  <p className="font-bold text-slate-800">
                    {shipmentDetails?.shipping_company || "غير محدد"}
                  </p>
                </div>

                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-bold mb-1">
                    المحافظة / العنوان
                  </p>
                  <p className="font-semibold text-slate-700">
                    {shipmentDetails?.customers?.governorate} -{" "}
                    {shipmentDetails?.customers?.address || "غير مسجل"}
                  </p>
                </div>
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-1">
                      رقم التتبع (AWB)
                    </p>
                    <p
                      className="font-mono font-bold text-slate-800 text-left"
                      dir="ltr"
                    >
                      {shipmentDetails?.tracking_number || "لا يوجد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Box size={18} className="text-slate-400" /> الموديلات
                  المشحونة
                </h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-[#1a365d] text-white">
                      <tr>
                        <th className="p-4 font-bold">الموديل</th>
                        <th className="p-4 font-bold">اللون / المقاس</th>
                        <th className="p-4 font-bold">الكمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {shipmentDetails?.shipment_items?.length > 0 ? (
                        shipmentDetails.shipment_items.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-4 font-bold text-slate-800">
                              {item.inventory?.models?.name || "غير محدد"}
                            </td>
                            <td className="p-4 font-semibold text-slate-600">
                              {item.inventory?.color} / مقاس{" "}
                              {/* 💡 استخدام المقاس المترجم هنا */}
                              {item.inventory?.realSizeName}
                            </td>
                            <td className="p-4 font-bold text-[#1a365d]">
                              {item.quantity}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="p-8 text-center text-slate-500 bg-slate-50 font-medium"
                          >
                            لا توجد موديلات مسجلة لهذه الشحنة.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">تحديث حالة الشحنة</p>
                  <p className="text-xs text-slate-500 mt-1">
                    قم بتغيير الحالة عند استلام المندوب أو تسليم العميل.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {shipmentDetails?.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus("shipped")}
                      disabled={isUpdating}
                      className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      خروج للشحن 🚚
                    </button>
                  )}
                  {shipmentDetails?.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={isUpdating}
                      className="flex-1 sm:flex-none bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                    >
                      تأكيد التسليم ✅
                    </button>
                  )}
                  {shipmentDetails?.status === "delivered" && (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-200">
                      <PackageCheck size={18} /> تمت العملية بنجاح
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions (PDF / WhatsApp) */}
        <div className="flex shrink-0 flex-wrap justify-between gap-3 border-t border-slate-200 p-6 bg-white rounded-b-[2rem]">
          <div className="flex flex-1 sm:flex-none gap-2">
            <button
              onClick={handlePrint}
              className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <Printer size={18} /> تحميل وطباعة PDF
            </button>
            <button className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm">
              <Send size={18} /> واتساب
            </button>
          </div>
          <button
            onClick={closeModal}
            className="flex-1 sm:flex-none rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 transition shadow-sm"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>

      {/* 💡 عنصر طباعة بوليصة الشحنة الخفي (بالهوية البصرية الرسمية) */}
      <div style={{ display: "none" }}>
        <PrintableShipmentReceipt
          ref={printRef}
          shipment={shipmentDetails}
          logo={logoImage}
        />
      </div>
    </div>
  );
};

// ==========================================
// 💡 مكون قالب طباعة بوليصة الشحنة الاحترافي
// ==========================================
const PrintableShipmentReceipt = forwardRef(({ shipment, logo }, ref) => {
  if (!shipment) return null;

  return (
    <div
      ref={ref}
      className="p-8 font-arabic bg-white text-slate-900"
      dir="rtl"
    >
      {/* رأس البوليصة */}
      <div className="border-b-4 border-[#1a365d] pb-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {logo && (
            <img
              src={logo}
              alt="الصحابة"
              className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1"
            />
          )}
          <div>
            <h1 className="text-2xl font-black text-[#1a365d]">
              الصحابة لتصنيع وتصدير الملابس
            </h1>
            <p className="text-xs font-bold text-[#b91c1c] mt-0.5">
              نصنع الجودة بخيوط الثقة
            </p>
          </div>
        </div>
        <div className="text-left bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <p className="text-xs font-bold text-slate-500">بوليصة شحن وتصدير</p>
          <p className="text-sm font-black text-[#1a365d] mt-1 font-mono">
            #{shipment.shipment_number}
          </p>
        </div>
      </div>

      {/* تفاصيل العميل والشحن */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
        <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
          <p className="font-bold text-slate-400 mb-1">
            بيانات العميل المستلم:
          </p>
          <p className="font-bold text-slate-900 text-sm">
            {shipment.customers?.name}
          </p>
          <p className="text-slate-600 mt-1">
            المحافظة: {shipment.customers?.governorate}
          </p>
          <p className="text-slate-600">
            العنوان: {shipment.customers?.address || "غير مسجل"}
          </p>
        </div>
        <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
          <p className="font-bold text-slate-400 mb-1">بيانات الشحن:</p>
          <p className="text-slate-700">
            البراند:{" "}
            <span className="font-bold text-[#1a365d]">
              {shipment.brands?.name_ar}
            </span>
          </p>
          <p className="text-slate-700 mt-1">
            شركة الشحن:{" "}
            <span className="font-bold text-slate-900">
              {shipment.shipping_company || "غير محدد"}
            </span>
          </p>
          <p className="text-slate-700 mt-1">
            رقم التتبع (AWB):{" "}
            <span className="font-mono font-bold text-slate-900">
              {shipment.tracking_number || "لا يوجد"}
            </span>
          </p>
        </div>
      </div>

      {/* جدول الموديلات المشحونة */}
      <div className="mb-8">
        <h3 className="font-bold text-xs text-[#1a365d] mb-2 bg-slate-100 p-2 rounded border-r-4 border-[#1a365d]">
          محتويات الشحنة والموديلات
        </h3>
        <table className="w-full text-right text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-[#1a365d] text-white">
              <th className="border border-slate-300 p-2.5">الموديل</th>
              <th className="border border-slate-300 p-2.5">اللون / المقاس</th>
              <th className="border border-slate-300 p-2.5 text-center">
                الكمية
              </th>
            </tr>
          </thead>
          <tbody>
            {shipment.shipment_items?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="border border-slate-300 p-2.5 font-bold text-slate-800">
                  {item.inventory?.models?.name}
                </td>
                <td className="border border-slate-300 p-2.5 text-slate-600">
                  {item.inventory?.color} / مقاس{" "}
                  {/* 💡 استخدام المقاس المترجم هنا في البوليصة */}
                  {item.inventory?.realSizeName}
                </td>
                <td className="border border-slate-300 p-2.5 text-center font-bold text-[#1a365d]">
                  {item.quantity} قطعة
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* التوقيعات والختم */}
      <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t border-slate-200 text-center text-xs">
        <div>
          <p className="font-bold text-slate-700 mb-12">
            مسؤول المخزن / التجهيز
          </p>
          <p className="border-t border-slate-400 w-48 mx-auto pt-1 text-slate-400">
            التوقيع
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-700 mb-12">
            مندوب شركة الشحن / المستلم
          </p>
          <p className="border-t border-slate-400 w-48 mx-auto pt-1 text-slate-400">
            التوقيع والاستلام
          </p>
        </div>
      </div>

      {/* تذييل الصفحة */}
      <div className="mt-12 text-center text-[10px] text-slate-400 font-bold">
        <p>
          نظام إدارة أوردرات المصنع - الصحابة لتصنيع وتصدير الملابس | بوليصة
          معتمدة
        </p>
      </div>
    </div>
  );
});

export default ViewShipment;
