"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function RouteGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const locale = useLocale();

  const { user, loading, initialized } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (!initialized || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(`/${locale}`);
      return;
    }

    const userRoles = user?.roles ?? [];

    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      router.replace(`/${locale}/unauthorized`);
    }
  }, [initialized, loading, user, allowedRoles, router, locale]);

  if (!initialized || loading) return null;

  return <>{children}</>;
}
