import { supabase } from "../../supabase";
import { notificationService } from "./notificationService";

export const sendForApproval = async (collectionId, type, note, modelId = null) => {
  try {
    // 💡 إدخال صف جديد دايماً كطلب مستقل
    const { data, error } = await supabase.from('approvals').insert([
      {
        collection_id: collectionId,
        model_id: modelId,
        approval_type: type,
        status: 'sent',
        notes: note
      }
    ]);

    if (error) {
      // لو نسينا نمسح القيد من الداتابيز، الكود هينبهنا
      if (error.code === '23505') {
        throw new Error("لا يمكن إضافة الطلب. يرجى مسح قيد عدم التكرار (Unique Constraint) من جدول approvals في Supabase.");
      }
      throw error;
    }

    // إرسال الإشعار للمدير 
    let typeName = type === 'tech_pack' ? 'بطاقة فنية' : type === 'quotation' ? 'عرض سعر' : 'عقد عمل';
    await notificationService.sendNotification(
      "management",
      "طلب اعتماد جديد ⚠️",
      `تم إرسال طلب اعتماد (${typeName}) جديد، برجاء المراجعة.`,
      collectionId
    );

    return { success: true, data };
  } catch (error) {
    console.error("Error sending approval:", error);
    throw error;
  }
};