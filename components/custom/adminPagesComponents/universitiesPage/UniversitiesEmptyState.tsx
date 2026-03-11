"use client";

import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextMuted from "@/components/custom/common/texts/TextMuted";

interface UniversitiesEmptyStateProps {
  totalUniversitiesCount: number;
  onAddClick: () => void;
  t: (key: string) => string;
}

export default function UniversitiesEmptyState({
  totalUniversitiesCount,
  onAddClick,
  t,
}: UniversitiesEmptyStateProps) {
  const hasNoUniversities = totalUniversitiesCount === 0;

  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-bg-alt dark:bg-gray-800">
        <Building className="h-12 w-12 text-sec" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-prim dark:text-sec">
        {hasNoUniversities
          ? t("emptyState.noUniversities")
          : t("emptyState.noResults")}
      </h3>
      <TextMuted className="mb-8 w-fit max-w-md mx-auto">
        {hasNoUniversities
          ? t("emptyState.startAdding")
          : t("emptyState.adjustSearch")}
      </TextMuted>
      <Button
        onClick={onAddClick}
        className="gap-2 bg-btn hover:opacity-80 text-text-light"
      >
        <Plus className="h-5 w-5" />
        {t("actions.addNewUniversity")}
      </Button>
    </div>
  );
}
