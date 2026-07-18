import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200 overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-4xl font-bold text-center">تسجيل الدخول</h1>
          <p className="mt-3 md:text-sm text-xs text-slate-500 text-center">
            الرجاء إدخال البريد الإلكتروني وكلمة المرور للمتابعة.
          </p>
        </div>

        <form className="space-y-5 px-8 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 text-right">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="example@example.com"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#002366] focus:ring-2 focus:ring-[#002366]/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 text-right">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#002366] focus:ring-2 focus:ring-[#002366]/20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-2xl bg-[#002366] px-4 py-3 text-white md:text-lg font-semibold shadow-lg shadow-[#002366]/15 transition hover:bg-[#091d4c]"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
