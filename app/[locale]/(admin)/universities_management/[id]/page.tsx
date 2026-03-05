"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getUniversityDetails } from "@/store/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import UniversityUsers from "@/components/UniversityUsers";

import {
  Building,
  MapPin,
  User,
  Shield,
  Globe,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
  Calendar,
  Hash,
  Users,
  Eye,
  IdCard,
  CirclePlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteUniversity,
  createProgram,
  getUniversityUsers,
} from "@/store/admin";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import TextMuted from "@/components/custom/texts/TextMuted";
import Sidebar from "@/components/Sidebar";
import Background from "@/components/custom/Background";
import MainTitle from "@/components/custom/texts/MainTitle";
import { cn } from "@/lib/utils";

interface ProgramFormData {
  nameAr: string;
  nameEn: string;
  code: string;
  description: string;
  universityId: number;
  managerId: number;
}

export default function UniversityDetailsPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("UniversityDetailsPage");

  const university = useSelector(
    (state: RootState) => state.admin.universityDetails,
  );
  const uniUsers = useSelector(
    (state: RootState) => state.admin.universityUsers,
  );
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [programFormData, setProgramFormData] = useState<ProgramFormData>({
    nameAr: "",
    nameEn: "",
    code: "",
    description: "",
    universityId: id ? parseInt(id) : 0,
    managerId: 0,
  });
  const onClose = () => {
    setIsOpen(false);
  };
  const loadUniversityDetails = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getUniversityDetails(parseInt(id!))).unwrap();
      await dispatch(getUniversityUsers(parseInt(id!))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, t]);

  useEffect(() => {
    if (id) {
      loadUniversityDetails();
      setProgramFormData((prev) => ({
        ...prev,
        universityId: parseInt(id),
      }));
    }
  }, [id, loadUniversityDetails]);

  const handleProgramInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProgramFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAddProgramDialog = () => {
    setProgramFormData({
      nameAr: "",
      nameEn: "",
      code: "",
      description: "",
      universityId: id ? parseInt(id) : 0,
      managerId: 0,
    });
    setIsAddProgramDialogOpen(true);
  };

  const handleCreateProgram = async () => {
    if (
      !programFormData.nameAr ||
      !programFormData.nameEn ||
      !programFormData.code
    ) {
      toast.error(t("form.validation.requiredFields"));
      return;
    }

    setIsUpdating(true);
    try {
      const res = await dispatch(createProgram(programFormData)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message);
      setIsAddProgramDialogOpen(false);
      loadUniversityDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.createProgramFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUniversity = async () => {
    if (!university || !university.id) return;

    setIsUpdating(true);
    try {
      const res = await dispatch(deleteUniversity(university.id)).unwrap();
      toast.success(res.message);
      setIsDeleteDialogOpen(false);
      // Redirect to universities management page
      window.location.href = `/${locale}/universities_management`;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.deleteFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };
  if (loading) {
    return <UniversityDetailsSkeleton />;
  }

  if (!university) {
    return (
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-8 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                {t("emptyState.universityNotFound")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t("emptyState.universityNotFoundDescription")}
              </p>
              <Link href={`/${locale}/universities_management`}>
                <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("actions.backToUniversities")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Background className="relative">
            <div className=" w-full flex flex-col  sm:flex-row justify-between items-center sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <Link
                  href={`/${locale}/universities_management`}
                  className={cn(
                    "absolute rtl:right-[10px] ltr:left-[10px] bottom-[10px]",
                    "sm:relative sm:rtl:right-auto sm:ltr:left-auto sm:bottom-auto",
                  )}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-btn shadow-md">
                      <Building className="w-4 h-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <MainTitle>
                      {locale === "ar" ? university.nameAr : university.nameEn}
                    </MainTitle>
                  </div>
                </div>
              </div>

              <div className="flex  flex-wrap items-center gap-3">
                <Button
                  className="cursor-pointer bg-red-500 border border-red-500 text-white hover:text-red-500 hover:bg-transparent hover:border-red-500"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant={"none"}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          </Background>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Card 1: Blue */}
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900/50 rtl:border-r-4 ltr:border-l-4 rtl:border-blue-500 ltr:border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programsCount || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.programs")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Green */}
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900/50 rtl:border-r-4 ltr:border-l-4 rtl:border-green-500 ltr:border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.filter((p) => p.isActive).length ||
                        0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.activePrograms")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Purple */}
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900/50 rtl:border-r-4 ltr:border-l-4 rtl:border-purple-500 ltr:border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.reduce(
                        (sum: number, p) => sum + (p.coursesCount || 0),
                        0,
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.totalCourses")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Orange */}
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900/50 rtl:border-r-4 ltr:border-l-4 rtl:border-orange-500 ltr:border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.reduce(
                        (sum, p) => sum + (p.coursesBanksCount || 0),
                        0,
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.courseBanks")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* University Info & Programs */}
          <div className="lg:col-span-2 space-y-8">
            {/* University Details Card */}
            {/* <Card className="rounded-2xl border border-border-light shadow-lg bg-white dark:bg-gray-800">
                  <CardHeader className="pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="p-2 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                          <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {t("universityInfo.title")}
                      </CardTitle>
                      <Badge
                        className={`gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full ${
                          university.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500 dark:border-green-800"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500 dark:border-red-800 "
                        }`}
                        variant="outline"
                      >
                        {university.isActive ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            {t("common.active")}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            {t("common.inactive")}
                          </>
                        )}
                      </Badge>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        {t("universityInfo.description")}
                      </CardDescription>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(true)}
                      className="gap-2 rounded-xl border-blue-500 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap"
                    >
                      <Users className="h-4 w-4" />
                      عرض المستخدمين
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4  gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          {t("universityInfo.fields.universityCode")}
                        </Label>
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-xl font-bold px-4 py-2 rounded-lg bg-linear-to-r from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900/30 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                            {university.code}
                          </code>
                          <Badge
                            variant="outline"
                            className="gap-1.5 px-3 py-1 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            {university.isPublic
                              ? t("common.public")
                              : t("common.private")}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t("universityInfo.fields.location")}
                        </Label>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
                          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {university.city}, {university.country}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {t("universityInfo.fields.universityType")}
                        </Label>
                        <Badge
                          className={`gap-2 px-4 py-2 text-base ${
                            university.isPublic
                              ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-linear-to-r from-gray-700 to-gray-800 text-white"
                          }`}
                        >
                          {university.isPublic
                            ? t("universityInfo.publicUniversity")
                            : t("universityInfo.privateUniversity")}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t("universityInfo.fields.admin")}
                        </Label>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700">
                          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {university.admin || t("universityInfo.noAdmin")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <UniversityUsers
                        isOpen={isOpen}
                        onClose={onClose}
                        universityId={parseInt(id!)}
                        universityName={university.nameAr}
                        users={uniUsers || []}
                        onUserAssigned={loadUniversityDetails}
                      />
                    </div>
                  </CardContent>
                </Card> */}
            {/* University Details Card */}
            <Card className="relative rounded-3xl border-2 border-transparent bg-white dark:bg-gray-800 shadow-lg overflow-hidden group pt-0">
              {/* Decorative Background Elements */}

              <CardHeader className="relative pb-8 pt-8 px-8 bg-gradient-to-br from-prim via-[#1a2285] to-sec">
                <div className="flex flex-col justify-center  md:flex-row md:items-center md:justify-between gap-6">
                  {/* Title Section */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4 ">
                      {/* Icon Container with Animation */}
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover/icon:blur-2xl transition-all duration-300" />
                        <div className="relative p-3 md:p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
                          <Building className="w-4 h-4 md:h-6 md:w-6 text-white drop-shadow-lg" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3  ">
                        <CardTitle className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                          {t("universityInfo.title")}
                        </CardTitle>
                        {/* Status Badge */}
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            className={`
                  gap-2 px-5 py-2 text-sm font-semibold rounded-full shadow-lg backdrop-blur-md
                  
                  ${
                    university.isActive
                      ? "bg-green-500/90 text-white border-2 border-green-300/50"
                      : "bg-red-500/90 text-white border-2 border-red-300/50 "
                  }
                `}
                            variant="outline"
                          >
                            {university.isActive ? (
                              <>
                                <CheckCircle className="h-4 w-4 animate-pulse" />
                                {t("common.active")}
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                {t("common.inactive")}
                              </>
                            )}
                          </Badge>

                          {/* University Type Badge */}
                          <Badge
                            className={`
                  gap-2 px-5 py-2 text-sm font-semibold rounded-full shadow-lg backdrop-blur-md border-2
                  transition-all duration-300
                  ${
                    university.isPublic
                      ? "bg-white/90 text-[#141a73] border-white/50"
                      : "bg-amber-500/90 text-white border-amber-300/50"
                  }
                `}
                          >
                            <Shield className="h-4 w-4" />
                            {university.isPublic
                              ? t("common.public")
                              : t("common.private")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="
          group/btn gap-3 px-6 py-6 rounded-2xl text-base font-semibold
          bg-white/95 hover:bg-white text-[#141a73] 
          shadow-xl hover:shadow-2xl
          transform hover:scale-105 hover:-translate-y-1
          transition-all duration-300
          border-2 border-white/50
        "
                  >
                    <Users className="h-5 w-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                    عرض المستخدمين
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative">
                <CardDescription className="text-prim dark:text-sec mb-4 text-xl font-semibold">
                  {t("universityInfo.description")}
                </CardDescription>
                <div className="flex flex-col lg:flex-row gap-6 ">
                  {/* University Code Card */}
                  <div className="group/card relative flex-1 ">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2ab3f7]/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300 space-y-2">
                      {/* Label */}
                      <div className="text-xl flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                          <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        {t("universityInfo.fields.universityCode")}
                      </div>

                      {/* Code Display */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur-lg" />
                        <code className="relative block font-mono text-3xl font-black text-center px-6 py-2 rounded-xl bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/50 text-[#141a73] dark:text-white border-2 border-blue-300 dark:border-blue-700 shadow-inner">
                          {university.code}
                        </code>
                      </div>

                      {/* Type Indicator */}
                      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {university.isPublic
                            ? t("common.public")
                            : t("common.private")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="group/card relative flex-1  ">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-2xl transition-all duration-300  space-y-2 h-full flex flex-col">
                      {/* Label */}
                      <div className="flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        {t("universityInfo.fields.location")}
                      </div>

                      {/* Location Display */}
                      <div className="flex-1 flex items-center gap-4 px-5 py-2 rounded-xl bg-white dark:bg-gray-800/50 border-2 border-green-200 dark:border-green-800 shadow-inner">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-400/30 rounded-xl blur-md" />
                          <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-gray-900 dark:text-white truncate">
                            {university.city}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                            {university.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* University Type Card */}

                  {/* Admin Card */}
                  <div className="group/card relative flex-1 col-span-2 xl:col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-2xl  space-y-2 h-full flex flex-col">
                      {/* Label */}
                      <div className="flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                          <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        {t("universityInfo.fields.admin")}
                      </div>

                      {/* Admin Display */}
                      <div className="flex-1 flex items-center gap-4 px-5 py-4 rounded-xl bg-white dark:bg-gray-800/50 border-2 border-amber-200 dark:border-amber-800 shadow-inner">
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-400/30 rounded-xl blur-md" />
                          <div className="relative p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-gray-900 dark:text-white truncate">
                            {university.admin || t("universityInfo.noAdmin")}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {university.admin ? "مدير النظام" : "لا يوجد"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* University Users Modal/Component */}
                <UniversityUsers
                  isOpen={isOpen}
                  onClose={onClose}
                  universityId={parseInt(id!)}
                  universityName={university.nameAr}
                  users={uniUsers || []}
                  onUserAssigned={loadUniversityDetails}
                />
              </CardContent>
            </Card>

            {/* Programs Section - Enhanced Design */}
            <div className="space-y-6">
              {/* Section Header with subtle background */}
              <Background className="flex-col items-center text-center space-y-2 sm:text-start sm:items-center sm:justify-between sm:flex-row">
                <div className="space-y-1 sm:w-full">
                  <h2 className="text-2xl font-bold text-prim dark:text-sec">
                    {t("programsSection.title")}
                  </h2>
                  <TextMuted>
                    {locale === "ar"
                      ? "إدارة ومراقبة البرامج الدراسية التابعة للجامعة"
                      : "Manage and monitor university academic programs"}
                  </TextMuted>
                </div>
                <Button
                  className="gap-2 rounded-xl bg-btn text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  onClick={handleOpenAddProgramDialog}
                >
                  <Plus className="h-5 w-5" />
                  {t("programsSection.addProgram")}
                </Button>
              </Background>

              {university.programs && university.programs.length > 0 ? (
                <Card className="rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
                  {/* Desktop Table - Modern & Clean */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-md">
                        <tr className="text-start">
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "اسم البرنامج" : "Program Name"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "الكود" : "Code"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "المدير" : "Manager"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "المقررات" : "Courses"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "البنوك" : "Banks"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "الحالة" : "Status"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "التاريخ" : "Created"}
                          </th>
                          <th className="mx-6 py-4 font-semibold ">
                            {locale === "ar" ? "الإجراءات" : "Actions"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {university.programs.map((program) => (
                          <tr
                            key={program.id}
                            className="text-start text-nowrap hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200 group"
                          >
                            <td className="px-6 py-4 align-middle">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white text-base">
                                  {locale == "ar"
                                    ? program.nameAr
                                    : program.nameEn}
                                </span>
                                <span className="italic text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {locale == "ar"
                                    ? program.nameEn
                                    : program.nameAr}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <code className=" px-2.5 py-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                                {program.code}
                              </code>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                  <User className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {program.manager || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                                <GraduationCap className="h-4 w-4 text-blue-500" />
                                <span className="font-bold">
                                  {program.coursesCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                                <FileText className="h-4 w-4 text-purple-500" />
                                <span className="font-bold">
                                  {program.coursesBanksCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <Badge
                                variant="outline"
                                className={`gap-1.5 border-0 px-3 py-1 rounded-full text-xs font-semibold ${
                                  program.isActive
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                                }`}
                              >
                                {program.isActive ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {program.isActive
                                  ? t("common.active")
                                  : t("common.inactive")}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <div className="text-gray-700 dark:text-gray-400 text-sm font-medium">
                                {formatDate(program.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-middle text-right">
                              <Link
                                href={`/${locale}/universities_management/${id}/${program.id}`}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 font-medium transition-all"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>
                                    {t("programsSection.viewDetails")}
                                  </span>
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards - Modern Profile Cards */}
                  <div className="md:hidden p-4 space-y-5">
                    {university.programs.map((program) => (
                      <Card
                        key={program.id}
                        className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Decorative Side Border based on Status */}
                        <div
                          className={`absolute top-0 bottom-0 w-1.5 ${
                            program.isActive
                              ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                              : "bg-gradient-to-b from-slate-400 to-slate-600"
                          }`}
                        />

                        <CardContent className="p-5 space-y-4">
                          {/* Header: Name & Status */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {program.nameAr}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {program.nameEn}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`gap-1 border-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                program.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                              }`}
                            >
                              {program.isActive
                                ? t("common.active")
                                : t("common.inactive")}
                            </Badge>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Code Block */}
                            <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-semibold uppercase">
                                {locale === "ar" ? "الكود" : "Code"}
                              </span>
                              <code className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                                {program.code}
                              </code>
                            </div>

                            {/* Manager */}
                            <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg">
                              <User className="h-4 w-4 text-purple-500" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-gray-400 uppercase">
                                  {locale === "ar" ? "المدير" : "Manager"}
                                </span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                                  {program.manager || "-"}
                                </span>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-gray-400 uppercase">
                                  {locale === "ar" ? "التاريخ" : "Date"}
                                </span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                  {formatDate(program.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Mini Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400">
                                <GraduationCap className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                  {program.coursesCount || 0}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">
                                  {locale === "ar" ? "المقررات" : "Courses"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                  {program.coursesBanksCount || 0}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">
                                  {locale === "ar" ? "البنوك" : "Banks"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description (Optional) */}
                          {program.description && (
                            <div className="pt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {program.description ||
                                  (locale === "ar"
                                    ? "لا يوجد وصف متاح"
                                    : "No description available")}
                              </p>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                            <Link
                              href={`/${locale}/universities_management/${id}/${program.id}`}
                              className="block"
                            >
                              <Button
                                variant="outline"
                                className="w-full justify-center gap-2 rounded-xl border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium h-10"
                              >
                                <Eye className="h-4 w-4" />
                                {t("programsSection.viewDetails")}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : (
                /* Enhanced Empty State */
                <Card className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-800/50 dark:to-gray-900/50 shadow-inner">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-2xl rounded-full"></div>
                      <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 rotate-3">
                        <BookOpen className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t("programsSection.emptyState.title")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
                      {t("programsSection.emptyState.description")}
                    </p>

                    <Button
                      onClick={handleOpenAddProgramDialog}
                      className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all px-6"
                    >
                      <Plus className="h-5 w-5" />
                      {t("programsSection.emptyState.createFirstProgram")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800"
        >
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mb-6">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
              {t("deleteDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              {t("deleteDialog.description", {
                universityName: university.nameAr,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 close-hover"
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              onClick={handleDeleteUniversity}
              disabled={isUpdating}
            >
              {isUpdating
                ? t("common.deleting")
                : t("deleteDialog.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Dialog */}
      <Dialog
        open={isAddProgramDialogOpen}
        onOpenChange={setIsAddProgramDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[550px] rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800"
        >
          <DialogHeader className="flex flex-row">
            <div className="px-2 pt-3  rounded-lg bg-btn">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-prim dark:text-sec flex items-center gap-3">
                {t("programDialog.title")}
              </DialogTitle>
              <DialogDescription>
                <TextMuted>
                  {t("programDialog.description", {
                    universityName: university?.nameAr,
                  })}
                </TextMuted>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="program-nameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <User size={16} strokeWidth={3} className="text-sec" />
                  {t("programDialog.fields.nameAr")} *
                </Label>
                <Input
                  id="program-nameAr"
                  name="nameAr"
                  value={programFormData.nameAr}
                  onChange={handleProgramInputChange}
                  placeholder={t("programDialog.placeholders.nameAr")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="program-nameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <User size={16} strokeWidth={3} className="text-sec" />
                  {t("programDialog.fields.nameEn")} *
                </Label>
                <Input
                  id="program-nameEn"
                  name="nameEn"
                  value={programFormData.nameEn}
                  onChange={handleProgramInputChange}
                  placeholder={t("programDialog.placeholders.nameEn")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="program-code"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <Hash strokeWidth={3} className="text-sec" size={16} />
                {t("programDialog.fields.code")} *
              </Label>
              <Input
                id="program-code"
                name="code"
                value={programFormData.code}
                onChange={handleProgramInputChange}
                placeholder={t("programDialog.placeholders.code")}
                className="rounded-xl font-mono border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="program-description"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <FileText strokeWidth={3} className="text-sec" size={16} />

                {t("programDialog.fields.description")}
              </Label>
              <Textarea
                id="program-description"
                name="description"
                value={programFormData.description}
                onChange={handleProgramInputChange}
                placeholder={t("programDialog.placeholders.description")}
                className="rounded-xl min-h-[120px] border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="program-universityId"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <IdCard strokeWidth={3} className="text-sec" size={16} />

                  {t("programDialog.fields.universityId")}
                </Label>
                <Input
                  id="program-universityId"
                  name="universityId"
                  type="number"
                  value={programFormData.universityId}
                  readOnly
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="program-managerId"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <IdCard strokeWidth={3} className="text-sec" size={16} />

                  {t("programDialog.fields.managerId")}
                </Label>
                <Select
                  value={programFormData.managerId?.toString()}
                  onValueChange={(value) =>
                    setProgramFormData({
                      ...programFormData,
                      managerId: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                    <SelectValue
                      placeholder={t(
                        "programDialog.placeholders.selectManager",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    {uniUsers?.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id.toString()}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {item.fullNameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddProgramDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateProgram}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-btn hover:opacity-80 text-white shadow-lg"
            >
              {isUpdating ? (
                <>{t("common.creating")}</>
              ) : (
                <>
                  <CirclePlus
                    strokeWidth={3}
                    className="text-white"
                    size={16}
                  />
                  {t("programDialog.createButton")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Skeleton Component
function UniversityDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl bg-gray-300 dark:bg-gray-700" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-5 w-48 bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-28 rounded-2xl bg-gray-300 dark:bg-gray-700"
              />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-96 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-10 w-40 rounded-xl bg-gray-300 dark:bg-gray-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-72 rounded-2xl bg-gray-300 dark:bg-gray-700"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-64 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-48 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-56 rounded-2xl bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
