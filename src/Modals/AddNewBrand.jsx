import React from "react";

const AddNewBrand = ({ isAddModalOpen, setIsAddModalOpen }) => {
  return (
    // الخلفية الشفافة
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-3 sm:p-4 z-[999]">
      {/* المربع الأبيض للمودال (محكوم بأقصى ارتفاع 95% من الشاشة) */}
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-xl overflow-hidden">
        {/* 1. الهيدر (ثابت) */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-100 text-right bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1">
            إضافة براند جديد
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
            اسم البراند بالعربية وكود البراند مطلوبين على الأقل. باقي البيانات
            بتتسحب تلقائياً لأي كولكشن جديد.
          </p>
        </div>

        {/* 2. المحتوى (قابل للتمرير - Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-right scrollbar-thin scrollbar-thumb-slate-200">
          <form className="space-y-6">
            {/* اللوجو */}
            <div onClick={() => document.getElementById("fileInput").click()}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                لوجو البراند
              </label>
              <input type="file" className="hidden" id="fileInput" />
              <div className="border-2 border-dashed border-slate-300 rounded-xl py-6 sm:py-8 text-center cursor-pointer hover:bg-slate-50 transition">
                <p className="text-sm text-slate-500">اضغط لرفع لوجو البراند</p>
              </div>
            </div>

            {/* شبكة الحقول (تم تحسينها للموبايل) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  اسم البراند بالعربية *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* الحقول القصيرة تاخد عمود واحد في الموبايل */}
              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  كود البراند
                </label>
                <input
                  type="text"
                  defaultValue="7622"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  العميل / الشركة
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  مسؤول التواصل
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  واتساب
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  نوع النشاط
                </label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                  <option>أطفال</option>
                  <option>حريمي</option>
                  <option>رجالي</option>
                  <option>يونيفورم</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                  الحالة
                </label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                  <option>نشط</option>
                  <option>متوقف</option>
                </select>
              </div>
            </div>

            {/* الملاحظات */}
            <div>
              <label className="block text-xs sm:text-sm text-slate-600 mb-2">
                ملاحظات
              </label>
              <textarea
                rows="3"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* 3. الفوتر والأزرار (ثابت في الأسفل) */}
        <div className="shrink-0 p-5 sm:p-6 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 z-10">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-[#b91c1c] border border-[#b91c1c] hover:bg-red-50 transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-white bg-[#b91c1c] hover:bg-red-800 transition"
          >
            حفظ البراند
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewBrand;
