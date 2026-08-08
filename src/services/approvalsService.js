import { supabase } from "../../supabase";
import { notificationService } from "./notificationService";

// 💡 ضفنا modelId كمتغير اختياري في الدالة
export const sendForApproval = async (collectionId, type, note, modelId = null) => {
  try {
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
      if (error.code === '23505') {
        throw new Error("تم إرسال هذا الطلب مسبقاً وهو قيد المراجعة.");
      }
      throw error;
    }

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