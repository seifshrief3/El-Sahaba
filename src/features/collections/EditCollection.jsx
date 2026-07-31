import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  handleGetCollectionById,
  handleUpdateCollection,
} from "../../services/collectionsService";
import { handleGetAllBrands } from "../../services/brandsService";

const EditCollection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [brands, setBrands] = useState([]);
  const [selectedBrandData, setSelectedBrandData] = useState(null);

  const [formData, setFormData] = useState({
    brand_id: "",
    name: "",
    code: "",
    department: "",
    season: "",
    year: "",
    models_count: 0,
    delivery_date: "",
    customer_service_user_id: "",
    general_notes: "",
    product_type: "",
    expected_quantity: 0,
    deposit_percentage: 0,
    priority: "normal",
    status: "draft",
    data_approval_status: "not_approved",
    agreement_terms: "",
    updated_at: "",
  });

  // جلب بيانات الكولكشن والبراندات أول ما الصفحة تفتح
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // بنجيب البراندات والكولكشن في نفس الوقت عشان السرعة
        const [brandsData, collectionData] = await Promise.all([
          handleGetAllBrands(),
          handleGetCollectionById(id),
        ]);

        setBrands(brandsData);

        // ربط بيانات البراند المختار
        if (collectionData.brands) {
          setSelectedBrandData(collectionData.brands);
        }

        // تفريغ الداتا في الـ State
        setFormData({
          brand_id: collectionData.brand_id || "",
          name: collectionData.name || "",
          code: collectionData.code || "",
          department: collectionData.department || "",
          season: collectionData.season || "",
          year: collectionData.year || "",
          models_count: collectionData.models_count || 0,
          delivery_date: collectionData.delivery_date
            ? collectionData.delivery_date.split("T")[0]
            : "", // تظبيط صيغة التاريخ
          customer_service_user_id:
            collectionData.customer_service_user_id || "",
          general_notes: collectionData.general_notes || "",
          product_type: collectionData.product_type || "",
          expected_quantity: collectionData.expected_quantity || 0,
          deposit_percentage: collectionData.deposit_percentage || 0,
          priority: collectionData.priority || "normal",
          status: collectionData.status || "draft",
          data_approval_status:
            collectionData.data_approval_status || "not_approved",
          agreement_terms: collectionData.agreement_terms || "",
          updated_at: collectionData.updated_at,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الكولكشن");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // دالة التغيير في الحقول
  const handleChange = (e) => {
    const { name, value } = e.target;

    // لو غير البراند، نحدث بيانات العميل المعروضة
    if (name === "brand_id") {
      const brand = brands.find((b) => b.id === value);
      setSelectedBrandData(brand || null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // حساب نسبة الاكتمال
  const calculateProgress = () => {
    const totalFields = 10;
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

  // دالة حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand_id || !formData.name) {
      toast.error("برجاء اختيار البراند وكتابة اسم الكولكشن");
      return;
    }

    setSaving(true);
    try {
      // تجهيز الداتا للإرسال (تحديث التاريخ وتحويل الأرقام)
      const dataToUpdate = {
        ...formData,
        year: Number(formData.year) || null,
        models_count: Number(formData.models_count) || 0,
        expected_quantity: Number(formData.expected_quantity) || 0,
        deposit_percentage: Number(formData.deposit_percentage) || 0,
        delivery_date: formData.delivery_date || null,
        customer_service_user_id: formData.customer_service_user_id || null,
        updated_at: new Date().toISOString(),
      };

      await handleUpdateCollection(id, dataToUpdate);
      toast.success("تم تحديث الكولكشن بنجاح!");
      navigate("/customer_service/collections");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#1a365d] font-bold">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* زر الرجوع */}
        <div className="flex justify-end mb-2">
          <Link
            to="/customer_service/collections"
            className="text-[#1a365d] border border-[#1a365d] bg-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ◀ كل الكولكشنات
          </Link>
        </div>

        {/* الكارت الرئيسي لبيانات الكولكشن */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm">
          {/* الهيدر: العنوان ونسبة الاكتمال */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1 sm:mb-2">
                تعديل: {formData.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                نسبة اكتمال بيانات الكولكشن:
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
              <span className="text-xs sm:text-sm text-slate-500">
                آخر حفظ:{" "}
                {new Date(formData.updated_at).toLocaleDateString("ar-EG")}
              </span>
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
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                تم سحب بيانات البراند تلقائياً. كل الكولكشنات هتاخد اللوجو
                الجديد تلقائياً لو تم تعديله.
              </p>
            </div>

            {/* الصف الأول */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm text-slate-600 mb-2">
                  اسم الكولكشن *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
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
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
            </div>

            {/* الصف الثاني */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  موعد التسليم
                </label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  مسؤول خدمة العملاء
                </label>
                <input
                  type="text"
                  name="customer_service_user_id"
                  value={formData.customer_service_user_id}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 text-right"
                />
              </div>
            </div>

            {/* الملاحظة العامة */}
            <div className="mb-8">
              <label className="block text-sm text-slate-600 mb-2">
                ملاحظة عامة
              </label>
              <textarea
                name="general_notes"
                value={formData.general_notes}
                onChange={handleChange}
                rows="3"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* الأزرار وقسم التفاصيل الإضافية */}
            <div className="flex flex-col items-end gap-3 mb-6 w-full">
              {/* زر التبديل */}
              <button
                type="button"
                onClick={() => setShowExtraDetails(!showExtraDetails)}
                className="w-full sm:w-auto text-[#1a365d] border border-[#1a365d] px-6 py-2.5 sm:py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition text-center"
              >
                {showExtraDetails
                  ? "إخفاء التفاصيل الإضافية ▲"
                  : "تفاصيل إضافية (اختياري) ▼"}
              </button>

              {/* قسم التفاصيل الإضافية */}
              {showExtraDetails && (
                <div className="bg-[#f8fafc] w-full rounded-xl border border-slate-200 p-6 shadow-inner">
                  {/* بيانات مسحوبة من البراند */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        كود الكولكشن
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        readOnly
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-center text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-2 text-center">
                        اسم العميل
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
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-center bg-slate-100 text-slate-500 cursor-not-allowed"
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
                        <option value="cancelled">ملغي</option>
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

              {/* أزرار الحفظ */}
              <div className="flex w-full sm:w-auto mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto text-white px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition ${
                    saving
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-[#b91c1c] hover:bg-red-800"
                  }`}
                >
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات ◀"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCollection;
