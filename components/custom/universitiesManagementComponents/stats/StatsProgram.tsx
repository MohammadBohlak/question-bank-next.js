import React from "react";
import { BookMarked, CheckCircle, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  CourseFormData,
  ProgramFormData,
} from "@/app/[locale]/(admin)/universities_management/[id]/[programId]/page";
import StatsGrid from "../../common/StatsGrid";

interface StatsProgramProps {
  program: {
    coursesCount?: number;
    coursesBanksCount?: number;
  };
  courses:
    | Array<{
        isActive: boolean;
      }>
    | any[];
}

const StatsProgram: React.FC<StatsProgramProps> = ({ program, courses }) => {
  const t = useTranslations("programDetails");

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
  };

  const statsData = [
    {
      id: "courses",
      title: t("stats.courses"),
      value: program.coursesCount || 0,
      icon: BookMarked,
      dotColor: colorSchemes.blue.dot,
      shadowColor: colorSchemes.blue.shadow,
      hoverBg: colorSchemes.blue.hover,
    },
    {
      id: "activeCourses",
      title: t("stats.activeCourses"),
      value: courses.filter((c) => c.isActive).length,
      icon: CheckCircle,
      dotColor: colorSchemes.green.dot,
      shadowColor: colorSchemes.green.shadow,
      hoverBg: colorSchemes.green.hover,
    },
    {
      id: "courseBanks",
      title: t("stats.courseBanks"),
      value: program.coursesBanksCount || 0,
      icon: FileText,
      dotColor: colorSchemes.purple.dot,
      shadowColor: colorSchemes.purple.shadow,
      hoverBg: colorSchemes.purple.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsProgram;
