import React, { useState } from "react";

const AllBrands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // التحكم في التبويبات

  // داتا وهمية للبراندات مضاف إليها "السجل الزمني" التفصيلي
  const brandsData = [
    {
      id: "B-2284",
      name: "مدرسة ستانفورد",
      code: "STN-26",
      contactPerson: "أ. أحمد محمود",
      phone: "01012345678",
      address: "التجمع الخامس، القاهرة",
      activity: "زي مدرسي - أطفال",
      status: "نشط",
      lastUpdates: [
        { date: "اليوم 10:30 ص", text: "إصدار أمر تشغيل لكولكشن الزي الشتوي" },
        {
          date: "منذ يومين",
          text: "موافقة العميل على عرض السعر والـ Tech Pack",
        },
      ],
      stats: { totalCollections: 12, activeOrders: 2, totalPieces: 15400 },
      history: [
        {
          id: "C-105",
          name: "الزي الشتوي 2026",
          date: "2026-07-20",
          status: "جاري التنفيذ",
        },
        {
          id: "C-101",
          name: "الزي الصيفي 2026",
          date: "2026-02-15",
          status: "تم التسليم",
        },
      ],
      timeline: [
        {
          date: "20 يوليو 2026",
          time: "10:30 ص",
          type: "action",
          title: "إصدار أمر تشغيل",
          desc: "تم إصدار أمر تشغيل لكولكشن الزي الشتوي (10 سريهات).",
          user: "خدمة العملاء",
        },
        {
          date: "18 يوليو 2026",
          time: "02:15 م",
          type: "approval",
          title: "اعتماد العميل",
          desc: "تم اعتماد عرض السعر والورقة الفنية (Tech Pack).",
          user: "النظام",
        },
        {
          date: "15 يوليو 2026",
          time: "11:00 ص",
          type: "creation",
          title: "إنشاء كولكشن جديد",
          desc: "تم إضافة كولكشن الزي الشتوي (5 موديلات).",
          user: "أحمد المبيعات",
        },
        {
          date: "10 أبريل 2026",
          time: "04:00 م",
          type: "shipping",
          title: "تسليم شحنة",
          desc: "تم تسليم الشحنة النهائية لكولكشن الزي الصيفي للعميل.",
          user: "قسم الشحن",
        },
        {
          date: "01 يناير 2026",
          time: "09:00 ص",
          type: "creation",
          title: "إنشاء ملف البراند",
          desc: "تم تسجيل بيانات مدرسة ستانفورد في النظام.",
          user: "مدير النظام",
        },
      ],
    },
    {
      id: "B-8890",
      name: "براند إيليت",
      code: "ELT-44",
      contactPerson: "م. طارق سعيد",
      phone: "01198765432",
      address: "مدينة نصر، القاهرة",
      activity: "كاجوال - رجالي",
      status: "نشط",
      lastUpdates: [
        { date: "منذ أسبوع", text: "إنشاء كولكشن تيشيرتات بولو" },
        { date: "منذ أسبوعين", text: "تسليم شحنة كولكشن الصيف" },
      ],
      stats: { totalCollections: 5, activeOrders: 1, totalPieces: 4200 },
      history: [
        {
          id: "C-108",
          name: "تيشيرتات بولو",
          date: "2026-07-10",
          status: "قيد التسعير",
        },
      ],
      timeline: [
        {
          date: "10 يوليو 2026",
          time: "01:00 م",
          type: "creation",
          title: "إنشاء كولكشن",
          desc: "تم إنشاء كولكشن تيشيرتات بولو وهو الآن قيد التسعير.",
          user: "خدمة العملاء",
        },
        {
          date: "15 مارس 2025",
          time: "10:00 ص",
          type: "creation",
          title: "إنشاء ملف البراند",
          desc: "تم تسجيل براند إيليت في النظام.",
          user: "مدير النظام",
        },
      ],
    },
  ];

  const openModal = (brand) => {
    setSelectedBrand(brand);
    setActiveTab("overview"); // دايما يفتح على النظرة العامة
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  // دالة لتحديد لون أيقونة السجل الزمني بناءً على نوع الحدث
  const getTimelineIconStyle = (type) => {
    switch (type) {
      case "creation":
        return "bg-blue-100 border-blue-500 text-blue-500";
      case "approval":
        return "bg-emerald-100 border-emerald-500 text-emerald-500";
      case "action":
        return "bg-red-100 border-[#b91c1c] text-[#b91c1c]";
      case "shipping":
        return "bg-slate-100 border-slate-700 text-slate-700";
      default:
        return "bg-slate-100 border-slate-300";
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-arabic relative"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* العنوان وشريط البحث */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a365d] mb-1">
              سجل البراندات
            </h1>
            <p className="text-sm text-slate-500">
              إدارة ومتابعة نشاط العملاء.
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="ابحث باسم البراند أو الكود..."
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1a365d] bg-slate-50"
            />
          </div>
        </div>

        {/* شبكة كروت البراندات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandsData.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${brand.status === "نشط" ? "bg-[#1a365d]" : "bg-slate-300"}`}
              ></div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xl font-black text-[#1a365d] shadow-sm">
                      {brand.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1a365d] leading-tight mb-1">
                        {brand.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono tracking-wider">
                          {brand.code}
                        </span>
                        <span>•</span>
                        <span className="line-clamp-1">{brand.activity}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${brand.status === "نشط" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                  >
                    {brand.status}
                  </span>
                </div>

                <hr className="border-slate-100 mb-5" />

                <div className="mb-6 flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
                    أحدث الإجراءات
                  </p>
                  <div className="space-y-4">
                    {brand.lastUpdates.map((update, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b91c1c] shrink-0"></div>
                        <div>
                          <p className="text-xs font-medium text-slate-700 leading-relaxed mb-0.5">
                            {update.text}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {update.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openModal(brand)}
                  className="w-full bg-slate-50 text-[#1a365d] border border-slate-200 hover:border-[#1a365d] hover:bg-[#1a365d] hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center mt-auto"
                >
                  فتح ملف البراند
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================= */}
      {/* الـ Modal الخاص بتفاصيل البراند */}
      {/* ======================================= */}
      {isModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border border-slate-200">
            {/* هيدر الـ Modal */}
            <div className="flex justify-between items-center p-5 sm:p-6 bg-[#1a365d] text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-xl font-black">
                  {selectedBrand.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedBrand.name}</h2>
                  <p className="text-xs text-blue-200 mt-1">
                    الكود:{" "}
                    <span className="font-mono">{selectedBrand.code}</span> |
                    النشاط: {selectedBrand.activity}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-[#b91c1c] text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* نظام التبويبات (Tabs) */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === "overview" ? "border-[#b91c1c] text-[#1a365d]" : "border-transparent text-slate-500 hover:text-[#1a365d]"}`}
              >
                نظرة عامة والكولكشنات
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-4 px-6 text-sm font-bold transition-colors border-b-2 ${activeTab === "timeline" ? "border-[#b91c1c] text-[#1a365d]" : "border-transparent text-slate-500 hover:text-[#1a365d]"}`}
              >
                السجل الزمني (الأنشطة)
              </button>
            </div>

            {/* محتوى الـ Modal المتغير بناءً على التبويب */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
              {/* تبويب النظرة العامة */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                      <p className="text-slate-500 text-xs font-bold mb-1">
                        إجمالي الكولكشنات
                      </p>
                      <p className="text-2xl font-black text-[#1a365d]">
                        {selectedBrand.stats.totalCollections}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                      <p className="text-slate-500 text-xs font-bold mb-1">
                        كولكشنات نشطة
                      </p>
                      <p className="text-2xl font-black text-[#b91c1c]">
                        {selectedBrand.stats.activeOrders}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                      <p className="text-slate-500 text-xs font-bold mb-1">
                        إجمالي القطع المسلمة
                      </p>
                      <p className="text-2xl font-black text-[#1a365d]">
                        {selectedBrand.stats.totalPieces.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                      بيانات التواصل
                    </h3>
                    <div className="space-y-4 text-sm text-right">
                      <div>
                        <span className="block text-slate-400 text-[11px] mb-1">
                          المسؤول
                        </span>
                        <span className="font-bold text-slate-700">
                          {selectedBrand.contactPerson}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[11px] mb-1">
                          الهاتف / واتساب
                        </span>
                        <span className="font-bold text-slate-700" dir="ltr">
                          {selectedBrand.phone}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[11px] mb-1">
                          العنوان
                        </span>
                        <span className="font-bold text-slate-700">
                          {selectedBrand.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                      سجل الكولكشنات
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3 font-semibold">
                              الكولكشن
                            </th>
                            <th className="py-3 px-3 font-semibold">التاريخ</th>
                            <th className="py-3 px-3 font-semibold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedBrand.history.map((col, idx) => (
                            <tr key={idx}>
                              <td className="py-3 px-3 font-bold text-[#1a365d]">
                                {col.name}
                              </td>
                              <td className="py-3 px-3 text-slate-500 text-xs">
                                {col.date}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-1 rounded text-[10px] font-bold border ${col.status === "تم التسليم" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : col.status === "جاري التنفيذ" ? "bg-slate-50 text-[#1a365d] border-slate-200" : "bg-red-50 text-[#b91c1c] border-red-100"}`}
                                >
                                  {col.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب السجل الزمني التفصيلي */}
              {activeTab === "timeline" && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in-up">
                  <div className="relative border-r-2 border-slate-100 pr-6 space-y-8">
                    {selectedBrand.timeline?.map((event, idx) => (
                      <div key={idx} className="relative">
                        {/* النقطة الدائرية (Bullet) */}
                        <div
                          className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-[3px] bg-white ${getTimelineIconStyle(event.type)}`}
                        ></div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#1a365d]">
                            {event.title}
                          </h4>
                          <div className="flex flex-col sm:items-end text-[11px] text-slate-400 font-medium">
                            <span>{event.date}</span>
                            <span>{event.time}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          {event.desc}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">
                            بواسطة: {event.user}
                          </span>
                        </div>
                      </div>
                    ))}

                    {!selectedBrand.timeline && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        لا يوجد سجل زمني متاح حالياً.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* الفوتر / زرار تقرير الـ AI */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex justify-end">
              <button className="w-full sm:w-auto bg-[#b91c1c] hover:bg-red-800 text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                🤖 استخراج تقرير AI متكامل
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }
      `,
        }}
      />
    </div>
  );
};

export default AllBrands;
