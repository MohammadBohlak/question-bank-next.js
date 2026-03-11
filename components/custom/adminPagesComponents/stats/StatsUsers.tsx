import React from "react";
import { Users, UserIcon } from "lucide-react"; // يمكنك استيراد Male/Female من lucide إذا رغبت
import { useTranslations } from "next-intl";
import StatsGrid from "../../common/StatsGrid";

interface StatsUsersProps {
  users?: any[];
}

const StatsUsers: React.FC<StatsUsersProps> = ({ users }) => {
  const t = useTranslations("usersManagement");

  // تعريف الألوان لتتوافق مع التصميم القديم
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
    pink: {
      dot: "bg-pink-500",
      shadow: "rgba(236,72,153,0.5)",
      hover: "hover:bg-pink-50/50 dark:hover:bg-pink-900/10",
    },
  };

  const statsData = [
    {
      id: "total",
      title: t("stats.totalUsers"),
      value: users?.length || 0,
      icon: Users,
      dotColor: colorSchemes.blue.dot,
      shadowColor: colorSchemes.blue.shadow,
      hoverBg: colorSchemes.blue.hover,
    },
    {
      id: "active",
      title: t("stats.activeUsers"),
      value: users?.filter((u) => u.isActive).length || 0,
      icon: UserIcon,
      dotColor: colorSchemes.green.dot,
      shadowColor: colorSchemes.green.shadow,
      hoverBg: colorSchemes.green.hover,
    },
    {
      id: "male",
      title: t("stats.maleUsers"),
      value: users?.filter((u) => u.gender === 0).length || 0,
      icon: UserIcon, // يمكن استبدالها بـ Male من lucide-react
      dotColor: colorSchemes.purple.dot,
      shadowColor: colorSchemes.purple.shadow,
      hoverBg: colorSchemes.purple.hover,
    },
    {
      id: "female",
      title: t("stats.femaleUsers"),
      value: users?.filter((u) => u.gender === 1).length || 0,
      icon: UserIcon, // يمكن استبدالها بـ Female من lucide-react
      dotColor: colorSchemes.pink.dot,
      shadowColor: colorSchemes.pink.shadow,
      hoverBg: colorSchemes.pink.hover,
    },
  ];

  return <StatsGrid data={statsData} />;
};

export default StatsUsers;
