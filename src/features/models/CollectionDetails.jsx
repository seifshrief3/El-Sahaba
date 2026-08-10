import React, { useState, useEffect } from "react";
import ModelForm from "./ModelForm";
import { toast } from "sonner";
import { handleGetModelsByCollectionId } from "../../services/modelService";
import { supabase } from "../../../supabase"; // 💡 تأكد من مسار ملف السوبابيز عندك

const CollectionDetails = ({ collection, onBack }) => {
  // 1. States الخاصة بالبيانات
  const [modelsData, setModelsData] = useState([]);
  const [activeModelId, setActiveModelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false); // لمنع الضغط المتكرر

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

  // ==========================================
  // 💡 إضافة موديل جديد فارغ
  // ==========================================
  const handleAddNewModel = async () => {
    setIsActionLoading(true);
    try {
      // توليد رقم موديل عشوائي لتفادي خطأ الـ Not Null
      const generateModelNumber = `MOD-${Math.floor(1000 + Math.random() * 9000)}`;

      const newModelPayload = {
        collection_id: collection.id,
        name: "موديل جديد",
        model_number: generateModelNumber, // 💡 تم إضافة رقم الموديل هنا
        tech_pack_status: "not_created",
      };

      const { data, error } = await supabase
        .from("models")
        .insert([newModelPayload])
        .select()
        .single();

      if (error) throw error;

      setModelsData((prev) => [...prev, data]);
      setActiveModelId(data.id);
      toast.success("تم إضافة موديل جديد بنجاح!");
    } catch (error) {
      console.error("Error adding new model:", error);
      toast.error("حدث خطأ أثناء إضافة الموديل");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // 💡 تكرار الموديل الحالي (Duplicate)
  // ==========================================
  const handleDuplicateModel = async () => {
    if (!activeModelId) return;
    setIsActionLoading(true);
    try {
      const activeModel = modelsData.find((m) => m.id === activeModelId);

      // 💡 التعديل هنا: استثنينا hasError وأي علاقات (زي tech_packs) عشان الداتابيز ماترفضش
      const {
        id,
        created_at,
        updated_at,
        tech_pack_status,
        hasError,
        tech_packs,
        quotation_items,
        ...restData
      } = activeModel;

      const duplicatedPayload = {
        ...restData,
        name: `${activeModel.name || "موديل"} (نسخة)`,
        // 💡 تم إضافة رقم الموديل مضاف إليه كلمة C لتجنب تكرار الكود
        model_number: `${activeModel.model_number}-C`,
        tech_pack_status: "not_created",
      };

      const { data, error } = await supabase
        .from("models")
        .insert([duplicatedPayload])
        .select()
        .single();

      if (error) throw error;

      setModelsData((prev) => [...prev, data]);
      setActiveModelId(data.id);
      toast.success("تم تكرار الموديل بنجاح! يمكنك الآن التعديل عليه.");
    } catch (error) {
      console.error("Error duplicating model:", error);
      toast.error("حدث خطأ أثناء تكرار الموديل");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // 💡 حذف الموديل الحالي (Delete)
  // ==========================================
  const handleDeleteModel = async () => {
    if (!activeModelId) return;

    const confirmDelete = window.confirm(
      "هل أنت متأكد من حذف هذا الموديل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
    );
    if (!confirmDelete) return;

    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from("models")
        .delete()
        .eq("id", activeModelId);

      if (error) throw error;

      const updatedModels = modelsData.filter((m) => m.id !== activeModelId);
      setModelsData(updatedModels);

      setActiveModelId(updatedModels.length > 0 ? updatedModels[0].id : null);
      toast.success("تم حذف الموديل بنجاح.");
    } catch (error) {
      console.error("Error deleting model:", error);

      // 💡 معالجة ذكية لخطأ ارتباط الموديل بعرض سعر
      if (error.code === "23503") {
        toast.error(
          "لا يمكن حذف هذا الموديل لأنه مرتبط بـ 'عرض سعر' مسجل بالفعل.",
        );
      } else {
        toast.error("حدث خطأ أثناء حذف الموديل");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

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
        <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 flex flex-col items-center gap-4 mt-4">
          <p className="font-bold">
            لا يوجد موديلات مضافة لهذا الكولكشن حتى الآن.
          </p>
          <button
            onClick={handleAddNewModel}
            disabled={isActionLoading}
            className="bg-[#1a365d] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition"
          >
            + إضافة الموديل الأول
          </button>
        </div>
      ) : (
        <>
          {/* شريط الموديلات (التابات) */}
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide items-center">
            {modelsData.map((model) => {
              const hasError = checkModelError(model);

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

            {/* 💡 زر إضافة موديل جديد في التابات */}
            <button
              onClick={handleAddNewModel}
              disabled={isActionLoading}
              className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-full text-sm font-bold border border-dashed border-slate-400 text-slate-500 hover:text-[#1a365d] hover:border-[#1a365d] hover:bg-slate-50 transition shrink-0"
              title="إضافة موديل جديد لهذا الكولكشن"
            >
              + إضافة موديل
            </button>
          </div>

          {/* استدعاء الفورم وتمرير البيانات ليه */}
          {activeModel && (
            <div className="mt-2 animate-fade-in-up">
              {/* 💡 شريط أدوات الموديل (تكرار / حذف) */}
              <div className="flex justify-end gap-3 mb-4">
                <button
                  onClick={handleDuplicateModel}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#1a365d] rounded-lg text-sm font-bold hover:bg-slate-50 hover:border-[#1a365d] transition shadow-sm disabled:opacity-50"
                  title="إنشاء نسخة مطابقة من هذا الموديل"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    ></path>
                  </svg>
                  تكرار الموديل
                </button>
                <button
                  onClick={handleDeleteModel}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-[#b91c1c] rounded-lg text-sm font-bold hover:bg-red-100 transition shadow-sm disabled:opacity-50"
                  title="حذف هذا الموديل نهائياً"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  حذف الموديل
                </button>
              </div>

              <ModelForm
                activeModel={activeModel}
                onModelChange={handleModelChange}
                brandName={collection.brands?.name_ar}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionDetails;
