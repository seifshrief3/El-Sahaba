import React from "react";

const BrandCard = ({ brand, openModal }) => {
  console.log(brand);

  // =========================================================
  // Collect all models from all collections
  // =========================================================

  const models = Array.isArray(brand?.collections)
    ? brand.collections
        .flatMap((collection) =>
          Array.isArray(collection?.models) ? collection.models : [],
        )
        .filter((model) => model?.id)
        .filter(
          (model, index, array) =>
            index === array.findIndex((item) => item.id === model.id),
        )
    : [];

  return (
    <div
      key={brand.id}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group overflow-hidden"
    >
      {/* =====================================================
          Top Status Line
      ===================================================== */}

      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          brand.status === "active" ? "bg-[#1a365d]" : "bg-slate-300"
        }`}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* =====================================================
            Brand Header
        ===================================================== */}

        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand Logo */}
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {brand?.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name_ar || "Logo"}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <span className="text-xl font-black text-[#1a365d]">
                  {brand?.name_ar?.charAt(0) || "؟"}
                </span>
              )}
            </div>

            {/* Brand Info */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#1a365d] leading-tight mb-1">
                {brand.name_ar}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono tracking-wider">
                  {brand.code}
                </span>

                <span>•</span>

                <span className="line-clamp-1">
                  {brand.activity || "غير محدد"}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${
              brand.status === "active"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {brand.status === "active" ? "نشط" : "متوقف"}
          </span>
        </div>

        {/* =====================================================
            Models
        ===================================================== */}

        {models.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                موديلات البراند
              </p>

              <span className="text-[10px] text-slate-400 font-medium">
                {models.length} موديل
              </span>
            </div>

            <div className="flex gap-2 overflow-hidden">
              {models.slice(0, 5).map((model) => (
                <div
                  key={model.id}
                  className="
                    w-14
                    h-14
                    rounded-xl
                    bg-slate-100
                    border
                    border-slate-200
                    overflow-hidden
                    shrink-0
                    relative
                  "
                  title={model.name || "موديل"}
                >
                  {model?.image_url ? (
                    <img
                      src={model.image_url}
                      alt={model.name || "Model"}
                      className="
                        w-full
                        h-full
                        object-cover
                        group-hover:scale-105
                        transition-transform
                        duration-300
                      "
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] text-slate-400 text-center px-1">
                        بدون صورة
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Remaining Models */}
              {models.length > 5 && (
                <div
                  className="
                    w-14
                    h-14
                    rounded-xl
                    bg-[#1a365d]
                    text-white
                    shrink-0
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-black
                  "
                >
                  +{models.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        <hr className="border-slate-100 mb-5" />

        {/* =====================================================
            Latest Updates
        ===================================================== */}

        <div className="mb-6 flex-1">
          <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
            أحدث الإجراءات
          </p>

          <div className="space-y-4">
            {brand?.lastUpdates?.length === 0 ? (
              <p className="text-xs text-slate-400">لا يوجد سجل أنشطة.</p>
            ) : (
              brand?.lastUpdates?.map((update, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b91c1c] shrink-0" />

                  <div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed mb-0.5">
                      {update.text}
                    </p>

                    <span className="text-[10px] text-slate-400">
                      {update.date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =====================================================
            Open Brand
        ===================================================== */}

        <button
          onClick={() => openModal(brand)}
          className="
            w-full
            bg-slate-50
            text-[#1a365d]
            border
            border-slate-200
            hover:border-[#1a365d]
            hover:bg-[#1a365d]
            hover:text-white
            py-2.5
            rounded-lg
            text-sm
            font-bold
            transition-colors
            flex
            items-center
            justify-center
            mt-auto
          "
        >
          فتح ملف البراند
        </button>
      </div>
    </div>
  );
};

export default BrandCard;
