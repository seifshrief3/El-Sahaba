import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "../assets/logo.jpeg";

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // تسجيل الدخول
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const result = await handleLogin(e, email, password);

    if (!result.success) {
      toast.error(result.message || "بيانات تسجيل الدخول غير صحيحة");
      return;
    }

    // توجيه المستخدم حسب دوره
    switch (result.role) {
      case "admin":
        navigate("/managments");
        break;

      case "customer_service":
        navigate("/customer_service");
        break;

      case "planning":
        navigate("/planning");
        break;

      case "management":
        navigate("/managments");
        break;

      case "warehouse":
        navigate("/shipping");
        break;

      case "client":
        navigate("/client-portal");
        break;

      default:
        toast.error("لم يتم العثور على صلاحية لهذا المستخدم");
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-arabic"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-28 w-auto object-contain" />
          </div>

          <h1 className="text-3xl font-bold text-center text-[#1a365d] mt-2">
            تسجيل الدخول
          </h1>

          <p className="mt-2 text-sm text-slate-500 text-center">
            الرجاء إدخال البريد الإلكتروني وكلمة المرور للمتابعة.
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-5 px-8 pb-8" onSubmit={handleLoginSubmit}>
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 text-right">
              البريد الإلكتروني
            </label>

            <input
              type="email"
              placeholder="example@example.com"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20 text-left"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 text-right">
              كلمة المرور
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20 text-left"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-2xl bg-[#1a365d] px-4 py-3 text-white text-lg font-bold shadow-lg shadow-[#1a365d]/15 transition hover:bg-blue-900 disabled:opacity-70 mt-2"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
