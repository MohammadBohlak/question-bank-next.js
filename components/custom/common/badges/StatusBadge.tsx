import React from "react";
import { Badge } from "@/components/ui/badge"; // تأكد من المسار الصحيح
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  isActive: boolean;
  // يمكنك إضافة خيار لإخفاء النص وإظهار الأيقونة فقط إذا أردت مستقبلاً
  // showText?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => {
  const t = useTranslations("badges");
  return (
    <Badge
      variant="outline"
      className={`gap-1 px-2.5 py-1 rounded-md text-xs font-semibold font-arabic border-0 ${
        isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isActive ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      <span>{isActive ? t("active") : t("inActive")}</span>
    </Badge>
  );
};

export default StatusBadge;
