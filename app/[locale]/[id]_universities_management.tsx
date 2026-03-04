"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getUniversityDetails } from "@/store/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteUniversity, createProgram, getUniversityUsers } from "@/store/admin";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('UniversityDetailsPage');

  const university = useSelector((state: RootState) => state.admin.universityDetails);
  const uniUsers = useSelector((state: RootState) => state.admin.universityUsers);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProgramDialogOpen, setIsAddProgramDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const [programFormData, setProgramFormData] = useState<ProgramFormData>({
    nameAr: "",
    nameEn: "",
    code: "",
    description: "",
    universityId: id ? parseInt(id) : 0,
    managerId: 0
  });
  const onClose = () => {
    setIsOpen(false)
  }
  const loadUniversityDetails = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getUniversityDetails(parseInt(id!))).unwrap();
      await dispatch(getUniversityUsers(parseInt(id!))).unwrap();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, t]);

  useEffect(() => {
    if (id) {
      loadUniversityDetails();
      setProgramFormData(prev => ({
        ...prev,
        universityId: parseInt(id)
      }));
    }
  }, [id, loadUniversityDetails]);

  const handleProgramInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProgramFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenAddProgramDialog = () => {
    setProgramFormData({
      nameAr: "",
      nameEn: "",
      code: "",
      description: "",
      universityId: id ? parseInt(id) : 0,
      managerId: 0
    });
    setIsAddProgramDialogOpen(true);
  };

  const handleCreateProgram = async () => {
    if (!programFormData.nameAr || !programFormData.nameEn || !programFormData.code) {
      toast.error(t('form.validation.requiredFields'));
      return;
    }

    setIsUpdating(true);
    try {
      const res = await dispatch(createProgram(programFormData)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(' • '));
        return;
      }

      toast.success(res.message);
      setIsAddProgramDialogOpen(false);
      loadUniversityDetails();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('errors.createProgramFailed'));
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
      toast.error(error instanceof Error ? error.message : t('errors.deleteFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return <UniversityDetailsSkeleton />;
  }

  if (!university) {
    return (
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-8 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                {t('emptyState.universityNotFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('emptyState.universityNotFoundDescription')}
              </p>
              <Link href={`/${locale}/universities_management`}>
                <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('actions.backToUniversities')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/universities_management`}>
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
                  <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 shadow-md">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-blue-700 dark:from-gray-100 dark:to-blue-300 bg-clip-text text-transparent">
                    {locale === 'ar' ? university.nameAr : university.nameEn}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {locale === 'ar' ? university.nameEn : university.nameAr}
                </p>
              </div>
            </div>

            <div className="flex  flex-wrap items-center gap-3">
              <Badge
                className={`gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full ${university.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500 dark:border-green-800'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500 dark:border-red-800'
                  }`}
                variant="outline"
              >
                {university.isActive ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t('common.active')}
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    {t('common.inactive')}
                  </>
                )}
              </Badge>
              <Button
                className="cursor-pointer bg-red-200 text-red-600 border border-red-500 dark:text-red-400"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2  lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programsCount || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('stats.programs')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.filter(p => p.isActive).length || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('stats.activePrograms')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.reduce((sum: number, p) => sum + (p.coursesCount || 0), 0)}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('stats.totalCourses')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {university.programs?.reduce((sum, p) => sum + (p.coursesBanksCount || 0), 0)}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('stats.courseBanks')}
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
        <div className="grid grid-cols-1  lg:grid-cols-1 gap-8">
          {/* University Info & Programs */}
          <div className="lg:col-span-2 space-y-8">
            {/* University Details Card */}
            <Card className="rounded-2xl border border-border-light shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                      <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t('universityInfo.title')}
                  </CardTitle>

                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('universityInfo.description')}
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
                      {t('universityInfo.fields.universityCode')}
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
                        {university.isPublic ? t('common.public') : t('common.private')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('universityInfo.fields.location')}
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
                      {t('universityInfo.fields.universityType')}
                    </Label>
                    <Badge className={`gap-2 px-4 py-2 text-base ${university.isPublic
                      ? "bg-linear-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-linear-to-r from-gray-700 to-gray-800 text-white"
                      }`}>
                      {university.isPublic ? t('universityInfo.publicUniversity') : t('universityInfo.privateUniversity')}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('universityInfo.fields.admin')}
                    </Label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700">
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {university.admin || t('universityInfo.noAdmin')}
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
            </Card>

            {/* Programs Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('programsSection.title')}
                  </h2>
                </div>
                <Button
                  className="gap-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleOpenAddProgramDialog}
                >
                  <Plus className="h-5 w-5" />
                  {t('programsSection.addProgram')}
                </Button>
              </div>

              {university.programs && university.programs.length > 0 ? (
                <Card className="rounded-2xl border border-border-light shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'اسم البرنامج' : 'Program Name'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'الكود' : 'Code'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'المدير' : 'Manager'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'المقررات' : 'Courses'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'البنوك' : 'Banks'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'الحالة' : 'Status'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'التاريخ' : 'Created'}
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                            {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {university.programs.map((program) => (
                          <tr
                            key={program.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {program.nameAr}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {program.nameEn}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                                {program.code}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-700 dark:text-gray-300">
                                {program.manager || "-"}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {program.coursesCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {program.coursesBanksCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge
                                className={`gap-1.5 px-3 py-1 rounded-full ${program.isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                  : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                                  }`}
                              >
                                {program.isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    {t('common.active')}
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    {t('common.inactive')}
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(program.createdAt)}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Link href={`/${locale}/universities_management/${id}/${program.id}`}>
                                <Button size="sm" className="gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                                  <Eye className="h-3.5 w-3.5" />
                                  {t('programsSection.viewDetails')}
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4 p-6">
                    {university.programs.map((program) => (
                      <Card key={program.id} className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className={`h-1 w-full ${program.isActive
                          ? 'bg-linear-to-r from-green-500 to-blue-500'
                          : 'bg-linear-to-r from-gray-400 to-gray-600'
                          }`} />
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {program.nameAr}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {program.nameEn}
                                </div>
                              </div>
                              <Badge
                                className={`gap-1.5 px-3 py-1 rounded-full ${program.isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                  : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                                  }`}
                              >
                                {program.isActive ? t('common.active') : t('common.inactive')}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {locale === 'ar' ? 'الكود' : 'Code'}
                                </div>
                                <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                  {program.code}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {locale === 'ar' ? 'المدير' : 'Manager'}
                                </div>
                                <div className="font-medium">
                                  {program.manager || "-"}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('programsSection.courses')}
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                  <span className="font-bold">{program.coursesCount || 0}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('programsSection.courseBanks')}
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                  <span className="font-bold">{program.coursesBanksCount || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {program.description || t('programsSection.noDescription')}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                {formatDate(program.createdAt)}
                              </div>
                              <Link href={`/${locale}/universities_management/${id}/${program.id}`}>
                                <Button size="sm" className="gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                                  <Eye className="h-3.5 w-3.5" />
                                  {t('programsSection.viewDetails')}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="rounded-2xl border-0 shadow-lg bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900/50">
                  <CardContent className="py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      {t('programsSection.emptyState.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      {t('programsSection.emptyState.description')}
                    </p>
                    <Button
                      onClick={handleOpenAddProgramDialog}
                      className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t('programsSection.emptyState.createFirstProgram')}
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
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mb-6">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
              {t('deleteDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              {t('deleteDialog.description', { universityName: university.nameAr })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              onClick={handleDeleteUniversity}
              disabled={isUpdating}
            >
              {isUpdating ? t('common.deleting') : t('deleteDialog.deleteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Dialog */}
      <Dialog open={isAddProgramDialogOpen} onOpenChange={setIsAddProgramDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl border-0 shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              {t('programDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t('programDialog.description', { universityName: university?.nameAr })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="program-nameAr" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('programDialog.fields.nameAr')} *
                </Label>
                <Input
                  id="program-nameAr"
                  name="nameAr"
                  value={programFormData.nameAr}
                  onChange={handleProgramInputChange}
                  placeholder={t('programDialog.placeholders.nameAr')}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="program-nameEn" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('programDialog.fields.nameEn')} *
                </Label>
                <Input
                  id="program-nameEn"
                  name="nameEn"
                  value={programFormData.nameEn}
                  onChange={handleProgramInputChange}
                  placeholder={t('programDialog.placeholders.nameEn')}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="program-code" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('programDialog.fields.code')} *
              </Label>
              <Input
                id="program-code"
                name="code"
                value={programFormData.code}
                onChange={handleProgramInputChange}
                placeholder={t('programDialog.placeholders.code')}
                className="rounded-xl font-mono border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="program-description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('programDialog.fields.description')}
              </Label>
              <Textarea
                id="program-description"
                name="description"
                value={programFormData.description}
                onChange={handleProgramInputChange}
                placeholder={t('programDialog.placeholders.description')}
                className="rounded-xl min-h-[120px] border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="program-universityId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('programDialog.fields.universityId')}
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
                <Label htmlFor="program-managerId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('programDialog.fields.managerId')}
                </Label>
                <Select
                  value={programFormData.managerId?.toString()}
                  onValueChange={value => setProgramFormData({ ...programFormData, managerId: parseInt(value) })}
                >
                  <SelectTrigger className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                    <SelectValue placeholder={t('programDialog.placeholders.selectManager')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    {uniUsers?.map(item => (
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
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateProgram}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {isUpdating ? t('common.creating') : t('programDialog.createButton')}
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
              <Skeleton key={i} className="h-28 rounded-2xl bg-gray-300 dark:bg-gray-700" />
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
                  <Skeleton key={i} className="h-72 rounded-2xl bg-gray-300 dark:bg-gray-700" />
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