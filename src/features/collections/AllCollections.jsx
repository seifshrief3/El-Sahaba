import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { handleGetCollections } from "../../services/collectionsService";
import DownloadPDFButton from "../../components/DownloadPDFButton";

const AllCollections = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    handleGetCollections().then((data) => {
      setCollections(data);
    });
  }, []);

  // 1. دالة حساب الأيام المتبقية أو التأخير
  const getTimeStatus = (deliveryDate, status) => {
    // لو مفيش تاريخ تسليم
    if (!deliveryDate) {
      return { text: "غير محدد", color: "text-slate-500", bg: "bg-slate-100" };
    }

    // لو الكولكشن اتسلم خلاص
    if (status === "completed") {
      return {
        text: "تم التسليم",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
      };
    }

    // لو ملغي
    if (status === "cancelled") {
      return { text: "ملغي", color: "text-slate-500", bg: "bg-slate-100" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // تصفير الوقت عشان نحسب الأيام بس بدقة

    const targetDate = new Date(deliveryDate);
    targetDate.setHours(0, 0, 0, 0);

    // حساب الفرق بالميللي ثانية وتحويله لأيام
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        text: `متبقي ${diffDays} يوم`,
        color: "text-[#92400e]",
        bg: "bg-amber-50",
      };
    } else if (diffDays === 0) {
      return {
        text: "التسليم اليوم!",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    } else {
      // لو الرقم بالسالب (تأخير)
      return {
        text: `متأخر ${Math.abs(diffDays)} يوم`,
        color: "text-[#b91c1c]",
        bg: "bg-red-50",
      };
    }
  };

  // 2. دالة حساب نسبة الاستكمال (مبنية على الداتا المتاحة)
  const calculateProgress = (collection) => {
    // لو مكتمل يبقى 100%
    if (collection.status === "completed") return 100;
    // لو ملغي مفيش نسبة
    if (collection.status === "cancelled") return 0;

    let progress = 0;

    // 10% لو مسودة
    if (collection.status === "draft") progress = 10;

    // 30% لو نشط
    if (collection.status === "active") progress = 30;

    // بنزود 20% لو تم اعتماد البيانات
    if (collection.data_approval_status === "approved") progress += 20;

    // بنزود بناءً على عدد الموديلات (لو دخل موديلات يبقى شغال)
    if (collection.models_count > 0) progress += 20;

    // دي مجرد حسبة مبدئية، ولما تربط باقي الجداول هتقدر تخليها أدق
    // (مثلاً: كمية المنتجة فعلياً / الكمية المطلوبة * 100)

    return progress;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* ========================================================= */}
        {/* 1. الهيدر */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-slate-500">الكولكشنات</p>
              <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#1a365d]">
                كل الكولكشنات
              </h1>
            </div>
            <Link
              to="/customer_service/add_collection"
              className="rounded-lg bg-[#b91c1c] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-800 text-center w-full sm:w-auto block"
            >
              + إنشاء كولكشن جديد
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. قائمة الكولكشنات */}
        {/* ========================================================= */}
        {collections.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-slate-200 text-slate-500 font-bold">
            لا يوجد كولكشنات حالية
          </div>
        ) : (
          collections.map((collection) => (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-5 sm:gap-6 hover:shadow-md transition">
              {/* بيانات الكولكشن (اليمين) */}
              <div className="text-right">
                <h2 className="text-lg sm:text-xl font-bold text-[#1a365d] mb-2 sm:mb-1">
                  {collection.name}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    {collection.brands.name_ar}
                  </span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-100">
                    يسير حسب الخطة
                  </span>
                </div>
              </div>

              {/* الإحصائيات والأزرار (اليسار/الأسفل) */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 w-full md:w-auto">
                {/* الإحصائيات */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm w-full lg:w-auto bg-slate-50 lg:bg-transparent p-3 lg:p-0 rounded-lg border lg:border-none border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1a365d]">
                      {collection.models_count}
                    </span>
                    <span className="text-slate-500">موديل</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1a365d]">
                      {calculateProgress(collection)}%
                    </span>
                    <span className="text-slate-500 text-sm">استكمال</span>
                  </div>

                  <span className="text-slate-300 hidden sm:inline">•</span>

                  {/* دمجنا الألوان اللي راجعة من الـ Function هنا */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                      getTimeStatus(collection.delivery_date, collection.status)
                        .bg
                    } ${
                      getTimeStatus(collection.delivery_date, collection.status)
                        .color
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm">
                      {
                        getTimeStatus(
                          collection.delivery_date,
                          collection.status,
                        ).text
                      }
                    </span>
                  </div>
                </div>

                {/* الأزرار */}
                {/* الأزرار بعد التعديل */}
                <div className="flex items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-none border-slate-100">
                  {/* هنا استخدمنا الكومبوننت الجديد وبعتناله الكولكشن */}
                  <DownloadPDFButton collection={collection} />

                  <Link
                    to={`/customer_service/edit_collection/${collection.id}`}
                    className="flex-1 lg:flex-none rounded-lg bg-[#b91c1c] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-red-800 text-center"
                  >
                    فتح ◀
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllCollections;
