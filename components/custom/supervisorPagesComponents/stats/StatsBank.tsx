import React from "react";
import {
  FileText,
  Layers,
  CheckCircle,
  CheckCircle2,
  BarChart,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

interface StatsBankProps {
  bank:
    | {
        questionsCount?: number;
        chaptersCount?: number;
      }
    | any;
  stats: {
    confirmed: number;
    easy: number;
    medium: number;
    hard: number;
  };
}

const StatsBank: React.FC<StatsBankProps> = ({ bank, stats }) => {
  const t = useTranslations("bankDetails"); // تأكد من صحة namespace

  // تعريف الألوان لتتوافق مع التصميم الأصلي
  // الألوان تم اختيارها لتقريب التدرجات اللونية (Gradient) المستخدمة سابقاً
  const colorSchemes = {
    bluePurple: {
      dot: "bg-blue-500",
      shadow: "rgba(59,130,246,0.5)",
      hover: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    },
    emeraldTeal: {
      dot: "bg-emerald-500",
      shadow: "rgba(16,185,129,0.5)",
      hover: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
    },
    green: {
      dot: "bg-green-500",
      shadow: "rgba(34,197,94,0.5)",
      hover: "hover:bg-green-50/50 dark:hover:bg-green-900/10",
    },
    blueIndigo: {
      dot: "bg-blue-600",
      shadow: "rgba(37,99,235,0.5)",
      hover: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
    },
    amber: {
      dot: "bg-amber-500",
      shadow: "rgba(245,158,11,0.5)",
      hover: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
    },
  };

  const statsData = [
    {
      id: "totalQuestions",
      title: t("stats.totalQuestions"),
      value: bank?.questionsCount || 0,
      icon: FileText,
      dotColor: colorSchemes.bluePurple.dot,
      shadowColor: colorSchemes.bluePurple.shadow,
      hoverBg: colorSchemes.bluePurple.hover,
    },
    {
      id: "chapters",
      title: t("stats.chapters"),
      value: bank?.chaptersCount || 0,
      icon: Layers,
      dotColor: colorSchemes.emeraldTeal.dot,
      shadowColor: colorSchemes.emeraldTeal.shadow,
      hoverBg: colorSchemes.emeraldTeal.hover,
    },
    {
      id: "confirmed",
      title: t("stats.confirmed"),
      value: stats.confirmed,
      icon: CheckCircle,
      dotColor: colorSchemes.green.dot,
      shadowColor: colorSchemes.green.shadow,
      hoverBg: colorSchemes.green.hover,
    },
    {
      id: "easy",
      title: t("stats.easy"),
      value: stats.easy,
      icon: CheckCircle2,
      dotColor: colorSchemes.emeraldTeal.dot,
      shadowColor: colorSchemes.emeraldTeal.shadow,
      hoverBg: colorSchemes.emeraldTeal.hover,
    },
    {
      id: "medium",
      title: t("stats.medium"),
      value: stats.medium,
      icon: BarChart,
      dotColor: colorSchemes.blueIndigo.dot,
      shadowColor: colorSchemes.blueIndigo.shadow,
      hoverBg: colorSchemes.blueIndigo.hover,
    },
    {
      id: "hard",
      title: t("stats.hard"),
      value: stats.hard,
      icon: AlertTriangle,
      dotColor: colorSchemes.amber.dot,
      shadowColor: colorSchemes.amber.shadow,
      hoverBg: colorSchemes.amber.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsBank;
