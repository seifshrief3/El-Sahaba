import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../supabase";
import { notificationService } from "../services/notificationService";
import { toast } from "sonner";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getUserDepartment = () => {
    const email = user?.email?.toLowerCase() || "";

    // 1. فحص إيميل الإدارة / المدير
    if (email.includes("management")) {
      return "management";
    }
    // 2. فحص التخطيط
    if (email.includes("planning")) return "planning";

    // 3. فحص المخازن
    if (email.includes("warehouse") || email.includes("inventory"))
      return "inventory";

    // 4. الافتراضي (خدمة العملاء)
    return "customer_service";
  };

  const userDepartment = getUserDepartment();

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      const data = await notificationService.fetchNotifications(userDepartment);
      setNotifications(data);
      setIsLoading(false);
    };
    loadNotifications();

    const channel = supabase
      .channel("realtime-notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `department=eq.${userDepartment}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userDepartment]);

  const handleMarkAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif,
      ),
    );
    await notificationService.markAsRead(notificationId);
  };

  // ==========================================
  // 💡 الأكشن الخاص بقسم التخطيط (استلام أوردر)
  // ==========================================
  const handleAcceptOrder = async (notif) => {
    if (!notif.reference_id) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("production_orders")
        .update({ status: "in_progress" })
        .eq("collection_id", notif.reference_id);

      if (error) throw error;

      await notificationService.sendNotification(
        "customer_service",
        "تم الاستلام 🏭✅",
        `قسم التخطيط استلم أمر التشغيل وتم البدء فيه.`,
        notif.reference_id,
      );

      await handleMarkAsRead(notif.id);
      toast.success("تم استلام أمر التشغيل بنجاح وبدء العمل فيه!");
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("حدث خطأ أثناء استلام أمر التشغيل.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // 💡 الأكشن الخاص بقسم المخزن (النسخة السريعة 🚀)
  // ==========================================
  const handleReceiveInWarehouse = async (notif) => {
    if (!notif.reference_id) return;
    setIsProcessing(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("production_orders")
        .select("id")
        .eq("collection_id", notif.reference_id)
        .single();

      if (orderError) throw orderError;

      const { data: activeDeliveries, error: fetchError } = await supabase
        .from("production_deliveries")
        .select(
          `
          id,
          delivery_number,
          production_delivery_items (
            delivered_qty,
            production_order_item_sizes (
              sizes (name),
              production_order_items (
                model_id,
                color
              )
            )
          )
        `,
        )
        .eq("status", "pending")
        .eq("production_order_id", orderData.id);

      if (fetchError) throw fetchError;

      if (!activeDeliveries || activeDeliveries.length === 0) {
        toast.info("لا توجد دفعات معلقة للاستلام لهذا الأمر.");
        setIsProcessing(false);
        return;
      }

      let totalItemsInserted = 0;

      // مصفوفات لتجميع العمليات عشان ننفذها بالتوازي
      const inventoryUpdatePromises = [];
      const inventoryInsertPayloads = [];
      const deliveryUpdatePromises = [];

      for (const delivery of activeDeliveries) {
        for (const item of delivery.production_delivery_items) {
          const qty = item.delivered_qty || 0;
          if (qty <= 0) continue;

          const modelId =
            item.production_order_item_sizes?.production_order_items?.model_id;
          const color =
            item.production_order_item_sizes?.production_order_items?.color ||
            "غير محدد";
          const sizeName =
            item.production_order_item_sizes?.sizes?.name || "غير محدد";

          if (!modelId) continue;
          totalItemsInserted += qty;

          // البحث في المخزن
          const { data: existingInv, error: searchError } = await supabase
            .from("inventory")
            .select("id, received_qty, available_qty")
            .eq("model_id", modelId)
            .eq("color", color)
            .eq("size", sizeName)
            .maybeSingle();

          if (searchError) throw searchError;

          if (existingInv) {
            // تحديث الرصيد (نضيفه للـ Promises)
            inventoryUpdatePromises.push(
              supabase
                .from("inventory")
                .update({
                  received_qty: (existingInv.received_qty || 0) + qty,
                  available_qty: (existingInv.available_qty || 0) + qty,
                  last_updated: new Date().toISOString(),
                })
                .eq("id", existingInv.id),
            );
          } else {
            // إضافة رصيد جديد (نجمعه عشان نعمل Bulk Insert)
            inventoryInsertPayloads.push({
              production_order_id: orderData.id,
              model_id: modelId,
              color: color,
              size: sizeName,
              received_qty: qty,
              available_qty: qty,
              reserved_qty: 0,
              shipped_qty: 0,
            });
          }
        }

        // 3. تحديث حالة الدفعة لـ completed (نضيفه للـ Promises)
        deliveryUpdatePromises.push(
          supabase
            .from("production_deliveries")
            .update({ status: "completed" })
            .eq("id", delivery.id),
        );
      }

      if (totalItemsInserted === 0) {
        toast.error("لم يتم إضافة أي منتج للمخزن (الكميات في الدفعة = 0)");
        setIsProcessing(false);
        return;
      }

      // 🚀 تنفيذ كل التحديثات والإضافات في نفس اللحظة!
      const allPromises = [
        ...inventoryUpdatePromises,
        ...deliveryUpdatePromises,
      ];

      // لو فيه داتا جديدة هتتضاف، نبعتها Bulk Insert (طلبية واحدة سريعة جداً)
      if (inventoryInsertPayloads.length > 0) {
        allPromises.push(
          supabase.from("inventory").insert(inventoryInsertPayloads),
        );
      }

      // نستنى كل حاجة تخلص مرة واحدة
      await Promise.all(allPromises);

      // 4. التحقق هل الأوردر خلص؟
      const { data: sizesCheck } = await supabase
        .from("production_order_item_sizes")
        .select("remaining_qty")
        .in(
          "production_order_item_id",
          (
            await supabase
              .from("production_order_items")
              .select("id")
              .eq("production_order_id", orderData.id)
          ).data.map((i) => i.id),
        );

      const isOrderFullyDelivered = sizesCheck?.every(
        (s) => s.remaining_qty <= 0,
      );

      if (isOrderFullyDelivered) {
        await supabase
          .from("production_orders")
          .update({ status: "completed" })
          .eq("id", orderData.id);
      }

      if (typeof handleNotificationClick === "function") {
        await handleNotificationClick(notif);
      } else if (typeof handleMarkAsRead === "function") {
        await handleMarkAsRead(notif.id);
      }

      toast.success(`تم استلام البضاعة (${totalItemsInserted} قطعة) بنجاح!`);
    } catch (error) {
      console.error("🚨 إيرور الاستلام الحقيقي:", error);
      toast.error(`فشل الإضافة: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 font-arabic"
        dir="rtl"
      >
        <div className="text-[#1a365d] font-bold text-lg">
          جاري تحميل الإشعارات...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8 font-arabic"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1a365d] mb-1">
            صندوق الإشعارات
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            متابعة كافة التحديثات والأوامر الواردة لقسمك.
          </p>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold">
              لا توجد إشعارات في صندوق الوارد حالياً.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${notif.is_read ? "bg-white opacity-80" : "bg-blue-50/50"}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_0_4px_rgba(220,38,38,0.1)]"></span>
                      )}
                      <h3
                        className={`text-base font-bold ${notif.is_read ? "text-slate-600" : "text-[#1a365d]"}`}
                      >
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(notif.created_at).toLocaleString("ar-EG")}
                    </span>
                  </div>

                  {/* 💡 Actions (أزرار التحكم الديناميكية) */}
                  {!notif.is_read && (
                    <div className="flex items-center gap-3 sm:w-auto w-full">
                      {/* زرار التخطيط */}
                      {userDepartment === "planning" &&
                        notif.reference_id &&
                        notif.title.includes("أمر تشغيل") && (
                          <button
                            onClick={() => handleAcceptOrder(notif)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none bg-red-800 text-white hover:bg-red-900 px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 shadow-sm"
                          >
                            استلام العمل ◀
                          </button>
                        )}

                      {/* زرار المخزن */}
                      {userDepartment === "inventory" &&
                        notif.reference_id &&
                        (notif.title.includes("جاهز للاستلام") ||
                          notif.title.includes("دفعة جديدة")) && (
                          <button
                            onClick={() => handleReceiveInWarehouse(notif)}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 shadow-sm"
                          >
                            استلام البضاعة 📦
                          </button>
                        )}

                      {/* الزرار المشترك (تحديد كمقروء) */}
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-6 py-2.5 rounded-lg text-sm font-bold transition"
                      >
                        ✓ تحديد كمقروء
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
