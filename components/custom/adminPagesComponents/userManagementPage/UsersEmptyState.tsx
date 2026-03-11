import React from "react";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersEmptyStateProps {
  hasFilters: boolean; // true إذا كان هناك بحث أو فلتر
  onCreateClick: () => void; // دالة فتح نموذج الإنشاء
  t: (key: string) => string; // دالة الترجمة
}

const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({
  hasFilters,
  onCreateClick,
  t,
}) => {
  return (
    <div className="py-12 text-center">
      {/* الأيقونة */}
      <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
        <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>

      {/* العنوان */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
        {hasFilters
          ? t("usersTable.emptyState.noResults")
          : t("usersTable.emptyState.title")}
      </h3>

      {/* الوصف */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {hasFilters
          ? t("usersTable.emptyState.noResultsDescription")
          : t("usersTable.emptyState.description")}
      </p>

      {/* زر الإنشاء */}
      <Button
        onClick={onCreateClick}
        className="bg-btn text-white shadow-lg hover:shadow-xl"
      >
        <UserPlus className="h-5 w-5 mr-2" />
        {t("usersTable.emptyState.createFirstUser")}
      </Button>
    </div>
  );
};

export default UsersEmptyState;
