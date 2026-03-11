import React from "react";

import { BookOpen, Eye, Globe, BookMarked } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

const StatsCourses = ({}) => {
  const courses = useSelector(
    (state: RootState) => state.supervisor.courses || [],
  );
  const t = useTranslations("questionbank");

  const statsData = [
    {
      id: "total",
      title: t("totalCourses"),
      value: courses.length,
      icon: BookOpen,
      dotColor: "bg-blue-500",
      shadowColor: "rgba(59,130,246,0.5)",
      hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10", // يمكنك تمريرها كـ prop إذا أردت تخصيصها من الخارج
    },
    {
      id: "active",
      title: t("activeCourses"),
      value: courses.filter((c) => c.isActive).length,
      icon: Eye,
      dotColor: "bg-emerald-500",
      shadowColor: "rgba(16,185,129,0.5)",
      hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
    },
    {
      id: "public",
      title: t("publicCourses"),
      value: courses.filter((c) => !c.isPrivate).length,
      icon: Globe,
      dotColor: "bg-amber-500",
      shadowColor: "rgba(245,158,11,0.5)",
      hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
    },
    {
      id: "banks",
      title: t("totalBanks"),
      value: courses.reduce((sum, c) => sum + c.courseBanksCount, 0),
      icon: BookMarked,
      dotColor: "bg-purple-500",
      shadowColor: "rgba(168,85,247,0.5)",
      hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsCourses;
