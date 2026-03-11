import { Badge } from "lucide-react";
import React from "react";

const TypeBadge = ({
  isPublic,
  t,
}: {
  isPublic: boolean;
  t: (key: string) => string;
}) => {
  return (
    <>
      <Badge
        // variant={isPublic ? "default" : "secondary"}
        className={`rounded-md ${
          isPublic
            ? "text-secondary dark:text-blue-400 font-bold bg-secondary/20 dark:bg-blue-900/70 border-none"
            : "text-dark dark:text-gray-200 font-bold bg-dark/20 dark:bg-gray-700"
        }`}
      >
        {isPublic ? t("common.public") : t("common.private")}
      </Badge>
    </>
  );
};

export default TypeBadge;
