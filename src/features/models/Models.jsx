import React, { useState, useEffect } from "react";
import CollectionDetails from "./CollectionDetails";
import { handleGetCollections } from "../../services/collectionsService"; // تأكد من مسار السيرفيس

const Models = () => {
  const [view, setView] = useState("list");

  // States للداتا
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // State عشان نشيل الكولكشن اللي تم اختياره بالكامل (مش اسمه بس)
  const [selectedCollection, setSelectedCollection] = useState(null);

  // جلب الكولكشنات أول ما الصفحة تفتح
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await handleGetCollections();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleOpenCollection = (collection) => {
    setSelectedCollection(collection);
    setView("details");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* شاشة قائمة الكولكشنات */}
        {view === "list" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <p className="text-sm text-slate-500">الموديلات</p>
              <h1 className="mt-2 text-2xl font-bold text-[#1a365d]">
                الوضع العام للموديلات
              </h1>
            </div>

            {loading ? (
              <div className="text-center p-10 font-bold text-[#1a365d]">
                جاري تحميل الكولكشنات...
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-xl border border-slate-200 text-slate-500 font-bold">
                لا يوجد كولكشنات حالية لعرض موديلاتها.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap gap-3 justify-between items-center transition hover:shadow-md"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-[#1a365d]">
                        {col.name}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span>
                          البراند: {col.brands?.name_ar || "غير محدد"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{col.models_count || 0} موديل</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenCollection(col)}
                      className="bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors"
                    >
                      فتح الكولكشن
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* شاشة تفاصيل الموديلات */}
        {view === "details" && selectedCollection && (
          <CollectionDetails
            collection={selectedCollection} // بعتنا الـ Object كله عشان نقدر نستخدم الـ ID جوه
            onBack={() => {
              setView("list");
              setSelectedCollection(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Models;
