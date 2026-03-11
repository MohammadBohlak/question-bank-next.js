"use client";

import {
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Hash,
  User,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniversityFormData } from "@/app/[locale]/(admin)/universities_management/page";
import StatusBadge from "../../common/badges/StatusBadge";
import TypeBadge from "../../common/badges/TypeBadge";

export interface UniversityListItem {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  country: string;
  city: string;
  isPublic: boolean;
  isActive: boolean;
  programsCount: number;
  admin: string;
  adminId: number | null;
}

interface UniversitiesListViewProps {
  universities: UniversityListItem[];
  onEdit: (university: UniversityFormData) => void;
  onDelete: (university: { id: number; nameAr: string }) => void;
  mapToForm: (university: any) => UniversityFormData;
  loading: boolean;
  t: (key: string) => string;
  locale: string;
}

export default function UniversitiesListView({
  universities,
  onEdit,
  onDelete,
  mapToForm,
  loading,
  t,
  locale,
}: UniversitiesListViewProps) {
  return (
    <div className="space-y-4">
      {universities.map((university) => (
        <div
          key={university.id}
          className="group border border-border-light dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-200 bg-card-bg dark:bg-gray-800 hover:border-primary/30 dark:hover:border-blue-500/30"
        >
          <div className="flex flex-col  justify-between gap-4">
            {/* 📋 القسم الرئيسي: معلومات الجامعة */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-text dark:text-gray-100 truncate">
                  {locale === "ar" ? university.nameAr : university.nameEn}
                </h3>
                <span className="text-sm text-prim italic dark:text-gray-400 truncate">
                  {locale === "en" ? university.nameAr : university.nameEn}
                </span>

                {/* شارات الحالة */}
                <div className="flex items-center gap-1">
                  <TypeBadge isPublic={university.isPublic} t={t} />
                  <StatusBadge isActive={university.isActive} />
                </div>
              </div>

              {/* 📊 شبكة البيانات التفصيلية */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
                  <Hash className="h-4 w-4 text-sec flex-shrink-0" />
                  <span className="truncate" title={university.code}>
                    <span className="text-black dark:text-white font-bold">
                      {t("list.fields.code")} :{" "}
                    </span>
                    {university.code}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-sec flex-shrink-0" />
                  <span
                    className="truncate"
                    title={`${university.city}, ${university.country}`}
                  >
                    <span className="text-black dark:text-white font-bold">
                      {t("list.fields.location")} :{" "}
                    </span>
                    {university.city}, {university.country}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
                  <GraduationCap className="h-4 w-4 text-sec flex-shrink-0" />
                  <span>
                    <span className="text-black dark:text-white font-bold">
                      {t("list.fields.programs")} :{" "}
                    </span>
                    {university.programsCount}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary dark:text-gray-300">
                  <User className="h-4 w-4 text-sec flex-shrink-0" />
                  <span className="truncate" title={university.admin}>
                    <span className="text-black dark:text-white font-bold">
                      {t("list.fields.admin")} :{" "}
                    </span>
                    {university.admin || t("common.noAdmin")}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔘 أزرار الإجراءات */}
            <div className="flex items-center justify-end gap-1 lg:border-l lg:pl-4 lg:border-border-light dark:lg:border-gray-700">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(mapToForm(university))}
                disabled={loading}
                className="gap-2 text-primary dark:text-blue-400 hover:bg-primary/10 dark:hover:bg-blue-900/30 border-primary/30 dark:border-blue-500/30"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.edit")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onDelete({ id: university.id, nameAr: university.nameAr })
                }
                disabled={loading}
                className="gap-2 text-error dark:text-red-400 hover:bg-error/10 dark:hover:bg-red-900/30 border-error/30 dark:border-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("actions.delete")}</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
