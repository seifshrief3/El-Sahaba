import React from "react";

const ModelBasicInfo = ({
  activeModel,
  modelName,
  setModelName,
  modelNumber,
  setModelNumber,
  imagePreview,
  handleImageChange,
  closeUpPreviews,
  handleCloseUpChange,
  removeCloseUpImage,
}) => {
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
            {activeModel.name || "اسم الموديل"}
            <span className="text-sm font-normal text-slate-400">
              — {activeModel.model_number || "كود الموديل"}
            </span>
          </h3>

          <div className="flex items-center gap-4">
            {activeModel.hasError && (
              <span className="bg-red-50 text-[#b91c1c] px-3 py-1 rounded text-xs font-bold border border-red-100">
                أحمر - بيانات ناقصة
              </span>
            )}
          </div>
        </div>

        {activeModel.hasError && (
          <div className="bg-red-50 border border-red-200 text-[#b91c1c] rounded-lg p-3 text-sm font-medium text-right">
            تأكد من إكمال البيانات الأساسية لتجنب أي أخطاء في التسعير أو
            التخطيط.
          </div>
        )}
      </div>

      <hr className="border-slate-100 mb-6" />

      <div>
        <h4 className="text-base font-bold text-[#1a365d] mb-1">
          البيانات الأساسية والصور
        </h4>

        <p className="text-sm text-slate-500 mb-6 text-right">
          أدخل المواصفات والصور، وسيقوم الذكاء الاصطناعي ببناء الورقة الفنية
          وتحليل التفاصيل.
        </p>

        <div className="flex flex-wrap gap-8 mb-8">
          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
              صورة الموديل المرجعية (الرئيسية) *
            </label>

            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition hover:border-[#1a365d] overflow-hidden relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <span className="text-3xl text-slate-400 mb-1">+</span>
                  <span className="text-xs text-slate-500 font-medium text-center px-2">
                    إرفاق صورة
                  </span>
                </>
              )}

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Close Ups */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
              صور تفاصيل الموديل (زووم) - اختياري
            </label>

            <div className="flex flex-wrap gap-3">
              {closeUpPreviews?.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="relative w-20 h-20 border rounded-lg overflow-hidden group"
                >
                  <img
                    src={preview}
                    alt={`Detail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeCloseUpImage(index)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  >
                    حذف
                  </button>
                </div>
              ))}

              {(closeUpPreviews?.length || 0) < 8 && (
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition hover:border-[#1a365d]">
                  <span className="text-2xl text-slate-400 mb-1">+</span>

                  <span className="text-[10px] text-slate-500 font-medium text-center">
                    تفاصيل
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleCloseUpChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Model Name + Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
              اسم المنتج *
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="مثال: تيشيرت بولو صيفي"
              className="w-full border border-slate-300 rounded-lg p-3 text-sm text-right focus:outline-none focus:border-[#1a365d] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
              رقم / كود الموديل *
            </label>
            <input
              type="text"
              value={modelNumber || ""}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="مثال: MOD-2026-A"
              className="w-full border border-slate-300 bg-white rounded-lg p-3 text-sm text-slate-800 text-right font-bold focus:outline-none focus:border-[#1a365d]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelBasicInfo;
