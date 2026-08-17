import React from "react";
import {
  Eye,
  FileText,
  Headset,
  PackageCheck,
  RefreshCw,
  Truck,
  MessageCircle,
  Warehouse,
  Boxes,
  Shirt,
  ChevronLeft,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Package,
  Send,
} from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";
import StatCard from "../ui/StatCard";
// 💡 تم إضافة الدوال المفقودة من ملف utils
import { formatNumber, formatDate, getCollectionProgress } from "../utils";

const DashboardHome = ({
  totalShipped,
  totalProductionQuantity,
  inventorySummary,
  inventoryRows,
  sizeColumns,
  shipmentRows,
  shipmentCount,
  completedShipments,
  pendingShipments,
  enrichedCollections,
  inventory,
  setActivePage,
  setSelectedShipment,
}) => {
  // 💡 حساب المتغيرات اللي كانت ناقصة بتسبب مشكلة
  const totalReceived = inventorySummary?.received || 0;

  const shippingProgressPercentage =
    totalProductionQuantity > 0
      ? Math.round((totalShipped / totalProductionQuantity) * 100)
      : 0;

  const inventoryProgressPercentage =
    totalProductionQuantity > 0
      ? Math.round((inventorySummary.available / totalProductionQuantity) * 100)
      : 0;

  return (
    <main className="max-w-[1600px] mx-auto px-3 md:px-7 py-5 md:py-7 animate-fade-in">
      {/* =================================================
            HOME
        ================================================= */}
      <div className="space-y-5">
        {/* قسم المؤشرات الدائرية (Charts) وخدمة العملاء الجديد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chart 1: Shipping Progress */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#102A43] mb-1">
                نسبة إنجاز الشحن
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                من إجمالي أوامر التشغيل
              </p>
              <div className="mt-4 font-black text-2xl text-emerald-600">
                {formatNumber(totalShipped)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  قطعة مشحونة
                </span>
              </div>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${shippingProgressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#102A43]">
                  {shippingProgressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart 2: Inventory Availability */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#102A43] mb-1">
                القطع الجاهزة للشحن
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                نسبة التوفر في المخزن
              </p>
              <div className="mt-4 font-black text-2xl text-blue-600">
                {formatNumber(inventorySummary.available)}{" "}
                <span className="text-sm font-medium text-slate-400">
                  قطعة متاحة
                </span>
              </div>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-blue-600"
                  strokeDasharray={`${inventoryProgressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#102A43]">
                  {inventoryProgressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Customer Service Support */}
          <div className="bg-gradient-to-br from-[#0D2748] to-[#1a3d6d] rounded-3xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 opacity-10">
              <Headset size={100} />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm">
                <Headset size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg">تواصل مع خدمة العملاء</h3>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  نحن هنا لمساعدتك في أي استفسار يخص إنتاج وشحن الكولكشن الخاص بك.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/201115480308"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-5 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <MessageCircle size={18} />
              تواصل الآن عبر الواتساب
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.9fr] gap-5">
          {/* Inventory Table */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <SectionTitle
                icon={Warehouse}
                title="مخزون مخزن الشحن"
                subtitle="تفاصيل الكميات المتاحة والمشحونة حسب الموديل"
              />
            </div>

            {inventoryRows.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="لا توجد بيانات مخزون"
                description="لا توجد كميات مسجلة لهذا البراند حالياً."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[950px]">
                  <thead>
                    <tr className="bg-[#0D2748] text-white">
                      <th className="px-3 py-3 text-right font-black">الموديل</th>
                      <th className="px-3 py-3 font-black">الكود</th>
                      <th className="px-3 py-3 font-black">عدد الأشكال</th>
                      <th className="px-3 py-3 font-black">المتاح</th>
                      <th className="px-3 py-3 font-black">المحجوز</th>
                      {sizeColumns.map((size) => (
                        <th key={size} className="px-3 py-3 font-black">
                          {size}
                        </th>
                      ))}
                      <th className="px-3 py-3 font-black">المشحون</th>
                      <th className="px-3 py-3 font-black">الإجمالي</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventoryRows.map((row) => {
                      const total = row.available + row.shipped;

                      return (
                        <tr
                          key={row.modelId}
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                {row.model?.image_url ? (
                                  <img
                                    src={row.model.image_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Shirt size={18} className="text-slate-300" />
                                )}
                              </div>

                              <div>
                                <div className="font-black text-[#102A43]">
                                  {row.model?.name || "موديل غير محدد"}
                                </div>

                                <div className="text-[10px] text-slate-400">
                                  {row.model?.model_number || "-"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center font-bold">
                            {row.model?.model_number || "-"}
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span className="font-black">1</span>
                          </td>

                          <td className="px-3 py-3 text-center font-black text-emerald-600">
                            {formatNumber(row.available)}
                          </td>

                          <td className="px-3 py-3 text-center font-black text-red-500">
                            {formatNumber(row.reserved)}
                          </td>

                          {sizeColumns.map((size) => (
                            <td
                              key={size}
                              className="px-3 py-3 text-center font-bold text-slate-600"
                            >
                              {formatNumber(row.sizes[size] || 0)}
                            </td>
                          ))}

                          <td className="px-3 py-3 text-center font-black text-orange-500">
                            {formatNumber(row.shipped)}
                          </td>

                          <td className="px-3 py-3 text-center font-black text-[#102A43]">
                            {formatNumber(total)}
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-blue-50/70 font-black">
                      <td className="px-3 py-3">الإجمالي</td>
                      <td />
                      <td />
                      <td className="px-3 py-3 text-center text-emerald-700">
                        {formatNumber(inventorySummary.available)}
                      </td>
                      <td className="px-3 py-3 text-center text-red-600">
                        {formatNumber(inventorySummary.reserved)}
                      </td>

                      {sizeColumns.map((size) => {
                        const totalSize = inventory.reduce((sum, item) => {
                          if (String(item.size) === String(size)) {
                            return sum + (Number(item.available_qty) || 0);
                          }
                          return sum;
                        }, 0);

                        return (
                          <td key={size} className="px-3 py-3 text-center">
                            {formatNumber(totalSize)}
                          </td>
                        );
                      })}

                      <td className="px-3 py-3 text-center text-orange-600">
                        {formatNumber(inventorySummary.shipped)}
                      </td>
                      <td className="px-3 py-3 text-center text-[#102A43]">
                        {formatNumber(
                          inventorySummary.available + inventorySummary.shipped
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Shipment Table */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <SectionTitle
                icon={Truck}
                title="سجل الشحنات"
                subtitle="آخر الشحنات الخاصة بالبراند"
                action={
                  <button
                    onClick={() => setActivePage("shipments")}
                    className="text-[#0D5FE8] text-xs font-black flex items-center gap-1"
                  >
                    عرض الكل
                    <ChevronLeft size={14} />
                  </button>
                }
              />
            </div>

            {shipmentRows.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="لا توجد شحنات"
                description="لم يتم تسجيل أي شحنات لهذا البراند حتى الآن."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0D2748] text-white">
                      <th className="px-3 py-3 text-right">رقم الشحنة</th>
                      <th className="px-3 py-3">الكمية</th>
                      <th className="px-3 py-3">شركة الشحن</th>
                      <th className="px-3 py-3">الحالة</th>
                      <th className="px-3 py-3">الإجراء</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shipmentRows.slice(0, 5).map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-3 py-3 font-black">
                          {shipment.shipment_number || "-"}
                        </td>
                        <td className="px-3 py-3 text-center font-black text-[#0D2748]">
                          {formatNumber(shipment.totalQuantity)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {shipment.shipping_company || "-"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => setSelectedShipment(shipment)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 inline-flex items-center justify-center transition"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* =================================================
                INDICATORS
            ================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <SectionTitle
            icon={BarChart3}
            title="خلاصة المؤشرات الرئيسية"
            subtitle="ملخص سريع لحالة الإنتاج والمخزون والشحن"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard
              title="إجمالي المستلم"
              value={totalReceived}
              subtitle="الكمية المستلمة"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="إجمالي القطع الحالية"
              value={totalProductionQuantity}
              subtitle="إجمالي أوامر التشغيل"
              icon={Package}
              iconClass="bg-blue-50 text-blue-700"
            />

            <StatCard
              title="إجمالي المشحون"
              value={totalShipped}
              subtitle="تم شحنها بالفعل"
              icon={Truck}
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="المتاح بالمخزن"
              value={inventorySummary.available}
              subtitle="جاهز للشحن"
              icon={Boxes}
              iconClass="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="القطع المحجوزة"
              value={inventorySummary.reserved}
              subtitle="كميات محجوزة"
              icon={PackageCheck}
              iconClass="bg-red-50 text-red-600"
            />

            <StatCard
              title="عدد الشحنات"
              value={shipmentCount}
              subtitle={`${completedShipments} شحنة مكتملة`}
              icon={Send}
              iconClass="bg-cyan-50 text-cyan-600"
            />
          </div>
        </section>

        {/* =================================================
                BOTTOM ROW
            ================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1fr_0.85fr] gap-5">
          {/* Shipment Path */}
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <SectionTitle
              icon={Truck}
              title="مسار الشحن"
              subtitle="مراحل انتقال الطلب"
            />

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="font-black text-sm">أمر التشغيل</div>
                  <div className="text-[11px] text-slate-400">
                    تم إصدار أمر التشغيل
                  </div>
                </div>
              </div>

              <div className="mr-6 border-r-2 border-dashed border-slate-200 h-5" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <PackageCheck size={22} />
                </div>
                <div>
                  <div className="font-black text-sm">تم التجهيز</div>
                  <div className="text-[11px] text-slate-400">
                    الكميات وصلت للمخزن
                  </div>
                </div>
              </div>

              <div className="mr-6 border-r-2 border-dashed border-slate-200 h-5" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <div className="font-black text-sm">تم الشحن</div>
                  <div className="text-[11px] text-slate-400">
                    {formatNumber(totalShipped)} قطعة تم شحنها
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Shipments */}
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <SectionTitle
              icon={ClipboardList}
              title="آخر الشحنات"
              subtitle="آخر عمليات الشحن المسجلة"
            />

            {shipmentRows.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="لا توجد شحنات"
                description="ستظهر الشحنات هنا بمجرد تسجيلها."
              />
            ) : (
              <div className="space-y-2">
                {shipmentRows.slice(0, 6).map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition text-right"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D2748] flex items-center justify-center shrink-0">
                        <Truck size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm truncate">
                          {shipment.shipment_number || "شحنة"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(shipment.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={shipment.status} />
                      <span className="text-[10px] font-bold text-slate-400">
                        {formatNumber(shipment.totalQuantity)} قطعة
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Alerts / Progress */}
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <SectionTitle
              icon={AlertTriangle}
              title="حالة الكولكشنات"
              subtitle="نسبة الشحن لكل كولكشن"
            />

            {enrichedCollections.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="لا توجد كولكشنات"
                description="ستظهر الكولكشنات هنا عند إضافتها."
              />
            ) : (
              <div className="space-y-4">
                {enrichedCollections.slice(0, 5).map((collection) => {
                  const progress = getCollectionProgress(collection);

                  return (
                    <div key={collection.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black truncate">
                          {collection.name}
                        </span>
                        <span className="text-[11px] font-black text-[#0D2748]">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 100 ? "bg-emerald-500" : "bg-[#0D2748]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>
                          مشحون: {formatNumber(collection.shippedQuantity)}
                        </span>
                        <span>
                          متبقي:{" "}
                          {formatNumber(
                            Math.max(
                              0,
                              collection.totalQuantity -
                                collection.shippedQuantity
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-center pt-1">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 shadow-sm">
            <RefreshCw size={13} />
            جميع البيانات محدثة من قاعدة البيانات
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardHome;