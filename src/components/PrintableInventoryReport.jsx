import React, { forwardRef } from "react";

const PrintableInventoryReport = forwardRef(
  ({ stats, inventory, logo }, ref) => {
    const groupedModels = {};

    inventory.forEach((item) => {
      const key = `${item.brand}-${item.collection}-${item.model}`;

      if (!groupedModels[key]) {
        groupedModels[key] = {
          brand: item.brand,
          collection: item.collection,
          model: item.model,

          available: 0,
          reserved: 0,
          shipped: 0,
          total: 0,

          colors: {},
        };
      }

      const model = groupedModels[key];

      model.available += Number(item.available) || 0;
      model.reserved += Number(item.reserved) || 0;
      model.shipped += Number(item.shipped) || 0;

      model.total = model.available + model.reserved + model.shipped;

      // ------------------------------------------
      // تجميع الألوان
      // ------------------------------------------
      const colorName = item.color || "غير محدد";

      if (!model.colors[colorName]) {
        model.colors[colorName] = {
          color: colorName,
          available: 0,
          reserved: 0,
          shipped: 0,
          total: 0,
          sizes: {},
        };
      }

      const color = model.colors[colorName];

      color.available += Number(item.available) || 0;
      color.reserved += Number(item.reserved) || 0;
      color.shipped += Number(item.shipped) || 0;

      color.total = color.available + color.reserved + color.shipped;

      // ------------------------------------------
      // تجميع المقاسات
      // ------------------------------------------
      if (Array.isArray(item.sizes)) {
        item.sizes.forEach((sizeItem) => {
          const sizeName = sizeItem.size || "غير محدد";

          if (!color.sizes[sizeName]) {
            color.sizes[sizeName] = {
              size: sizeName,
              available: 0,
              reserved: 0,
              shipped: 0,
              total: 0,
            };
          }

          const size = color.sizes[sizeName];

          size.available += Number(sizeItem.available) || 0;
          size.reserved += Number(sizeItem.reserved) || 0;
          size.shipped += Number(sizeItem.shipped) || 0;

          size.total = size.available + size.reserved + size.shipped;
        });
      }
    });

    const models = Object.values(groupedModels);

    // ==========================================
    // إحصائيات إضافية للتقرير
    // ==========================================

    const totalModels = models.length;

    const totalColors = models.reduce(
      (total, model) => total + Object.keys(model.colors).length,
      0,
    );

    const totalPieces =
      Number(stats.available || 0) +
      Number(stats.reserved || 0) +
      Number(stats.shipped || 0);

    return (
      <div
        ref={ref}
        className="inventory-print-report bg-white text-slate-900 font-arabic"
        dir="rtl"
      >
        {/* =====================================================
              رأس التقرير
          ====================================================== */}

        <div className="report-header border-b-4 border-[#1a365d] pb-5 mb-6 flex justify-between items-center">
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

              <p className="text-xs font-bold text-[#b91c1c] mt-1">
                نصنع الجودة بخيوط الثقة
              </p>

              <p className="text-xs text-slate-500 mt-2">
                تقرير الجرد التفصيلي للمصنع
              </p>
            </div>
          </div>

          <div className="text-left bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[190px]">
            <p className="text-xs font-bold text-slate-500">
              تقرير الجرد العام
            </p>

            <p className="text-xs font-black text-[#1a365d] mt-1">
              تاريخ الإصدار: {new Date().toLocaleDateString("ar-EG")}
            </p>

            <p className="text-[10px] text-slate-500 mt-1">
              وقت الإصدار: {new Date().toLocaleTimeString("ar-EG")}
            </p>
          </div>
        </div>

        {/* =====================================================
              ملخص المخزون
          ====================================================== */}

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 border-r-4 border-r-[#1a365d]">
            <p className="text-[10px] font-bold text-slate-500">
              المتاح بالمخزن
            </p>

            <p className="text-xl font-black text-[#1a365d] mt-1">
              {Number(stats.available || 0).toLocaleString()}
            </p>

            <p className="text-[9px] text-slate-400">قطعة متاحة فعليًا</p>
          </div>

          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 border-r-4 border-r-[#b91c1c]">
            <p className="text-[10px] font-bold text-slate-500">
              المحجوز للشحن
            </p>

            <p className="text-xl font-black text-[#b91c1c] mt-1">
              {Number(stats.reserved || 0).toLocaleString()}
            </p>

            <p className="text-[9px] text-slate-400">قطعة محجوزة</p>
          </div>

          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 border-r-4 border-r-blue-600">
            <p className="text-[10px] font-bold text-slate-500">
              إجمالي المشحون
            </p>

            <p className="text-xl font-black text-blue-700 mt-1">
              {Number(stats.shipped || 0).toLocaleString()}
            </p>

            <p className="text-[9px] text-slate-400">قطعة تم شحنها</p>
          </div>

          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 border-r-4 border-r-slate-600">
            <p className="text-[10px] font-bold text-slate-500">
              إجمالي حركة المخزون
            </p>

            <p className="text-xl font-black text-[#1a365d] mt-1">
              {totalPieces.toLocaleString()}
            </p>

            <p className="text-[9px] text-slate-400">قطعة</p>
          </div>
        </div>

        {/* =====================================================
              ملخص الأصناف
          ====================================================== */}

        <div className="grid grid-cols-3 gap-3 mb-7">
          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <p className="text-[10px] text-slate-500 font-bold">
              عدد البراندات
            </p>

            <p className="text-lg font-black text-[#1a365d] mt-1">
              {stats.brands}
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <p className="text-[10px] text-slate-500 font-bold">
              عدد الموديلات
            </p>

            <p className="text-lg font-black text-[#1a365d] mt-1">
              {totalModels}
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <p className="text-[10px] text-slate-500 font-bold">عدد الألوان</p>

            <p className="text-lg font-black text-[#1a365d] mt-1">
              {totalColors}
            </p>
          </div>
        </div>

        {/* =====================================================
              تفاصيل الموديلات
          ====================================================== */}

        <div className="mb-4">
          <h3 className="font-black text-sm text-[#1a365d] mb-3 bg-slate-100 p-3 rounded-lg border-r-4 border-[#1a365d]">
            التفاصيل الكاملة لأرصدة الموديلات والألوان والمقاسات
          </h3>
        </div>

        {/* =====================================================
              كل موديل
          ====================================================== */}

        <div className="space-y-6">
          {models.map((model, modelIndex) => {
            const colors = Object.values(model.colors);

            return (
              <div
                key={`${model.brand}-${model.collection}-${model.model}-${modelIndex}`}
                className="model-block border border-slate-300 rounded-xl overflow-hidden"
              >
                {/* ---------------------------------------------
                      Header الموديل
                  ---------------------------------------------- */}

                <div className="bg-[#1a365d] text-white p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] opacity-80">
                      {model.brand}
                      {" • "}
                      {model.collection}
                    </p>

                    <h2 className="text-base font-black mt-0.5">
                      {model.model}
                    </h2>
                  </div>

                  <div className="text-left">
                    <p className="text-[9px] opacity-80">إجمالي قطع الموديل</p>

                    <p className="text-lg font-black">
                      {model.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ---------------------------------------------
                      ملخص الموديل
                  ---------------------------------------------- */}

                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 border-b border-slate-200">
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <p className="text-[9px] text-slate-400">عدد الألوان</p>

                    <p className="text-sm font-black text-[#1a365d]">
                      {colors.length}
                    </p>
                  </div>

                  <div className="bg-white border border-emerald-100 rounded-lg p-2">
                    <p className="text-[9px] text-emerald-600">المتاح</p>

                    <p className="text-sm font-black text-emerald-700">
                      {model.available.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white border border-orange-100 rounded-lg p-2">
                    <p className="text-[9px] text-orange-600">المحجوز</p>

                    <p className="text-sm font-black text-orange-700">
                      {model.reserved.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white border border-blue-100 rounded-lg p-2">
                    <p className="text-[9px] text-blue-600">المشحون</p>

                    <p className="text-sm font-black text-blue-700">
                      {model.shipped.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ---------------------------------------------
                      جدول الألوان والمقاسات
                  ---------------------------------------------- */}

                <div className="p-3">
                  <table className="w-full text-right text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[#1a365d]">
                        <th className="border border-slate-300 p-2">اللون</th>

                        <th className="border border-slate-300 p-2">المقاس</th>

                        <th className="border border-slate-300 p-2 text-center">
                          إجمالي
                        </th>

                        <th className="border border-slate-300 p-2 text-center">
                          المتاح
                        </th>

                        <th className="border border-slate-300 p-2 text-center">
                          المحجوز
                        </th>

                        <th className="border border-slate-300 p-2 text-center">
                          المشحون
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {colors.map((color, colorIndex) => {
                        const sizes = Object.values(color.sizes);

                        // لو مفيش مقاسات، نعرض صف للون نفسه
                        if (sizes.length === 0) {
                          return (
                            <tr key={`${color.color}-${colorIndex}`}>
                              <td className="border border-slate-300 p-2 font-black text-[#1a365d]">
                                {color.color}
                              </td>

                              <td className="border border-slate-300 p-2 text-slate-500">
                                غير محدد
                              </td>

                              <td className="border border-slate-300 p-2 text-center font-black">
                                {color.total.toLocaleString()}
                              </td>

                              <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                                {color.available.toLocaleString()}
                              </td>

                              <td className="border border-slate-300 p-2 text-center font-bold text-orange-700">
                                {color.reserved.toLocaleString()}
                              </td>

                              <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">
                                {color.shipped.toLocaleString()}
                              </td>
                            </tr>
                          );
                        }

                        return sizes.map((size, sizeIndex) => (
                          <tr
                            key={`${color.color}-${size.size}-${sizeIndex}`}
                            className={
                              sizeIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }
                          >
                            {/* اللون */}

                            <td className="border border-slate-300 p-2 font-black text-[#1a365d]">
                              {sizeIndex === 0 ? color.color : ""}
                            </td>

                            {/* المقاس */}

                            <td className="border border-slate-300 p-2 font-bold text-slate-700">
                              {size.size}
                            </td>

                            {/* الإجمالي */}

                            <td className="border border-slate-300 p-2 text-center font-black text-slate-800">
                              {size.total.toLocaleString()}
                            </td>

                            {/* المتاح */}

                            <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                              {size.available.toLocaleString()}
                            </td>

                            {/* المحجوز */}

                            <td className="border border-slate-300 p-2 text-center font-bold text-orange-700">
                              {size.reserved.toLocaleString()}
                            </td>

                            {/* المشحون */}

                            <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">
                              {size.shipped.toLocaleString()}
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>

                    {/* -----------------------------------------
                          إجمالي الموديل
                      ------------------------------------------ */}

                    <tfoot>
                      <tr className="bg-[#f1f5f9] font-black">
                        <td
                          colSpan="2"
                          className="border border-slate-300 p-2 text-[#1a365d]"
                        >
                          إجمالي {model.model}
                        </td>

                        <td className="border border-slate-300 p-2 text-center text-[#1a365d]">
                          {model.total.toLocaleString()}
                        </td>

                        <td className="border border-slate-300 p-2 text-center text-emerald-700">
                          {model.available.toLocaleString()}
                        </td>

                        <td className="border border-slate-300 p-2 text-center text-orange-700">
                          {model.reserved.toLocaleString()}
                        </td>

                        <td className="border border-slate-300 p-2 text-center text-blue-700">
                          {model.shipped.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
              ملخص نهائي
          ====================================================== */}

        <div className="mt-8 border-2 border-[#1a365d] rounded-xl overflow-hidden">
          <div className="bg-[#1a365d] text-white p-3">
            <h3 className="font-black text-sm">الملخص النهائي للجرد</h3>
          </div>

          <div className="grid grid-cols-4 gap-0">
            <div className="p-4 border-l border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold">
                إجمالي القطع
              </p>

              <p className="text-lg font-black text-[#1a365d] mt-1">
                {totalPieces.toLocaleString()}
              </p>
            </div>

            <div className="p-4 border-l border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold">
                المتاح حاليًا
              </p>

              <p className="text-lg font-black text-emerald-700 mt-1">
                {Number(stats.available || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 border-l border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold">المحجوز</p>

              <p className="text-lg font-black text-orange-700 mt-1">
                {Number(stats.reserved || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 text-center">
              <p className="text-[10px] text-slate-500 font-bold">المشحون</p>

              <p className="text-lg font-black text-blue-700 mt-1">
                {Number(stats.shipped || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
              التوقيعات
          ====================================================== */}

        <div className="grid grid-cols-3 gap-8 mt-12 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-600">مسؤول المخزن</p>

            <div className="h-12 border-b border-slate-400 mt-6"></div>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-600">مسؤول الجرد</p>

            <div className="h-12 border-b border-slate-400 mt-6"></div>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-600">اعتماد الإدارة</p>

            <div className="h-12 border-b border-slate-400 mt-6"></div>
          </div>
        </div>

        {/* =====================================================
              Footer
          ====================================================== */}

        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500 font-bold">
          <p>نظام إدارة أوردرات المصنع - الصحابة لتصنيع وتصدير الملابس</p>

          <p>تم استخراج التقرير أوتوماتيكياً من السيستم الموحد</p>
        </div>

        {/* =====================================================
              Print CSS
          ====================================================== */}

        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }

              body {
                background: white !important;
              }

              .inventory-print-report {
                width: 100%;
                background: white !important;
                color: #0f172a;
              }

              .model-block {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              table {
                break-inside: auto;
              }

              tr {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              thead {
                display: table-header-group;
              }

              tfoot {
                display: table-row-group;
              }

              h1,
              h2,
              h3 {
                break-after: avoid;
                page-break-after: avoid;
              }
            }
          `}
        </style>
      </div>
    );
  },
);

export default PrintableInventoryReport;
