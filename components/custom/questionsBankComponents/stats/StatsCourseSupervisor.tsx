import React from "react";
import { BookOpen, FileText, Layers, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid"; // تأكد من صحة المسار
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface StatsCourseProps {
  totalQuestions: number;
  totalChapters: number;
  activeBanksCount: number;
}

const StatsCourseSupervisor: React.FC<StatsCourseProps> = ({
  totalQuestions,
  totalChapters,
  activeBanksCount,
}) => {
  const t = useTranslations("courseDetails");
  const course = useSelector(
    (state: RootState) => state.supervisor.courseDetail,
  );
  const statsData = [
    {
      id: "banks",
      title: t("courseBanks"),
      value: course?.courseBanksCount ?? 0,
      icon: BookOpen,
      dotColor: "bg-blue-500",
      shadowColor: "rgba(59,130,246,0.5)",
      hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    },
    {
      id: "questions",
      title: t("totalQuestions"),
      value: totalQuestions,
      icon: FileText,
      dotColor: "bg-purple-500",
      shadowColor: "rgba(168,85,247,0.5)",
      hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
    },
    {
      id: "chapters",
      title: t("totalChapters"),
      value: totalChapters,
      icon: Layers,
      dotColor: "bg-amber-500",
      shadowColor: "rgba(245,158,11,0.5)",
      hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
    },
    {
      id: "active",
      title: t("activeBanks"),
      value: activeBanksCount,
      icon: CheckCircle,
      dotColor: "bg-emerald-500",
      shadowColor: "rgba(16,185,129,0.5)",
      hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsCourseSupervisor;
