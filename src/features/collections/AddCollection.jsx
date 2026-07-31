import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleGetAllBrands } from "../../services/brandsService";
import { handleAddNewCollection } from "../../services/collectionsService";

const AddCollection = () => {
  const navigate = useNavigate();
  const [showExtraDetails, setShowExtraDetails] = useState(true);

  // 1. States للبراندات
  const [brands, setBrands] = useState([]);
  const [selectedBrandData, setSelectedBrandData] = useState(null);

  // 2. State لبيانات الفورم (بنفس أسماء عواميد الداتابيز)
  const [formData, setFormData] = useState({
    brand_id: "",
    name: "",
    code: `COL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    department: "",
    season: "",
    year: new Date().getFullYear(),
    models_count: 0,
    delivery_date: "",
    product_type: "",
    expected_quantity: 0,
    deposit_percentage: 0,
    priority: "normal",
    status: "draft",
    data_approval_status: "not_approved",
    agreement_terms: "",
    general_notes: "",
  });

  const [saving, setSaving] = useState(false);

  // 3. جلب البراندات أول ما الصفحة تفتح
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await handleGetAllBrands();
        // هنعرض البراندات النشطة بس في القائمة
        setBrands(data.filter((b) => b.status === "active"));
      } catch (error) {
        toast.error("حصل خطأ أثناء جلب البراندات");
      }
    };
    fetchBrands();
  }, []);

  // 4. دالة تغيير المدخلات
  const handleChange = (e) => {
    const { name, value } = e.target;

    // لو غيرنا البراند، نسحب بياناته عشان نعرضها في الحقول الإضافية
    if (name === "brand_id") {
      const brand = brands.find((b) => b.id === value);
      setSelectedBrandData(brand || null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 5. حساب نسبة الاكتمال ديناميكياً
  const calculateProgress = () => {
    const totalFields = 10; // الحقول الأساسية المهمة
    let filledFields = 0;

    if (formData.brand_id) filledFields++;
    if (formData.name) filledFields++;
    if (formData.department) filledFields++;
    if (formData.season) filledFields++;
    if (formData.delivery_date) filledFields++;
    if (formData.models_count > 0) filledFields++;
    if (formData.product_type) filledFields++;
    if (formData.expected_quantity > 0) filledFields++;
    if (formData.deposit_percentage > 0) filledFields++;
    if (formData.agreement_terms) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  // 6. دالة الإرسال لـ Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand_id || !formData.name) {
      toast.error("برجاء اختيار البراند وكتابة اسم الكولكشن الأساسي");
      return;
    }

    setSaving(true);
    try {
      // تجهيز الداتا وتحويل الأرقام للصيغة الصحيحة
      const finalData = {
        ...formData,
        year: Number(formData.year) || null,
        models_count: Number(formData.models_count) || 0,
        expected_quantity: Number(formData.expected_quantity) || 0,
        deposit_percentage: Number(formData.deposit_percentage) || 0,
        delivery_date: formData.delivery_date || null, // لو فاضي نبعته null عشان الـ DB
      };

      const newCollection = await handleAddNewCollection(finalData);
      toast.success("تم حفظ الكولكشن بنجاح!");

      // التوجيه لصفحة الكولكشنات (أو صفحة إضافة الموديلات حسب الـ Flow بتاعك)
      navigate("/customer_service/collections");
    } catch (error) {
      console.error(error);
      toast.error("حصل خطأ أثناء حفظ الكولكشن");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl flex flex-col gap-4">
        {/* زر الرجوع */}
        <div className="flex justify-end mb-2">
          <Link
            to="/customer_service/collections"
            className="text-[#1a365d] border border-[#1a365d] bg-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ◀ كل الكولكشنات
          </Link>
        </div>

        {/* الكارت الرئيسي */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
          {/* الهيدر */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[#1a365d] mb-2">
                إعداد كولكشن جديد
              </h1>
              <p className="text-sm text-slate-500">
                نسبة اكتمال بيانات الكولكشن:
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">
                {progress === 100 ? "مكتمل" : "جاري الإعداد"}
              </span>
              {/* شريط التقدم الدائري الديناميكي */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative transition-all duration-500"
                style={{
                  background: `conic-gradient(#1a365d ${progress}%, #f1f5f9 0)`,
                }}
              >
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#1a365d] font-bold text-xs">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="text-right">
            {/* اختيار البراند */}
            <div className="mb-6">
              <label className="block text-sm text-slate-600 mb-2">
                البراند *
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">— اختار براند —</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name_ar} ({brand.code})
                  </option>
                ))}
              </select>
            </div>

            {/* الصف الأول */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  اسم الكولكشن *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: يونيفورم صيفي"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  القسم
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">— اختار —</option>
                  <option value="أطفال">أطفال</option>
                  <option value="حريمي">حريمي</option>
                  <option value="رجالي">رجالي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  الموسم
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  placeholder="صيف / شتاء"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  السنة
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  عدد الموديلات *
                </label>
                <input
                  type="number"
                  name="models_count"
                  value={formData.models_count}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* الصف الثاني */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  موعد التسليم
                </label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  ملاحظات عامة
                </label>
                <input
                  type="text"
                  name="general_notes"
                  value={formData.general_notes}
                  onChange={handleChange}
                  placeholder="أي ملاحظات سريعة..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* الأزرار وقسم التفاصيل الإضافية */}
            <div className="flex flex-col gap-3 mb-6 w-full">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtraDetails(!showExtraDetails)}
                  className="text-[#1a365d] border border-[#1a365d] px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  {showExtraDetails
                    ? "إخفاء التفاصيل الإضافية ▲"
                    : "إظهار التفاصيل الإضافية ▼"}
                </button>
              </div>

              {/* قسم التفاصيل الإضافية */}
              {showExtraDetails && (
                <div className="bg-[#f8fafc] w-full rounded-xl border border-slate-200 p-6 shadow-inner">
                  {/* بيانات مسحوبة من البراند */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        كود الكولكشن (يُولد تلقائياً)
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-center text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        اسم العميل (مسحوب من البراند)
                      </label>
                      <input
                        type="text"
                        value={
                          selectedBrandData?.client_name ||
                          selectedBrandData?.name_ar ||
                          ""
                        }
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-center bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        كود العميل
                      </label>
                      <input
                        type="text"
                        value={selectedBrandData?.code || ""}
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-center bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        تليفون العميل
                      </label>
                      <input
                        type="text"
                        value={selectedBrandData?.phone || ""}
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-center bg-slate-100 text-slate-500 cursor-not-allowed"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        إيميل العميل
                      </label>
                      <input
                        type="text"
                        value={selectedBrandData?.email || ""}
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-center bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* تفاصيل الإنتاج والدفع */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        نوع المنتج
                      </label>
                      <input
                        type="text"
                        name="product_type"
                        value={formData.product_type}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        الكمية المتوقعة
                      </label>
                      <input
                        type="number"
                        name="expected_quantity"
                        value={formData.expected_quantity}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        نسبة العربون %
                      </label>
                      <input
                        type="number"
                        name="deposit_percentage"
                        value={formData.deposit_percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        أولوية الكولكشن
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="normal">عادي</option>
                        <option value="urgent">عاجل</option>
                      </select>
                    </div>
                  </div>

                  {/* حالات الكولكشن */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        حالة الكولكشن
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="draft">مسودة</option>
                        <option value="active">نشط</option>
                        <option value="completed">مكتمل</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        حالة اعتماد البيانات
                      </label>
                      <select
                        name="data_approval_status"
                        value={formData.data_approval_status}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="not_approved">لم يعتمد بعد</option>
                        <option value="approved">معتمد</option>
                      </select>
                    </div>
                  </div>

                  {/* شروط الاتفاق */}
                  <div>
                    <label className="block text-xs text-slate-600 mb-2 text-right">
                      شروط الاتفاق / التعاقد
                    </label>
                    <textarea
                      name="agreement_terms"
                      value={formData.agreement_terms}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none bg-white"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`text-white px-8 py-2.5 rounded-lg text-sm font-bold transition ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-[#b91c1c] hover:bg-red-800"}`}
            >
              {saving ? "جاري الحفظ..." : "حفظ وإنشاء الموديلات ◀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCollection;
