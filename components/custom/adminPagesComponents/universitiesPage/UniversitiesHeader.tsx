import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";
import { University } from "lucide-react";
import { useTranslations } from "next-intl";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";

interface UniversitiesHeaderProps {
  onRefresh: () => void;
  onAddClick: () => void;
  isLoading: boolean;
}

const UniversitiesHeader: React.FC<UniversitiesHeaderProps> = ({
  onRefresh,
  onAddClick,
  isLoading,
}) => {
  const t = useTranslations("UniversitiesPage");

  return (
    <Background isHeader>
      <div className="flex w-full justify-center md:justify-start">
        <div className="w-full flex flex-col md:flex-row items-center md:justify-between gap-4">
          {/* العنوان والوصف */}
          <div>
            <MainTitle className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-prim to-sec shadow-md">
                <University className="h-6 w-6 text-white" />
              </div>
              {t("title")}
            </MainTitle>
            <TextMuted className="mt-2 flex items-center gap-2 text-gray-500 dark:text-gray-300">
              <Building className="h-4 w-4" />
              {t("subtitle")}
            </TextMuted>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t("common.refresh")}
            </Button>
            <Button
              className="gap-2 bg-btn dark:bg-sec hover:opacity-80 text-text-light"
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
              {t("actions.addUniversity")}
            </Button>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default UniversitiesHeader;
