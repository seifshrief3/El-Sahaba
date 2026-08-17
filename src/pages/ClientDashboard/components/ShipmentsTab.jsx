import React from "react";
import {
  Truck,
  Printer,
  CheckCircle2,
  Clock3,
  Package,
  Eye,
} from "lucide-react";
import { formatNumber, formatDate } from "../utils";
import SectionTitle from "../ui/SectionTitle";
import StatCard from "../ui/StatCard";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

const ShipmentsTab = ({
  shipmentRows,
  shipmentCount,
  completedShipments,
  pendingShipments,
  totalShipped,
  setSelectedShipment,
  handlePrintShipments,
  shipmentsPrintRef,
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* =====================================================
            Header
        ===================================================== */}

        <div className="p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <SectionTitle
              icon={Truck}
              title="سجل الشحنات"
              subtitle="جميع الشحنات الخاصة بالبراند"
            />

            <button
              type="button"
              onClick={handlePrintShipments}
              className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-[#0D2748] hover:bg-slate-50 font-bold text-sm flex items-center justify-center gap-2 transition shrink-0"
            >
              <Printer size={16} />

              <span className="hidden sm:block">طباعة التقرير</span>
            </button>
          </div>

          {/* ===================================================
              Dashboard Statistics
              لا تظهر في التقرير
          =================================================== */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print-hide">
            <StatCard
              title="إجمالي الشحنات"
              value={shipmentCount}
              icon={Truck}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="مكتملة"
              value={completedShipments}
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="قيد المتابعة"
              value={pendingShipments}
              icon={Clock3}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="إجمالي القطع المشحونة"
              value={totalShipped}
              icon={Package}
              iconClass="bg-violet-50 text-violet-600"
            />
          </div>
        </div>

        {/* =====================================================
            PRINT REPORT
            ده الجزء الوحيد اللي react-to-print هيطبعه
        ===================================================== */}

        <div ref={shipmentsPrintRef} className="print-container">
          {/* =================================================
              Report Header
          ================================================= */}

          <div className="hidden print:block px-5 pt-5 pb-4">
            <div className="border-b-2 border-[#0D2748] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0D2748]">
                    تقرير سجل الشحنات
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    تقرير تفصيلي بجميع الشحنات الخاصة بالبراند
                  </p>
                </div>

                <div className="text-left text-sm text-slate-500">
                  <div>تاريخ التقرير</div>

                  <div className="font-bold text-slate-700 mt-1">
                    {new Date().toLocaleDateString("ar-EG")}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Summary */}

            <div className="grid grid-cols-4 gap-3 mt-5">
              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">إجمالي الشحنات</div>

                <div className="text-xl font-black text-[#0D2748] mt-1">
                  {formatNumber(shipmentCount)}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">الشحنات المكتملة</div>

                <div className="text-xl font-black text-emerald-700 mt-1">
                  {formatNumber(completedShipments)}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">قيد المتابعة</div>

                <div className="text-xl font-black text-amber-700 mt-1">
                  {formatNumber(pendingShipments)}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">
                  إجمالي القطع المشحونة
                </div>

                <div className="text-xl font-black text-violet-700 mt-1">
                  {formatNumber(totalShipped)}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              Empty State
          ================================================= */}

          {shipmentRows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Truck}
                title="لا توجد شحنات"
                description="لم يتم تسجيل شحنات لهذا البراند."
              />
            </div>
          ) : (
            /* =================================================
               Shipments Table
            ================================================= */

            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full min-w-[950px] text-sm">
                <thead>
                  <tr className="bg-[#0D2748] text-white">
                    <th className="px-4 py-4 text-right">رقم الشحنة</th>

                    <th className="px-4 py-4">شركة الشحن</th>

                    <th className="px-4 py-4">رقم البوليصة</th>

                    <th className="px-4 py-4">عدد القطع</th>

                    <th className="px-4 py-4">تاريخ الشحن</th>

                    <th className="px-4 py-4">الحالة</th>

                    <th className="px-4 py-4 print-hide">التفاصيل</th>
                  </tr>
                </thead>

                <tbody>
                  {shipmentRows.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-slate-100 hover:bg-blue-50/30 transition"
                    >
                      {/* Shipment Number */}

                      <td className="px-4 py-4 font-black">
                        {shipment.shipment_number || "-"}
                      </td>

                      {/* Shipping Company */}

                      <td className="px-4 py-4 text-center">
                        {shipment.shipping_company || "-"}
                      </td>

                      {/* Tracking Number */}

                      <td className="px-4 py-4 text-center font-bold">
                        {shipment.tracking_number || "-"}
                      </td>

                      {/* Quantity */}

                      <td className="px-4 py-4 text-center font-black text-[#0D2748]">
                        {formatNumber(shipment.totalQuantity)}
                      </td>

                      {/* Date */}

                      <td className="px-4 py-4 text-center text-slate-500">
                        {formatDate(shipment.created_at)}
                      </td>

                      {/* Status */}

                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={shipment.status} />
                      </td>

                      {/* Details */}

                      <td className="px-4 py-4 text-center print-hide">
                        <button
                          type="button"
                          onClick={() => setSelectedShipment(shipment)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black"
                        >
                          <Eye size={15} />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              Report Footer
          ================================================= */}

          <div className="hidden print:flex items-center justify-between px-5 py-4 mt-4 border-t border-slate-200 text-xs text-slate-400">
            <span>
              إجمالي عدد الشحنات:{" "}
              <strong className="text-slate-700">
                {formatNumber(shipmentCount)}
              </strong>
            </span>

            <span>
              إجمالي القطع المشحونة:{" "}
              <strong className="text-slate-700">
                {formatNumber(totalShipped)}
              </strong>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShipmentsTab;
