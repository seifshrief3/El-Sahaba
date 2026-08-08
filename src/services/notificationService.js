import { supabase } from "../../supabase";

export const notificationService = {
  // إرسال إشعار لقسم معين
  sendNotification: async (department, title, message, referenceId = null) => {
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          department,
          title,
          message,
          reference_id: referenceId,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  },

  // جلب إشعارات قسم معين
  fetchNotifications: async (department) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("department", department)
        .order("created_at", { ascending: false })
        .limit(20); // جلب آخر 20 إشعار بس

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  },

  // تحديد الإشعار كمقروء
  markAsRead: async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  },
};