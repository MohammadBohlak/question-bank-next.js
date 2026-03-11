// src/lib/userUtils.ts

import { AllUsers } from "@/app/[locale]/(admin)/users/page";

export const getFullNameAr = (user: AllUsers): string => {
  return (
    user.fullNameAr ||
    `${user.nameAr || ""} ${user.fatherNameAr || ""} ${user.surnameAr || ""}`.trim()
  );
};
export const getFullNameEn = (user: AllUsers): string => {
  return (
    user.fullNameEn ||
    `${user.nameEn || ""} ${user.fatherNameEn || ""} ${user.surnameEn || ""}`.trim()
  );
};

export const getUsername = (user: AllUsers): string => {
  return user.username || user.userName || "-";
};

export const getEmail = (user: AllUsers): string => {
  return user.email || "-";
};

export const getMobile = (user: AllUsers): string => {
  return user.mobile || "-";
};
export const formatDate = (dateString: string | undefined, lang: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};
