import React from "react";
import { BookOpen, CheckCircle, GraduationCap, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

// 1. تعريف شكل كائن البرنامج الواحد
interface ProgramItem {
  isActive: boolean;
  coursesCount?: number;
  coursesBanksCount?: number;
}

// 2. تعريف شكل الـ Props التي يستقبلها المكون
interface StatsUniversityProps {
  university: {
    programsCount?: number | null;
    programs?: ProgramItem[] | null;
  };
}

const StatsUniversity: React.FC<StatsUniversityProps> = ({ university }) => {
  const t = useTranslations("UniversityDetailsPage");

  // تعريف الألوان لتتوافق مع التصميم الأصلي
  const colorSchemes = {
    blue: {
      dot: "bg-blue-500",
      shadow: "rgba(59,130,246,0.5)",
      hover: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    },
    green: {
      dot: "bg-green-500",
      shadow: "rgba(34,197,94,0.5)",
      hover: "hover:bg-green-50/50 dark:hover:bg-green-900/10",
    },
    purple: {
      dot: "bg-purple-500",
      shadow: "rgba(168,85,247,0.5)",
      hover: "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
    },
    orange: {
      dot: "bg-orange-500",
      shadow: "rgba(249,115,22,0.5)",
      hover: "hover:bg-orange-50/50 dark:hover:bg-orange-900/10",
    },
  };

  // حساب القيم بنفس منطق الكود القديم
  const activeProgramsCount =
    university.programs?.filter((p) => p.isActive).length || 0;
  const totalCoursesCount =
    university.programs?.reduce(
      (sum: number, p) => sum + (p.coursesCount || 0),
      0,
    ) || 0;
  const totalBanksCount =
    university.programs?.reduce(
      (sum, p) => sum + (p.coursesBanksCount || 0),
      0,
    ) || 0;

  const statsData = [
    {
      id: "programs",
      title: t("stats.programs"),
      value: university.programsCount || 0,
      icon: BookOpen,
      dotColor: colorSchemes.blue.dot,
      shadowColor: colorSchemes.blue.shadow,
      hoverBg: colorSchemes.blue.hover,
    },
    {
      id: "activePrograms",
      title: t("stats.activePrograms"),
      value: activeProgramsCount,
      icon: CheckCircle,
      dotColor: colorSchemes.green.dot,
      shadowColor: colorSchemes.green.shadow,
      hoverBg: colorSchemes.green.hover,
    },
    {
      id: "totalCourses",
      title: t("stats.totalCourses"),
      value: totalCoursesCount,
      icon: GraduationCap,
      dotColor: colorSchemes.purple.dot,
      shadowColor: colorSchemes.purple.shadow,
      hoverBg: colorSchemes.purple.hover,
    },
    {
      id: "courseBanks",
      title: t("stats.courseBanks"),
      value: totalBanksCount,
      icon: FileText,
      dotColor: colorSchemes.orange.dot,
      shadowColor: colorSchemes.orange.shadow,
      hoverBg: colorSchemes.orange.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsUniversity;
