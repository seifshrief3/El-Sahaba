import React, { useState } from "react";
import AddNewBrand from "../../Modals/AddNewBrand";
import { Link } from "react-router-dom";

const Brands = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* رأس الصفحة وشريط البحث */}
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl flex flex-col gap-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[#1a365d] text-2xl font-bold mb-2">
              البراندات
            </h1>
            <p className="text-xs text-slate-500">
              كل بيانات العميل/البراند في مكان واحد — تتسحب تلقائيًا عند إنشاء
              أي كولكشن جديد.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-3xl bg-red-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-900 cursor-pointer"
          >
            + إضافة براند
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="اسم البراند , الكود , اسم العميل..."
            className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-[70%] focus:outline-none focus:border-blue-500"
          />
          <select className="border border-slate-300 p-2.5 rounded-lg text-sm text-slate-700 w-[30%] focus:outline-none focus:border-blue-500">
            <option value="نشط">نشط</option>
            <option value="متوقف">متوقف</option>
          </select>
        </div>
      </div>

      {/* قائمة البراندات */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="bg-white p-5 rounded-2xl flex justify-between items-center gap-10 border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#1a365d] flex items-center gap-3">
              مدرسة ستانفورد - 2284
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-0.5 rounded-full text-xs font-bold">
                نشط
              </span>
            </h2>
          </div>
          <div className="flex gap-6 items-center">
            <p className="text-sm font-medium text-slate-500">1 كولكشن</p>
            <Link
              to={"/customer_service/edit_brands/1"}
              className="rounded-lg bg-slate-100 border border-slate-200 px-6 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              فتح
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* مودال 1: إضافة براند جديد (Capture.PNG) */}
      {/* ========================================================== */}
      {isAddModalOpen && (
        <AddNewBrand
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}

      {/* ========================================================== */}
      {/* مودال 2: تعديل مدرسة ستانفورد (Capture1.PNG) */}
      {/* ========================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[999] overflow-y-auto">
          {/* حاوية المودال بلون رمادي فاتح عشان الكروت البيضاء تظهر جواها */}
          <div className="w-full max-w-6xl my-8 flex flex-col gap-6">
            {/* الكارت الأول: تعديل البراند */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="mb-6 flex justify-between items-start">
                <div className="text-right flex-1">
                  <h2 className="text-2xl font-bold text-[#1a365d] mb-1">
                    تعديل: مدرسة ستانفورد
                  </h2>
                  <p className="text-sm text-slate-500">
                    اسم البراند بالعربية وكود البراند مطلوبين على الأقل. باقي
                    البيانات بتتسحب تلقائياً لأي كولكشن جديد.
                  </p>
                </div>
                {/* شارة الحالة على اليسار */}
                <div className="mr-auto">
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold">
                    نشط
                  </span>
                </div>
              </div>

              <form className="space-y-6 text-right">
                {/* اللوجو */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    لوجو البراند
                  </label>
                  <div className="border-2 border-dashed border-[#1a365d] rounded-xl py-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                    <p className="text-sm text-slate-500">
                      اضغط لرفع لوجو البراند
                    </p>
                  </div>
                </div>

                {/* الصف الأول */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      اسم البراند بالعربية *
                    </label>
                    <input
                      type="text"
                      defaultValue="مدرسة ستانفورد"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      الاسم بالإنجليزية
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      كود البراند
                    </label>
                    <input
                      type="text"
                      defaultValue="2284"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      اسم العميل / الشركة المالكة
                    </label>
                    <input
                      type="text"
                      defaultValue="مدرسة ستانفورد"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      مسؤول التواصل
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* الصف الثاني */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      واتساب
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      نوع النشاط
                    </label>
                    <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                      <option>يونيفورم</option>
                      <option>أطفال</option>
                      <option>حريمي</option>
                      <option>رجالي</option>
                    </select>
                  </div>
                </div>

                {/* الصف الثالث */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      الحالة
                    </label>
                    <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                      <option>نشط</option>
                      <option>متوقف</option>
                    </select>
                  </div>
                </div>

                {/* الملاحظات */}
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    rows="4"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-8 py-2.5 rounded-lg text-sm font-bold text-[#b91c1c] border border-[#b91c1c] hover:bg-red-50 transition"
                  >
                    أرشفة البراند
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-[#b91c1c] hover:bg-red-800 transition"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>
            </div>

            {/* الكارت الثاني: الكولكشنات المرتبطة */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1a365d]">
                  الكولكشنات المرتبطة (1)
                </h3>
                <button className="px-5 py-2 rounded-lg text-sm font-bold text-[#1a365d] border border-[#1a365d] hover:bg-blue-50 transition">
                  + كولكشن جديد لهذا البراند
                </button>
              </div>

              {/* عنصر الكولكشن */}
              <div className="border border-slate-200 rounded-xl p-5 flex justify-between items-center bg-slate-50/50">
                <div className="text-right">
                  <h4 className="font-bold text-[#1a365d] text-lg">كولكشن 1</h4>
                  <p className="text-sm text-slate-500 mt-1">صيف 2026</p>
                </div>
                <div>
                  <button className="px-8 py-2 rounded-lg text-sm font-bold text-[#1a365d] border border-[#1a365d] hover:bg-blue-50 transition bg-white">
                    فتح
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
