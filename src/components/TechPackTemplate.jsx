import React from "react";
import logoImage from "../assets/logo.jpeg";

const TechPackTemplate = React.forwardRef(
  ({ data, activeModel, brandName }, ref) => {
    if (!data) return null;
    const mainImage = activeModel?.image_url || "";

    // 💡 دالة الأمان القصوى: بتضمن إن أي داتا راجعة من الـ AI تتعرض كنص مقروء ومستحيل تضرب الشاشة
    const safeRender = (value) => {
      if (!value) return "---";
      if (typeof value === "string") return value;
      if (Array.isArray(value)) return value.join(" - ");
      if (typeof value === "object") {
        try {
          return Object.values(value)
            .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
            .join(" | ");
        } catch (e) {
          return JSON.stringify(value);
        }
      }
      return String(value);
    };

    // 💡 تعديل ليدعم النصوص المباشرة بجانب المصفوفات
    const renderFabricNames = (fabricData) => {
      if (!fabricData) return "---";

      // لو الخامة جاية كنص مباشر
      if (typeof fabricData === "string") return fabricData;

      // لو الخامة جاية كمصفوفة
      if (Array.isArray(fabricData)) {
        return fabricData
          .map((fabric) => {
            if (typeof fabric === "string") return fabric;
            if (fabric && typeof fabric === "object") return fabric.name || "";
            return "";
          })
          .filter(Boolean)
          .join(" | ");
      }
      return "---";
    };

    // 💡 تعديل ليدعم استلام الوزن بشكل صريح من الـ AI
    const renderFabricWeights = (fabricData, weightData) => {
      // الأولوية لوزن الخامة لو مبعوت بشكل منفصل وصريح
      if (weightData && typeof weightData === "string") return weightData;

      // كبديل، نحاول نستخرجه من مصفوفة الخامات القديمة لو موجودة
      if (Array.isArray(fabricData)) {
        const weights = fabricData
          .map((fabric) => {
            if (fabric && typeof fabric === "object")
              return fabric.weight || "";
            return "";
          })
          .filter(Boolean);

        if (weights.length > 0) return weights.join(" | ");
      }
      return "---";
    };

    const styles = {
      // إعدادات الصفحة المطاطية لضمان احتواء كامل على صفحة A4 واحدة
      page: {
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        padding: "4mm 6mm",
        direction: "rtl",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Rubik', sans-serif",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      },
      sectionRow: {
        display: "flex",
        gap: "4px",
        alignItems: "stretch",
        minHeight: 0,
      },
      navyHeader: {
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "3px",
        fontWeight: "bold",
        fontSize: "10.5px",
        textAlign: "center",
        border: "1px solid #0f172a",
      },
      boxWrapper: {
        border: "1px solid #0f172a",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: "#ffffff",
        minHeight: 0,
        overflow: "hidden",
      },
      table: {
        width: "100%",
        height: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      },
      th: {
        border: "1px solid #0f172a",
        padding: "2px 4px",
        fontWeight: "bold",
        backgroundColor: "#f1f5f9",
        textAlign: "center",
        fontSize: "9px",
        verticalAlign: "middle",
        overflow: "hidden",
      },
      td: {
        border: "1px solid #0f172a",
        padding: "2px 4px",
        textAlign: "right",
        fontSize: "9px",
        fontWeight: "bold",
        verticalAlign: "middle",
        overflow: "hidden",
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
      closeUpGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "3px",
        padding: "3px",
        flex: 1,
        minHeight: 0,
      },
      closeUpItem: {
        border: "1px solid #0f172a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
      closeUpImgBlock: {
        flex: 1,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        minHeight: 0,
      },
      redCircle: {
        position: "absolute",
        bottom: "2px",
        left: "2px",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        width: "13px",
        height: "13px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "8.5px",
        fontWeight: "bold",
        zIndex: 2,
      },
      closeUpLabel: {
        fontSize: "8.5px",
        textAlign: "center",
        fontWeight: "bold",
        borderTop: "1px solid #0f172a",
        padding: "2px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      },
    };

    const bomList = [
      {
        name: "القماش الرئيسي",
        desc: safeRender(data?.bill_of_materials_BOM?.main_fabric),
      },
      { name: "الريب", desc: safeRender(data?.bill_of_materials_BOM?.rib) },
      {
        name: "السحاب",
        desc: safeRender(data?.bill_of_materials_BOM?.zippers_and_buttons),
      },
      { name: "الأزرار", desc: "(يحدد لاحقاً)" },
      {
        name: "الخيوط",
        desc: safeRender(data?.bill_of_materials_BOM?.threads),
      },
      {
        name: "الطباعة",
        desc: safeRender(data?.bill_of_materials_BOM?.printing_embroidery),
      },
      { name: "التطريز", desc: "(يحدد لاحقاً)" },
      {
        name: "الإكسسوارات",
        desc: safeRender(data?.bill_of_materials_BOM?.accessories),
      },
    ];

    const sizesString =
      typeof data?.basic_info?.size_range === "string"
        ? data.basic_info.size_range
        : "";
    const displaySizes = sizesString
      ? sizesString
          .split(/[،,-]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : ["يحدد لاحقاً"];

    const colorsArray = Array.isArray(data?.basic_info?.colors)
      ? data.basic_info.colors
      : activeModel?.colors || ["يحدد لاحقاً"];

    const dynamicCloseUpParts = Array.isArray(
      data?.technical_description?.close_up_parts,
    )
      ? data.technical_description.close_up_parts
      : [];

    const closeUpSlots = Array.from({ length: 8 }).map((_, idx) => {
      return dynamicCloseUpParts[idx] || null;
    });

    return (
      <>
        <style>
          {`
            @page { size: A4 portrait; margin: 0mm !important; }
            @media print {
              body { margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `}
        </style>

        <div ref={ref} style={styles.page}>
          {/* 1. HEADER SECTION */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flex: 1.2,
              minHeight: 0,
              borderBottom: "2px solid #0f172a",
              paddingBottom: "4px",
            }}
          >
            <div
              style={{
                width: "160px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <img
                src={logoImage}
                alt="الصحابة"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 10px",
              }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  margin: "0 0 2px 0",
                  lineHeight: "1.1",
                }}
              >
                الورقة الفنية للمنتج
              </h1>
              <h2
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: "0 0 2px 0",
                }}
              >
                قسم التخطيط والجودة
              </h2>
              <h3 style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
                شركة الصحابة لتصنيع وتصدير الملابس
              </h3>
            </div>

            <table
              style={{
                borderCollapse: "collapse",
                width: "190px",
                height: "100%",
                border: "1px solid #0f172a",
                fontSize: "10px",
              }}
            >
              <tbody>
                <tr>
                  <th style={{ ...styles.th, width: "40%" }}>رقم الملف:</th>
                  <td style={styles.td}>
                    {activeModel?.model_number || "TECH-0000"}
                  </td>
                </tr>
                <tr>
                  <th style={styles.th}>تاريخ الإصدار:</th>
                  <td style={styles.td}>
                    {new Date().toLocaleDateString("ar-EG")}
                  </td>
                </tr>
                <tr>
                  <th style={styles.th}>الإصدار:</th>
                  <td style={styles.td}>1.0</td>
                </tr>
                <tr>
                  <th style={styles.th}>عدد الصفحات:</th>
                  <td style={styles.td}>1 من 1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. ROW 1: Images & Model Info */}
          <div style={{ ...styles.sectionRow, flex: 3.2 }}>
            <div style={{ ...styles.boxWrapper, flex: "2.5" }}>
              <div style={styles.navyHeader}>FRONT | BACK | SIDE</div>
              <div
                style={{
                  flex: 1,
                  padding: "4px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 0,
                }}
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt="Model Views"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ color: "#94a3b8" }}>صورة الموديل المجمعة</span>
                )}
              </div>
            </div>

            <div style={{ ...styles.boxWrapper, flex: "1" }}>
              <div style={styles.navyHeader}>1- بيانات الموديل</div>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <th style={styles.th}>اسم المنتج</th>
                    <td style={styles.td}>
                      {safeRender(data?.basic_info?.product_name)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>رقم الموديل</th>
                    <td style={styles.td}>
                      {activeModel?.model_number || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>اسم البراند</th>
                    <td style={styles.td}>
                      {safeRender(data?.basic_info?.brand) ||
                        brandName ||
                        "---"}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>الفئة</th>
                    <td style={styles.td}>
                      {safeRender(data?.basic_info?.category)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>الموسم</th>
                    <td style={styles.td}>
                      {safeRender(data?.basic_info?.season)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>نوع الخامة</th>
                    <td style={styles.td}>
                      {renderFabricNames(data?.basic_info?.main_fabric)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>وزن الخامة</th>
                    <td style={styles.td}>
                      {/* 💡 تم تمرير نوع الخامة ووزن الخامة معاً لضمان الاستخراج الصحيح */}
                      {renderFabricWeights(
                        data?.basic_info?.main_fabric,
                        data?.basic_info?.fabric_weight,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>المقاسات</th>
                    <td style={styles.td}>{sizesString || "---"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. ROW 2: Manufacturing & Technical Description */}
          <div style={{ ...styles.sectionRow }}>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>2- تفاصيل التصنيع</div>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <th style={{ ...styles.th, width: "30%" }}>نوع الخياطة</th>
                    <td style={styles.td}>
                      {safeRender(data?.technical_description?.stitching_type)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>نوع الغرز</th>
                    <td style={styles.td}>
                      {safeRender(data?.technical_description?.stitch_details)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>أماكن التقويات</th>
                    <td style={styles.td}>
                      {safeRender(
                        data?.technical_description?.reinforcement_areas,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>التشطيب</th>
                    <td style={styles.td}>
                      {safeRender(data?.technical_description?.finishing)}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.th}>طريقة التشغيل</th>
                    <td style={styles.td}>(يحدد لاحقاً)</td>
                  </tr>
                  <tr>
                    <th style={styles.th}>ملاحظات الإنتاج</th>
                    <td style={styles.td}>
                      {safeRender(
                        data?.technical_description?.production_notes,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>1- الوصف الفني</div>
              <div
                style={{
                  padding: "6px",
                  fontSize: "10px",
                  lineHeight: "1.6",
                  textAlign: "right",
                  fontWeight: "bold",
                  overflow: "hidden",
                }}
              >
                {safeRender(data?.technical_description?.short_description)}
              </div>
            </div>
          </div>

          {/* 4. ROW 3: Close-up Details & BOM */}
          <div style={{ ...styles.sectionRow, flex: 2.2 }}>
            <div style={{ ...styles.boxWrapper, flex: "1.5" }}>
              <div style={styles.navyHeader}>
                تفاصيل المنتج (CLOSE-UP DETAILS)
              </div>
              <div style={styles.closeUpGrid}>
                {closeUpSlots.map((label, idx) => {
                  const imgSrc = activeModel?.close_up_images?.[idx];
                  return (
                    <div key={idx} style={styles.closeUpItem}>
                      <div style={styles.closeUpImgBlock}>
                        <div style={styles.redCircle}>{idx + 1}</div>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={safeRender(label) || `Detail ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: "9px" }}>
                            -
                          </span>
                        )}
                      </div>
                      {/* 💡 يعرض الوصف فقط لو الصورة موجودة */}
                      <div style={styles.closeUpLabel}>
                        {imgSrc ? safeRender(label) : "---"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...styles.boxWrapper, flex: "1" }}>
              <div style={{ ...styles.navyHeader, backgroundColor: "#b91c1c" }}>
                جدول الخامات (BOM)
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.th,
                        backgroundColor: "#f1f5f9",
                        width: "10%",
                      }}
                    >
                      م
                    </th>
                    <th
                      style={{
                        ...styles.th,
                        backgroundColor: "#f1f5f9",
                        width: "25%",
                      }}
                    >
                      الخامة
                    </th>
                    <th
                      style={{
                        ...styles.th,
                        backgroundColor: "#f1f5f9",
                        width: "40%",
                      }}
                    >
                      النوع / الوصف
                    </th>
                    <th
                      style={{
                        ...styles.th,
                        backgroundColor: "#f1f5f9",
                        width: "25%",
                      }}
                    >
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bomList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {idx + 1}
                      </td>
                      <td style={styles.td}>{item.name}</td>
                      <td style={styles.td}>{item.desc}</td>
                      <td style={{ ...styles.td, color: "#64748b" }}>
                        (يحدد لاحقاً)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. ROW 4: POM, Size Range, Colors */}
          <div style={{ ...styles.sectionRow, flex: 0.9 }}>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>جدول القياسات (POM)</div>
              <div
                style={{
                  padding: "4px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                (يحدد لاحقاً بواسطة قسم التخطيط)
              </div>
            </div>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>جدول المقاسات (SIZE RANGE)</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "3px",
                  padding: "4px",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                {displaySizes.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #0f172a",
                      padding: "2px 6px",
                      fontWeight: "bold",
                      fontSize: "9.5px",
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>لوحة الألوان (COLOR PALETTE)</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px",
                  flex: 1,
                }}
              >
                {colorsArray.map((color, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "10px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #0f172a",
                        margin: "0 auto 2px",
                      }}
                    ></div>
                    <div style={{ fontSize: "8.5px", fontWeight: "bold" }}>
                      {typeof color === "string"
                        ? color
                        : `${color?.part || "جزء"}: ${color?.color || "يحدد لاحقاً"}`}{" "}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. ROW 5: Tech Comments, Care, Quality */}
          <div style={{ ...styles.sectionRow, flex: 1.1 }}>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>
                ملاحظات فنية (TECHNICAL COMMENTS)
              </div>
              <div
                style={{
                  padding: "4px",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "9.5px",
                  flex: 1,
                }}
              >
                {safeRender(data?.technical_comments)}
              </div>
            </div>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>
                تعليمات العناية (CARE INSTRUCTIONS)
              </div>
              <div
                style={{
                  padding: "4px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  fontSize: "9.5px",
                }}
              >
                أيقونات العناية
              </div>
            </div>
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>
                نقاط فحص الجودة (QUALITY CHECK POINTS)
              </div>
              <div style={{ padding: "4px", flex: 1, overflow: "hidden" }}>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "9.5px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  {Array.isArray(data?.quality_check_points) ? (
                    data.quality_check_points.slice(0, 3).map((pt, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>
                        <span style={{ color: "#dc2626", marginLeft: "4px" }}>
                          ✔
                        </span>
                        {safeRender(pt)}
                      </li>
                    ))
                  ) : (
                    <li style={{ marginBottom: "2px" }}>
                      <span style={{ color: "#dc2626", marginLeft: "4px" }}>
                        ✔
                      </span>
                      {safeRender(data?.quality_check_points)}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 7. FOOTER */}
          <div
            style={{
              display: "flex",
              flex: 1.2,
              minHeight: 0,
              backgroundColor: "#f1f5f9",
              borderTop: "2px solid #0f172a",
              borderBottom: "2px solid #0f172a",
            }}
          >
            {[
              "إعداد: قسم التخطيط",
              "مراجعة: قسم الجودة",
              "اعتماد: مدير الإنتاج",
              "اعتماد العينة: التخطيط",
            ].map((title, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  padding: "5px",
                  borderLeft: idx !== 3 ? "1px solid #0f172a" : "none",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    fontSize: "9.5px",
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: "8.5px", fontWeight: "bold" }}>
                  الاسم: ....................
                </div>
                <div style={{ fontSize: "8.5px", fontWeight: "bold" }}>
                  التاريخ: ..................
                </div>
                <div style={{ fontSize: "8.5px", fontWeight: "bold" }}>
                  التوقيع: ..................
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              height: "22px",
              flexShrink: 0,
              backgroundColor: "#0f172a",
              color: "#ffffff",
              textAlign: "center",
              padding: "4px",
              fontSize: "10.5px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            صادر من قسم التخطيط والجودة - شركة الصحابة لتصنيع وتصدير الملابس
          </div>
        </div>
      </>
    );
  },
);

TechPackTemplate.displayName = "TechPackTemplate";

export default TechPackTemplate;
