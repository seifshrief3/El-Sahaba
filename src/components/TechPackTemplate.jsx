import React from "react";
import logoImage from "../assets/logo.jpeg";

const TechPackTemplate = React.forwardRef(
  ({ data, activeModel, brandName }, ref) => {
    if (!data) return null;

    // =====================================================
    // MAIN IMAGE
    // =====================================================

    const mainImage = activeModel?.image_url || "";

    // =====================================================
    // SAFE RENDER
    // =====================================================

    const safeRender = (value) => {
      if (value === null || value === undefined || value === "") {
        return "---";
      }

      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }

      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            if (item && typeof item === "object") {
              return (
                item.description ||
                item.label ||
                item.name ||
                JSON.stringify(item)
              );
            }

            return String(item);
          })
          .filter(Boolean)
          .join(" - ");
      }

      if (typeof value === "object") {
        try {
          return Object.entries(value)
            .map(([key, val]) => {
              const rendered =
                typeof val === "object" ? JSON.stringify(val) : String(val);

              return `${key}: ${rendered}`;
            })
            .join(" | ");
        } catch (e) {
          return JSON.stringify(value);
        }
      }

      return String(value);
    };

    // =====================================================
    // FABRIC NAMES
    // =====================================================

    const renderFabricNames = (fabricData) => {
      if (!fabricData) {
        return "---";
      }

      if (typeof fabricData === "string") {
        return fabricData;
      }

      if (Array.isArray(fabricData)) {
        return fabricData
          .map((fabric) => {
            if (typeof fabric === "string") {
              return fabric;
            }

            if (fabric && typeof fabric === "object") {
              return fabric.name || "";
            }

            return "";
          })
          .filter(Boolean)
          .join(" | ");
      }

      return "---";
    };

    // =====================================================
    // FABRIC WEIGHTS
    // =====================================================

    const renderFabricWeights = (fabricData, weightData) => {
      if (typeof weightData === "string" && weightData.trim()) {
        return weightData;
      }

      if (Array.isArray(fabricData)) {
        const weights = fabricData
          .map((fabric) => {
            if (fabric && typeof fabric === "object") {
              return fabric.weight || "";
            }

            return "";
          })
          .filter(Boolean);

        if (weights.length > 0) {
          return weights.join(" | ");
        }
      }

      return "---";
    };

    // =====================================================
    // STYLES
    // =====================================================

    const styles = {
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
        minHeight: 0,
      },

      closeUpImgBlock: {
        flex: 1,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        minHeight: 0,
        overflow: "hidden",
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
        whiteSpace: "normal",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        minHeight: "17px",
      },
    };

    // =====================================================
    // BOM
    // =====================================================

    const bomData = data?.bill_of_materials_BOM || {};

    const bomList = [
      {
        name: "القماش الرئيسي",
        desc: safeRender(bomData.main_fabric),
      },

      {
        name: "الريب",
        desc: safeRender(bomData.rib),
      },

      {
        name: "السحاب",
        desc: safeRender(bomData.zippers),
      },

      {
        name: "الأزرار",
        desc: safeRender(bomData.buttons),
      },

      {
        name: "الخيوط",
        desc: safeRender(bomData.threads),
      },

      {
        name: "الطباعة",
        desc: safeRender(bomData.printing),
      },

      {
        name: "التطريز",
        desc: safeRender(bomData.embroidery),
      },

      {
        name: "الإكسسوارات",
        desc: safeRender(bomData.accessories),
      },
    ];

    // =====================================================
    // SIZES
    // =====================================================

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

    // =====================================================
    // COLORS
    // =====================================================

    const colorsArray = Array.isArray(data?.basic_info?.colors)
      ? data.basic_info.colors
      : Array.isArray(activeModel?.colors)
        ? activeModel.colors
        : [];

    // =====================================================
    // CLOSE-UP IMAGES
    // =====================================================

    const closeUpImages = Array.isArray(activeModel?.close_up_images)
      ? activeModel.close_up_images
      : [];

    // =====================================================
    // CLOSE-UP DESCRIPTIONS
    // =====================================================

    const closeUpParts = Array.isArray(
      data?.technical_description?.close_up_parts,
    )
      ? data.technical_description.close_up_parts
      : [];

    // =====================================================
    // CREATE CLOSE-UP SLOTS
    //
    // IMPORTANT:
    // Images are the primary source.
    // Descriptions are secondary.
    // =====================================================

    const closeUpSlots = Array.from(
      {
        length: Math.max(closeUpImages.length, 8),
      },
      (_, idx) => {
        const image = closeUpImages[idx] || null;

        const rawLabel = closeUpParts[idx];

        let label = "تفصيل غير موضح";

        if (typeof rawLabel === "string" && rawLabel.trim()) {
          label = rawLabel.trim();
        } else if (rawLabel && typeof rawLabel === "object") {
          label = rawLabel.description || rawLabel.label || "تفصيل غير موضح";
        }

        return {
          image,
          label,
        };
      },
    );

    // =====================================================
    // CARE INSTRUCTIONS
    // =====================================================

    const careInstructions = Array.isArray(data?.care_instructions)
      ? data.care_instructions
      : [];

    // =====================================================
    // QUALITY CHECK
    // =====================================================

    const qualityPoints = Array.isArray(data?.quality_check_points)
      ? data.quality_check_points
      : [];

    // =====================================================
    // RENDER
    // =====================================================

    return (
      <>
        <style>
          {`
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }

            @media print {

              body {
                margin: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}
        </style>

        <div ref={ref} style={styles.page}>
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

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

              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
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
                  <th
                    style={{
                      ...styles.th,
                      width: "40%",
                    }}
                  >
                    رقم الملف:
                  </th>

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

          {/* ================================================= */}
          {/* MODEL INFO + MAIN IMAGE */}
          {/* ================================================= */}

          <div
            style={{
              ...styles.sectionRow,
              flex: 3.2,
            }}
          >
            {/* MAIN IMAGE */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "2.5",
              }}
            >
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
                  <span
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    صورة الموديل المجمعة
                  </span>
                )}
              </div>
            </div>

            {/* MODEL DATA */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
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

          {/* ================================================= */}
          {/* MANUFACTURING + TECHNICAL DESCRIPTION */}
          {/* ================================================= */}

          <div
            style={{
              ...styles.sectionRow,
            }}
          >
            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>2- تفاصيل التصنيع</div>

              <table style={styles.table}>
                <tbody>
                  <tr>
                    <th
                      style={{
                        ...styles.th,
                        width: "30%",
                      }}
                    >
                      نوع الخياطة
                    </th>

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

                    <td style={styles.td}>يحدد لاحقاً</td>
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

          {/* ================================================= */}
          {/* CLOSE-UP + BOM */}
          {/* ================================================= */}

          <div
            style={{
              ...styles.sectionRow,
              flex: 2.2,
            }}
          >
            {/* CLOSE-UP */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1.5",
              }}
            >
              <div style={styles.navyHeader}>
                تفاصيل المنتج (CLOSE-UP DETAILS)
              </div>

              <div style={styles.closeUpGrid}>
                {closeUpSlots.map((item, idx) => (
                  <div key={idx} style={styles.closeUpItem}>
                    <div style={styles.closeUpImgBlock}>
                      <div style={styles.redCircle}>{idx + 1}</div>

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#cbd5e1",
                            fontSize: "9px",
                          }}
                        >
                          -
                        </span>
                      )}
                    </div>

                    <div style={styles.closeUpLabel}>
                      {item.image ? safeRender(item.label) : "---"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOM */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div
                style={{
                  ...styles.navyHeader,
                  backgroundColor: "#b91c1c",
                }}
              >
                جدول الخامات (BOM)
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.th,
                        width: "10%",
                      }}
                    >
                      م
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        width: "25%",
                      }}
                    >
                      الخامة
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        width: "40%",
                      }}
                    >
                      النوع / الوصف
                    </th>

                    <th
                      style={{
                        ...styles.th,
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
                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        {idx + 1}
                      </td>

                      <td style={styles.td}>{item.name}</td>

                      <td style={styles.td}>{item.desc}</td>

                      <td
                        style={{
                          ...styles.td,
                          color: "#64748b",
                        }}
                      >
                        يحدد لاحقاً
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================= */}
          {/* POM + SIZES + COLORS */}
          {/* ================================================= */}

          <div
            style={{
              ...styles.sectionRow,
              flex: 0.9,
            }}
          >
            {/* POM */}

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
                يحدد لاحقاً بواسطة قسم التخطيط
              </div>
            </div>

            {/* SIZES */}

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

            {/* COLORS */}

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
                  flexWrap: "wrap",
                }}
              >
                {colorsArray.map((color, idx) => {
                  const colorName =
                    typeof color === "string"
                      ? color
                      : color?.color || "يحدد لاحقاً";

                  const partName =
                    typeof color === "string" ? "" : color?.part || "";

                  return (
                    <div
                      key={idx}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "10px",
                          backgroundColor: "#f1f5f9",
                          border: "1px solid #0f172a",
                          margin: "0 auto 2px",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "8.5px",
                          fontWeight: "bold",
                        }}
                      >
                        {partName ? `${partName}: ${colorName}` : colorName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* COMMENTS + CARE + QUALITY */}
          {/* ================================================= */}

          <div
            style={{
              ...styles.sectionRow,
              flex: 1.1,
            }}
          >
            {/* TECHNICAL COMMENTS */}

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
                  overflow: "hidden",
                }}
              >
                {safeRender(data?.technical_comments)}
              </div>
            </div>

            {/* CARE */}

            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>
                تعليمات العناية (CARE INSTRUCTIONS)
              </div>

              <div
                style={{
                  padding: "4px",
                  flex: 1,
                  overflow: "hidden",
                  fontSize: "9px",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {careInstructions.length > 0 ? (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {careInstructions.slice(0, 4).map((instruction, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "2px",
                        }}
                      >
                        <span
                          style={{
                            color: "#dc2626",
                            marginLeft: "4px",
                          }}
                        >
                          ✓
                        </span>

                        {safeRender(instruction)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    style={{
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    لم يتم تحديد تعليمات العناية
                  </div>
                )}
              </div>
            </div>

            {/* QUALITY */}

            <div style={styles.boxWrapper}>
              <div style={styles.navyHeader}>
                نقاط فحص الجودة (QUALITY CHECK POINTS)
              </div>

              <div
                style={{
                  padding: "4px",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
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
                  {qualityPoints.length > 0 ? (
                    qualityPoints.slice(0, 3).map((pt, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "2px",
                        }}
                      >
                        <span
                          style={{
                            color: "#dc2626",
                            marginLeft: "4px",
                          }}
                        >
                          ✔
                        </span>

                        {safeRender(pt)}
                      </li>
                    ))
                  ) : (
                    <li>
                      <span
                        style={{
                          color: "#dc2626",
                          marginLeft: "4px",
                        }}
                      >
                        ✔
                      </span>
                      لم يتم تحديد نقاط الفحص
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* FOOTER APPROVALS */}
          {/* ================================================= */}

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

                <div
                  style={{
                    fontSize: "8.5px",
                    fontWeight: "bold",
                  }}
                >
                  الاسم: ....................
                </div>

                <div
                  style={{
                    fontSize: "8.5px",
                    fontWeight: "bold",
                  }}
                >
                  التاريخ: ..................
                </div>

                <div
                  style={{
                    fontSize: "8.5px",
                    fontWeight: "bold",
                  }}
                >
                  التوقيع: ..................
                </div>
              </div>
            ))}
          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

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
