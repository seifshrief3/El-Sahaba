import React from "react";
import { Boxes, Printer, Search, Eye } from "lucide-react";
import { formatNumber, getCollectionProgress } from "../utils";
import SectionTitle from "../ui/SectionTitle";
import EmptyState from "../ui/EmptyState";

const CollectionsTab = ({
  searchTerm,
  setSearchTerm,
  filteredCollections,
  setSelectedCollection,
}) => {
  // =========================================================
  // Helpers
  // =========================================================

  const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // Get model quantity
  // =========================================================

  const getModelQuantity = (collection, model) => {
    const orderItems = Array.isArray(collection?.orderItems)
      ? collection.orderItems
      : [];

    const modelItems = orderItems.filter((item) => item.model_id === model.id);

    if (modelItems.length > 0) {
      const hasQuantity = modelItems.some(
        (item) => item.quantity !== null && item.quantity !== undefined,
      );

      if (hasQuantity) {
        return modelItems.reduce(
          (sum, item) => sum + safeNumber(item.quantity),
          0,
        );
      }

      return modelItems.reduce(
        (sum, item) => sum + safeNumber(item.total_quantity),
        0,
      );
    }

    return safeNumber(model?.quantity || model?.total_quantity);
  };

  // =========================================================
  // Get next stage
  // =========================================================

  const getNextStage = (collection) => {
    /*
      لو عندك المرحلة التالية محفوظة بالفعل في الداتا بيز
      هيتم استخدامها مباشرة.
    */

    const directStage =
      collection?.nextStage ||
      collection?.next_stage ||
      collection?.nextPhase ||
      collection?.next_phase;

    if (directStage) {
      return directStage;
    }

    /*
      لو المرحلة الحالية محفوظة في الداتا
      نحاول استخدامها.
    */

    const currentStage =
      collection?.currentStage ||
      collection?.current_stage ||
      collection?.currentPhase ||
      collection?.current_phase;

    if (currentStage) {
      const stages = [
        "التخطيط",
        "الخامات",
        "العينة",
        "القص",
        "الطباعة",
        "التطريز",
        "الخياطة",
        "الجودة",
        "التشطيب",
        "الشحن",
      ];

      const currentIndex = stages.findIndex((stage) => stage === currentStage);

      if (currentIndex !== -1 && currentIndex < stages.length - 1) {
        return stages[currentIndex + 1];
      }

      if (currentIndex === stages.length - 1) {
        return "مكتمل";
      }
    }

    /*
      Fallback:
      لو مفيش currentStage أو nextStage
      نحسب المرحلة من نسبة الإنجاز.
    */

    const progress = Number(getCollectionProgress(collection)) || 0;

    if (progress >= 100) {
      return "مكتمل";
    }

    if (progress < 10) {
      return "التخطيط";
    }

    if (progress < 20) {
      return "الخامات";
    }

    if (progress < 30) {
      return "العينة";
    }

    if (progress < 40) {
      return "القص";
    }

    if (progress < 50) {
      return "الطباعة";
    }

    if (progress < 60) {
      return "التطريز";
    }

    if (progress < 75) {
      return "الخياطة";
    }

    if (progress < 85) {
      return "الجودة";
    }

    if (progress < 95) {
      return "التشطيب";
    }

    return "الشحن";
  };

  // =========================================================
  // Generate Print Report
  // =========================================================

  const handlePrintReport = () => {
    if (!filteredCollections?.length) {
      return;
    }

    // =======================================================
    // Overall statistics
    // =======================================================

    const totalCollections = filteredCollections.length;

    const totalModels = filteredCollections.reduce(
      (sum, collection) =>
        sum + (Array.isArray(collection.models) ? collection.models.length : 0),
      0,
    );

    const totalQuantity = filteredCollections.reduce(
      (sum, collection) => sum + safeNumber(collection.totalQuantity),
      0,
    );

    const totalShipped = filteredCollections.reduce(
      (sum, collection) => sum + safeNumber(collection.shippedQuantity),
      0,
    );

    const totalAvailable = filteredCollections.reduce(
      (sum, collection) => sum + safeNumber(collection.availableQuantity),
      0,
    );

    const totalReserved = filteredCollections.reduce(
      (sum, collection) => sum + safeNumber(collection.reservedQuantity),
      0,
    );

    // =======================================================
    // Generate collection rows
    // =======================================================

    const collectionsHTML = filteredCollections
      .map((collection, collectionIndex) => {
        const models = Array.isArray(collection.models)
          ? collection.models
          : [];

        const progress = getCollectionProgress(collection);

        const nextStage = getNextStage(collection);

        const collectionQuantity = safeNumber(collection.totalQuantity);

        const collectionShipped = safeNumber(collection.shippedQuantity);

        const collectionAvailable = safeNumber(collection.availableQuantity);

        const collectionReserved = safeNumber(collection.reservedQuantity);

        const modelsHTML =
          models.length > 0
            ? `
              <table class="models-table">
                <thead>
                  <tr>
                    <th style="width: 45%">الموديل</th>
                    <th style="width: 20%">الكود</th>
                    <th style="width: 20%">الكمية</th>
                    <th style="width: 15%">الحالة</th>
                  </tr>
                </thead>

                <tbody>
                  ${models
                    .map((model) => {
                      const quantity = getModelQuantity(collection, model);

                      return `
                        <tr>
                          <td>
                            <strong>
                              ${model?.name || "موديل بدون اسم"}
                            </strong>
                          </td>

                          <td>
                            ${model?.model_number || "-"}
                          </td>

                          <td>
                            ${formatNumber(quantity)}
                          </td>

                          <td>
                            ${
                              model?.tech_pack_status === "created"
                                ? "تم إنشاء التيك باك"
                                : "قيد التجهيز"
                            }
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>
            `
            : `
              <div class="empty-models">
                لا توجد موديلات مرتبطة بهذا الكولكشن.
              </div>
            `;

        return `
          <section class="collection-section">

            <div class="collection-header">

              <div>
                <div class="collection-number">
                  الكولكشن رقم ${collectionIndex + 1}
                </div>

                <h2>
                  ${collection?.name || "كولكشن بدون اسم"}
                </h2>

                <div class="collection-meta">
                  ${models.length} موديل
                </div>
              </div>

              <div class="progress-box">
                <div class="progress-label">
                  نسبة الإنجاز
                </div>

                <div class="progress-value">
                  ${progress}%
                </div>

                <div class="next-stage-print">
                  المرحلة التالية:
                  <strong>${nextStage}</strong>
                </div>
              </div>

            </div>

            <div class="stats-grid">

              <div class="stat-card">
                <div class="stat-label">
                  إجمالي القطع
                </div>

                <div class="stat-value">
                  ${formatNumber(collectionQuantity)}
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-label">
                  تم الشحن
                </div>

                <div class="stat-value green">
                  ${formatNumber(collectionShipped)}
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-label">
                  بالمخزن
                </div>

                <div class="stat-value blue">
                  ${formatNumber(collectionAvailable)}
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-label">
                  محجوز
                </div>

                <div class="stat-value orange">
                  ${formatNumber(collectionReserved)}
                </div>
              </div>

            </div>

            <div class="section-title">
              <span>تفاصيل الموديلات</span>
            </div>

            ${modelsHTML}

          </section>
        `;
      })
      .join("");

    // =======================================================
    // Full Report HTML
    // =======================================================

    const reportHTML = `
      <!DOCTYPE html>

      <html lang="ar" dir="rtl">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>تقرير الكولكشنات</title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
            color: #0f172a;
            font-family:
              "Tahoma",
              "Arial",
              sans-serif;
            direction: rtl;
          }

          .report {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
          }

          /* =====================================================
             Header
          ===================================================== */

          .report-header {
            background: #0D2748;
            color: white;
            border-radius: 18px;
            padding: 28px;
            margin-bottom: 24px;
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }

          .report-title {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
          }

          .report-subtitle {
            margin-top: 8px;
            color: #cbd5e1;
            font-size: 13px;
          }

          .report-date {
            text-align: left;
            font-size: 12px;
            color: #cbd5e1;
          }

          /* =====================================================
             Overall stats
          ===================================================== */

          .overall-grid {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 28px;
          }

          .overall-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 18px;
          }

          .overall-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 8px;
          }

          .overall-value {
            font-size: 22px;
            font-weight: 900;
            color: #0D2748;
          }

          .overall-value.green {
            color: #047857;
          }

          .overall-value.blue {
            color: #1d4ed8;
          }

          .overall-value.orange {
            color: #c2410c;
          }

          /* =====================================================
             Collection
          ===================================================== */

          .collection-section {
            background: white;
            border: 1px solid #dbe3ec;
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          .collection-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 18px;
            border-bottom: 1px solid #e2e8f0;
          }

          .collection-number {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 5px;
          }

          .collection-header h2 {
            margin: 0;
            color: #0D2748;
            font-size: 21px;
            font-weight: 900;
          }

          .collection-meta {
            margin-top: 6px;
            color: #64748b;
            font-size: 12px;
          }

          .progress-box {
            min-width: 150px;
            text-align: center;
            background: #eff6ff;
            border-radius: 12px;
            padding: 12px 18px;
          }

          .progress-label {
            font-size: 10px;
            color: #64748b;
          }

          .progress-value {
            margin-top: 4px;
            color: #0D2748;
            font-size: 21px;
            font-weight: 900;
          }

          .next-stage-print {
            margin-top: 5px;
            font-size: 10px;
            color: #64748b;
          }

          .next-stage-print strong {
            color: #0D2748;
          }

          /* =====================================================
             Collection stats
          ===================================================== */

          .stats-grid {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 10px;
            margin-top: 18px;
            margin-bottom: 22px;
          }

          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 13px;
          }

          .stat-label {
            font-size: 10px;
            color: #64748b;
          }

          .stat-value {
            margin-top: 5px;
            font-size: 17px;
            font-weight: 900;
            color: #0D2748;
          }

          .stat-value.green {
            color: #047857;
          }

          .stat-value.blue {
            color: #1d4ed8;
          }

          .stat-value.orange {
            color: #c2410c;
          }

          /* =====================================================
             Section title
          ===================================================== */

          .section-title {
            font-size: 14px;
            font-weight: 900;
            color: #0D2748;
            margin-bottom: 10px;
          }

          /* =====================================================
             Models table
          ===================================================== */

          .models-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          .models-table th {
            background: #0D2748;
            color: white;
            padding: 10px;
            text-align: right;
            font-weight: 900;
          }

          .models-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }

          .models-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          .empty-models {
            padding: 18px;
            background: #f8fafc;
            border-radius: 10px;
            color: #94a3b8;
            text-align: center;
            font-size: 12px;
          }

          /* =====================================================
             Footer
          ===================================================== */

          .report-footer {
            text-align: center;
            color: #94a3b8;
            font-size: 10px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }

          /* =====================================================
             Print
          ===================================================== */

          @page {
            size: A4;
            margin: 12mm;
          }

          @media print {

            body {
              background: white;
            }

            .report {
              max-width: none;
              padding: 0;
            }

            .report-header {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .models-table th {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .collection-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

          }

        </style>

      </head>

      <body>

        <main class="report">

          <!-- ===================================================
               Report Header
          =================================================== -->

          <header class="report-header">

            <div class="header-top">

              <div>

                <h1 class="report-title">
                  تقرير الكولكشنات
                </h1>

                <div class="report-subtitle">
                  تقرير شامل بالكولكشنات والموديلات وكميات الإنتاج
                </div>

              </div>

              <div class="report-date">
                تاريخ التقرير
                <br />
                ${formatDate()}
              </div>

            </div>

          </header>

          <!-- ===================================================
               Overall Statistics
          =================================================== -->

          <section class="overall-grid">

            <div class="overall-card">

              <div class="overall-label">
                إجمالي الكولكشنات
              </div>

              <div class="overall-value">
                ${formatNumber(totalCollections)}
              </div>

            </div>

            <div class="overall-card">

              <div class="overall-label">
                إجمالي الموديلات
              </div>

              <div class="overall-value">
                ${formatNumber(totalModels)}
              </div>

            </div>

            <div class="overall-card">

              <div class="overall-label">
                إجمالي القطع
              </div>

              <div class="overall-value">
                ${formatNumber(totalQuantity)}
              </div>

            </div>

            <div class="overall-card">

              <div class="overall-label">
                تم الشحن
              </div>

              <div class="overall-value green">
                ${formatNumber(totalShipped)}
              </div>

            </div>

            <div class="overall-card">

              <div class="overall-label">
                بالمخزن
              </div>

              <div class="overall-value blue">
                ${formatNumber(totalAvailable)}
              </div>

            </div>

            <div class="overall-card">

              <div class="overall-label">
                محجوز
              </div>

              <div class="overall-value orange">
                ${formatNumber(totalReserved)}
              </div>

            </div>

          </section>

          <!-- ===================================================
               Collections
          =================================================== -->

          ${collectionsHTML}

          <!-- ===================================================
               Footer
          =================================================== -->

          <footer class="report-footer">
            تم إنشاء هذا التقرير آليًا من نظام إدارة الإنتاج
          </footer>

        </main>

        <script>

          window.onload = function () {

            setTimeout(function () {
              window.print();
            }, 400);

          };

          window.onafterprint = function () {

            setTimeout(function () {
              window.close();
            }, 300);

          };

        </script>

      </body>

      </html>
    `;

    // =======================================================
    // Open report window
    // =======================================================

    const printWindow = window.open("", "_blank", "width=1100,height=800");

    if (!printWindow) {
      alert(
        "تعذر فتح نافذة التقرير. برجاء السماح بالنوافذ المنبثقة من المتصفح.",
      );

      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="space-y-5 animate-fade-in">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        {/* =====================================================
            Header
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <SectionTitle
            icon={Boxes}
            title="الكولكشنات"
            subtitle="جميع الكولكشنات الخاصة بالبراند"
          />

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* =================================================
                Print Report
            ================================================= */}

            <button
              onClick={handlePrintReport}
              disabled={!filteredCollections?.length}
              className="
                h-11
                px-4
                rounded-xl
                bg-white
                border
                border-slate-200
                text-[#0D2748]
                hover:bg-slate-50
                disabled:opacity-50
                disabled:cursor-not-allowed
                font-bold
                text-sm
                flex
                items-center
                justify-center
                gap-2
                transition
                shrink-0
              "
            >
              <Printer size={16} />

              <span className="hidden sm:block">طباعة التقرير</span>
            </button>

            {/* =================================================
                Search
            ================================================= */}

            <div className="relative w-full md:w-80">
              <Search
                size={17}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث باسم الكولكشن أو الموديل..."
                className="
                  w-full
                  h-11
                  pr-10
                  pl-4
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  focus:bg-white
                  focus:border-[#0D2748]
                  outline-none
                  text-sm
                "
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            Collections
        ===================================================== */}

        {filteredCollections.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="لا توجد كولكشنات"
            description="لا توجد نتائج مطابقة للبحث."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCollections.map((collection) => {
              const progress = getCollectionProgress(collection);

              const nextStage = getNextStage(collection);

              const firstModel = collection.models?.[0];

              return (
                <div
                  key={collection.id}
                  className="
                    group
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    overflow-hidden
                    hover:-translate-y-1
                    hover:shadow-xl
                    transition-all
                    duration-300
                  "
                >
                  {/* =================================================
                      Image
                  ================================================= */}

                  <div
                    className="
                      h-44
                      bg-[#0D2748]
                      relative
                      overflow-hidden
                    "
                  >
                    {firstModel?.image_url ? (
                      <img
                        src={firstModel.image_url}
                        alt=""
                        className="
                          w-full
                          h-full
                          object-cover
                          opacity-90
                          group-hover:scale-105
                          transition
                          duration-500
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Boxes size={60} className="text-white/20" />
                      </div>
                    )}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#071A31]/90
                        via-transparent
                        to-transparent
                      "
                    />

                    {/* =================================================
                        Collection name
                    ================================================= */}

                    <div
                      className="
                        absolute
                        bottom-4
                        right-4
                        left-4
                      "
                    >
                      <div
                        className="
                          text-white
                          text-xl
                          font-black
                        "
                      >
                        {collection.name}
                      </div>

                      <div
                        className="
                          text-blue-100/80
                          text-xs
                          mt-1
                        "
                      >
                        {collection.models?.length || 0} موديل
                      </div>
                    </div>

                    {/* =================================================
                        Progress Badge
                    ================================================= */}

                    <div
                      className="
                        absolute
                        top-3
                        left-3
                      "
                    >
                      <span
                        className="
                          px-3
                          py-1.5
                          rounded-lg
                          bg-white/95
                          text-[#0D2748]
                          text-[11px]
                          font-black
                          shadow-sm
                        "
                      >
                        {progress}% مكتمل
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      Data
                  ================================================= */}

                  <div className="p-4">
                    {/* =================================================
                        Progress + Next Stage
                    ================================================= */}

                    <div
                      className="
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-3.5
                        mb-4
                      "
                    >
                      {/* Progress Header */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          mb-2
                        "
                      >
                        <div
                          className="
                            text-xs
                            font-bold
                            text-slate-500
                          "
                        >
                          نسبة الإنجاز
                        </div>

                        <div
                          className="
                            text-sm
                            font-black
                            text-[#0D2748]
                          "
                        >
                          {progress}%
                        </div>
                      </div>

                      {/* Progress Bar */}

                      <div
                        className="
                          h-2
                          rounded-full
                          bg-white
                          border
                          border-slate-200
                          overflow-hidden
                        "
                      >
                        <div
                          className="
                            h-full
                            bg-[#0D2748]
                            rounded-full
                            transition-all
                            duration-500
                          "
                          style={{
                            width: `${Math.min(Math.max(progress, 0), 100)}%`,
                          }}
                        />
                      </div>

                      {/* Next Stage */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          mt-3
                          pt-3
                          border-t
                          border-slate-200
                        "
                      >
                        <span
                          className="
                            text-[11px]
                            text-slate-400
                            font-medium
                          "
                        >
                          المرحلة التالية
                        </span>

                        <span
                          className="
                            text-xs
                            font-black
                            text-[#0D2748]
                            bg-white
                            border
                            border-slate-200
                            px-2.5
                            py-1
                            rounded-lg
                          "
                        >
                          {nextStage}
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                        Statistics
                    ================================================= */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-2
                      "
                    >
                      {/* Total */}

                      <div
                        className="
                          rounded-xl
                          bg-slate-50
                          p-3
                        "
                      >
                        <div
                          className="
                            text-[10px]
                            text-slate-400
                          "
                        >
                          إجمالي القطع
                        </div>

                        <div
                          className="
                            font-black
                            text-lg
                            mt-1
                          "
                        >
                          {formatNumber(collection.totalQuantity)}
                        </div>
                      </div>

                      {/* Shipped */}

                      <div
                        className="
                          rounded-xl
                          bg-emerald-50
                          p-3
                        "
                      >
                        <div
                          className="
                            text-[10px]
                            text-emerald-600
                          "
                        >
                          تم الشحن
                        </div>

                        <div
                          className="
                            font-black
                            text-lg
                            text-emerald-700
                            mt-1
                          "
                        >
                          {formatNumber(collection.shippedQuantity)}
                        </div>
                      </div>

                      {/* Available */}

                      <div
                        className="
                          rounded-xl
                          bg-blue-50
                          p-3
                        "
                      >
                        <div
                          className="
                            text-[10px]
                            text-blue-600
                          "
                        >
                          بالمخزن
                        </div>

                        <div
                          className="
                            font-black
                            text-lg
                            text-blue-700
                            mt-1
                          "
                        >
                          {formatNumber(collection.availableQuantity)}
                        </div>
                      </div>

                      {/* Reserved */}

                      <div
                        className="
                          rounded-xl
                          bg-orange-50
                          p-3
                        "
                      >
                        <div
                          className="
                            text-[10px]
                            text-orange-600
                          "
                        >
                          محجوز
                        </div>

                        <div
                          className="
                            font-black
                            text-lg
                            text-orange-700
                            mt-1
                          "
                        >
                          {formatNumber(collection.reservedQuantity)}
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        Details
                    ================================================= */}

                    <button
                      onClick={() => setSelectedCollection(collection)}
                      className="
                        w-full
                        mt-4
                        h-11
                        rounded-xl
                        bg-[#0D2748]
                        hover:bg-[#163A65]
                        text-white
                        font-black
                        text-sm
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition
                      "
                    >
                      <Eye size={17} />
                      عرض تفاصيل الكولكشن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CollectionsTab;
