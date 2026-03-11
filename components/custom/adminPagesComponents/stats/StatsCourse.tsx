import React from "react";
import { BookMarked, FileText, Layers, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

// نستخدم Partial<Omit<...>> لتعريف الخصائص التي نحتاجها فقط من الـ Course Interface
interface StatsCourseProps {
  course: {
    courseBanksCount: number;
    program: string; // اسم البرنامج (نص)
  };
  totalQuestions: number;
  totalChapters: number;
}

const StatsCourse: React.FC<StatsCourseProps> = ({
  course,
  totalQuestions,
  totalChapters,
}) => {
  const t = useTranslations("adminCourseDetails");

  // تعريف الألوان
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
    amber: {
      dot: "bg-amber-500",
      shadow: "rgba(245,158,11,0.5)",
      hover: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
    },
  };

  const statsData = [
    {
      id: "banks",
      title: t("stats.banks"),
      value: course.courseBanksCount,
      icon: BookMarked,
      dotColor: colorSchemes.blue.dot,
      shadowColor: colorSchemes.blue.shadow,
      hoverBg: colorSchemes.blue.hover,
    },
    {
      id: "questions",
      title: t("stats.questions"),
      value: totalQuestions,
      icon: FileText,
      dotColor: colorSchemes.green.dot,
      shadowColor: colorSchemes.green.shadow,
      hoverBg: colorSchemes.green.hover,
    },
    {
      id: "chapters",
      title: t("stats.chapters"),
      value: totalChapters,
      icon: Layers,
      dotColor: colorSchemes.purple.dot,
      shadowColor: colorSchemes.purple.shadow,
      hoverBg: colorSchemes.purple.hover,
    },
    {
      id: "program",
      title: t("stats.program"),
      value: course.program, // عرض اسم البرنامج كقيمة
      icon: GraduationCap,
      dotColor: colorSchemes.amber.dot,
      shadowColor: colorSchemes.amber.shadow,
      hoverBg: colorSchemes.amber.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsCourse;
