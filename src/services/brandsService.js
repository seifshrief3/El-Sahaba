import { supabase } from "../../supabase";
// 💡 تأكد من كتابة المسار الصحيح لملف الـ service بتاع الـ logs
import { addSystemLog } from "./systemLogService";

export const handleAddNewBrand = async (brand) => {
  const { data, error } = await supabase
    .from("brands")
    .insert([brand])
    .select()
    .single();

  if (error) {
    throw error;
  }

  // 💡 تسجيل حدث الإنشاء في سجل النظام
  await addSystemLog({
    module: "customer_service",
    action_type: "CREATE",
    entity_type: "brand",
    entity_id: data.id,
    title: "إضافة براند جديد",
    description: `تم إضافة براند جديد للنظام باسم: ${data.name_ar}`,
    details: { brand_code: data.code, name_en: data.name_en }
  });

  return data;
};

export const handleGetAllBrands = async () => {
  const { data, error } = await supabase.from("brands").select("*, collections(id)");

  if (error) {
    throw error;
  }

  return data;
};

export const handleGetBrandById = async (brandId) => {
  const { data, error } = await supabase
    .from("brands")
    .select("*, collections(id, name, season)")
    .eq("id", brandId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const handleUpdateBrand = async (brandId, updatedData) => {
  const { collections, ...dataToUpdate } = updatedData;

  const { data, error } = await supabase
    .from("brands")
    .update(dataToUpdate)
    .eq("id", brandId)
    .select()
    .single();

  if (error) throw error;

  // 💡 تسجيل حدث التعديل في سجل النظام
  await addSystemLog({
    module: "customer_service",
    action_type: "UPDATE",
    entity_type: "brand",
    entity_id: brandId,
    title: "تعديل بيانات براند",
    description: `تم تحديث بيانات البراند: ${data.name_ar}`,
    details: dataToUpdate // بنحفظ التحديثات اللي تمت كمرجع
  });

  return data;
};

export const handleDeleteBrand = async (brandId) => {
  // 💡 بنستخدم .select() هنا عشان نجيب الداتا اللي اتمسحت ونكتب اسمها في الـ Log
  const { data: deletedBrand, error } = await supabase
    .from("brands")
    .delete()
    .eq("id", brandId)
    .select()
    .single();

  if (error) throw error;

  // 💡 تسجيل حدث الحذف في سجل النظام
  await addSystemLog({
    module: "customer_service",
    action_type: "DELETE",
    entity_type: "brand",
    entity_id: brandId,
    title: "حذف براند",
    description: `تم حذف البراند "${deletedBrand?.name_ar || 'غير معروف'}" من النظام نهائياً.`,
    details: { deleted_brand_data: deletedBrand } // بنحفظ نسخة من الداتا اللي اتمسحت احتياطي
  });
};

export const handleGetBrandsDetailedReport = async () => {
  const { data, error } = await supabase
    .from("brands")
    .select('*, collections(*, models(*), quotations(*), production_orders(*))')

  if (error) throw error;

  return data;
};