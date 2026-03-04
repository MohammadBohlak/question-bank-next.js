"use client";
import React, { useEffect, useState } from "react";
// import { useTranslations } from 'next-intl'
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Moon,
  Sun,
  Menu,
  ClipboardList,
  Languages,
  Building,
  User2,
  Globe,
  SidebarClose,
  ArrowLeft,
  PanelRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslations } from "next-intl";
import { cp } from "fs";
function useIsSm() {
  const [isSm, setIsSm] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");

    const updateState = () => setIsSm(media.matches);

    updateState(); // تحديث أولي

    media.addEventListener("change", updateState);
    return () => media.removeEventListener("change", updateState);
  }, []);

  return isSm;
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [roleFromStorage, setRoleFromStorage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("sidebar");
  const router = useRouter();
  const pathname = usePathname();
  const isSm = useIsSm();
  // const t = useTranslations('sidebar')
  const locale = useLocale();

  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log(isSm);
  }, [isSm]);
  // Initialize dark mode from localStorage
  useEffect(() => {
    if (!mounted) return;

    const savedMode = localStorage.getItem("mod");
    if (savedMode) {
      const isDark = savedMode === "dark";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [mounted]);

  const toggleDarkMode = () => {
    if (!mounted) return;
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("mod", newDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const toggleLanguage = () => {
    if (!mounted) return;

    const newLocale = locale === "en" ? "ar" : "en";

    // Remove current locale from path
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(`/${locale}`.length)
      : pathname;

    const newPath = `/${newLocale}${pathWithoutLocale || ""}`;

    router.replace(newPath);
  };

  const reduxRoles = useSelector((state: RootState) => state.auth.user?.roles);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem("roles");
    if (stored) setRoleFromStorage(stored);
  }, [mounted]);

  const normalizeRoles = (r: unknown): string[] => {
    if (!Array.isArray(r)) return [];
    if (Array.isArray(r[0])) return r.flat();
    return r;
  };

  const adminLinks = [
    {
      name: t("universities"),
      icon: Building,
      value: "universities_management",
    },
    {
      name: t("users"),
      icon: User2,
      value: "users",
    },
  ];

  const logout = () => {
    if (!mounted) return;
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    router.push("/");
  };

  const rawRoles =
    reduxRoles ?? (roleFromStorage ? JSON.parse(roleFromStorage) : []);
  const roles = normalizeRoles(rawRoles);

  const isAdmin = roles.includes("exm_SuperAdmin");
  const isSupervisor = roles.includes("exm_CourseSupervisor");

  const supervisorLinks = [
    {
      name: t("programBanks"),
      icon: Building,
      value: "questions_bank",
    },
    {
      name: t("recheckQuestions"),
      icon: ClipboardList,
      value: "question_recheck",
    },
  ];
  // todo: لازم تشيل adminLinks من آخر خيار
  // يعني لازم السطر اللي تحت يرجع يصير هيك
  //const menuLinks = isAdmin ? adminLinks: isSupervisor ? supervisorLinks : [] ;
  const menuLinks = isAdmin
    ? adminLinks
    : isSupervisor
      ? supervisorLinks
      : adminLinks;

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <aside
        className={cn(
          "h-screen bg-card-bg shadow-2xl dark:bg-gray-900 border-r border-border dark:border-gray-800 no-print flex flex-col transition-all duration-300",
          collapsed ? "w-14" : "w-64",
        )}
      >
        {/* Loading skeleton */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-800 bg-prim dark:bg-blue-800">
          <div className="h-6 bg-muted/50 dark:bg-gray-700/50 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        className={cn(
          "absolute right-0 ",
          "bg-prim dark:bg-sec rounded-l-full p-1 text-white z-10",
        )}
        onClick={() => {
          setCollapsed((p) => !p);
        }}
      >
        <PanelRight size={16} />
      </button>
      <aside
        className={cn(
          "h-screen bg-card-bg shadow-2xl border-l border-1 dark:bg-gray-900 border-r border-border dark:border-gray-800 no-print flex flex-col justify-between transition-all duration-300 z-20",
          // collapsed ? "w-20" : "w-64",
          collapsed
            ? "translate-x-full w-0 sm:w-14 sm:translate-x-0"
            : "translate-x-0 w-64 ",
        )}
        // dir=""
      >
        {(!collapsed || isSm) && (
          <>
            <div className="">
              <div
                className="flex items-center gap-3 pt-8 px-2 border-b border-border
                dark:border-gray-800"
              >
                {/* Logo */}
                <div className="flex items-center gap-3 flex-col w-full">
                  {!collapsed && (
                    <Image
                      src="/logo3.png"
                      alt={t("questionBank")}
                      width={150}
                      height={150}
                      priority
                    />
                  )}

                  <div className="flex  justify-between items-center w-full">
                    {!collapsed && (
                      <div>
                        <div className="leading-tight">
                          <h2 className="text-lg font-bold text-prim dark:text-white font-arabic">
                            {t("questionBank")}
                          </h2>
                          <p className="text-sm text-prim/70 dark:text-gray-100 font-arabic">
                            {t("dashboard")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Collapse Button */}
                    <div className="mb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className=" text-prim  dark:text-white hover:bg-sec/10 transition-colors duration-300"
                      >
                        <Menu size={25} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 mt-6 space-y-2 px-2">
                {menuLinks.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = pathname.endsWith(item.value);
                  return (
                    <div key={idx} className="relative group">
                      {" "}
                      {/* Wrapper for Tooltip logic */}
                      <button
                        onClick={() =>
                          router.push(`/${locale}/${item.value.toLowerCase()}`)
                        }
                        className={cn(
                          `flex items-center ${collapsed ? "justify-center " : "px-4"} cursor-pointer gap-3 font-medium text-l w-full py-3 rounded-lg transition-colors duration-200`,
                          isActive
                            ? "bg-linear-to-b from-sec to-prim   text-white font-semibold"
                            : "text-text dark:text-gray-300 border border-border dark:border-gray-700 hover:bg-muted dark:hover:bg-gray-800",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive
                              ? "text-white"
                              : "text-prim dark:text-blue-400",
                          )}
                        />
                        {!collapsed && (
                          <span className="font-arabic transition-all duration-300">
                            {item.name}
                          </span>
                        )}
                        {isActive && !collapsed && (
                          <div
                            className={`${locale == "ar" ? "mr-auto" : "ml-auto"} w-2 h-2 rounded-full bg-sec dark:bg-blue-400`}
                          ></div>
                        )}
                      </button>
                      {/* Tooltip Component - CSS Only */}
                      {collapsed && (
                        <div
                          className={cn(
                            `!font-serif absolute top-1/2 -translate-y-1/2 ${locale == "ar" ? "right-full mr-3" : "left-full ml-3"} `, // Position: left of the item (since RTL)
                            "opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0", // Animation
                            "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-arabic rounded-md px-3 py-1.5 shadow-xl",
                            "whitespace-nowrap pointer-events-none transition-all duration-300 ease-out",
                            "z-50 border border-gray-700 dark:border-gray-200", // Border for better visibility
                          )}
                        >
                          {item.name}
                          {/* Small Arrow pointing to the button */}
                          <div
                            className={`absolute ${locale == "ar" ? "right-0 translate-x-full" : "left-0 translate-x-[-100%]"}  top-1/2 -translate-y-1/2 `}
                          >
                            <div
                              className={`w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${locale == "ar" ? "border-l-[6px] border-l-gray-900 dark:border-l-gray-50" : "border-r-[6px] border-r-gray-900 dark:border-r-gray-50"} `}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            <div
              className={` py-4 ${collapsed ? "px-2" : "px-4"} border-t border-border dark:border-gray-800 flex-col space-y-2`}
              dir={`${locale == "en" ? "ltr" : "rtl"}`}
            >
              <div className="relative group">
                {" "}
                {/* Wrapper */}
                <button
                  onClick={toggleLanguage}
                  className={cn(
                    `flex items-center cursor-pointer gap-3 w-full px-4 py-3 rounded-lg
            border border-border dark:border-gray-700 text-text-sec dark:text-gray-300
            bg-card-bg dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700/50 transition-colors duration-200`,
                  )}
                  style={{
                    justifyContent: collapsed ? "center" : "space-between",
                  }}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <Globe className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                    {!collapsed && (
                      <span className="relative transition-all duration-300 font-arabic ">
                        {locale === "en" ? "العربية" : "English"}
                      </span>
                    )}
                  </div>
                </button>
                {/* Tooltip for Language */}
                {collapsed && (
                  <div
                    className={cn(
                      `!font-serif absolute top-1/2 -translate-y-1/2 ${locale == "ar" ? "right-full mr-3" : "left-full ml-3"} `,
                      "opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0",
                      "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-arabic rounded-md px-3 py-1.5 shadow-xl",
                      "whitespace-nowrap pointer-events-none transition-all duration-300 ease-out z-50 border border-gray-700 dark:border-gray-200",
                    )}
                  >
                    {locale === "en" ? "العربية" : "English"}
                    <div
                      className={`absolute ${locale == "ar" ? "right-0 translate-x-full" : "left-0 translate-x-[-100%]"}  top-1/2 -translate-y-1/2 `}
                    >
                      <div
                        className={`w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${locale == "ar" ? "border-l-[6px] border-l-gray-900 dark:border-l-gray-50" : "border-r-[6px] border-r-gray-900 dark:border-r-gray-50"} `}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                {" "}
                {/* Wrapper */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center cursor-pointer gap-3 w-full px-4 py-3 rounded-lg
            border border-border dark:border-gray-700 text-text-sec dark:text-gray-300
            bg-card-bg dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="relative w-5 h-5">
                      <Sun
                        className={cn(
                          "w-5 h-5 absolute transition-all duration-500 transform",
                          darkMode
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100",
                        )}
                      />
                      <Moon
                        className={cn(
                          "w-5 h-5 absolute transition-all duration-500 transform",
                          darkMode
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0",
                        )}
                      />
                    </div>

                    {!collapsed && (
                      <span className="relative transition-all duration-300 font-arabic ">
                        {darkMode ? t("lightMode") : t("darkMode")}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="mr-auto  flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-all  duration-500 border-2",
                          darkMode
                            ? "bg-yellow-300 dark:bg-yellow-400 border-yellow-300 dark:border-yellow-400"
                            : "bg-muted dark:bg-gray-600 border-border-light dark:border-gray-500",
                        )}
                      />
                      <span className="text-xs text-text-sec dark:text-gray-400 font-arabic">
                        {darkMode
                          ? locale === "ar"
                            ? "ليلي"
                            : "Dark"
                          : locale === "ar"
                            ? "نهاري"
                            : "Light"}
                      </span>
                    </div>
                  )}
                  {/* <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-gray-600/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div> */}
                </button>
                {/* Tooltip for Dark Mode */}
                {collapsed && (
                  <div
                    className={cn(
                      `!font-serif absolute top-1/2 -translate-y-1/2 ${locale == "ar" ? "right-full mr-3" : "left-full ml-3"} `,
                      "opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0",
                      "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-arabic rounded-md px-3 py-1.5 shadow-xl",
                      "whitespace-nowrap pointer-events-none transition-all duration-300 ease-out z-50 border border-gray-700 dark:border-gray-200",
                    )}
                  >
                    {darkMode ? t("lightMode") : t("darkMode")}
                    <div
                      className={`absolute ${locale == "ar" ? "right-0 translate-x-full" : "left-0 translate-x-[-100%]"}  top-1/2 -translate-y-1/2 `}
                    >
                      <div
                        className={`w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${locale == "ar" ? "border-l-[6px] border-l-gray-900 dark:border-l-gray-50" : "border-r-[6px] border-r-gray-900 dark:border-r-gray-50"} `}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                {" "}
                {/* Wrapper */}
                <button
                  onClick={logout}
                  className="flex items-center  gap-3 w-full px-3 py-3 rounded-lg
            bg-error dark:bg-red-700 text-white dark:text-gray-100
            hover:bg-error/90 dark:hover:bg-red-800 transition-colors duration-200 relative overflow-hidden"
                >
                  <LogOut className="w-5 h-5 font-bold cursor-pointer transition-transform duration-300 group-hover:-translate-x-1" />
                  {!collapsed && (
                    <span className="font-arabic transition-all duration-300 ">
                      {t("logout")}
                    </span>
                  )}
                </button>
                {/* Tooltip for Logout */}
                {collapsed && (
                  <div
                    className={cn(
                      `!font-serif absolute top-1/2 -translate-y-1/2 ${locale == "ar" ? "right-full mr-3" : "left-full ml-3"} `,
                      "opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0",
                      "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-arabic rounded-md px-3 py-1.5 shadow-xl",
                      "whitespace-nowrap pointer-events-none transition-all duration-300 ease-out z-50 border border-gray-700 dark:border-gray-200",
                    )}
                  >
                    {t("logout")}
                    <div
                      className={`absolute ${locale == "ar" ? "right-0 translate-x-full" : "left-0 translate-x-[-100%]"}  top-1/2 -translate-y-1/2 `}
                      // className={`absolute ${locale == "ar" ? "right-0" : "left-0"}  top-1/2 -translate-y-1/2 translate-x-full`}
                    >
                      <div
                        className={`w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${locale == "ar" ? "border-l-[6px] border-l-gray-900 dark:border-l-gray-50" : "border-r-[6px] border-r-gray-900 dark:border-r-gray-50"} `}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
