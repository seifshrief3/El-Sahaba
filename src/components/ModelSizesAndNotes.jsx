import React from "react";

const ModelSizesAndNotes = ({
  sizesList,
  selectedSizes,
  toggleSize,
  notes,
  setNotes,
}) => {
  return (
    <>
      {/* المقاسات المطلوبة */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-3 text-right">
          المقاسات المطلوبة *
        </label>
        <div className="flex flex-wrap gap-2">
          {sizesList.map((size, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${
                selectedSizes.includes(size)
                  ? "bg-[#1a365d] text-white border-[#1a365d]"
                  : "bg-white text-slate-600 border-slate-300 hover:border-[#1a365d] hover:text-[#1a365d]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* ملاحظات حرة */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 text-right">
          ملاحظة إضافية للمصنع (اختياري)
        </label>
        <textarea
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اكتب أي توجيهات خاصة بهذا الموديل..."
          className="w-full border border-slate-300 rounded-lg p-3 text-sm text-right focus:outline-none focus:border-[#1a365d] resize-none bg-white"
        ></textarea>
      </div>
    </>
  );
};

export default ModelSizesAndNotes;
