import React from "react";
import logo from "../assets/logo.jpeg"; // 💡 تأكد من مسار اللوجو بتاع المصنع

const ClientPrintTemplate = React.forwardRef((props, ref) => {
  const {
    activeTab,
    clientBrand,
    stats,
    allModels,
    shipments,
    inventoryHistory,
  } = props;

  const renderContent = () => {
    // =======================================================
    // 1. تقرير جرد المخزون
    // =======================================================
    if (activeTab === "inventory") {
      return (
        <>
          <div className="report-kpis">
            <div className="report-kpi">
              <span>المتاح للبيع</span>
              <strong>{stats.totalInventory.toLocaleString()}</strong>
            </div>
            <div className="report-kpi">
              <span>المحجوز</span>
              <strong>{stats.reservedPieces.toLocaleString()}</strong>
            </div>
            <div className="report-kpi">
              <span>إجمالي المشحون</span>
              <strong>{stats.shippedPieces.toLocaleString()}</strong>
            </div>
            <div className="report-kpi">
              <span>عدد الموديلات</span>
              <strong>{stats.modelsCount.toLocaleString()}</strong>
            </div>
          </div>

          <h3 className="report-section-title">تفاصيل الجرد للموديلات</h3>
          {allModels.length > 0 ? (
            allModels.map((model) => (
              <div key={model.id} className="report-model">
                <div className="report-model-header">
                  <div>
                    <h4>
                      {model.name || "—"}{" "}
                      <span className="model-code">
                        ({model.model_number || "—"})
                      </span>
                    </h4>
                    <p>الكولكشن: {model.collectionName || "—"}</p>
                  </div>
                  <div className="report-model-summary">
                    <span>
                      المتاح: <strong>{model.stockInfo.available}</strong>
                    </span>
                    <span>
                      المحجوز: <strong>{model.stockInfo.reserved}</strong>
                    </span>
                    <span>
                      المستلم: <strong>{model.stockInfo.received}</strong>
                    </span>
                    <span>
                      المشحون: <strong>{model.stockInfo.shipped}</strong>
                    </span>
                  </div>
                </div>

                {model.details.length > 0 ? (
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>اللون</th>
                        <th>المقاس</th>
                        <th>المستلم</th>
                        <th>المتاح للبيع</th>
                        <th>المحجوز</th>
                        <th>المشحون</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.details.map((detail, index) => (
                        <tr key={`${model.id}-${index}`}>
                          <td>{detail.color || "—"}</td>
                          <td>{detail.size || "—"}</td>
                          <td>{detail.received ?? "—"}</td>
                          <td className="highlight-green">
                            {detail.available ?? "—"}
                          </td>
                          <td className="highlight-orange">
                            {detail.reserved ?? "—"}
                          </td>
                          <td>{detail.shipped ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="report-empty">لا توجد تفاصيل مقاسات.</p>
                )}
              </div>
            ))
          ) : (
            <p className="report-empty">لا توجد بيانات مخزون.</p>
          )}
        </>
      );
    }

    // =======================================================
    // 2. تقرير الشحنات
    // =======================================================
    if (activeTab === "shipments") {
      const completedShipments = shipments.filter(
        (s) =>
          s.status === "completed" ||
          s.status === "shipped" ||
          s.status === "delivered",
      ).length;
      const totalShipmentPieces = shipments.reduce(
        (sum, s) => sum + Number(s.total_pieces || 0),
        0,
      );

      return (
        <>
          <div className="report-kpis">
            <div className="report-kpi">
              <span>إجمالي الشحنات</span>
              <strong>{shipments.length}</strong>
            </div>
            <div className="report-kpi">
              <span>المكتملة</span>
              <strong>{completedShipments}</strong>
            </div>
            <div className="report-kpi">
              <span>إجمالي القطع</span>
              <strong>{totalShipmentPieces.toLocaleString()}</strong>
            </div>
          </div>

          <h3 className="report-section-title">تفاصيل الشحنات الصادرة</h3>
          {shipments.length > 0 ? (
            shipments.map((shipment) => (
              <div key={shipment.id} className="report-shipment">
                <div className="report-shipment-header">
                  <div>
                    <h4>شحنة رقم: {shipment.shipment_number || "—"}</h4>
                    <p>
                      التاريخ:{" "}
                      {shipment.created_at
                        ? new Date(shipment.created_at).toLocaleDateString(
                            "ar-EG",
                          )
                        : "—"}
                    </p>
                    {shipment.tracking_number && (
                      <p>
                        شركة الشحن: {shipment.shipping_company} | تتبع:{" "}
                        {shipment.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="status-box">
                    <strong>
                      {shipment.status === "shipped"
                        ? "تم الشحن"
                        : "جاري التجهيز"}
                    </strong>
                    <p>القطع: {shipment.total_pieces}</p>
                  </div>
                </div>

                {shipment.shipment_items?.length > 0 && (
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>الموديل</th>
                        <th>الكود</th>
                        <th>اللون</th>
                        <th>المقاس</th>
                        <th>الكمية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipment.shipment_items.map((item, index) => (
                        <tr key={`${shipment.id}-${index}`}>
                          <td>{item.inventory?.models?.name || "—"}</td>
                          <td>{item.inventory?.models?.model_number || "—"}</td>
                          <td>{item.inventory?.color || "—"}</td>
                          <td>{item.inventory?.size || "—"}</td>
                          <td className="highlight-blue">
                            {item.quantity ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          ) : (
            <p className="report-empty">لا توجد شحنات مسجلة.</p>
          )}
        </>
      );
    }

    // =======================================================
    // 3. تقرير الاستلامات (History)
    // =======================================================
    if (activeTab === "history") {
      const totalReceived = inventoryHistory.reduce(
        (sum, h) =>
          sum +
          (h.production_delivery_items?.reduce(
            (s, i) => s + Number(i.delivered_qty || 0),
            0,
          ) || 0),
        0,
      );
      return (
        <>
          <div className="report-kpis">
            <div className="report-kpi">
              <span>عدد الدفعات</span>
              <strong>{inventoryHistory.length}</strong>
            </div>
            <div className="report-kpi">
              <span>إجمالي القطع المستلمة</span>
              <strong>{totalReceived.toLocaleString()}</strong>
            </div>
          </div>

          <h3 className="report-section-title">سجل استلام الدفعات من المصنع</h3>
          {inventoryHistory.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>رقم الدفعة</th>
                  <th>الكولكشن</th>
                  <th>الكمية المستلمة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {inventoryHistory.map((history, index) => {
                  const qty =
                    history.production_delivery_items?.reduce(
                      (sum, item) => sum + Number(item.delivered_qty || 0),
                      0,
                    ) || 0;
                  return (
                    <tr key={`${history.delivery_number}-${index}`}>
                      <td className="font-mono">
                        {history.delivery_number || "—"}
                      </td>
                      <td>
                        {history.production_orders?.collections?.name || "—"}
                      </td>
                      <td className="highlight-green">{qty}</td>
                      <td>
                        {history.updated_at
                          ? new Date(history.updated_at).toLocaleDateString(
                              "ar-EG",
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="report-empty">لا توجد سجلات استلام حتى الآن.</p>
          )}
        </>
      );
    }

    return null;
  };

  const getReportTitle = () => {
    if (activeTab === "inventory") return "تقرير جرد المخزون التفصيلي";
    if (activeTab === "shipments") return "تقرير حركة الشحنات الصادرة";
    if (activeTab === "history") return "سجل العمليات والدفعات المستلمة";
    return "تقرير النظام";
  };

  return (
    <div ref={ref} className="print-container" aria-hidden="true">
      <div className="print-report" dir="rtl">
        {/* ================= HEADER ================= */}
        <div className="report-header">
          <div className="header-info">
            <h1>{getReportTitle()}</h1>
            <h2>
              العميل / البراند: <span>{clientBrand?.name_ar || "—"}</span>
            </h2>
            <p>تاريخ الإصدار: {new Date().toLocaleString("ar-EG")}</p>
          </div>
          <div className="header-logo">
            <img src={logo} alt="مصنع الصحابة" />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="report-content">{renderContent()}</div>

        {/* ================= FOOTER ================= */}
        <div className="report-footer">
          <p>
            <strong>مصنع الصحابة لتصنيع وتصدير الملابس</strong>
          </p>
          <p>
            تم توليد هذا التقرير آلياً بواسطة بوابة العملاء الذكية -{" "}
            {new Date().getFullYear()} ©
          </p>
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap');

          .print-container {
            position: absolute; left: -10000px; top: 0;
          }

          @media print {
            @page { size: A4; margin: 15mm; }
            html, body { 
              background: white !important; margin: 0 !important; padding: 0 !important; 
              -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            .print-container { 
              position: static !important; display: block !important; left: auto !important; 
            }

            .print-report {
              font-family: 'Rubik', sans-serif !important;
              color: #1a365d;
              direction: rtl;
            }

            /* Header */
            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 4px solid #1a365d;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-info h1 { margin: 0; font-size: 24px; font-weight: 900; color: #1a365d; }
            .header-info h2 { margin: 8px 0; font-size: 18px; color: #475569; }
            .header-info h2 span { color: #b91c1c; font-weight: 800; }
            .header-info p { margin: 0; font-size: 12px; color: #64748b; }
            .header-logo img { height: 80px; object-fit: contain; }

            /* KPIs */
            .report-kpis {
              display: flex; gap: 15px; margin-bottom: 30px;
            }
            .report-kpi {
              flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;
              background-color: #f8fafc;
            }
            .report-kpi span { display: block; font-size: 12px; font-weight: 700; color: #64748b; }
            .report-kpi strong { display: block; font-size: 24px; font-weight: 900; color: #1a365d; margin-top: 5px; }

            /* Section Titles */
            .report-section-title {
              font-size: 18px; font-weight: 800; color: #b91c1c; border-bottom: 2px solid #e2e8f0;
              padding-bottom: 5px; margin-bottom: 15px;
            }

            /* Models & Shipments */
            .report-model, .report-shipment {
              margin-bottom: 30px; page-break-inside: avoid;
            }
            .report-model-header, .report-shipment-header {
              display: flex; justify-content: space-between; margin-bottom: 10px;
              background: #f1f5f9; padding: 10px 15px; border-radius: 6px; border-right: 4px solid #1a365d;
            }
            .report-model-header h4, .report-shipment-header h4 { margin: 0; font-size: 16px; font-weight: 800; }
            .model-code { color: #b91c1c; font-family: monospace; }
            .report-model-header p, .report-shipment-header p { margin: 5px 0 0; font-size: 12px; color: #475569; font-weight: 500;}
            .report-model-summary { display: flex; gap: 15px; font-size: 12px; align-items: center;}
            .status-box { text-align: left; }
            .status-box strong { display: inline-block; background: #1a365d; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;}

            /* Tables */
            .report-table {
              width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;
            }
            .report-table th, .report-table td {
              border: 1px solid #cbd5e1; padding: 8px; text-align: right;
            }
            .report-table th { background-color: #1a365d !important; color: white !important; font-weight: 700; }
            .report-table tr:nth-child(even) { background-color: #f8fafc; }
            
            .highlight-green { color: #059669; font-weight: 900; }
            .highlight-orange { color: #ea580c; font-weight: 900; }
            .highlight-blue { color: #2563eb; font-weight: 900; }

            /* Footer */
            .report-footer {
              margin-top: 40px; padding-top: 15px; border-top: 2px solid #e2e8f0; text-align: center;
            }
            .report-footer p { margin: 5px 0; font-size: 11px; color: #64748b; }
            .report-footer strong { color: #1a365d; font-size: 14px;}
          }
        `}
      </style>
    </div>
  );
});

export default ClientPrintTemplate;
