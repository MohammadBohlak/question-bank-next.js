"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversityCard } from "@/components/university-card";
import { UniversityFormData } from "@/app/[locale]/(admin)/universities_management/page";

export interface UniversityCardModel {
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

interface UniversitiesGridViewProps {
  universities: UniversityCardModel[];
  onEdit: (university: UniversityFormData) => void;
  onDelete: (university: { id: number; nameAr: string }) => void;
  mapToForm: (university: any) => UniversityFormData;
  loading: boolean;
}

export default function UniversitiesGridView({
  universities,
  onEdit,
  onDelete,
  mapToForm,
  loading,
}: UniversitiesGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {universities.map((university) => (
        <div key={university.id} className="relative group">
          <UniversityCard university={university} />

          {/* Action buttons overlay - تظهر عند التحويم */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 shadow-md bg-card-bg dark:bg-gray-800 hover:bg-bg-alt dark:hover:bg-gray-700"
              onClick={() => onEdit(mapToForm(university))}
              disabled={loading}
              title="تعديل"
            >
              <Pencil className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 shadow-md bg-card-bg dark:bg-gray-800 hover:bg-error/10 dark:hover:bg-red-900/30"
              onClick={() =>
                onDelete({ id: university.id, nameAr: university.nameAr })
              }
              disabled={loading}
              title="حذف"
            >
              <Trash2 className="h-3.5 w-3.5 text-error dark:text-red-400" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
