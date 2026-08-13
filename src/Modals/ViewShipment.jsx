import {
  X,
  Truck,
  PackageCheck,
  Box,
  RefreshCw,
  Printer,
  Layers,
  AlertTriangle,
} from "lucide-react";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../supabase";
import { toast } from "sonner";
import logoImage from "../assets/logo.jpeg";

const ViewShipment = ({ shipment, setOpenModal, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `بوليصة_شحن_${
      shipmentDetails?.shipment_number || "الصحابة"
    }`,
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

    setTimeout(() => {
      setOpenModal(false);
    }, 300);
  };

  const fetchShipmentDetails = async () => {
    setIsLoading(true);

    try {
      const { data: sizesData, error: sizesError } = await supabase
        .from("sizes")
        .select("id, name, sort_order")
        .order("sort_order", { ascending: true });

      if (sizesError) throw sizesError;

      const sizeMap = {};

      sizesData?.forEach((size) => {
        sizeMap[size.id] = size.name;
      });

      const { data, error } = await supabase
        .from("shipments")
        .select(
          `
            id,
            shipment_number,
            status,
            series_count,
            broken_qty,
            combined_qty,
            boxes_count,
            shipping_company,
            tracking_number,
            created_at,

            customers (
              name,
              phone,
              governorate,
              address
            ),

            brands (
              name_ar
            ),

            shipment_items (
              id,
              quantity,
              inventory_id,

              inventory (
                id,
                size,
                available_qty,
                models (
                  id,
                  name,
                  model_number,
                  collection_id
                )
              )
            ),

            shipment_broken_items (
              id,
              model_id,
              inventory_id,
              size,
              quantity,

              models (
                id,
                name,
                model_number
              )
            )
          `,
        )
        .eq("id", shipment.db_id)
        .single();

      if (error) throw error;

      const shipmentItems = data?.shipment_items || [];
      const brokenItems = data?.shipment_broken_items || [];

      const modelMap = {};

      shipmentItems.forEach((item) => {
        const model = item.inventory?.models;

        if (!model) return;

        const modelId = model.id;

        if (!modelMap[modelId]) {
          modelMap[modelId] = {
            id: model.id,
            name: model.name,
            model_number: model.model_number,
            sizes: {},
          };
        }

        const sizeId = item.inventory?.size;

        if (!sizeId) return;

        const sizeName = sizeMap[sizeId] || sizeId;
        const quantity = Number(item.quantity) || 0;

        if (!modelMap[modelId].sizes[sizeId]) {
          modelMap[modelId].sizes[sizeId] = {
            id: sizeId,
            name: sizeName,
            quantity: 0,
          };
        }

        modelMap[modelId].sizes[sizeId].quantity += quantity;
      });

      const models = Object.values(modelMap).map((model) => ({
        ...model,
        sizes: Object.values(model.sizes),
      }));

      const formattedBrokenItems = brokenItems.map((item) => ({
        id: item.id,
        model_id: item.model_id,
        model_name: item.models?.name || "غير محدد",
        model_number: item.models?.model_number || "",
        size: sizeMap[item.size] || item.size,
        quantity: Number(item.quantity) || 0,
      }));

      setShipmentDetails({
        ...data,
        models,
        brokenItems: formattedBrokenItems,
      });
    } catch (error) {
      console.error("Error fetching shipment details:", error);

      toast.error("حدث خطأ أثناء جلب تفاصيل الشحنة.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeriesCount = () => {
    return Number(shipmentDetails?.series_count) || 0;
  };

  const getModelsCount = () => {
    return shipmentDetails?.models?.length || 0;
  };

  const getSizesCount = () => {
    const sizes = new Set();

    shipmentDetails?.models?.forEach((model) => {
      model.sizes?.forEach((size) => {
        sizes.add(size.id);
      });
    });

    return sizes.size;
  };

  const getBasePieces = () => {
    const seriesCount = getSeriesCount();

    if (!shipmentDetails?.models?.length) return 0;

    return shipmentDetails.models.reduce((total, model) => {
      return total + (model.sizes?.length || 0) * seriesCount;
    }, 0);
  };

  const getBrokenPieces = () => {
    if (!shipmentDetails?.brokenItems) return 0;

    return shipmentDetails.brokenItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );
  };

  const getCombinedPieces = () => {
    return getBasePieces() + getBrokenPieces();
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("shipments")
        .update({
          status: newStatus,
        })
        .eq("id", shipment.db_id);

      if (error) throw error;

      if (
        shipmentDetails.status === "preparing" &&
        (newStatus === "shipped" || newStatus === "delivered")
      ) {
        for (const item of shipmentDetails.shipment_items || []) {
          const { data: invData, error: invError } = await supabase
            .from("inventory")
            .select("reserved_qty, shipped_qty")
            .eq("id", item.inventory_id)
            .single();

          if (invError) throw invError;

          if (invData) {
            const quantity = Number(item.quantity) || 0;

            const { error: updateError } = await supabase
              .from("inventory")
              .update({
                reserved_qty: Math.max(
                  0,
                  (invData.reserved_qty || 0) - quantity,
                ),
                shipped_qty: (invData.shipped_qty || 0) + quantity,
              })
              .eq("id", item.inventory_id);

            if (updateError) throw updateError;
          }
        }
      }

      toast.success("تم تحديث حالة الشحنة بنجاح!");

      setShipmentDetails({
        ...shipmentDetails,
        status: newStatus,
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating status:", error);

      toast.error("حدث خطأ أثناء تحديث حالة الشحنة.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!shipment) return null;

  const seriesCount = getSeriesCount();
  const modelsCount = getModelsCount();
  const sizesCount = getSizesCount();
  const basePieces = getBasePieces();
  const brokenPieces = getBrokenPieces();
  const combinedPieces = getCombinedPieces();

  return (
    <div className="font-arabic" dir="rtl">
      <div
        onClick={closeModal}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-[2rem] bg-white shadow-2xl transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 p-6 rounded-t-[2rem]">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#1a365d]/10 p-3 text-[#1a365d]">
              <Truck size={24} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900 font-mono">
                  #{shipmentDetails?.shipment_number || shipment.shipmentNumber}
                </h2>

                {shipmentDetails && (
                  <span
                    className={`rounded-md border px-3 py-1 text-xs font-bold ${
                      statusColors[shipmentDetails.status]
                    }`}
                  >
                    {statusToDisplay[shipmentDetails.status]}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-medium text-slate-500">
                تفاصيل الشحنة والسريهات والمقاسات والمكسر.
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 font-bold text-[#1a365d]">
              <RefreshCw className="ml-2 animate-spin" size={20} />
              جاري تحميل التفاصيل...
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-xs font-bold text-slate-400">
                    البراند
                  </p>

                  <p className="font-bold text-[#1a365d]">
                    {shipmentDetails?.brands?.name_ar || "غير محدد"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-xs font-bold text-slate-400">
                    العميل المستلم
                  </p>

                  <p className="font-bold text-slate-800">
                    {shipmentDetails?.customers?.name || "غير محدد"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-xs font-bold text-slate-400">
                    شركة الشحن
                  </p>

                  <p className="font-bold text-slate-800">
                    {shipmentDetails?.shipping_company || "غير محدد"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <p className="mb-1 text-xs font-bold text-slate-400">
                    المحافظة / العنوان
                  </p>

                  <p className="font-semibold text-slate-700">
                    {shipmentDetails?.customers?.governorate || "غير محدد"}
                    {" - "}
                    {shipmentDetails?.customers?.address || "غير مسجل"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-bold text-slate-400">
                    رقم التتبع
                  </p>

                  <p
                    className="text-left font-mono font-bold text-slate-800"
                    dir="ltr"
                  >
                    {shipmentDetails?.tracking_number || "لا يوجد"}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <Layers size={18} className="text-[#1a365d]" />
                  ملخص السريهات
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-xs font-bold text-blue-600">
                      عدد السريهات
                    </p>

                    <p className="text-2xl font-black text-blue-700">
                      {seriesCount.toLocaleString("ar-EG")}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-blue-500">
                      سري
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-bold text-slate-500">
                      عدد الموديلات
                    </p>

                    <p className="text-2xl font-black text-[#1a365d]">
                      {modelsCount.toLocaleString("ar-EG")}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      موديل
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-bold text-slate-500">
                      عدد المقاسات
                    </p>

                    <p className="text-2xl font-black text-[#1a365d]">
                      {sizesCount.toLocaleString("ar-EG")}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      مقاس
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="mb-2 text-xs font-bold text-indigo-600">
                      القطع الأساسية
                    </p>

                    <p className="text-2xl font-black text-indigo-700">
                      {basePieces.toLocaleString("ar-EG")}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-indigo-500">
                      سري × موديلات × مقاسات
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="mb-2 text-xs font-bold text-emerald-600">
                      إجمالي القطع
                    </p>

                    <p className="text-2xl font-black text-emerald-700">
                      {combinedPieces.toLocaleString("ar-EG")}
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-emerald-500">
                      الأساسي + المكسر
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <Box size={18} className="text-[#1a365d]" />
                  تفاصيل السريهات حسب الموديل والمقاس
                </h3>

                <div className="space-y-4">
                  {shipmentDetails?.models?.length > 0 ? (
                    shipmentDetails.models.map((model) => (
                      <div
                        key={model.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-slate-900">
                              {model.name || "غير محدد"}
                            </p>

                            {model.model_number && (
                              <p className="mt-1 text-xs text-slate-400">
                                كود الموديل: {model.model_number}
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-blue-100 px-3 py-2 text-center">
                            <p className="text-[10px] font-bold text-blue-600">
                              إجمالي الموديل
                            </p>

                            <p className="font-black text-blue-700">
                              {(
                                (model.sizes?.length || 0) * seriesCount
                              ).toLocaleString("ar-EG")}{" "}
                              قطعة
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-5">
                          {model.sizes?.map((size) => (
                            <div
                              key={size.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
                            >
                              <p className="text-xs font-bold text-slate-500">
                                مقاس
                              </p>

                              <p className="mt-1 font-black text-[#1a365d]">
                                {size.name}
                              </p>

                              <div className="mt-2 border-t border-slate-200 pt-2">
                                <p className="text-[10px] text-slate-400">
                                  الكمية
                                </p>

                                <p className="font-black text-blue-700">
                                  {size.quantity.toLocaleString("ar-EG")}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  قطعة
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center font-medium text-slate-500">
                      لا توجد تفاصيل للموديلات في هذه الشحنة.
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <AlertTriangle size={18} className="text-red-600" />
                  تفاصيل المكسر
                </h3>

                {shipmentDetails?.brokenItems?.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-red-200">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-red-50 text-red-800">
                        <tr>
                          <th className="p-4 font-bold">الموديل</th>
                          <th className="p-4 font-bold">المقاس</th>
                          <th className="p-4 font-bold">الكمية</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-red-100 bg-white">
                        {shipmentDetails.brokenItems.map((item) => (
                          <tr key={item.id}>
                            <td className="p-4">
                              <p className="font-bold text-slate-800">
                                {item.model_name}
                              </p>

                              {item.model_number && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {item.model_number}
                                </p>
                              )}
                            </td>

                            <td className="p-4 font-bold text-slate-700">
                              {item.size}
                            </td>

                            <td className="p-4 font-black text-red-700">
                              {item.quantity.toLocaleString("ar-EG")} قطعة
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr className="bg-red-50">
                          <td
                            colSpan="2"
                            className="p-4 font-black text-red-800"
                          >
                            إجمالي المكسر
                          </td>

                          <td className="p-4 font-black text-red-700">
                            {brokenPieces.toLocaleString("ar-EG")} قطعة
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center font-medium text-slate-500">
                    لا يوجد مكسر مسجل في هذه الشحنة.
                  </div>
                )}
              </div>

              <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      إجمالي القطع في الشحنة
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      السريهات الأساسية + القطع المكسرة
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-3xl font-black text-emerald-700">
                      {combinedPieces.toLocaleString("ar-EG")}
                    </p>

                    <p className="text-xs font-bold text-emerald-600">قطعة</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
                <div>
                  <p className="font-bold text-slate-800">تحديث حالة الشحنة</p>

                  <p className="mt-1 text-xs text-slate-500">
                    قم بتغيير الحالة عند خروج الشحنة أو تأكيد التسليم.
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  {shipmentDetails?.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus("shipped")}
                      disabled={isUpdating}
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 sm:flex-none"
                    >
                      خروج للشحن 🚚
                    </button>
                  )}

                  {shipmentDetails?.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={isUpdating}
                      className="flex-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                    >
                      تأكيد التسليم ✅
                    </button>
                  )}

                  {shipmentDetails?.status === "delivered" && (
                    <span className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 font-bold text-emerald-600">
                      <PackageCheck size={18} />
                      تمت العملية بنجاح
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-between gap-3 rounded-b-[2rem] border-t border-slate-200 bg-white p-6">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex-none"
          >
            <Printer size={18} />
            طباعة بوليصة الشحن
          </button>

          <button
            onClick={closeModal}
            className="flex-1 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 sm:flex-none"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>

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

const PrintableShipmentReceipt = forwardRef(({ shipment, logo }, ref) => {
  if (!shipment) return null;

  const seriesCount = Number(shipment.series_count) || 0;

  const modelsCount = shipment.models?.length || 0;

  const basePieces =
    shipment.models?.reduce((total, model) => {
      return total + (model.sizes?.length || 0) * seriesCount;
    }, 0) || 0;

  const brokenPieces =
    shipment.brokenItems?.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    ) || 0;

  const combinedPieces = basePieces + brokenPieces;

  return (
    <div
      ref={ref}
      className="bg-white p-8 font-arabic text-slate-900"
      dir="rtl"
    >
      <div className="mb-6 flex items-center justify-between border-b-4 border-[#1a365d] pb-6">
        <div className="flex items-center gap-4">
          {logo && (
            <img
              src={logo}
              alt="الصحابة"
              className="h-16 w-16 rounded-lg border border-slate-200 object-contain p-1"
            />
          )}

          <div>
            <h1 className="text-2xl font-black text-[#1a365d]">
              الصحابة لتصنيع وتصدير الملابس
            </h1>

            <p className="mt-0.5 text-xs font-bold text-[#b91c1c]">
              نصنع الجودة بخيوط الثقة
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
          <p className="text-xs font-bold text-slate-500">بوليصة شحن</p>

          <p className="mt-1 font-mono text-sm font-black text-[#1a365d]">
            #{shipment.shipment_number}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-1 font-bold text-slate-400">
            بيانات العميل المستلم:
          </p>

          <p className="text-sm font-bold text-slate-900">
            {shipment.customers?.name || "غير محدد"}
          </p>

          <p className="mt-1 text-slate-600">
            المحافظة: {shipment.customers?.governorate || "غير محدد"}
          </p>

          <p className="text-slate-600">
            العنوان: {shipment.customers?.address || "غير مسجل"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-1 font-bold text-slate-400">بيانات الشحن:</p>

          <p className="text-slate-700">
            البراند:{" "}
            <span className="font-bold text-[#1a365d]">
              {shipment.brands?.name_ar || "غير محدد"}
            </span>
          </p>

          <p className="mt-1 text-slate-700">
            شركة الشحن:{" "}
            <span className="font-bold text-slate-900">
              {shipment.shipping_company || "غير محدد"}
            </span>
          </p>

          <p className="mt-1 text-slate-700">
            رقم التتبع:{" "}
            <span className="font-mono font-bold text-slate-900">
              {shipment.tracking_number || "لا يوجد"}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-2 rounded border-r-4 border-[#1a365d] bg-slate-100 p-2 text-xs font-bold text-[#1a365d]">
          ملخص الشحنة
        </h3>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-[10px] font-bold text-blue-600">عدد السريهات</p>

            <p className="mt-1 text-lg font-black text-blue-700">
              {seriesCount}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] font-bold text-slate-500">
              عدد الموديلات
            </p>

            <p className="mt-1 text-lg font-black text-[#1a365d]">
              {modelsCount}
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-[10px] font-bold text-red-600">المكسر</p>

            <p className="mt-1 text-lg font-black text-red-700">
              {brokenPieces}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[10px] font-bold text-emerald-600">
              إجمالي القطع
            </p>

            <p className="mt-1 text-lg font-black text-emerald-700">
              {combinedPieces}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-2 rounded border-r-4 border-[#1a365d] bg-slate-100 p-2 text-xs font-bold text-[#1a365d]">
          تفاصيل السريهات حسب الموديل والمقاس
        </h3>

        <table className="w-full border-collapse border border-slate-300 text-right text-xs">
          <thead>
            <tr className="bg-[#1a365d] text-white">
              <th className="border border-slate-300 p-2.5">الموديل</th>

              <th className="border border-slate-300 p-2.5">المقاس</th>

              <th className="border border-slate-300 p-2.5 text-center">
                عدد السريهات
              </th>

              <th className="border border-slate-300 p-2.5 text-center">
                القطع
              </th>
            </tr>
          </thead>

          <tbody>
            {shipment.models?.flatMap((model) =>
              model.sizes?.map((size) => (
                <tr key={`${model.id}-${size.id}`}>
                  <td className="border border-slate-300 p-2.5 font-bold text-slate-800">
                    {model.name || "غير محدد"}
                    {model.model_number && (
                      <span className="mr-2 text-[10px] text-slate-400">
                        {model.model_number}
                      </span>
                    )}
                  </td>

                  <td className="border border-slate-300 p-2.5 text-slate-600">
                    {size.name}
                  </td>

                  <td className="border border-slate-300 p-2.5 text-center font-bold text-blue-700">
                    {seriesCount}
                  </td>

                  <td className="border border-slate-300 p-2.5 text-center font-bold text-[#1a365d]">
                    {size.quantity} قطعة
                  </td>
                </tr>
              )),
            )}
          </tbody>

          <tfoot>
            <tr className="bg-slate-100">
              <td
                colSpan="3"
                className="border border-slate-300 p-2.5 font-black"
              >
                إجمالي القطع الأساسية
              </td>

              <td className="border border-slate-300 p-2.5 text-center font-black text-[#1a365d]">
                {basePieces} قطعة
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {shipment.brokenItems?.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-2 rounded border-r-4 border-red-600 bg-red-50 p-2 text-xs font-bold text-red-700">
            تفاصيل المكسر
          </h3>

          <table className="w-full border-collapse border border-red-200 text-right text-xs">
            <thead>
              <tr className="bg-red-50 text-red-800">
                <th className="border border-red-200 p-2.5">الموديل</th>

                <th className="border border-red-200 p-2.5">المقاس</th>

                <th className="border border-red-200 p-2.5 text-center">
                  الكمية
                </th>
              </tr>
            </thead>

            <tbody>
              {shipment.brokenItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-red-200 p-2.5 font-bold">
                    {item.model_name}
                  </td>

                  <td className="border border-red-200 p-2.5">{item.size}</td>

                  <td className="border border-red-200 p-2.5 text-center font-black text-red-700">
                    {item.quantity} قطعة
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-red-50">
                <td
                  colSpan="2"
                  className="border border-red-200 p-2.5 font-black"
                >
                  إجمالي المكسر
                </td>

                <td className="border border-red-200 p-2.5 text-center font-black text-red-700">
                  {brokenPieces} قطعة
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 border-t border-slate-200 pt-6 text-center">
        <div>
          <p className="text-xs font-bold text-slate-500">القطع الأساسية</p>

          <p className="mt-1 text-xl font-black text-[#1a365d]">{basePieces}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-red-500">المكسر</p>

          <p className="mt-1 text-xl font-black text-red-700">{brokenPieces}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-emerald-600">إجمالي القطع</p>

          <p className="mt-1 text-xl font-black text-emerald-700">
            {combinedPieces}
          </p>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-center text-xs">
        <div>
          <p className="mb-12 font-bold text-slate-700">
            مسؤول المخزن / التجهيز
          </p>

          <p className="mx-auto w-48 border-t border-slate-400 pt-1 text-slate-400">
            التوقيع
          </p>
        </div>

        <div>
          <p className="mb-12 font-bold text-slate-700">
            مندوب شركة الشحن / المستلم
          </p>

          <p className="mx-auto w-48 border-t border-slate-400 pt-1 text-slate-400">
            التوقيع والاستلام
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] font-bold text-slate-400">
        <p>
          نظام إدارة أوردرات المصنع - الصحابة لتصنيع وتصدير الملابس | بوليصة
          معتمدة
        </p>
      </div>
    </div>
  );
});

export default ViewShipment;
