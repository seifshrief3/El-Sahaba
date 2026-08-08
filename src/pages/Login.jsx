import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { toast } from "sonner";
import logo from "../assets/logo.jpeg";

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  // States للتحكم في الفورم
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States لإنشاء حساب العميل
  const [selectedBrand, setSelectedBrand] = useState("");
  const [brandsList, setBrandsList] = useState([]);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // جلب قائمة البراندات
  useEffect(() => {
    if (!isLoginView && brandsList.length === 0) {
      const fetchBrands = async () => {
        const { data, error } = await supabase
          .from("brands")
          .select("id, name_ar");
        if (!error && data) {
          setBrandsList(data);
        }
      };
      fetchBrands();
    }
  }, [isLoginView, brandsList.length]);

  // دالة تسجيل الدخول
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(e, email, password);

    if (!result.success) return;

    // توجيه المستخدم حسب دوره
    switch (result.role) {
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
        alert("لم يتم العثور على صلاحية لهذا المستخدم");
    }
  };

  // دالة إنشاء حساب للعميل
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBrand) {
      toast.error("برجاء اختيار البراند الخاص بك");
      return;
    }

    setIsSigningUp(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "client",
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user.id;
      const { error: brandError } = await supabase
        .from("brands")
        .update({ client_id: userId })
        .eq("id", selectedBrand);

      if (brandError) throw brandError;

      toast.success("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      setIsLoginView(true);
      setPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-arabic"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200 overflow-hidden">
        {/* 💡 التعديل هنا: تقليل البادينج (pt-8 بدل py-10) */}
        <div className="px-8 pt-8 pb-4 flex flex-col items-center">
          {/* 💡 التعديل هنا: تقليل الـ Margin السفلي وإزالة الشادو */}
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-28 w-auto object-contain" />
          </div>

          <h1 className="text-3xl font-bold text-center text-[#1a365d]">
            {isLoginView ? "تسجيل الدخول" : "إنشاء حساب عميل جديد"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 text-center">
            {isLoginView
              ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور للمتابعة."
              : "برجاء إدخال بياناتك واختيار البراند الخاص بك لمتابعة التشغيل."}
          </p>
        </div>

        <form
          className="space-y-5 px-8 pb-8"
          onSubmit={isLoginView ? handleLoginSubmit : handleSignUpSubmit}
        >
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

          {!isLoginView && (
            <div className="animate-fade-in">
              <label className="mb-2 block text-sm font-semibold text-slate-700 text-right">
                اختار البراند الخاص بك
              </label>
              <select
                required
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/20 cursor-pointer"
              >
                <option value="" disabled>
                  -- اضغط لاختيار البراند --
                </option>
                {brandsList.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name_ar}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isSigningUp}
            className="w-full cursor-pointer rounded-2xl bg-[#1a365d] px-4 py-3 text-white text-lg font-bold shadow-lg shadow-[#1a365d]/15 transition hover:bg-blue-900 disabled:opacity-70 mt-2"
          >
            {isLoginView
              ? loading
                ? "جاري الدخول..."
                : "تسجيل الدخول"
              : isSigningUp
                ? "جاري إنشاء الحساب..."
                : "إنشاء الحساب"}
          </button>
        </form>

        <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            {isLoginView ? "أنت عميل لدى المصنع؟" : "لديك حساب بالفعل؟"}
            <button
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-[#b91c1c] font-bold hover:underline mx-2 transition"
            >
              {isLoginView ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
