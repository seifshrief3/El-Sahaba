import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  Package,
  Clock,
  CheckCircle,
  Activity,
  Shirt,
  ImageIcon,
  Calendar,
  ChevronLeft,
  AlertCircle,
  FileText,
  Factory,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const [clientBrand, setClientBrand] = useState(null);
  const [stats, setStats] = useState({
    collectionsCount: 0,
    modelsCount: 0,
    activeOrdersCount: 0,
    totalInventory: 0,
  });
  const [recentCollections, setRecentCollections] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: brandData, error: brandError } = await supabase
          .from("brands")
          .select("*")
          .eq("client_portal_user_id", user.id)
          .single();

        if (brandError || !brandData) throw brandError;
        setClientBrand(brandData);

        const brandId = brandData.id;

        const { data: collectionsData, error: collError } = await supabase
          .from("collections")
          .select(
            `
            id,
            name,
            customer_approval,
            created_at,
            production_orders ( status ),
            models ( id, name, model_number, image_url )
          `,
          )
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false });

        const { data: inventoryData, error: invError } = await supabase
          .from("inventory")
          .select(`available_qty, models!inner(id)`)
          .eq("models.collections.brand_id", brandId);

        const inventoryByModel = {};
        let totalPieces = 0;

        if (!invError && inventoryData) {
          inventoryData.forEach((item) => {
            const mId = item.models.id;
            const qty = item.available_qty || 0;
            if (!inventoryByModel[mId]) inventoryByModel[mId] = 0;
            inventoryByModel[mId] += qty;
            totalPieces += qty;
          });
        }

        if (!collError && collectionsData) {
          let activeOrders = 0;
          let totalModels = 0;
          let extractedModels = [];

          const formattedCollections = collectionsData.map((col) => {
            const orderStatus =
              col.production_orders?.[0]?.status || "no_order";
            const approval = col.customer_approval || "not_sent";

            if (
              orderStatus &&
              !["completed", "cancelled", "no_order"].includes(orderStatus)
            ) {
              activeOrders++;
            }

            const modelsInCollection = col.models || [];
            totalModels += modelsInCollection.length;

            modelsInCollection.forEach((m) => {
              extractedModels.push({
                ...m,
                collectionName: col.name,
                stock: inventoryByModel[m.id] || 0,
              });
            });

            // 💡 حساب مسار وتفاصيل الكولكشن (Live Tracking Logic)
            const tracking = getTrackingDetails(
              approval,
              orderStatus,
              col.created_at,
            );

            return {
              id: col.id,
              name: col.name,
              modelsCount: modelsInCollection.length,
              approval,
              orderStatus,
              tracking,
              date: new Date(col.created_at).toLocaleDateString("ar-EG"),
            };
          });

          setRecentCollections(formattedCollections);
          setAllModels(extractedModels);
          setStats({
            collectionsCount: collectionsData.length,
            modelsCount: totalModels,
            activeOrdersCount: activeOrders,
            totalInventory: totalPieces,
          });
        }
      } catch (error) {
        console.error("Error fetching client dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  // 💡 الدالة المسؤولة عن تحديد نسبة الإنجاز والخطوة القادمة وتاريخ التسليم
  const getTrackingDetails = (approval, orderStatus, createdAt) => {
    let progress = 0;
    let currentStage = "";
    let nextStage = "";
    let expectedDate = "يُحدد بعد الاعتماد";
    let colorClass = "bg-blue-600";

    if (orderStatus === "completed") {
      progress = 100;
      currentStage = "مكتمل ومسلم";
      nextStage = "لا يوجد (انتهى التشغيل)";
      expectedDate = "تم التسليم";
      colorClass = "bg-emerald-500";
    } else if (orderStatus === "cancelled") {
      progress = 100;
      currentStage = "التشغيل ملغي";
      nextStage = "التواصل مع الإدارة";
      expectedDate = "ملغي";
      colorClass = "bg-red-500";
    } else if (["in_progress", "on_hold", "pending"].includes(orderStatus)) {
      progress = 75;
      currentStage =
        orderStatus === "on_hold"
          ? "موقوف مؤقتاً في المصنع"
          : "قيد التشغيل بخطوط الإنتاج";
      nextStage = "الفحص النهائي والجودة (QC)";

      // حساب موعد تسليم افتراضي (بعد 30 يوم من الإنشاء كمثال)
      const date = new Date(createdAt);
      date.setDate(date.getDate() + 30);
      expectedDate = date.toLocaleDateString("ar-EG");
      colorClass = "bg-purple-600";
    } else if (approval === "approved") {
      progress = 50;
      currentStage = "تم اعتماد السعر والتصميمات";
      nextStage = "إصدار أمر التشغيل وبدء الإنتاج";
      expectedDate = "جاري الجدولة بالمصنع";
      colorClass = "bg-emerald-500";
    } else if (approval === "sent" || approval === "revised") {
      progress = 25;
      currentStage = "في انتظار موافقتك على العرض";
      nextStage = "مراجعة الـ Tech Pack وتأكيد الاعتماد من طرفك";
      colorClass = "bg-orange-500";
    } else {
      progress = 10;
      currentStage = "التجهيز (باترون - عينة - تسعير)";
      nextStage = "إرسال عرض السعر للمراجعة";
      colorClass = "bg-[#1a365d]";
    }

    return { progress, currentStage, nextStage, expectedDate, colorClass };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-arabic bg-slate-50">
        <div className="text-[#1a365d] font-bold text-xl animate-pulse">
          جاري تحميل بيانات {clientBrand?.name_ar || "البراند"}...
        </div>
      </div>
    );
  }

  if (!clientBrand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-arabic bg-slate-50 gap-4">
        <h2 className="text-2xl font-bold text-slate-700">
          لم يتم العثور على براند مرتبط بحسابك.
        </h2>
        <button onClick={onLogout} className="text-red-600 font-bold underline">
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-arabic" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center px-4 md:px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#1a365d]">
            مرحباً، {clientBrand.name_ar}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            بوابة تتبع التشغيل الخاصة بك
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />{" "}
          <span className="hidden md:inline">تسجيل الخروج</span>
        </button>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* كروت الإحصائيات (مختصرة وسريعة) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition">
            <div className="flex items-center gap-3 text-blue-600">
              <Package size={22} />
              <p className="text-sm font-bold text-slate-500">كولكشنات</p>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {stats.collectionsCount}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition">
            <div className="flex items-center gap-3 text-purple-600">
              <Shirt size={22} />
              <p className="text-sm font-bold text-slate-500">موديلات</p>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {stats.modelsCount}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition">
            <div className="flex items-center gap-3 text-orange-600">
              <Factory size={22} />
              <p className="text-sm font-bold text-slate-500">أوامر بالإنتاج</p>
            </div>
            <p className="text-2xl font-black text-slate-800">
              {stats.activeOrdersCount}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle size={22} />
              <p className="text-sm font-bold text-slate-500">الرصيد المتاح</p>
            </div>
            <p className="text-2xl font-black text-emerald-700">
              {stats.totalInventory.toLocaleString()}{" "}
              <span className="text-xs">قطعة</span>
            </p>
          </div>
        </div>

        {/* 💡 التحديث الجديد: كروت تتبع الكولكشنات (Live Tracking) بدل الجدول */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
            <Activity size={22} className="text-slate-400" /> مسار الإنتاج
            والتتبع الحي
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentCollections.length > 0 ? (
              recentCollections.map((col) => (
                <div
                  key={col.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* رأس الكارت */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 mb-1">
                        {col.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <FileText size={14} /> يحتوي على {col.modelsCount} موديل
                      </p>
                    </div>
                    <div className="text-left bg-slate-50 border border-slate-100 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">
                        تاريخ البدء
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {col.date}
                      </p>
                    </div>
                  </div>

                  {/* شريط التقدم (Progress Bar) */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>التجهيز</span>
                      <span>الاعتماد</span>
                      <span>الإنتاج</span>
                      <span>التسليم</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                      <div
                        className={`${col.tracking.colorClass} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${col.tracking.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#1a365d]">
                        {col.tracking.progress}% مكتمل
                      </span>
                      {col.tracking.progress < 100 &&
                        col.tracking.progress > 0 && (
                          <span className="text-orange-600 font-bold animate-pulse flex items-center gap-1">
                            <Clock size={12} /> العمل جاري
                          </span>
                        )}
                    </div>
                  </div>

                  {/* تفاصيل المرحلة والمطلوب */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="text-emerald-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">
                          الحالة الحالية
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {col.tracking.currentStage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                      <AlertCircle
                        size={18}
                        className="text-orange-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">
                          الخطوة القادمة (المطلوب)
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {col.tracking.nextStage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                      <Calendar
                        size={18}
                        className="text-blue-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-400 font-bold">
                          التسليم المتوقع
                        </p>
                        <p className="text-sm font-black text-blue-700">
                          {col.tracking.expectedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
                لا توجد كولكشنات تحت الإنشاء حالياً.
              </div>
            )}
          </div>
        </div>

        {/* قسم معرض الموديلات */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
            <Shirt size={22} className="text-slate-400" /> موديلات البراند (معرض
            الصور)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allModels.length > 0 ? (
              allModels.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    {model.image_url ? (
                      <img
                        src={model.image_url}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <ImageIcon size={40} className="text-slate-300" />
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm border border-slate-200">
                      <p className="text-xs font-bold text-slate-700">
                        {model.model_number}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 truncate mb-1">
                      {model.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-4 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                      {model.collectionName}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">
                        المتاح بالمخزن:
                      </span>
                      <span
                        className={`text-sm font-black ${model.stock > 0 ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {model.stock} قطعة
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
                لا توجد صور لموديلات حتى الآن.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
