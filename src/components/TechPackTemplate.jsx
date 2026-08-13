import React from "react";
import logoImage from "../assets/logo.jpeg";

const TechPackTemplate = React.forwardRef(
  ({ data, activeModel, brandName }, ref) => {
    if (!data) return null;

    // =========================================================
    // CONSTANTS
    // =========================================================

    const NAVY = "#0b2b63";
    const DARK_NAVY = "#082653";
    const RED = "#d71920";
    const LIGHT_BLUE = "#eef3f9";
    const BORDER = "#7b8794";
    const TEXT = "#172033";
    const LIGHT_BG = "#f8fafc";

    // =========================================================
    // MAIN IMAGE
    // =========================================================

    const mainImage = activeModel?.image_url || "";

    // =========================================================
    // SAFE RENDER
    // =========================================================

    const safeRender = (value) => {
      if (value === null || value === undefined || value === "") {
        return "—";
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
                item.value ||
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
        } catch (error) {
          return JSON.stringify(value);
        }
      }

      return String(value);
    };

    // =========================================================
    // FABRIC NAMES
    // =========================================================

    const renderFabricNames = (fabricData) => {
      if (!fabricData) {
        return "—";
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

      if (typeof fabricData === "object") {
        return fabricData.name || fabricData.description || "—";
      }

      return "—";
    };

    // =========================================================
    // FABRIC WEIGHTS
    // =========================================================

    const renderFabricWeights = (fabricData, weightData) => {
      if (typeof weightData === "string" && weightData.trim()) {
        return weightData;
      }

      if (typeof weightData === "number") {
        return String(weightData);
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

      return "يحدد لاحقاً بواسطة قسم التخطيط";
    };

    // =========================================================
    // BASIC INFO
    // =========================================================

    const basicInfo = data?.basic_info || {};

    const productName = basicInfo?.product_name || activeModel?.name || "—";

    const modelNumber = activeModel?.model_number || "—";

    const displayBrand =
      basicInfo?.brand || brandName || activeModel?.brand_name || "—";

    const category = basicInfo?.category || "—";

    const season = basicInfo?.season || "—";

    // =========================================================
    // SIZES
    // =========================================================

    const sizesString =
      typeof basicInfo?.size_range === "string" ? basicInfo.size_range : "";

    const displaySizes = sizesString
      ? sizesString
          .split(/[،,-]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : ["يحدد لاحقاً"];

    // =========================================================
    // COLORS
    // =========================================================

    const colorsArray = Array.isArray(basicInfo?.colors)
      ? basicInfo.colors
      : Array.isArray(activeModel?.colors)
        ? activeModel.colors
        : [];

    // =========================================================
    // CLOSE-UP IMAGES
    // =========================================================

    const closeUpImages = Array.isArray(activeModel?.close_up_images)
      ? activeModel.close_up_images
      : [];

    // =========================================================
    // CLOSE-UP DESCRIPTIONS
    // =========================================================

    const closeUpParts = Array.isArray(
      data?.technical_description?.close_up_parts,
    )
      ? data.technical_description.close_up_parts
      : [];

    // =========================================================
    // CLOSE-UP SLOTS
    // =========================================================

    const closeUpCount = Math.max(closeUpImages.length, closeUpParts.length, 1);

    const closeUpSlots = Array.from(
      {
        length: Math.min(closeUpCount, 8),
      },
      (_, idx) => {
        const image = closeUpImages[idx] || null;

        const rawLabel = closeUpParts[idx];

        let label = "تفصيل المنتج";

        if (typeof rawLabel === "string" && rawLabel.trim()) {
          label = rawLabel.trim();
        } else if (rawLabel && typeof rawLabel === "object") {
          label =
            rawLabel.description ||
            rawLabel.label ||
            rawLabel.name ||
            "تفصيل المنتج";
        }

        return {
          image,
          label,
        };
      },
    );

    // =========================================================
    // TECHNICAL DESCRIPTION
    // =========================================================

    const technicalDescription = data?.technical_description || {};

    // =========================================================
    // BOM
    // =========================================================

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

    // =========================================================
    // CARE INSTRUCTIONS
    // =========================================================

    const careInstructions = Array.isArray(data?.care_instructions)
      ? data.care_instructions
      : [];

    // =========================================================
    // QUALITY CHECK
    // =========================================================

    const qualityPoints = Array.isArray(data?.quality_check_points)
      ? data.quality_check_points
      : [];

    // =========================================================
    // DATE
    // =========================================================

    const issueDate = new Date().toLocaleDateString("ar-EG");

    // =========================================================
    // SIMPLE SVG ICONS
    // =========================================================

    const RulerIcon = () => (
      <svg
        width="38"
        height="38"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 44L44 11L53 20L20 53L11 44Z"
          stroke={NAVY}
          strokeWidth="3"
        />

        <path d="M20 35L25 40" stroke={NAVY} strokeWidth="3" />

        <path d="M27 28L32 33" stroke={NAVY} strokeWidth="3" />

        <path d="M34 21L39 26" stroke={NAVY} strokeWidth="3" />

        <path d="M41 14L46 19" stroke={NAVY} strokeWidth="3" />
      </svg>
    );

    const UserIcon = () => (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="20" r="10" stroke={NAVY} strokeWidth="3" />

        <path
          d="M14 53C15 42 22 36 32 36C42 36 49 42 50 53"
          stroke={NAVY}
          strokeWidth="3"
        />
      </svg>
    );

    const ShieldIcon = () => (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
        <path
          d="M32 7L51 14V28C51 40 43 50 32 56C21 50 13 40 13 28V14L32 7Z"
          stroke={NAVY}
          strokeWidth="3"
        />

        <path d="M23 31L29 37L41 24" stroke={NAVY} strokeWidth="3" />
      </svg>
    );

    const QualityIcon = () => (
      <svg width="34" height="34" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="22" stroke={NAVY} strokeWidth="3" />

        <path d="M22 32L29 39L43 25" stroke={NAVY} strokeWidth="3" />
      </svg>
    );

    // =========================================================
    // STYLES
    // =========================================================

    const styles = {
      page: {
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        padding: "3.5mm 5mm 2.5mm",
        direction: "rtl",
        backgroundColor: "#ffffff",
        color: TEXT,
        fontFamily: "'Cairo', 'Tahoma', Arial, sans-serif",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      },

      sectionRow: {
        display: "flex",
        gap: "3px",
        alignItems: "stretch",
        minHeight: 0,
        width: "100%",
      },

      navyHeader: {
        backgroundColor: NAVY,
        color: "#ffffff",
        padding: "3px 4px",
        fontWeight: "900",
        fontSize: "9.5px",
        lineHeight: "1.2",
        textAlign: "center",
        border: `1px solid ${NAVY}`,
        minHeight: "18px",
        boxSizing: "border-box",
      },

      redHeader: {
        backgroundColor: RED,
        color: "#ffffff",
        padding: "3px 4px",
        fontWeight: "900",
        fontSize: "9.5px",
        lineHeight: "1.2",
        textAlign: "center",
        border: `1px solid ${RED}`,
        minHeight: "18px",
        boxSizing: "border-box",
      },

      boxWrapper: {
        border: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        minHeight: 0,
        overflow: "hidden",
        borderRadius: "2px",
        boxSizing: "border-box",
      },

      table: {
        width: "100%",
        height: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      },

      th: {
        border: `1px solid ${BORDER}`,
        padding: "2px 3px",
        fontWeight: "800",
        backgroundColor: LIGHT_BLUE,
        color: NAVY,
        textAlign: "center",
        fontSize: "8.2px",
        lineHeight: "1.2",
        verticalAlign: "middle",
        overflow: "hidden",
      },

      td: {
        border: `1px solid ${BORDER}`,
        padding: "2px 3px",
        textAlign: "right",
        fontSize: "8.2px",
        fontWeight: "700",
        color: TEXT,
        verticalAlign: "middle",
        overflow: "hidden",
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: "1.25",
      },

      paragraph: {
        padding: "5px",
        fontSize: "8.5px",
        lineHeight: "1.55",
        textAlign: "right",
        fontWeight: "700",
        overflow: "hidden",
      },

      closeUpGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: "2px",
        padding: "3px",
        flex: 1,
        minHeight: 0,
        boxSizing: "border-box",
      },

      closeUpItem: {
        border: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        backgroundColor: "#ffffff",
        position: "relative",
      },

      closeUpImgBlock: {
        flex: 1,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: LIGHT_BG,
        minHeight: 0,
        overflow: "hidden",
      },

      closeUpLabel: {
        fontSize: "7.4px",
        textAlign: "center",
        fontWeight: "800",
        borderTop: `1px solid ${BORDER}`,
        padding: "2px 1px",
        whiteSpace: "normal",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        minHeight: "15px",
        lineHeight: "1.2",
        color: NAVY,
      },

      redCircle: {
        position: "absolute",
        bottom: "2px",
        left: "2px",
        backgroundColor: RED,
        color: "#ffffff",
        width: "13px",
        height: "13px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "7px",
        fontWeight: "900",
        zIndex: 2,
      },

      miniTitle: {
        color: NAVY,
        fontSize: "9px",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: "2px",
      },
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
      <>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }

            * {
              box-sizing: border-box;
            }

            @media print {
              html,
              body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
              }

              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}
        </style>

        <div ref={ref} style={styles.page}>
          {/* =====================================================
              HEADER
          ====================================================== */}

          <div
            style={{
              height: "16.5%",
              minHeight: 0,
              display: "flex",
              alignItems: "stretch",
              borderBottom: `2px solid ${RED}`,
              paddingBottom: "3px",
              gap: "6px",
            }}
          >
            {/* LOGO */}

            <div
              style={{
                width: "22%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "2px",
              }}
            >
              <img
                src={logoImage}
                alt="الصحابة"
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "82px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* CENTER TITLE */}

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 4px",
              }}
            >
              <h1
                style={{
                  color: NAVY,
                  fontSize: "24px",
                  fontWeight: "900",
                  margin: "0",
                  lineHeight: "1.2",
                }}
              >
                الورقة الفنية للمنتج
              </h1>

              <h2
                style={{
                  color: RED,
                  fontSize: "13px",
                  fontWeight: "900",
                  margin: "2px 0",
                  lineHeight: "1.3",
                }}
              >
                قسم التخطيط والجودة
              </h2>

              <h3
                style={{
                  color: NAVY,
                  fontSize: "11px",
                  fontWeight: "800",
                  margin: "0",
                  lineHeight: "1.3",
                }}
              >
                شركة الصحابة لتصنيع وتصدير الملابس
              </h3>
            </div>

            {/* FILE INFO */}

            <div
              style={{
                width: "27%",
                display: "flex",
                alignItems: "stretch",
              }}
            >
              <table
                style={{
                  ...styles.table,
                  border: `1px solid ${BORDER}`,
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
                      رقم الملف
                    </th>

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        direction: "ltr",
                        color: NAVY,
                        fontWeight: "900",
                      }}
                    >
                      {activeModel?.tech_pack_number ||
                        activeModel?.file_number ||
                        modelNumber ||
                        "TP-0000"}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>تاريخ الإصدار</th>

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        color: RED,
                        fontWeight: "900",
                      }}
                    >
                      {issueDate}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>الإصدار</th>

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        direction: "ltr",
                      }}
                    >
                      1.0
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>عدد الصفحات</th>

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "center",
                      }}
                    >
                      1 من 1
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* =====================================================
              MODEL DATA + MAIN IMAGE
          ====================================================== */}

          <div
            style={{
              ...styles.sectionRow,
              height: "21%",
            }}
          >
            {/* MODEL INFO - LEFT SIDE IN RTL LAYOUT */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "0.95",
              }}
            >
              <div style={styles.navyHeader}>1- بيانات الموديل</div>

              <table style={styles.table}>
                <tbody>
                  <tr>
                    <th style={styles.th}>اسم المنتج</th>

                    <td style={styles.td}>{safeRender(productName)}</td>
                  </tr>

                  <tr>
                    <th style={styles.th}>رقم الموديل</th>

                    <td
                      style={{
                        ...styles.td,
                        direction: "ltr",
                        textAlign: "center",
                        color: NAVY,
                        fontWeight: "900",
                      }}
                    >
                      {modelNumber}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>اسم البراند</th>

                    <td style={styles.td}>{safeRender(displayBrand)}</td>
                  </tr>

                  <tr>
                    <th style={styles.th}>الفئة</th>

                    <td style={styles.td}>{safeRender(category)}</td>
                  </tr>

                  <tr>
                    <th style={styles.th}>الموسم</th>

                    <td style={styles.td}>{safeRender(season)}</td>
                  </tr>

                  <tr>
                    <th style={styles.th}>نوع الخامة</th>

                    <td style={styles.td}>
                      {renderFabricNames(basicInfo?.main_fabric)}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>وزن الخامة</th>

                    <td
                      style={{
                        ...styles.td,
                        fontSize: "7.4px",
                      }}
                    >
                      {renderFabricWeights(
                        basicInfo?.main_fabric,
                        basicInfo?.fabric_weight,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>المقاسات</th>

                    <td style={styles.td}>{sizesString || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ONE COMBINED MODEL IMAGE */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1.75",
              }}
            >
              <div style={styles.navyHeader}>صورة الموديل المرجعية</div>

              <div
                style={{
                  flex: 1,
                  padding: "4px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 0,
                  backgroundColor: "#f8fafc",
                }}
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt="Model"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "10px",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    صورة الموديل المجمعة
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              TECHNICAL DESCRIPTION + MANUFACTURING + BOM
          ====================================================== */}

          <div
            style={{
              ...styles.sectionRow,
              height: "19%",
            }}
          >
            {/* TECHNICAL DESCRIPTION */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "0.9",
              }}
            >
              <div style={styles.navyHeader}>1- الوصف الفني</div>

              <div
                style={{
                  ...styles.paragraph,
                  flex: 1,
                }}
              >
                {safeRender(technicalDescription?.short_description)}
              </div>
            </div>

            {/* MANUFACTURING DETAILS */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>2- تفاصيل التصنيع</div>

              <table style={styles.table}>
                <tbody>
                  <tr>
                    <th
                      style={{
                        ...styles.th,
                        width: "34%",
                      }}
                    >
                      نوع الخياطة
                    </th>

                    <td style={styles.td}>
                      {safeRender(technicalDescription?.stitching_type)}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>نوع الغرز</th>

                    <td style={styles.td}>
                      {safeRender(technicalDescription?.stitch_details)}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>أماكن التقويات</th>

                    <td style={styles.td}>
                      {safeRender(technicalDescription?.reinforcement_areas)}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>التشطيب</th>

                    <td style={styles.td}>
                      {safeRender(technicalDescription?.finishing)}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>طريقة التشغيل</th>

                    <td style={styles.td}>
                      {safeRender(
                        technicalDescription?.operation_method || "يحدد لاحقاً",
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th style={styles.th}>ملاحظات الإنتاج</th>

                    <td style={styles.td}>
                      {safeRender(technicalDescription?.production_notes)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOM */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1.45",
              }}
            >
              <div style={styles.navyHeader}>جدول الخامات (BOM)</div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th
                      style={{
                        ...styles.th,
                        width: "7%",
                      }}
                    >
                      م
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        width: "22%",
                      }}
                    >
                      الخامة
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        width: "41%",
                      }}
                    >
                      الوصف
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        width: "30%",
                      }}
                    >
                      الكمية / المورد
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
                          textAlign: "center",
                          fontSize: "7.3px",
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

          {/* =====================================================
              CLOSE UP DETAILS
          ====================================================== */}

          <div
            style={{
              ...styles.boxWrapper,
              height: "14.5%",
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
                          fontSize: "10px",
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>

                  <div style={styles.closeUpLabel}>
                    {item.image ? safeRender(item.label) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =====================================================
              COLORS + SIZES + POM
          ====================================================== */}

          <div
            style={{
              ...styles.sectionRow,
              height: "11.5%",
            }}
          >
            {/* COLOR PALETTE */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>
                لوحة الألوان
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (COLOR PALETTE)
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  padding: "5px",
                  flexWrap: "wrap",
                }}
              >
                {colorsArray.length > 0 ? (
                  colorsArray.slice(0, 6).map((color, idx) => {
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
                          minWidth: "40px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "28px",
                            backgroundColor: "#f4f4f4",
                            border: `1px solid ${BORDER}`,
                            margin: "0 auto 2px",
                          }}
                        />

                        <div
                          style={{
                            fontSize: "7.5px",
                            fontWeight: "800",
                            color: TEXT,
                          }}
                        >
                          {partName ? `${partName}: ${colorName}` : colorName}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span
                    style={{
                      fontSize: "8px",
                      color: "#64748b",
                    }}
                  >
                    لا توجد ألوان محددة
                  </span>
                )}
              </div>
            </div>

            {/* SIZE RANGE */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>
                جدول المقاسات
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (SIZE RANGE)
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    ...styles.miniTitle,
                    marginBottom: "5px",
                  }}
                >
                  المقاسات المتوفرة
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  {displaySizes.map((size, idx) => (
                    <div
                      key={idx}
                      style={{
                        minWidth: "29px",
                        height: "26px",
                        border: `1px solid ${BORDER}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: "800",
                        color: NAVY,
                      }}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* POM */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>
                جدول القياسات
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (POM)
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "4px",
                }}
              >
                <RulerIcon />

                <div
                  style={{
                    textAlign: "right",
                    fontSize: "8px",
                    fontWeight: "800",
                    color: TEXT,
                  }}
                >
                  يحدد لاحقاً بواسطة
                  <br />
                  قسم التخطيط
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              QUALITY + CARE + TECHNICAL COMMENTS
          ====================================================== */}

          <div
            style={{
              ...styles.sectionRow,
              height: "12%",
            }}
          >
            {/* QUALITY */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>
                نقاط فحص الجودة
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (QUALITY CHECK POINTS)
                </span>
              </div>

              <div
                style={{
                  padding: "4px 6px",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "7.6px",
                    fontWeight: "800",
                    textAlign: "right",
                    lineHeight: "1.35",
                  }}
                >
                  {qualityPoints.length > 0 ? (
                    qualityPoints.slice(0, 7).map((point, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: "1px",
                        }}
                      >
                        <span
                          style={{
                            color: RED,
                            fontWeight: "900",
                            marginLeft: "4px",
                          }}
                        >
                          ●
                        </span>

                        {safeRender(point)}
                      </li>
                    ))
                  ) : (
                    <li>
                      <span
                        style={{
                          color: RED,
                          marginLeft: "4px",
                        }}
                      >
                        ●
                      </span>
                      لم يتم تحديد نقاط الفحص
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* CARE */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1",
              }}
            >
              <div style={styles.navyHeader}>
                تعليمات العناية
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (CARE INSTRUCTIONS)
                </span>
              </div>

              <div
                style={{
                  padding: "3px",
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* CARE ICONS */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginBottom: "3px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "6.5px",
                      fontWeight: "700",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        lineHeight: "1",
                      }}
                    >
                      ♨
                    </div>
                    غسل
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "6.5px",
                      fontWeight: "700",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        lineHeight: "1",
                      }}
                    >
                      ▱
                    </div>
                    كي
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "6.5px",
                      fontWeight: "700",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        lineHeight: "1",
                      }}
                    >
                      ▥
                    </div>
                    تجفيف
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "6.5px",
                      fontWeight: "700",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        lineHeight: "1",
                      }}
                    >
                      ⊘
                    </div>
                    ممنوع
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    textAlign: "right",
                    lineHeight: "1.35",
                  }}
                >
                  {careInstructions.length > 0 ? (
                    careInstructions.slice(0, 3).map((instruction, idx) => (
                      <div key={idx}>
                        <span
                          style={{
                            color: RED,
                            marginLeft: "3px",
                          }}
                        >
                          ✓
                        </span>

                        {safeRender(instruction)}
                      </div>
                    ))
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
            </div>

            {/* TECHNICAL COMMENTS */}

            <div
              style={{
                ...styles.boxWrapper,
                flex: "1.15",
              }}
            >
              <div style={styles.navyHeader}>
                ملاحظات فنية
                <span
                  style={{
                    fontSize: "7px",
                    marginRight: "3px",
                  }}
                >
                  (TECHNICAL COMMENTS)
                </span>
              </div>

              <div
                style={{
                  padding: "5px",
                  flex: 1,
                  overflow: "hidden",
                  textAlign: "right",
                  fontSize: "7.8px",
                  fontWeight: "700",
                  lineHeight: "1.5",
                }}
              >
                {safeRender(data?.technical_comments)}
              </div>
            </div>
          </div>

          {/* =====================================================
              APPROVALS
          ====================================================== */}

          <div
            style={{
              height: "9%",
              borderTop: `1px solid ${BORDER}`,
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              backgroundColor: "#ffffff",
              direction: "rtl",
            }}
          >
            {/* 1 */}

            <div
              style={{
                flex: 1,
                borderLeft: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "3px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <UserIcon />

                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: "800",
                    color: NAVY,
                  }}
                >
                  إعداد:
                  <br />
                  قسم التخطيط
                </span>
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                الاسم: ................
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                التاريخ: ..............
              </div>
            </div>

            {/* 2 */}

            <div
              style={{
                flex: 1,
                borderLeft: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "3px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <ShieldIcon />

                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: "800",
                    color: NAVY,
                  }}
                >
                  مراجعة:
                  <br />
                  قسم الجودة
                </span>
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                الاسم: ................
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                التاريخ: ..............
              </div>
            </div>

            {/* 3 */}

            <div
              style={{
                flex: 1,
                borderLeft: `1px solid ${BORDER}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "3px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <QualityIcon />

                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: "800",
                    color: NAVY,
                  }}
                >
                  اعتماد:
                  <br />
                  مدير الإنتاج
                </span>
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                الاسم: ................
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                التاريخ: ..............
              </div>
            </div>

            {/* 4 */}

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "3px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <RulerIcon />

                <span
                  style={{
                    fontSize: "7.5px",
                    fontWeight: "800",
                    color: NAVY,
                  }}
                >
                  اعتماد العينة:
                  <br />
                  التخطيط
                </span>
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                الاسم: ................
              </div>

              <div
                style={{
                  fontSize: "6.8px",
                  fontWeight: "700",
                }}
              >
                التاريخ: ..............
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <div
            style={{
              height: "4%",
              flexShrink: 0,
              backgroundColor: NAVY,
              color: "#ffffff",
              textAlign: "center",
              padding: "3px",
              fontSize: "8.5px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderTop: `2px solid ${RED}`,
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
