import React from "react";
import { useModelForm } from "../../hooks/useModelForm";
import ModelBasicInfo from "../../components/ModelBasicInfo";
import ModelFabricsAndColors from "../../components/ModelFabricsAndColors";
import ModelSizesAndNotes from "../../components/ModelSizesAndNotes";
import TechPackSection from "../../components/TechPackSection";

const ModelForm = ({ activeModel, onModelChange, brandName }) => {
  // سحب كل الدوال والبيانات من الـ Hook
  const {
    modelName,
    setModelName,
    notes,
    setNotes,
    imagePreview,
    handleImageChange,
    fabrics,
    addFabric,
    updateFabric,
    removeFabric,
    colors,
    addColor,
    updateColor,
    removeColor,
    selectedSizes,
    toggleSize,
    sizesList,
    isGenerating,
    handleSubmitAndGenerate,
    closeUpPreviews,
    handleCloseUpChange,
    removeCloseUpImage,
    handleUpdateTechPack,
  } = useModelForm(activeModel, onModelChange, brandName);

  if (!activeModel) return null;

  return (
    <div
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6"
      dir="rtl"
    >
      {/* 1. الهيدر والبيانات الأساسية والصورة */}
      <ModelBasicInfo
        activeModel={activeModel}
        modelName={modelName}
        setModelName={setModelName}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        // 💡 السطور دي اللي كانت ناقصة ومخلية الصور ماتتقريش!
        closeUpPreviews={closeUpPreviews}
        handleCloseUpChange={handleCloseUpChange}
        removeCloseUpImage={removeCloseUpImage}
      />

      {/* 2. الخامات والألوان */}
      <ModelFabricsAndColors
        fabrics={fabrics}
        addFabric={addFabric}
        updateFabric={updateFabric}
        removeFabric={removeFabric}
        colors={colors}
        addColor={addColor}
        updateColor={updateColor}
        removeColor={removeColor}
      />

      {/* 3. المقاسات والملاحظات */}
      <ModelSizesAndNotes
        sizesList={sizesList}
        selectedSizes={selectedSizes}
        toggleSize={toggleSize}
        notes={notes}
        setNotes={setNotes}
      />

      <hr className="border-slate-100 mt-4 mb-2" />

      {/* 4. الورقة الفنية والشات */}
      <TechPackSection
        activeModel={activeModel}
        isGenerating={isGenerating}
        handleSubmitAndGenerate={handleSubmitAndGenerate}
        brandName={brandName}
        handleUpdateTechPack={handleUpdateTechPack}
      />
    </div>
  );
};

export default ModelForm;
