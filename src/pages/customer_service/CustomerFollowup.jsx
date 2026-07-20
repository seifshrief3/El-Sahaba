import React, { useState } from "react";
import { Link } from "react-router-dom";

const CustomerFollowup = () => {
  // بيانات مبسطة تعكس اللوجيك الجديد (متابعة الموافقات)
  const [collectionsFollowup, setCollectionsFollowup] = useState([
    {
      id: "C-101",
      brandName: "مدرسة ستانفورد",
      brandCode: "STN-26",
      collectionName: "الزي المدرسي الشتوي",
      approvalStatus: "لم يتم الإرسال",
    },
    {
      id: "C-102",
      brandName: "شركة الأمل",
      brandCode: "AML-09",
      collectionName: "كولكشن صيف 2026",
      approvalStatus: "تم الإرسال",
    },
    {
      id: "C-103",
      brandName: "براند إيليت",
      brandCode: "ELT-44",
      collectionName: "تيشيرتات بولو موظفين",
      approvalStatus: "طلب تعديل",
    },
    {
      id: "C-104",
      brandName: "ستار كيدز",
      brandCode: "SKD-01",
      collectionName: "كولكشن أطفال خريفي",
      approvalStatus: "تمت الموافقة",
    },
  ]);

  // قائمة الحالات المتاحة (كما طلب العميل)
  const availableStatuses = [
    "لم يتم الإرسال",
    "تم الإرسال",
    "طلب تعديل",
    "تم التعديل",
    "تمت الموافقة",
  ];

  // دالة لتغيير حالة الموافقة
  const handleStatusChange = (id, newStatus) => {
    setCollectionsFollowup((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, approvalStatus: newStatus } : col,
      ),
    );
  };

  // دالة لتحديد لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "لم يتم الإرسال":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "تم الإرسال":
      case "تم التعديل":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "طلب تعديل":
        return "bg-red-50 text-red-700 border-red-200";
      case "تمت الموافقة":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* 1. العنوان */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-right">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-2">
                متابعة موافقات العملاء
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                تحديث حالة موافقة العميل على الـ Tech Pack وعرض السعر. لا يرسل
                إلى التخطيط إلا بعد "تمت الموافقة".
              </p>
            </div>
          </div>
        </div>

        {/* 2. شريط البحث والفلترة */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="ابحث باسم البراند أو الكولكشن..."
            className="w-full sm:flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white shadow-sm"
          />
          <select className="w-full sm:w-48 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 bg-white shadow-sm text-slate-700">
            <option>كل الحالات</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* 3. قائمة الكولكشنات ومتابعة الموافقة */}
        <div className="flex flex-col gap-4">
          {collectionsFollowup.map((collection) => (
            <div
              key={collection.id}
              className={`bg-white rounded-2xl border ${
                collection.approvalStatus === "تمت الموافقة"
                  ? "border-emerald-300 shadow-md"
                  : "border-slate-200 shadow-sm"
              } p-5 transition-all`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                {/* بيانات الكولكشن */}
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-[#1a365d] text-lg">
                      {collection.brandName}
                    </h3>
                    <span className="text-slate-400 text-sm">
                      #{collection.brandCode}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    كولكشن: {collection.collectionName}
                  </p>
                </div>

                {/* الحالة الحالية (Badges) */}
                <div>
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(
                      collection.approvalStatus,
                    )}`}
                  >
                    الحالة الحالية: {collection.approvalStatus}
                  </span>
                </div>
              </div>

              {/* أزرار تحديث الحالة (كما طلب العميل بدون كتابة يدوية) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-500 flex items-center ml-2">
                    تحديث الحالة:
                  </span>
                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(collection.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        collection.approvalStatus === status
                          ? "bg-[#1a365d] text-white border-[#1a365d]"
                          : "bg-white text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* زر إصدار أمر التشغيل (يظهر فقط عند الموافقة) */}
                <div className="w-full sm:w-auto flex justify-end">
                  {collection.approvalStatus === "تمت الموافقة" ? (
                    <Link
                      to={`/customer_service/start_order/${collection.id}`}
                      className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full sm:w-auto text-center flex items-center justify-center gap-2"
                    >
                      إصدار أمر التشغيل بالكميات ◀
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="bg-slate-100 text-slate-400 cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-bold w-full sm:w-auto"
                    >
                      أمر التشغيل مغلق
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerFollowup;
