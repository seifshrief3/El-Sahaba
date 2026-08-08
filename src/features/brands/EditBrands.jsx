import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  handleGetBrandById,
  handleUpdateBrand,
} from "../../services/brandsService";

const EditBrands = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // لمعرفة المسار الحالي

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    code: "",
    client_name: "",
    contact_person: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    activity: "أطفال",
    status: "active",
    notes: "",
    logo_url: "",
  });

  const [brandCollections, setBrandCollections] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // دالة لمعرفة الـ Root Path الحالي بناءً على الرابط
  const getBasePath = () => {
    if (location.pathname.includes("/managments")) return "/managments";
    return "/customer_service";
  };

  useEffect(() => {
    const fetchBrandDetails = async () => {
      try {
        const data = await handleGetBrandById(id);
        setFormData(data);
        setBrandCollections(data.collections || []);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      } catch (error) {
        console.error(error);
        toast.error("حصل خطأ أثناء جلب بيانات البراند.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBrandDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalLogoUrl = formData.logo_url;

      if (logoFile) {
        const cloudData = new FormData();
        cloudData.append("file", logoFile);
        cloudData.append("upload_preset", "sahaba_uploads");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/el-sahaba/auto/upload`,
          { method: "POST", body: cloudData },
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error?.message || "فشل رفع الصورة");

        finalLogoUrl = data.secure_url;
      }

      const finalData = {
        ...formData,
        logo_url: finalLogoUrl,
      };

      await handleUpdateBrand(id, finalData);
      toast.success("تم تعديل بيانات البراند بنجاح!");
      // navigate(`${getBasePath()}/brands`);
    } catch (error) {
      console.error(error);
      toast.error("حصل خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-arabic">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* زرار العودة - اللينك ديناميكي */}
        <div className="flex justify-start">
          <Link
            to={`${getBasePath()}/brands`}
            className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2"
          >
            ◀ رجوع للبراندات
          </Link>
        </div>

        {/* الكارت الأول: تعديل البراند */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="mb-6 flex justify-between items-start">
            <div className="text-right flex-1">
              <h2 className="text-2xl font-bold text-[#1a365d] mb-1">
                تعديل: {formData.name_ar}
              </h2>
              <p className="text-sm text-slate-500">
                قم بتحديث بيانات البراند، ولن يؤثر ذلك على أوامر التشغيل
                السابقة.
              </p>
            </div>
            <div className="mr-auto">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  formData.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}
              >
                {formData.status === "active" ? "نشط" : "متوقف"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            {/* اللوجو */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                لوجو البراند
              </label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="fileInput"
                onChange={handleFileSelect}
              />
              {logoPreview ? (
                <div className="flex flex-col items-start gap-2 border border-slate-200 rounded-xl p-4 w-fit bg-slate-50">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-lg bg-white border border-slate-200"
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                      className="text-xs text-[#1a365d] font-bold hover:underline"
                    >
                      تغيير
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
                        setFormData((prev) => ({ ...prev, logo_url: "" }));
                      }}
                      className="text-xs text-[#b91c1c] font-bold hover:underline"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  className="border-2 border-dashed border-[#1a365d] rounded-xl py-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition"
                >
                  <p className="text-sm text-slate-500">
                    اضغط لرفع لوجو البراند
                  </p>
                </div>
              )}
            </div>

            {/* باقي الفورم */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  اسم البراند بالعربية *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  required
                  value={formData.name_ar || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  كود البراند *
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  اسم العميل / الشركة
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  مسؤول التواصل
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  واتساب
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  نوع النشاط
                </label>
                <select
                  name="activity"
                  value={formData.activity || "أطفال"}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="يونيفورم">يونيفورم</option>
                  <option value="أطفال">أطفال</option>
                  <option value="حريمي">حريمي</option>
                  <option value="رجالي">رجالي</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  الحالة
                </label>
                <select
                  name="status"
                  value={formData.status || "active"}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">متوقف</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="4"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white transition ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-[#b91c1c] hover:bg-red-800"}`}
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </form>
        </div>

        {/* الكارت الثاني: الكولكشنات المرتبطة */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1a365d]">
              أوامر التشغيل المرتبطة ({brandCollections.length})
            </h3>
          </div>

          <div className="space-y-3">
            {brandCollections.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                لا توجد أوامر تشغيل مرتبطة بهذا البراند حتى الآن.
              </p>
            ) : (
              brandCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="border border-slate-200 rounded-xl p-5 flex justify-between items-center bg-slate-50/50"
                >
                  <div className="text-right">
                    <h4 className="font-bold text-[#1a365d] text-lg">
                      {collection.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      الموسم: {collection.season || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    {/* التعديل الأهم هنا: اللينك ديناميكي حسب القسم */}
                    <Link
                      to={`${getBasePath()}/edit_collection/${collection.id}`}
                      className="px-8 py-2 rounded-lg text-sm font-bold text-[#1a365d] border border-[#1a365d] hover:bg-blue-50 transition bg-white"
                    >
                      فتح
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBrands;
