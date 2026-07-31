import React, { useState } from "react";
import { handleAddNewBrand } from "../services/brandsService";
import { toast } from "sonner";

const AddNewBrand = ({ isAddModalOpen, setIsAddModalOpen }) => {
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
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); // بيعمل رابط وهمي مؤقت للصورة عشان تظهر لليوزر
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedLogoUrl = "";

      if (logoFile) {
        const cloudData = new FormData();
        cloudData.append("file", logoFile);
        cloudData.append("upload_preset", "sahaba_uploads"); // نفس الـ preset بتاعك

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/el-sahaba/auto/upload`,
          {
            method: "POST",
            body: cloudData,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "فشل رفع الصورة");
        }

        uploadedLogoUrl = data.secure_url; // استلمنا اللينك الحقيقي
      }

      // 2. نجهز الداتا النهائية عشان نبعتها لـ Supabase
      const finalData = {
        ...formData,
        logo_url: uploadedLogoUrl, // ضفنا اللينك النهائي
      };

      // 3. نحفظ في Supabase
      await handleAddNewBrand(finalData);

      toast.success("تم حفظ البراند بنجاح!");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("حصل خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-3 sm:p-4 z-[999]">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-xl overflow-hidden">
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-100 text-right bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1">
            إضافة براند جديد
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
            اسم البراند بالعربية وكود البراند مطلوبين على الأقل.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-right scrollbar-thin scrollbar-thumb-slate-200">
          <form
            id="add-brand-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* قسم اختيار الصورة */}
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
                <div className="flex flex-col items-start gap-2 border-2 border-slate-200 rounded-xl p-4 w-fit">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="text-xs text-[#b91c1c] font-bold hover:underline"
                  >
                    حذف الصورة
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl py-6 sm:py-8 text-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <p className="text-sm text-slate-500">
                    اضغط لاختيار لوجو البراند
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* --- حقول النصوص عادية زي ما هي --- */}
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  اسم البراند بالعربية *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  required
                  value={formData.name_ar}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  كود البراند *
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  العميل / الشركة
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  مسؤول التواصل
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  واتساب
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />
              </div>

              {/* حقل نوع النشاط (تأكد لو الداتابيز ليها شرط هنا برضه تخليه إنجليزي زي الـ status) */}
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  نوع النشاط
                </label>
                <select
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="أطفال">أطفال</option>
                  <option value="حريمي">حريمي</option>
                  <option value="رجالي">رجالي</option>
                  <option value="يونيفورم">يونيفورم</option>
                </select>
              </div>

              {/* التعديل: القيمة (value) إنجليزي، واللي بيظهر لليوزر عربي */}
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  الحالة
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">متوقف</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm resize-none"
              />
            </div>
          </form>
        </div>

        <div className="shrink-0 p-5 sm:p-6 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 z-10">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-[#b91c1c] border border-[#b91c1c] hover:bg-red-50 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="add-brand-form"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-white transition ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#b91c1c] hover:bg-red-800"
            }`}
          >
            {loading ? "جاري الحفظ..." : "حفظ البراند"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewBrand;
