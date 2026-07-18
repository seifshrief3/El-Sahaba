import React from "react";
import { Link } from "react-router-dom";

const EditBrands = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* زرار العودة للبراندات */}
        <div className="flex justify-start">
          <Link
            to="/customer_service/brands"
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
                تعديل: مدرسة ستانفورد
              </h2>
              <p className="text-sm text-slate-500">
                اسم البراند بالعربية وكود البراند مطلوبين على الأقل. باقي
                البيانات بتتسحب تلقائياً لأي كولكشن جديد.
              </p>
            </div>
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
                <p className="text-sm text-slate-500">اضغط لرفع لوجو البراند</p>
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
            <button
              type="button"
              className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-[#b91c1c] hover:bg-red-800 transition"
            >
              حفظ التعديلات
            </button>
          </form>
        </div>

        {/* الكارت الثاني: الكولكشنات المرتبطة */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1a365d]">
              الكولكشنات المرتبطة (1)
            </h3>
          </div>

          {/* عنصر الكولكشن */}
          <div className="border border-slate-200 rounded-xl p-5 flex justify-between items-center bg-slate-50/50">
            <div className="text-right">
              <h4 className="font-bold text-[#1a365d] text-lg">كولكشن 1</h4>
              <p className="text-sm text-slate-500 mt-1">صيف 2026</p>
            </div>
            <div>
              <Link
                to={"/customer_service/edit_collection/2"}
                className="px-8 py-2 rounded-lg text-sm font-bold text-[#1a365d] border border-[#1a365d] hover:bg-blue-50 transition bg-white"
              >
                فتح
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBrands;
