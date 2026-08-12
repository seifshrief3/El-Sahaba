import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../supabase";
import { notificationService } from "../services/notificationService";
import { toast } from "sonner";

const Navbar = ({ toggleSidebar }) => {
  const { user, handleLogout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef(null);

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
      const data = await notificationService.fetchNotifications(userDepartment);
      setNotifications(data);
    };
    loadNotifications();

    const channel = supabase
      .channel("realtime-notifications-navbar")
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
    }
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

      await handleNotificationClick(notif);
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="xl:hidden flex items-center justify-center p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <p className="text-sm text-slate-500 hidden sm:block">
            واجهة موحدة لأوردرات الصحابة
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a365d]">
            لوحة متابعة العمليات
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex rounded-full bg-slate-100 w-10 h-10 items-center justify-center text-slate-600 hover:bg-slate-200 transition"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="bg-[#1a365d] text-white px-4 py-3 font-bold text-sm flex justify-between items-center">
                <span>الإشعارات السريعة</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 px-2 py-0.5 rounded-full text-xs">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm font-medium">
                    لا توجد إشعارات حالياً
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-slate-100 transition ${notif.is_read ? "bg-white opacity-70" : "bg-blue-50"}`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <h4
                          className={`text-sm font-bold ${notif.is_read ? "text-slate-600" : "text-[#1a365d]"}`}
                        >
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* زرار التخطيط */}
                          {userDepartment === "planning" &&
                            notif.reference_id &&
                            notif.title.includes("أمر تشغيل") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptOrder(notif);
                                }}
                                disabled={isProcessing}
                                className="bg-red-800 text-white hover:bg-red-900 px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50"
                              >
                                استلام العمل ◀
                              </button>
                            )}

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

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                            className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded text-xs font-bold transition"
                          >
                            ✓ مقروء
                          </button>
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(notif.created_at).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-[#1a365d] hidden sm:block">
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
};

export default Navbar;
