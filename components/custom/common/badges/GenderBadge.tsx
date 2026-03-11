import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
interface GenderBadgeProps {
  gender?: number;
}
const GenderBadge = ({ gender }: GenderBadgeProps) => {
  const t = useTranslations("usersManagement");
  if (gender === 0) {
    return (
      <Badge className="gap-1.5 px-3 py-1 rounded-md font-bold text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
        {t("common.male")}
      </Badge>
    );
  } else if (gender === 1) {
    return (
      <Badge className="gap-1.5 px-3 py-1 rounded-md font-bold text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800">
        {t("common.female")}
      </Badge>
    );
  }
  return (
    <Badge className="gap-1.5 px-3 py-1 rounded-md font-bold text-xs bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800">
      {t("common.notSpecified")}
    </Badge>
  );
};

export default GenderBadge;
