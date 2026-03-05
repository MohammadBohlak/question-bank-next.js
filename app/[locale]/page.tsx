"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginUser } from "@/store/auth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const valid = username.length > 0 && password.length > 0;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!valid) {
      toast.error("يرجى إصلاح الأخطاء قبل تسجيل الدخول ❌");
      return;
    }

    const loginPromise = (async () => {
      const result = await dispatch(loginUser({ username, password })).unwrap();

      if (!result.success) {
        const errorMessage =
          result.errors?.join(" • ") || result.message || "فشل تسجيل الدخول";
        throw new Error(errorMessage);
      }

      const roles = result.result.user.roles;

      if (roles.includes("exm_SuperAdmin")) {
        router.push("/ar/universities_management");
      } else if (roles.includes("exm_CourseSupervisor")) {
        router.push("/ar/questions_bank");
      } else {
        throw new Error("صلاحية غير معروفة. يرجى الاتصال بالمسؤول.");
      }

      return result;
    })();

    toast.promise(loginPromise, {
      loading: "جاري تسجيل الدخول...",
      success: "تم تسجيل الدخول بنجاح",
      error: (err) => err.message || "فشل تسجيل الدخول ❌",
    });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
               bg-gradient-to-br from-blue-50 via-white to-blue-100
               p-4 transition-colors duration-300"
    >
      <div
        className="
        w-full max-w-5xl
        grid grid-cols-1 md:grid-cols-2
        rounded-2xl overflow-hidden
        bg-white/90 backdrop-blur
        border border-blue-100
        shadow-2xl
        transition-colors duration-300
      "
      >
        {/* RIGHT SIDE – LOGO / BRAND */}
        <div
          className="
          flex flex-col items-center justify-center
          bg-gradient-to-b from-sec to-prim
          text-white p-10
          
          transition-colors duration-300
        "
        >
          <Image
            src="/logo2.png"
            alt="نظام بنك الأسئلة"
            width={320}
            height={200}
            priority
            className="drop-shadow-xl rounded-sm"
          />

          <h1 className="mt-6 text-3xl font-bold font-arabic text-center">
            نظام بنك الأسئلة
          </h1>

          <p className="mt-2 text-base text-blue-100 font-arabic text-center leading-relaxed max-w-sm">
            منصة أكاديمية متكاملة لإدارة، إنشاء، وتنظيم الأسئلة الامتحانية
            باحترافية عالية
          </p>
        </div>

        {/* LEFT SIDE – LOGIN FORM */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login Header with Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 text-blue-600 shadow-sm border border-blue-100">
                <LogIn size={32} strokeWidth={2} className="text-blue-900" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 font-arabic">
                تسجيل الدخول
              </h2>
              <p className="text-md text-gray-600  font-arabic mt-2">
                الرجاء إدخال بياناتك للمتابعة
              </p>
            </div>

            {/* Username Field with Icon */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-900 font-arabic">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sec">
                  <User size={20} />
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  className="
                  w-full rounded-lg border border-blue-200
                  py-3 pr-10 pl-3 text-right font-arabic
                  bg-white
                  text-gray-900
                  placeholder:text-gray-500
                  f-input
                  transition-all duration-200
                "
                />
              </div>
            </div>

            {/* Password Field with Icon and Toggle Visibility */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-900 font-arabic">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sec">
                  <Lock size={20} />
                </div>
                <input
                  ref={passwordInputRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  className="
                  w-full rounded-lg border border-blue-200
                  py-3 pr-10 pl-12 text-right font-arabic
                  bg-white
                  text-gray-900
                  placeholder:text-gray-500
                  f-input
                  transition-all duration-200
                "
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    // // تأخير بسيط جداً حتى يتم تغيير الـ type ثم نركز
                    // setTimeout(() => {
                    //   passwordInputRef.current?.focus();
                    // }, 0);
                    setTimeout(() => {
                      const input = passwordInputRef.current;
                      if (input) {
                        input.focus();
                        // وضع المؤشر في نهاية النص
                        const len = input.value.length;
                        input.setSelectionRange(len, len);
                      }
                    }, 0);
                  }}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!valid}
              className={`
              w-full py-3 rounded-lg font-semibold font-arabic
              text-white transition-all duration-300
              ${
                valid
                  ? "bg-gradient-to-b from-[#2ab3f7] to-[#141a73] hover:opacity-90 shadow-lg"
                  : "bg-blue-300 cursor-not-allowed"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
