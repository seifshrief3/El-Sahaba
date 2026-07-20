import React from "react";

const ShowExtraDetails = () => {
  return (
    <div className="bg-[#f8fafc] w-full rounded-xl border border-slate-200 p-4 sm:p-6 my-2 shadow-inner">
      {/* الصف الأول */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            كود الكولكشن
          </label>
          <input
            type="text"
            defaultValue="COL-mrm379tgzsa6b"
            readOnly
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-right sm:text-center focus:outline-none text-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center line-clamp-1">
            اسم العميل (مسحوب من البراند)
          </label>
          <input
            type="text"
            defaultValue="مدرسة ستانفورد"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            كود العميل
          </label>
          <input
            type="text"
            defaultValue="6564"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            تليفون العميل
          </label>
          <input
            type="text"
            defaultValue="6546"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            إيميل العميل
          </label>
          <input
            type="text"
            defaultValue="hgfhf"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* الصف الثاني */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            نوع المنتج
          </label>
          <input
            type="text"
            defaultValue="hfghf"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center line-clamp-1">
            المقاسات العامة
          </label>
          <input
            type="text"
            defaultValue="656"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            الكمية المتوقعة
          </label>
          <input
            type="text"
            defaultValue="5646"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            نسبة العربون %
          </label>
          <input
            type="text"
            defaultValue="5646"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            أولوية الكولكشن
          </label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
            <option>عادي</option>
            <option>عاجل</option>
          </select>
        </div>
      </div>

      {/* الصف الثالث */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            حالة الكولكشن
          </label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
            <option>مسودة</option>
            <option>قيد الاعداد</option>
            <option>بيانات مكتملة</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2 text-right sm:text-center">
            حالة اعتماد البيانات
          </label>
          <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right sm:text-center focus:outline-none focus:border-blue-500 bg-white">
            <option>لم يعتمد بعد</option>
            <option>معتمد جزئيا</option>
            <option>معتمد بالكامل</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShowExtraDetails;
