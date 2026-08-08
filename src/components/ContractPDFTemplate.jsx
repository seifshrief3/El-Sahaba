import React from "react";
import logo from "../assets/logo.jpeg";

const ContractPDFTemplate = React.forwardRef(({ data, seriesCount }, ref) => {
  if (!data) return null;

  // الحسابات
  let grandTotalQty = 0;
  let grandTotalValue = 0;
  const allColors = new Set();
  const allSizes = new Set();

  data.models.forEach((model) => {
    const qty = model.sizes.length * model.colors.length * seriesCount;
    grandTotalQty += qty;
    grandTotalValue += qty * model.approvedPrice;

    model.colors.forEach((c) => allColors.add(c));
    model.sizes.forEach((s) => allSizes.add(s));
  });

  const advancePayment = grandTotalValue / 2;
  const remainingPayment = grandTotalValue / 2;

  // تواريخ
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString("ar-EG", { weekday: "long" });
  const formattedDate = dateObj.toLocaleDateString("en-GB");

  return (
    <div
      ref={ref}
      className="bg-white font-arabic p-8"
      style={{ direction: "rtl", color: "#000" }}
    >
      <style>
        {`
          @page { size: A4 portrait; margin: 10mm; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .page-break-avoid { page-break-inside: avoid; }
          }
          .main-text { font-size: 11px; }
          .blue-text { color: #1a365d; }
          .red-text { color: #b91c1c; }
          
          /* Custom Tables */
          .table-bordered { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px; }
          .table-bordered th, .table-bordered td { border: 1px solid #cbd5e1; padding: 6px; }
          .table-products th { background-color: #1a365d; color: #fff; text-align: center; }
          .table-products td { text-align: center; font-weight: bold; }
          .table-products .val-cell { color: #1a365d; }
          
          .table-terms { margin-top: 15px; }
          .table-terms td { text-align: right; font-size: 10px; padding: 8px; line-height: 1.6; }
          .table-terms .term-title { background-color: #f8fafc; font-weight: bold; width: 16%; text-align: center; color: #1a365d;}
        `}
      </style>

      {/* ================= هيدر العقد ================= */}
      <div className="flex justify-between items-center mb-3">
        <div className="w-24"></div> {/* مساحة فارغة لضبط التوسيط */}
        <div className="flex-1 text-center">
          <h1 className="text-[16px] font-black blue-text mb-2 tracking-wide">
            عقد تصنيع وتوريد زي مدرسي — شركة الصحابة لإدارة وتصنيع الملابس
          </h1>
          <h2 className="text-[10px] font-bold red-text">
            العميل: {data.brandName} | تاريخ العقد: {formattedDate} | مرجع الملف
            الفني: TP-{data.brandCode}-U01/U02/U03
          </h2>
        </div>
        <div className="w-24 flex justify-end">
          <img
            src={logo}
            alt="الصحابة"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* الخط الفاصل */}
      <div className="border-t-[3px] border-[#1a365d] mb-4"></div>

      {/* ================= الديباجة (مربع الأطراف) ================= */}
      <div className="main-text mb-4">
        <p className="font-bold mb-2">
          إنه في يوم {dayName} الموافق {formattedDate}م، تم الاتفاق والتعاقد بين
          كل من:
        </p>
        <div className="border border-slate-300 p-2 mb-2 bg-slate-50 flex flex-col gap-2">
          <p>
            <span className="font-bold blue-text text-xs">الطرف الأول:</span>{" "}
            شركة الصحابة لإدارة وتصنيع الملابس، ويمثلها في توقيع هذا العقد
            السيد/ة:{" "}
            <span className="text-transparent">__________________</span>{" "}
            <span className="font-bold blue-text">بصفته/ا:</span>{" "}
            <span className="text-transparent">__________________</span>
          </p>
          <p>
            <span className="font-bold blue-text text-xs">الطرف الثاني:</span>{" "}
            {data.brandName}، ويمثلها السيد/ة: أ. أحمد صبري{" "}
            <span className="font-bold blue-text">بصفته/ا:</span>{" "}
            <span className="text-transparent">__________________</span> ،{" "}
            <span className="font-bold blue-text">سجل تجاري/رقم رسمي:</span>{" "}
            <span className="text-transparent">__________________</span>
          </p>
        </div>
        <p className="text-[9px] text-slate-500 font-bold mt-2">
          وقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة قانوناً، على الالتزام
          الكامل بكافة ما ورد في هذا العقد وملحقه الفني باعتبارها جزءاً لا يتجزأ
          منه، وذلك على النحو التالي:
        </p>
      </div>

      {/* ================= جدول المنتجات ================= */}
      <table className="table-bordered table-products">
        <thead>
          <tr>
            <th colSpan="6" className="text-right px-3 py-1.5 text-xs">
              موضوع العقد — المنتجات والكميات والأسعار
            </th>
          </tr>
          <tr>
            <th className="w-20">كود الموديل</th>
            <th>المنتج</th>
            <th>الخامة</th>
            <th>الكمية (قطعة)</th>
            <th>سعر الوحدة (ج.م)</th>
            <th>الإجمالي (ج.م)</th>
          </tr>
        </thead>
        <tbody>
          {data.models.map((model, idx) => {
            const qty = model.sizes.length * model.colors.length * seriesCount;
            const total = qty * model.approvedPrice;
            return (
              <tr key={idx}>
                <td className="val-cell">{model.model_number}</td>
                <td className="val-cell">{model.name}</td>
                <td className="val-cell">
                  {model.fabric} {model.weight}
                </td>
                <td className="val-cell">{qty}</td>
                <td className="val-cell">
                  {model.approvedPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="val-cell font-black">
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
          {/* صف الإجمالي النهائي */}
          <tr className="bg-[#fee2e2]">
            <td colSpan="5" className="text-center font-bold text-[#b91c1c]">
              الإجمالي — {grandTotalQty} قطعة (ألوان:{" "}
              {Array.from(allColors).join("/")}، مقاسات{" "}
              {Array.from(allSizes).join("-")} بالتساوي)
            </td>
            <td className="font-black text-[#b91c1c] text-[11px]">
              {grandTotalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= جدول البنود والشروط ================= */}
      <table className="table-bordered table-terms page-break-avoid">
        <tbody>
          <tr>
            <td className="term-title">موضوع العقد</td>
            <td>
              يتعهد الطرف الأول بتصنيع وتوريد الكمية والمواصفات الموضحة أعلاه
              للطرف الثاني، وفق آلية العمل المعتمدة لدى الشركة (اعتماد التصميم،
              العينة، الإنتاج، الجودة، التسليم)، والملف الفني المعتمد من الطرفين
              الملحق بهذا العقد ويُعد جزءاً لا يتجزأ منه.
            </td>
          </tr>
          <tr>
            <td className="term-title">الكميات</td>
            <td>
              يحق للطرف الأول تسليم الكمية المتعاقد عليها بنسبة سماحية زيادة أو
              نقصاً لا تتجاوز ±3%، مع إجراء التسوية المالية المقابلة وفقاً لسعر
              الوحدة أعلاه، ولا يُعد ذلك إخلالاً بالعقد.
            </td>
          </tr>
          <tr>
            <td className="term-title">السعر وطريقة السداد</td>
            <td>
              السعر الإجمالي{" "}
              {grandTotalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              جنيه مصري (معفى من ضريبة القيمة المضافة)، يُسدد على دفعتين: 50%
              دفعة مقدمة (
              {advancePayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ج.م) عند التوقيع، و50% الباقي (
              {remainingPayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ج.م) قبل التسليم النهائي. لا يبدأ التنفيذ الفعلي إلا بعد استلام
              الدفعة المقدمة كاملة.
            </td>
          </tr>
          <tr>
            <td className="term-title">مدة التنفيذ والتسليم</td>
            <td>
              يلتزم الطرف الأول بتسليم الطلب كاملاً في موعد أقصاه 05/08/2026م،
              تبدأ من تاريخ استلام الدفعة المقدمة واعتماد العينة والمقاسات معاً.
              أي تأخير من الطرف الثاني في الاعتماد أو السداد أو إرسال المقاسات
              يمدد هذا الموعد تلقائياً بمقدار التأخير.
            </td>
          </tr>
          <tr>
            <td className="term-title">الضمان</td>
            <td>
              يضمن الطرف الأول سلامة القطع المصنعة من عيوب التصنيع فقط، لمدة
              ____ يوماً من تاريخ التسليم الفعلي. لا يشمل الضمان أي تلف ناتج عن
              سوء الاستخدام أو الغسيل أو الكي غير السليم أو الاستخدام خارج الغرض
              المخصص.
            </td>
          </tr>
          <tr>
            <td className="term-title">الاستلام والاستبدال</td>
            <td>
              يوقع الطرفان عند التسليم على محضر استلام يثبت الكمية المسلمة
              وحالتها. لا يحق للطرف الثاني طلب استرجاع أو استبدال أي قطعة بعد
              التوقيع على المحضر إلا في حال ثبوت عيب تصنيع فعلي يقع ضمن نطاق
              الضمان.
            </td>
          </tr>
          <tr>
            <td className="term-title">التعديلات</td>
            <td>
              أي طلب تعديل على المواصفات أو الكميات يرد بعد اعتماد العينة و/أو
              بعد بدء الإنتاج، يُحتسب له تكلفة إضافية ويمدد أجل التنفيذ بما
              يلزم، ولا يُعتمد أي تعديل إلا بموافقة خطية صادرة عن الطرفين معاً.
            </td>
          </tr>
          <tr>
            <td className="term-title">القوة القاهرة والسرية</td>
            <td>
              لا يُعد أي من الطرفين مخالفاً لالتزاماته حال تعذر التنفيذ لظروف
              قاهرة خارجة عن إرادته (يُعلق العقد تلقائياً طوال استمرارها).
              ويلتزم الطرفان بسرية تامة لكافة المعلومات والتصاميم والأسعار،
              وتبقى شعارات وتصاميم كل طرف مملوكة له حصرياً.
            </td>
          </tr>
          <tr>
            <td className="term-title">القانون المختص ونسخ العقد</td>
            <td>
              يخضع هذا العقد لأحكام القوانين المعمول بها في _______________ ،
              وتختص بالفصل في أي نزاع محاكم _______________ وحدها، بعد محاولة حل
              ودي خلال 15 يوماً. حُرر من نسختين متطابقتين بيد كل طرف، ويُعد
              الملف الفني ملحقاً موقعاً جزءاً لا يتجزأ منه.
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= جدول التوقيعات ================= */}
      <table className="table-bordered page-break-avoid mt-4">
        <thead>
          <tr>
            <th className="bg-[#1a365d] text-white w-1/2 p-2">
              عن الطرف الثاني — {data.brandName}
            </th>
            <th className="bg-[#1a365d] text-white w-1/2 p-2">
              عن الطرف الأول — شركة الصحابة لإدارة وتصنيع الملابس
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-right p-4 align-top border-slate-300">
              <div className="space-y-4 font-bold text-[11px] blue-text">
                <p>الاسم: أ. أحمد صبري</p>
                <p>
                  التوقيع والختم:{" "}
                  <span className="text-transparent">
                    ________________________
                  </span>
                </p>
                <p>التاريخ: {formattedDate}</p>
              </div>
            </td>
            <td className="text-right p-4 align-top border-slate-300">
              <div className="space-y-4 font-bold text-[11px] blue-text">
                <p>
                  الاسم:{" "}
                  <span className="text-transparent">
                    ________________________
                  </span>
                </p>
                <p>
                  التوقيع والختم:{" "}
                  <span className="text-transparent">
                    ________________________
                  </span>
                </p>
                <p>التاريخ: {formattedDate}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

ContractPDFTemplate.displayName = "ContractPDFTemplate";
export default ContractPDFTemplate;
