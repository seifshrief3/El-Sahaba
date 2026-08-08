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
  // 💡 الأكشن الخاص بقسم المخزن (استلام كولكشن من التخطيط)
  // ==========================================
  const handleReceiveInWarehouse = async (notif) => {
    if (!notif.reference_id) return;
    setIsProcessing(true);

    try {
      // 💡 ضفنا كلمة color في الاستعلام عشان نجيب اللون
      const { data: order, error: fetchError } = await supabase
        .from("production_orders")
        .select(
          `
          id, 
          cartons_count, 
          production_order_items (model_id, size, quantity, color), 
          collections (name)
        `,
        )
        .eq("collection_id", notif.reference_id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("production_orders")
        .update({ status: "completed" })
        .eq("id", order.id);

      if (updateError) throw updateError;

      if (
        order.production_order_items &&
        order.production_order_items.length > 0
      ) {
        // 💡 ضفنا color هنا عشان يتحفظ في جدول inventory
        const inventoryData = order.production_order_items.map((item) => ({
          production_order_id: order.id,
          model_id: item.model_id,
          size: item.size,
          color: item.color || "غير محدد",
          received_qty: item.quantity,
          available_qty: item.quantity,
        }));
        await supabase.from("inventory").insert(inventoryData);
      }

      await notificationService.sendNotification(
        "planning",
        "تم استلام البضاعة 📦✅",
        `قسم المخازن استلم كولكشن (${order.collections.name}) وتمت إضافته لأرصدة الجرد.`,
        notif.reference_id,
      );

      await handleNotificationClick(notif);
      toast.success("تم الاستلام وإضافة الكميات للمخزن بنجاح!");
    } catch (error) {
      console.error("Error receiving in warehouse:", error);
      toast.error("حدث خطأ أثناء استلام البضاعة.");
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

                          {/* 💡 زرار المخزن */}
                          {userDepartment === "inventory" &&
                            notif.reference_id &&
                            notif.title.includes("جاهز للاستلام") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReceiveInWarehouse(notif);
                                }}
                                disabled={isProcessing}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50"
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
