import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 💡 تأكد من مسار الاستيراد بناءً على هيكل ملفاتك
import {
  handleGetCollections,
  handleUpdateCustomerApproval,
} from "../../services/collectionsService";

const CustomerFollowup = () => {
  const [collectionsFollowup, setCollectionsFollowup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("كل الحالات");

  // 1. خريطة الحالات لربط الواجهة بقاعدة البيانات (عمود customer_approval)
  const statusMapToDB = {
    "لم يتم الإرسال": "not_sent",
    "تم الإرسال": "sent",
    "طلب تعديل": "revision_requested",
    "تم التعديل": "revised",
    "تمت الموافقة": "approved",
  };

  const availableStatuses = Object.keys(statusMapToDB);

  // 2. جلب البيانات من الداتابيز
  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await handleGetCollections();

      const formattedData = data.map((col) => {
        // قراءة الحالة من عمود customer_approval وتحويلها للعربي
        const arabicStatus =
          Object.keys(statusMapToDB).find(
            (key) => statusMapToDB[key] === col.customer_approval,
          ) || "لم يتم الإرسال";

        return {
          id: col.id,
          brandName: col.brands?.name_ar || "غير محدد",
          // لو عندك كود للبراند في الداتابيز استخدمه، غير كده بناخد أول 4 حروف من الـ ID كشكل جمالي
          brandCode: `BR-${col.id.substring(0, 4).toUpperCase()}`,
          collectionName: col.name,
          approvalStatus: arabicStatus,
        };
      });
      setCollectionsFollowup(formattedData);
    } catch (error) {
      console.error("خطأ في جلب بيانات المتابعة:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // 3. دالة لتغيير حالة الموافقة (تحديث الواجهة والداتابيز)
  const handleStatusChange = async (id, newArabicStatus) => {
    const dbStatus = statusMapToDB[newArabicStatus];

    // التحديث الفوري في الواجهة (Optimistic Update)
    setCollectionsFollowup((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, approvalStatus: newArabicStatus } : col,
      ),
    );

    try {
      // إرسال التحديث لقاعدة البيانات
      await handleUpdateCustomerApproval(id, dbStatus);
    } catch (error) {
      console.error("Error updating customer approval:", error);
      alert("حدث خطأ أثناء تحديث حالة موافقة العميل، يرجى المحاولة مرة أخرى.");
      loadCollections(); // التراجع للحالة السابقة في حالة الخطأ
    }
  };

  // 4. دالة لتحديد لون الحالة
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

  // 5. فلترة البيانات بناءً على البحث والحالة
  const filteredCollections = collectionsFollowup.filter((col) => {
    const matchSearch =
      col.brandName.includes(searchTerm) ||
      col.collectionName.includes(searchTerm);
    const matchStatus =
      filterStatus === "كل الحالات"
        ? true
        : col.approvalStatus === filterStatus;
    return matchSearch && matchStatus;
  });

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
                الكولكشن إلى التخطيط إلا بعد "تمت الموافقة".
              </p>
            </div>
          </div>
        </div>

        {/* 2. شريط البحث والفلترة */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="ابحث باسم البراند أو الكولكشن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-white shadow-sm text-slate-700 font-bold"
          >
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
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-bold">
              جاري تحميل بيانات المتابعة...
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-bold">
              لا توجد كولكشنات متطابقة مع البحث.
            </div>
          ) : (
            filteredCollections.map((collection) => (
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
                      <span className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {collection.brandCode}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      كولكشن:{" "}
                      <span className="font-bold">
                        {collection.collectionName}
                      </span>
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

                {/* أزرار تحديث الحالة */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <span className="text-xs font-bold text-slate-500 flex items-center ml-2">
                      تحديث الحالة:
                    </span>
                    {availableStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(collection.id, status)
                        }
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
                  <div className="w-full xl:w-auto flex justify-end">
                    {collection.approvalStatus === "تمت الموافقة" ? (
                      <Link
                        to={`/customer_service/start_order/${collection.id}`}
                        className="bg-[#b91c1c] hover:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm w-full xl:w-auto text-center flex items-center justify-center gap-2"
                      >
                        إصدار أمر التشغيل بالكميات ◀
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-400 cursor-not-allowed px-6 py-2.5 rounded-lg text-sm font-bold w-full xl:w-auto"
                      >
                        أمر التشغيل مغلق
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFollowup;
