import React from "react";
import { Building, Shield, Users, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

interface StatsUniversitiesProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    public: number;
    private: number;
  };
}

const StatsUniversities: React.FC<StatsUniversitiesProps> = ({ stats }) => {
  const t = useTranslations("UniversitiesPage"); // افترضت أن الـ namespace هو common بناءً على مفتاح stats

  // تعريف الألوان لتتوافق مع StatsGrid
  // لقد قمت بمطابقة الألوان القديمة (primary, success, error...) مع ألوان Tailwind الأساسية
  const colorSchemes = {
    primary: {
      dot: "bg-blue-500",
      shadow: "rgba(59,130,246,0.5)",
      hover: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    },
    success: {
      dot: "bg-emerald-500",
      shadow: "rgba(16,185,129,0.5)",
      hover: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
    },
    error: {
      dot: "bg-red-500",
      shadow: "rgba(239,68,68,0.5)",
      hover: "hover:bg-red-50/50 dark:hover:bg-red-900/10",
    },
    secondary: {
      dot: "bg-sky-500", // أقرب لـ secondary
      shadow: "rgba(14,165,233,0.5)",
      hover: "hover:bg-sky-50/50 dark:hover:bg-sky-900/10",
    },
    dark: {
      dot: "bg-gray-500",
      shadow: "rgba(107,114,128,0.5)",
      hover: "hover:bg-gray-50/50 dark:hover:bg-gray-800/10",
    },
  };

  const statsData = [
    {
      id: "total",
      title: t("stats.total"),
      value: stats.total,
      icon: Building,
      dotColor: colorSchemes.primary.dot,
      shadowColor: colorSchemes.primary.shadow,
      hoverBg: colorSchemes.primary.hover,
    },
    {
      id: "active",
      title: t("stats.active"),
      value: stats.active,
      icon: Shield, // أو أي أيقونة أخرى تراها مناسبة
      dotColor: colorSchemes.success.dot,
      shadowColor: colorSchemes.success.shadow,
      hoverBg: colorSchemes.success.hover,
    },
    {
      id: "inactive",
      title: t("stats.inactive"),
      value: stats.inactive,
      icon: Shield,
      dotColor: colorSchemes.error.dot,
      shadowColor: colorSchemes.error.shadow,
      hoverBg: colorSchemes.error.hover,
    },
    {
      id: "public",
      title: t("stats.public"),
      value: stats.public,
      icon: Users,
      dotColor: colorSchemes.secondary.dot,
      shadowColor: colorSchemes.secondary.shadow,
      hoverBg: colorSchemes.secondary.hover,
    },
    {
      id: "private",
      title: t("stats.private"),
      value: stats.private,
      icon: Globe,
      dotColor: colorSchemes.dark.dot,
      shadowColor: colorSchemes.dark.shadow,
      hoverBg: colorSchemes.dark.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsUniversities;
