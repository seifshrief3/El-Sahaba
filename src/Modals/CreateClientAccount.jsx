import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../supabase";

const CreateClientAccount = ({
  brand,
  isOpen,
  setIsCreateAccountOpen,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !brand) return null;

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("برجاء إدخال البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      toast.error("برجاء إدخال كلمة المرور");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsCreating(true);

    try {
      /*
       * =========================================================
       * مهم جداً:
       * نستخدم Supabase Client منفصل للـ signUp
       * حتى لا نغير Session حساب خدمة العملاء الحالي.
       * =========================================================
       */

      const authClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );

      /*
       * =========================================================
       * إنشاء حساب العميل
       * =========================================================
       */

      const { data: authData, error: authError } = await authClient.auth.signUp(
        {
          email: email.trim(),
          password: password,

          options: {
            data: {
              role: "client",
              brand_id: brand.id,
              brand_name: brand.name_ar,
            },
          },
        },
      );

      if (authError) {
        throw authError;
      }

      /*
       * =========================================================
       * التأكد إن المستخدم اتعمل فعلاً
       * =========================================================
       */

      const clientUser = authData?.user;

      if (!clientUser) {
        throw new Error("تم إنشاء الحساب ولكن لم يتم استرجاع بيانات المستخدم.");
      }

      /*
       * =========================================================
       * ربط حساب العميل بالبراند
       *
       * مهم:
       * العمود هو client_portal_user_id
       * وليس client_id
       * =========================================================
       */

      const { error: brandError } = await supabase
        .from("brands")
        .update({
          client_portal_user_id: clientUser.id,
        })
        .eq("id", brand.id);

      if (brandError) {
        console.error("BRAND UPDATE ERROR:", brandError);

        /*
         * الحساب اتعمل بالفعل ولكن فشل الربط بالبراند.
         */
        throw new Error("تم إنشاء حساب العميل، لكن فشل ربط الحساب بالبراند.");
      }

      /*
       * =========================================================
       * نجاح
       * =========================================================
       */

      toast.success("تم إنشاء حساب العميل بنجاح");

      toast.info("يمكن الآن إرسال بيانات الدخول للعميل.");

      /*
       * إرسال البيانات للصفحة الأم
       */
      if (onSuccess) {
        onSuccess({
          userId: clientUser.id,
          email: email.trim(),
          password: password,
        });
      }

      /*
       * تنظيف الفورم
       */
      setEmail("");
      setPassword("");

      setIsCreateAccountOpen(false);
    } catch (error) {
      console.error("CREATE CLIENT ACCOUNT ERROR:", error);

      toast.error(error?.message || "حدث خطأ أثناء إنشاء حساب العميل.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        dir="rtl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a365d] text-white">
              <UserPlus size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1a365d]">
                إنشاء حساب للعميل
              </h2>

              <p className="mt-1 text-xs text-slate-500">{brand.name_ar}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateAccountOpen(false)}
            disabled={isCreating}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <form onSubmit={handleCreateAccount} className="space-y-5 p-6">
          {/* Email */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              البريد الإلكتروني
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              dir="ltr"
              disabled={isCreating}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm text-slate-900 outline-none transition focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Password */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              كلمة المرور
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                disabled={isCreating}
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-left text-sm text-slate-900 outline-none transition focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              يجب أن تكون كلمة المرور 6 أحرف على الأقل.
            </p>
          </div>

          {/* Info */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-right">
            <p className="text-xs leading-6 text-blue-800">
              سيتم إنشاء حساب دخول خاص بالعميل وربطه ببراند{" "}
              <span className="font-bold">{brand.name_ar}</span>
              .
              <br />
              حساب خدمة العملاء الحالي لن يتأثر.
            </p>
          </div>

          {/* Buttons */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateAccountOpen(false)}
              disabled={isCreating}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 rounded-xl bg-[#1a365d] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientAccount;
