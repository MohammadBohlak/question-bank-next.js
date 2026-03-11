"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/custom/common/CustomSelect";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";
// تم إزالة استيراد useTranslations لأنه لم يعد مطلوباً هنا

// تعريف نوع جديد لـ props دالة الترجمة
interface UniversitiesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  canReset: boolean;
  onReset: () => void;
  t: (key: string) => string; // <--- إضافة دالة الترجمة كـ prop
}

export default function UniversitiesFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  canReset,
  onReset,
  t, // <--- استقبال الدالة
}: UniversitiesFiltersProps) {
  return (
    <Background>
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 flex flex-col space-y-2">
            <TextMuted>{t("search.label") || "البحث"}</TextMuted>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text dark:text-gray-400" />
              <Input
                placeholder={t("search.placeholder")}
                className="pr-10 rounded-xl border-border-light dark:border-gray-700 bg-input-bg dark:bg-gray-800 text-text dark:text-gray-300 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex flex-col space-y-2">
              <TextMuted>{t("filters.typeLabel") || "نوع الجامعة"}</TextMuted>
              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: t("filters.allTypes") },
                  { value: "public", label: t("filters.public") },
                  { value: "private", label: t("filters.private") },
                ]}
                placeholder={t("filters.type")}
                className="rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col space-y-2">
              <TextMuted>{t("filters.statusLabel") || "الحالة"}</TextMuted>
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: t("filters.allStatuses") },
                  { value: "active", label: t("filters.active") },
                  { value: "inactive", label: t("filters.inactive") },
                ]}
                placeholder={t("filters.status")}
                className="w-[140px] h-11 rounded-xl"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="none"
                className="h-11 flex items-center gap-2 border border-transparent bg-red-500 text-white hover:bg-transparent hover:border-red-500 hover:text-red-500 dark:bg-red-500 dark:hover:bg-transparent transition-all"
                onClick={onReset}
                disabled={!canReset}
              >
                <X className="h-4 w-4" />
                <span>{t("filters.clearFilters")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
