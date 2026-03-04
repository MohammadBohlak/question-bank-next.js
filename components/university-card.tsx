"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building,
  MapPin,
  User,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface UniversityCardProps {
  university: {
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
  };
}

export function UniversityCard({ university }: UniversityCardProps) {
  const t = useTranslations("UniversityCard");
  const { locale } = useParams();
  return (
    <Card
      className="
        group relative w-full h-full
        rounded-2xl
        border-none shadow-lg
        bg-card-bg dark:bg-gray-800
        transition-all duration-300
         hover:shadow-lg dark:hover:shadow-gray-900
      "
    >
      <CardHeader className="pb-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight  text-text dark:text-gray-100">
              {locale == "ar" ? university.nameAr : university.nameEn}
            </CardTitle>
            <p className="text-sm  text-right text-prim italic dark:text-gray-300">
              {locale == "en" ? university.nameAr : university.nameEn}
            </p>
          </div>

          <div className="flex space-x-2">
            <Badge
              variant="outline"
              className={`
              ${
                university.isActive
                  ? "bg-success/20 dark:bg-green-900/70 text-success dark:text-green-400 font-bold border-none"
                  : "text-error dark:text-red-400 bg-error/20 dark:bg-red-900/30 font-bold border-none"
              }
            `}
            >
              {university.isActive ? t("status.active") : t("status.inactive")}
            </Badge>
            <Badge
              className={`
                 text-text-light
                ${
                  university.isPublic
                    ? "text-secondary dark:text-blue-400 bg-secondary/20 dark:bg-blue-900/70 font-bold border-none"
                    : "text-dark dark:text-gray-200 bg-dark/20 dark:bg-gray-700"
                }
              `}
            >
              {university.isPublic ? t("type.public") : t("type.private")}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3 flex flex-col justify-between">
            <div className="flex items-center gap-2 ">
              <Building className="h-4 w-4 text-sec" />
              <span className="font-mono text-xs  text-text dark:text-gray-300">
                {university.code}
              </span>
            </div>
            <div className="flex items-center gap-2 ">
              <GraduationCap className="h-4 w-4 text-sec" />
              <span className="font-mono text-xs text-nowrap text-text dark:text-gray-300 flex items-center">
                {university.programsCount} {t("programs")}
              </span>
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sec" />
              <span className="truncate  text-text dark:text-gray-300">
                {university.city}, {university.country}
              </span>
            </div>

            <div className="flex items-center gap-2 ">
              <User className="h-4 w-4 text-sec" />
              <span className="truncate text-text dark:text-gray-300">
                {university.admin || t("noAdminAssigned")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className="
          gap-2 relative
          pt-4
          border-border-light dark:border-gray-700
          flex justify-end
        "
      >
        <div className="absolute bg-gray-400 w-[80%] h-[1px] top-0 right-[50%] translate-[50%]"></div>
        <Button
          // variant="outline"
          size="sm"
          className="bg-sec hover:bg-white hover:text-sec border-sec border text-white "
        >
          <Link
            className="w-full flex justify-center items-center space-x-2"
            href={`/universities_management/${university.id}`}
          >
            <span>{t("viewDetails")}</span>{" "}
            {locale == "ar" ? <ArrowLeft /> : <ArrowRight />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
