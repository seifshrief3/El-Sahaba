import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase"; // تأكد من صحة مسار الاستيراد
import { History, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EditsHistory = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_logs")
        // حددنا العواميد الصحيحة بناءً على الـ Schema بتاعتك
        .select("id, module, action_type, title, description, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      toast.error("حدث خطأ أثناء جلب سجل التعديلات");
    } finally {
      setIsLoading(false);
    }
  };

  // --- دوال الترجمة ---
  const translateModule = (moduleName) => {
    const modules = {
      customer_service: "خدمة العملاء",
      production: "الإنتاج",
      planning: "التخطيط",
      inventory: "المخازن",
      shipping: "الشحن",
      management: "الإدارة",
    };
    return modules[moduleName?.toLowerCase()] || moduleName;
  };

  const translateAction = (actionType) => {
    const actions = {
      STATUS_CHANGE: "تغيير حالة",
      CREATE: "إضافة",
      UPDATE: "تعديل",
      DELETE: "حذف",
      APPROVE: "موافقة",
      REJECT: "رفض",
    };
    return actions[actionType?.toUpperCase()] || actionType;
  };

  const getActionColor = (type) => {
    const upperType = type?.toUpperCase();
    if (["CREATE", "إضافة", "APPROVE", "موافقة"].includes(upperType)) {
      return "bg-green-100 text-green-700";
    }
    if (
      ["UPDATE", "تعديل", "STATUS_CHANGE", "تغيير حالة"].includes(upperType)
    ) {
      return "bg-blue-100 text-blue-700";
    }
    if (["DELETE", "حذف", "REJECT", "رفض"].includes(upperType)) {
      return "bg-red-100 text-red-700";
    }
    return "bg-slate-200 text-slate-700";
  };
  // -------------------

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#1a233a]">
          <History size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1a233a]">سجل التعديلات</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            عرض مفصل لتاريخ التعديلات والأحداث التي تمت على النظام.
          </p>
        </div>
      </div>

      {/* Logs List */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm min-h-[50vh]">
        {isLoading ? (
          <div className="flex h-full min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center text-[#1a233a]">
              <Loader2 className="mb-4 h-10 w-10 animate-spin" />
              <h2 className="text-lg font-bold">جاري تحميل السجلات...</h2>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-full min-h-[40vh] items-center justify-center text-slate-500">
            <p className="font-medium text-lg">
              لا توجد تعديلات مسجلة في النظام حتى الآن.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:shadow-md hover:bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1a233a]"></div>

                  <div className="flex flex-col gap-1.5">
                    {/* العنوان الأساسي للحدث */}
                    <p className="text-base font-bold text-[#1a233a] leading-relaxed">
                      {log.title}
                    </p>

                    {/* الوصف (لو موجود) */}
                    {log.description && (
                      <p className="text-sm font-medium text-slate-500">
                        {log.description}
                      </p>
                    )}

                    {/* شارات القسم ونوع الحركة مترجمة */}
                    <div className="flex gap-2 mt-1">
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {translateModule(log.module)}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ${getActionColor(
                          log.action_type,
                        )}`}
                      >
                        {translateAction(log.action_type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* الوقت والتاريخ */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 sm:self-start sm:mt-1">
                  <Clock size={14} />
                  <span dir="ltr">
                    {new Date(log.created_at).toLocaleString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditsHistory;
