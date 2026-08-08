import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase"; // تأكد من المسار حسب مشروعك
import { toast } from "sonner";

const AddNewCustomer = ({ setOpenModal, onSuccess }) => {
  const [brands, setBrands] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 State لحفظ بيانات الفورم
  const [formData, setFormData] = useState({
    brand_id: "",
    name: "",
    phone: "",
    whatsapp: "",
    governorate: "",
    contact_person: "",
    address: "",
    delivery_notes: "",
  });

  // 💡 جلب البراندات أول ما النافذة تفتح
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from("brands")
          .select("id, name_ar");
        if (error) throw error;
        if (data) setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("حدث خطأ أثناء جلب البراندات.");
      }
    };
    fetchBrands();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💡 دالة الحفظ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand_id || !formData.name) {
      toast.error("يرجى اختيار البراند وكتابة اسم العميل على الأقل.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("customers").insert([formData]);

      if (error) throw error;

      toast.success("تم إضافة العميل بنجاح!");
      if (onSuccess) onSuccess(); // تحديث الجدول في الشاشة اللي ورا
      setOpenModal(false); // قفل النافذة
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("حدث خطأ أثناء حفظ العميل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpenModal(false)}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm h-[100vh]"
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-4xl bg-white shadow-2xl font-arabic"
        dir="rtl"
      >
        {/* Header - ثابت */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5 sm:p-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              إضافة عميل جديد
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              سيتم استخدام بيانات العميل عند إنشاء الشحنات.
            </p>
          </div>

          <button
            onClick={() => setOpenModal(false)}
            className="rounded-xl p-2 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 💡 الفورم بيضم الـ Body والـ Footer مع بعض */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Body - سكرول داخلي */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  البراند *
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  required
                >
                  <option value="">اختر البراند</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  placeholder="اسم العميل أو الفرع"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366] text-right"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">واتساب</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366] text-right"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  المحافظة
                </label>
                <input
                  type="text"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  placeholder="القاهرة"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  اسم المسؤول
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  placeholder="اسم الشخص المستلم"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  العنوان
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  placeholder="العنوان بالكامل..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  ملاحظات التوصيل
                </label>
                <textarea
                  name="delivery_notes"
                  value={formData.delivery_notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#002366]"
                  placeholder="أي ملاحظات خاصة بالتوصيل ومواعيد الاستلام..."
                />
              </div>
            </div>
          </div>

          {/* Footer - ثابت */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-5 sm:p-6 bg-white">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-800 px-5 py-3 font-medium text-white hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ العميل"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddNewCustomer;
