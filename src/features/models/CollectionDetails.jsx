import React, { useState, useEffect } from "react";
import ModelForm from "./ModelForm";
import { toast } from "sonner";
import { handleGetModelsByCollectionId } from "../../services/modelService";

const CollectionDetails = ({ collection, onBack }) => {
  // 1. States الخاصة بالبيانات
  const [modelsData, setModelsData] = useState([]);
  const [activeModelId, setActiveModelId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. جلب الموديلات أول ما الكومبوننت يفتح
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const data = await handleGetModelsByCollectionId(collection.id);
        setModelsData(data);

        // لو في موديلات رجعت، خلي أول موديل هو النشط افتراضياً
        if (data && data.length > 0) {
          setActiveModelId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الموديلات");
      } finally {
        setLoading(false);
      }
    };

    if (collection?.id) {
      fetchModels();
    }
  }, [collection]);

  // دالة لتحديث بيانات الموديل محلياً في الـ State (عشان الـ Form)
  const handleModelChange = (field, value) => {
    setModelsData((prevModels) =>
      prevModels.map((model) =>
        model.id === activeModelId ? { ...model, [field]: value } : model,
      ),
    );
  };

  // الموديل النشط اللي هيتبعت للفورم
  const activeModel = modelsData.find((m) => m.id === activeModelId);

  // دالة لمعرفة هل الموديل فيه بيانات ناقصة (عشان النقطة الحمراء)
  const checkModelError = (model) => {
    // تقدر تغير الشروط دي حسب البيانات الأساسية المطلوبة عندك
    // مثلاً: لو مفيش صورة أو مفيش وصف يعتبر ناقص (Error)
    if (!model.description || model.tech_pack_status === "not_created") {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 text-[#1a365d] font-bold">
        جاري تحميل الموديلات...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* الهيدر وزر الرجوع */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#1a365d]">
            {collection.name}
          </h2>
          <span className="text-sm font-medium text-slate-500">
            الكود: {collection.code} | {modelsData.length} موديلات
          </span>
        </div>
        <button
          onClick={onBack}
          className="text-[#1a365d] border border-[#1a365d] bg-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
        >
          ◀ رجوع للقائمة
        </button>
      </div>

      {modelsData.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 font-bold mt-4">
          لا يوجد موديلات مضافة لهذا الكولكشن حتى الآن.
        </div>
      ) : (
        <>
          {/* شريط الموديلات (التابات) */}
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            {modelsData.map((model) => {
              const hasError = checkModelError(model); // فحص حالة الموديل ديناميكياً

              return (
                <button
                  key={model.id}
                  onClick={() => setActiveModelId(model.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                    activeModelId === model.id
                      ? "bg-[#1a365d] text-white border-[#1a365d]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {model.model_number} {model.name ? `- ${model.name}` : ""}
                  {hasError && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeModelId === model.id ? "bg-red-400" : "bg-red-500"
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* استدعاء الفورم وتمرير البيانات ليه */}
          {activeModel && (
            <ModelForm
              activeModel={activeModel}
              onModelChange={handleModelChange}
              brandName={collection.brands?.name_ar}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CollectionDetails;
