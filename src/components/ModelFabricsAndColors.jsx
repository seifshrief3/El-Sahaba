import React from "react";

const ModelFabricsAndColors = ({
  fabrics,
  addFabric,
  updateFabric,
  removeFabric,
  colors,
  addColor,
  updateColor,
  removeColor,
}) => {
  return (
    <>
      {/* الخامات والأوزان */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-right">
          الخامات والأوزان المطلوبة *
        </label>

        <div className="space-y-3">
          {fabrics.map((fabric, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={`اسم الخامة ${idx + 1} (مثال: قطن بيكيه)`}
                value={fabric.name}
                onChange={(e) => updateFabric(idx, "name", e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-[#1a365d] bg-white"
              />

              <input
                type="text"
                placeholder="وزن الخامة (مثال: 220 جرام)"
                value={fabric.weight}
                onChange={(e) => updateFabric(idx, "weight", e.target.value)}
                className="flex-1 sm:w-1/3 border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-[#1a365d] bg-white"
              />

              {fabrics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFabric(idx)}
                  className="p-2.5 bg-red-50 text-[#b91c1c] rounded-lg border border-red-100 hover:bg-red-100 transition"
                  title="حذف الخامة"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFabric}
          className="mt-3 text-sm font-bold text-[#1a365d] hover:text-blue-800 transition flex items-center gap-1"
        >
          + إضافة خامة أخرى
        </button>
      </div>

      {/* أجزاء الموديل وألوانها */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-slate-700 text-right">
            تركيبات الموديل وألوانها *
          </label>

          <span className="text-xs text-slate-400">
            كل Variant يمثل تركيبة ألوان مستقلة
          </span>
        </div>

        <div className="space-y-3">
          {colors.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              {/* رقم الـ Variant */}
              <input
                type="number"
                min="1"
                placeholder="Variant"
                value={item.variant || 1}
                onChange={(e) =>
                  updateColor(
                    idx,
                    "variant",
                    Math.max(1, Number(e.target.value) || 1),
                  )
                }
                className="w-full sm:w-28 border border-slate-300 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:border-[#1a365d] bg-white font-bold"
              />

              {/* اسم الجزء */}
              <input
                type="text"
                placeholder="اسم الجزء (مثال: التيشيرت)"
                value={item.part}
                onChange={(e) => updateColor(idx, "part", e.target.value)}
                className="flex-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-[#1a365d] bg-white"
              />

              {/* اللون */}
              <input
                type="text"
                placeholder="اللون (مثال: بينك)"
                value={item.color}
                onChange={(e) => updateColor(idx, "color", e.target.value)}
                className="flex-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm text-right focus:outline-none focus:border-[#1a365d] bg-white"
              />

              {/* حذف */}
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="p-2.5 bg-red-50 text-[#b91c1c] rounded-lg border border-red-100 hover:bg-red-100 transition"
                  title="حذف الجزء"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v-6m1-10V4a1 1 0 01-1-1h-4a1 1 0 01-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addColor}
          className="mt-3 px-4 py-2.5 bg-slate-100 text-[#1a365d] rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-200 transition"
        >
          + إضافة جزء ولونه
        </button>
      </div>
    </>
  );
};

export default ModelFabricsAndColors;
