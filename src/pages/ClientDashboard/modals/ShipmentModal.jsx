import React from "react";
import {
  Building2,
  CalendarDays,
  FileText,
  Hash,
  Package,
  PackageX,
  Truck,
  X,
} from "lucide-react";

import { formatDate, formatNumber } from "../utils";
import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";

const ShipmentModal = ({ shipment, onClose }) => {
  if (!shipment) return null;

  return (
    <div
      className="
        fixed inset-0
        z-[100]
        bg-[#06152a]/70
        backdrop-blur-sm
        flex items-center justify-center
        p-3 md:p-6
        print:hidden
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-6xl
          max-h-[92vh]
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-hidden
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D2748] text-white px-5 md:px-7 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-black text-lg md:text-xl">تفاصيل الشحنة</h2>

            <p className="text-xs text-blue-100/70 mt-1">
              {shipment.shipment_number || "شحنة غير محددة"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-9 h-9
              rounded-xl
              bg-white/10
              hover:bg-white/20
              flex items-center justify-center
              transition
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 md:p-7">
          <div className="space-y-6">
            {/* Shipment Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Hash size={14} />
                  رقم الشحنة
                </div>

                <div className="font-black mt-2">
                  {shipment.shipment_number || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Truck size={14} />
                  شركة الشحن
                </div>

                <div className="font-black mt-2">
                  {shipment.shipping_company || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={14} />
                  رقم البوليصة
                </div>

                <div className="font-black mt-2">
                  {shipment.tracking_number || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  التاريخ
                </div>

                <div className="font-black mt-2">
                  {formatDate(shipment.created_at)}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-2xl bg-[#F7F9FC] border border-slate-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black">حالة الشحنة</h3>

                <p className="text-xs text-slate-400 mt-1">
                  آخر حالة مسجلة للشحنة
                </p>
              </div>

              <StatusBadge status={shipment.status} />
            </div>

            {/* Customer */}
            {shipment.customers && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-[#0D2748]" />

                  <h3 className="font-black">بيانات العميل</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">اسم العميل</div>

                    <div className="font-black mt-1">
                      {shipment.customers.name || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">رقم الهاتف</div>

                    <div className="font-black mt-1">
                      {shipment.customers.phone || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipment Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package size={19} className="text-[#0D2748]" />

                <h3 className="font-black text-lg">تفاصيل محتويات الشحنة</h3>
              </div>

              {!shipment.shipment_items ||
              shipment.shipment_items.length === 0 ? (
                <EmptyState
                  icon={PackageX}
                  title="لا توجد تفاصيل"
                  description="لا توجد عناصر مرتبطة بهذه الشحنة."
                />
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[#0D2748] text-white">
                        <th className="px-4 py-3 text-right">الموديل</th>

                        <th className="px-4 py-3">الكود</th>

                        <th className="px-4 py-3">اللون</th>

                        <th className="px-4 py-3">المقاس</th>

                        <th className="px-4 py-3">الكمية</th>
                      </tr>
                    </thead>

                    <tbody>
                      {shipment.shipment_items.map((item, index) => {
                        const inventoryItem = item.inventory;

                        const model = inventoryItem?.models;

                        return (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-black">
                              {model?.name || "غير محدد"}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {model?.model_number || "-"}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {inventoryItem?.color || "-"}
                            </td>

                            <td className="px-4 py-3 text-center font-bold">
                              {inventoryItem?.size || "-"}
                            </td>

                            <td className="px-4 py-3 text-center font-black text-[#0D2748]">
                              {formatNumber(item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-blue-50 font-black">
                        <td colSpan="4" className="px-4 py-3 text-right">
                          الإجمالي
                        </td>

                        <td className="px-4 py-3 text-center text-[#0D2748]">
                          {formatNumber(
                            shipment.shipment_items.reduce(
                              (sum, item) => sum + (Number(item.quantity) || 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentModal;
