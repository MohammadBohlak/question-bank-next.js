"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginUser } from "@/store/auth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import Image from "next/image";
import { start } from "repl";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const valid = username.length > 0 && password.length > 0;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!valid) {
      toast.error("يرجى إصلاح الأخطاء قبل تسجيل الدخول ❌");
      return;
    }

    const loginPromise = (async () => {
      const result = await dispatch(loginUser({ username, password })).unwrap();

      // Check if login failed
      if (!result.success) {
        // Throw an error to trigger the error state in toast.promise
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
      error: (err) => err.message || "فشل تسجيل الدخول ❌", // This will show your error message
    });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
               bg-linear-to-br from-blue-50 via-white to-blue-100 
               dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 
               p-4 transition-colors duration-300"
    >
      <div
        className="
        w-full max-w-5xl
        grid grid-cols-1 md:grid-cols-2
        rounded-2xl overflow-hidden
        bg-white/90 backdrop-blur
        dark:bg-gray-800/90 dark:backdrop-blur
        border border-blue-100 dark:border-gray-700
        shadow-2xl dark:shadow-2xl dark:shadow-black/50
        transition-colors duration-300
      "
      >
        {/* RIGHT SIDE – LOGO / BRAND */}
        <div
          className="
          flex flex-col items-center justify-center
          bg-linear-to-br from-blue-600 to-blue-500
          dark:from-blue-800 dark:to-blue-900
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

          <p className="mt-2 text-base text-blue-100 dark:text-blue-200 font-arabic text-center leading-relaxed max-w-sm">
            منصة أكاديمية متكاملة لإدارة، إنشاء، وتنظيم الأسئلة الامتحانية
            باحترافية عالية
          </p>
        </div>

        {/* LEFT SIDE – LOGIN FORM */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white font-arabic">
                تسجيل الدخول
              </h2>
              <p className="text-sm text-blue-700/70 dark:text-gray-300 font-arabic mt-1">
                الرجاء إدخال بياناتك للمتابعة
              </p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-900 dark:text-gray-200 font-arabic">
                اسم المستخدم
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="أدخل اسم المستخدم"
                className="
                w-full rounded-lg border border-blue-200 dark:border-gray-600
                p-3 text-right font-arabic
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:outline-none focus:border-blue-500 dark:focus:border-blue-500
                focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                transition-all duration-200
              "
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-900 dark:text-gray-200 font-arabic">
                كلمة المرور
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="أدخل كلمة المرور"
                className="
                w-full rounded-lg border border-blue-200 dark:border-gray-600
                p-3 text-right font-arabic
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:outline-none focus:border-blue-500 dark:focus:border-blue-500
                focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                transition-all duration-200
              "
              />
            </div>

            <button
              type="submit"
              disabled={!valid}
              className={`
              w-full py-3 rounded-lg font-semibold font-arabic
              text-white transition-all duration-300
              ${
                valid
                  ? "bg-linear-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 hover:opacity-90 shadow-lg dark:shadow-blue-900/30"
                  : "bg-blue-300 dark:bg-gray-600 cursor-not-allowed"
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
