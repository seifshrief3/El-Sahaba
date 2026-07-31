import { supabase } from "../../supabase";

export const addSystemLog = async ({
  module,
  action_type,
  entity_type,
  entity_id = null,
  title,
  description,
  details = null
}) => {
  try {
    // لو عندك نظام Auth، هات الـ User ID
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("system_logs")
      .insert({
        user_id: user?.id || null, // اختياري
        module,
        action_type,
        entity_type,
        entity_id,
        title,
        description,
        details
      });

    if (error) throw error;
  } catch (error) {
    console.error("خطأ في تسجيل سجل النظام:", error);
    // مش بنعمل throw error هنا عشان لو الـ Log فشل، العملية الأساسية متقفش
  }
};