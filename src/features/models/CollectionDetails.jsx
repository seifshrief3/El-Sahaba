import React, { useState } from "react";
import ModelForm from "./ModelForm";

const CollectionDetails = ({ collectionName, onBack }) => {
  // 1. مصفوفة بيانات الموديلات (State)
  const [modelsData, setModelsData] = useState([
    {
      id: 3,
      name: "موديل 3",
      code: "2286",
      fabric: "",
      weight: "",
      notes: "",
      hasError: true,
    },
    {
      id: 4,
      name: "موديل 4",
      code: "2287",
      fabric: "ميلتون",
      weight: "300 جرام",
      notes: "",
      hasError: false,
    },
    {
      id: 5,
      name: "موديل 5",
      code: "2288",
      fabric: "",
      weight: "",
      notes: "",
      hasError: true,
    },
    {
      id: 6,
      name: "موديل 6",
      code: "2289",
      fabric: "",
      weight: "",
      notes: "",
      hasError: true,
    },
  ]);

  // 2. حالة لتحديد الموديل المفتوح حالياً (بياخد أول موديل كافتراضي)
  const [activeModelId, setActiveModelId] = useState(modelsData[0].id);

  // دالة لتحديث بيانات الموديل المفتوح
  const handleModelChange = (field, value) => {
    setModelsData((prevModels) =>
      prevModels.map((model) =>
        model.id === activeModelId ? { ...model, [field]: value } : model,
      ),
    );
  };

  // الموديل النشط اللي هيتبعت للفورم
  const activeModel = modelsData.find((m) => m.id === activeModelId);

  return (
    <div className="flex flex-col gap-4">
      {/* الهيدر وزر الرجوع */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-500">
          {collectionName}
        </span>
        <button
          onClick={onBack}
          className="text-[#1a365d] border border-[#1a365d] bg-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
        >
          ◀ كل الكولكشنات
        </button>
      </div>

      {/* شريط الموديلات (التابات) */}
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
        {modelsData.map((model) => (
          <button
            key={model.id}
            onClick={() => setActiveModelId(model.id)} // تغيير الموديل النشط عند الضغط
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
              activeModelId === model.id
                ? "bg-[#1a365d] text-white border-[#1a365d]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {model.name}
            {model.hasError && (
              <span
                className={`w-2 h-2 rounded-full ${activeModelId === model.id ? "bg-red-400" : "bg-red-500"}`}
              ></span>
            )}
          </button>
        ))}
      </div>

      {/* استدعاء الفورم وتمرير البيانات ليه */}
      <ModelForm activeModel={activeModel} onModelChange={handleModelChange} />

      {/* كارت التحليل الفني */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1a365d]">
            تحليل المنتج والورقة الفنية
          </h3>
        </div>
        <button className="bg-[#b91c1c] text-white w-full py-3.5 rounded-lg text-base font-bold">
          تحليل الموديل الحالي وإنشاء الورقة الفنية
        </button>
      </div>
    </div>
  );
};

export default CollectionDetails;
