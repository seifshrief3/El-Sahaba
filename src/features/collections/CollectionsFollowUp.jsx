import React, { useState } from "react";

// مكون لشارة الحالة (Badge)
const StatusBadge = ({ text, color }) => {
  const colorMap = {
    green: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    blue: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colorMap[color] || colorMap.blue}`}
    >
      {text}
    </span>
  );
};

const CollectionsFollowUp = () => {
  // حالة لعرض/إخفاء متابعة الموديلات
  const [showModels, setShowModels] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      {/* 1. بطاقة عنوان الصفحة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 text-right">
        <h1 className="text-xl font-bold text-slate-800">متابعة الكولكشنات</h1>
        <p className="text-sm text-slate-500 mt-1">
          بيظهر هنا الكولكشنات اللي صدر لها أمر تشغيل بس. افتح "متابعة
          الموديلات" لتعليم حالة كل مرحلة تشغيلية.
        </p>
      </div>

      {/* 2. بطاقة ملخص الكولكشن */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* تفاصيل الكولكشن (اليمين) */}
        <div className="flex-1 text-right">
          <h2 className="text-xl font-bold text-slate-900">كولكشن 1</h2>
          <p className="text-sm text-slate-500 mt-1 mb-2">
            مدرسة ستانفورد - العميل يستلم: 2026/08/05
          </p>
          <StatusBadge text="يسير حسب الخطة" color="green" />
        </div>

        {/* صناديق البيانات (الوسط) */}
        <div className="flex items-center justify-center gap-4 bg-slate-50 rounded-xl p-3">
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-blue-900">
              33<span className="text-base">%</span>
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">الإنجاز</p>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-blue-900">20</p>
            <p className="text-xs font-medium text-slate-500 mt-1">يوم متبقي</p>
          </div>
        </div>

        {/* الزر الأحمر (اليسار) */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#b91c1c] text-white text-sm font-bold transition hover:bg-red-800"
          >
            {showModels ? "إخفاء متابعة الموديلات" : "متابعة الموديلات ◀"}
          </button>
        </div>
      </div>

      {/* 3. بطاقة أمر التشغيل */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 relative">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-bold text-slate-900">أمر التشغيل</h2>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge text="قيد التشغيل" color="green" />
          </div>
        </div>

        {/* صناديق البيانات في أمر التشغيل */}
        <div className="flex flex-col md:flex-row bg-slate-50 rounded-xl p-6 gap-6 justify-between items-center">
          <div className="flex-1 text-center border-l border-slate-200 last:border-l-0 pl-6">
            <p className="text-2xl font-bold text-blue-900">
              1<span className="text-lg">%</span>
            </p>
            <p className="text-xs font-medium text-slate-500 mt-2">
              نسبة الإنجاز (من مراحل التشغيل)
            </p>
          </div>
          <div className="flex-1 text-center border-l border-slate-200 last:border-l-0 pl-6">
            <p className="text-xl font-bold text-blue-900">
              تم استلام البيانات
            </p>
            <p className="text-xs font-medium text-slate-500 mt-2">
              المرحلة الحالية
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xl font-bold text-blue-900">2026/08/05</p>
            <p className="text-xs font-medium text-slate-500 mt-2">
              الموعد المتوقع
            </p>
          </div>
        </div>
      </div>

      {/* 4. بطاقة صفحة المتابعة التشغيلية (تظهر عند الضغط على الزر) */}
      {showModels && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-blue-900">
              صفحة المتابعة التشغيلية
            </h2>
            <StatusBadge text="24% مكتمل تشغيلياً" color="blue" />
          </div>

          {/* تفاصيل الموديل والصورة */}
          <div className="flex justify-between items-center border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div className="text-right">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
                موديل 3{" "}
                <span className="text-sm font-normal text-slate-500">
                  #2286
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">المقاسات: --</p>
              <p className="text-xs text-slate-500 mt-1">الخامة: --</p>
              <p className="text-xs font-medium text-slate-700 mt-2">
                المرحلة الحالية:{" "}
                <span className="text-slate-600 font-normal">
                  تم تجهيز الملف الفني
                </span>
              </p>
            </div>

            {/* مربع الصورة البديل للأيقونة */}
            <div className="w-20 h-20 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
              <span className="text-slate-400 text-xs">صورة</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 1, text: "تم استلام البيانات", status: "تم" },
              { id: 2, text: "تم اعتماد الصورة", status: "تم" },
              { id: 3, text: "تم توليد التيك باك", status: "تم" },
              { id: 4, text: "تم مراجعة التخطيط", status: "تم" },
              { id: 5, text: "تم تجهيز الملف الفني", status: "غير بدأ" },
              { id: 6, text: "تم إرسال للتسعير", status: "غير بدأ" },
              { id: 7, text: "تم اعتماد التسعير", status: "غير بدأ" },
              { id: 8, text: "تم بدء العينة", status: "غير بدأ" },
              { id: 9, text: "تم اعتماد العينة", status: "غير بدأ" },
              { id: 10, text: "تم بدء التنفيذ", status: "غير بدأ" },
              { id: 11, text: "تم القص", status: "غير بدأ" },
              { id: 12, text: "تم الطباعة / التطريز", status: "غير بدأ" },
              { id: 13, text: "تم الخياطة", status: "غير بدأ" },
              { id: 14, text: "تم التشطيب", status: "غير بدأ" },
              { id: 15, text: "تم التعبئة", status: "غير بدأ" },
              { id: 16, text: "تم التجهيز للشحن", status: "غير بدأ" },
              { id: 17, text: "تم التسليم", status: "غير بدأ" },
            ].map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    {step.id}. {step.text}
                  </p>
                </div>

                {/* القائمة المنسدلة للخيارات الـ 5 */}
                <select
                  defaultValue={step.status}
                  className="w-32 px-2 py-1.5 rounded bg-white text-xs font-medium border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  dir="rtl"
                >
                  <option value="غير بدأ">غير بدأ</option>
                  <option value="جاري">جاري</option>
                  <option value="تم">تم</option>
                  <option value="متوقف">متوقف</option>
                  <option value="يوجد ملاحظة">يوجد ملاحظة</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsFollowUp;
