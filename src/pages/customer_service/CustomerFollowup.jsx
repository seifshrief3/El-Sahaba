import React, { useState } from "react";
import { Link } from "react-router-dom";

const CustomerFollowup = () => {
  // بيانات مبسطة
  const [brandsFollowup] = useState([
    {
      id: "2284",
      name: "مدرسة ستانفورد",
      phase: "جاري القص والتنفيذ",
      status: "يسير حسب الخطة",
      isUrgent: false,
      btnText: "إرسال تحديث",
    },
    {
      id: "7622",
      name: "شركة الأمل",
      phase: "في انتظار اعتماد السعر",
      status: "متوقف على العميل",
      isUrgent: true,
      btnText: "تذكير بالاعتماد",
    },
    {
      id: "8890",
      name: "براند إيليت",
      phase: "الطباعة والتطريز",
      status: "متأخر عن الموعد",
      isUrgent: true,
      btnText: "تواصل عاجل",
    },
  ]);

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* 1. العنوان المبسط */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-right">
          <h1 className="text-lg sm:text-xl font-bold text-[#1a365d] mb-2">
            متابعة العملاء (البراندات)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            متابعة سريعة لحالة كل براند والإجراءات المطلوبة للتواصل.
          </p>
        </div>

        {/* 2. شريط البحث والفلترة - متجاوب */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="ابحث باسم البراند أو الكود..."
            className="w-full sm:flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white shadow-sm"
          />
          <select className="w-full sm:w-48 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white shadow-sm text-slate-700">
            <option>كل الحالات</option>
            <option>يحتاج تدخل</option>
            <option>حسب الخطة</option>
          </select>
        </div>

        {/* 3. قائمة البراندات */}
        <div className="flex flex-col gap-4">
          {brandsFollowup.map((brand, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:bg-slate-50 transition"
            >
              {/* بيانات البراند (يمين) */}
              <div className="w-full md:flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#1a365d] text-base sm:text-lg">
                    {brand.name}
                  </h3>
                  <span className="text-slate-400 text-xs sm:text-sm">
                    #{brand.id}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  المرحلة:{" "}
                  <span className="font-medium text-slate-700">
                    {brand.phase}
                  </span>
                </p>
              </div>

              {/* الحالة (وسط) */}
              <div className="w-full md:w-auto text-right md:text-center">
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${
                    brand.isUrgent
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {brand.status}
                </span>
              </div>

              {/* أزرار الإجراء */}
              <div className="w-full md:w-auto flex gap-3 mt-2 md:mt-0">
                <Link
                  to={`/customer_service/edit_brands/${brand.id}`}
                  className="flex-1 md:flex-none text-center text-[#1a365d] border border-[#1a365d] hover:bg-slate-100 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
                >
                  الملف
                </Link>
                <button
                  className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-colors text-white ${
                    brand.isUrgent
                      ? "bg-[#b91c1c] hover:bg-red-800"
                      : "bg-[#1a365d] hover:bg-blue-900"
                  }`}
                >
                  {brand.btnText} ◀
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerFollowup;
