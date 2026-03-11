"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  getProgramDetails,
  updateProgram,
  deleteProgram,
  createCourse,
  getProgramUsers,
} from "@/store/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProgramUsers from "@/components/ProgramUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  Building,
  Calendar,
  Users,
  FileText,
  ChevronLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  BookMarked,
  ArrowLeft,
  Eye,
  MoreVertical,
  Filter,
  User,
  Hash,
  Globe,
  Power,
  UserCog,
  AlignLeft,
} from "lucide-react";
import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";
import StatsProgram from "@/components/custom/adminPagesComponents/stats/StatsProgram";
import DeleteProgramDialog from "@/components/custom/adminPagesComponents/dialogs/DeleteProgramDialog";

export interface ProgramFormData {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  description: string;
  managerId: number;
  isActive: boolean;
  universityId: number;
}

export interface CourseFormData {
  id?: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  programId: number;
}

export default function ProgramDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("programDetails");
  const program = useSelector((state: RootState) => state.admin.programDetails);
  const programUsers = useSelector(
    (state: RootState) => state.admin.programUsers,
  );
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpen, setIsOpen] = useState(false);

  const [courseSearch, setCourseSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const { locale, programId } = useParams<{
    locale: string;
    id: string;
    programId: string;
  }>();
  const [programFormData, setProgramFormData] = useState<ProgramFormData>({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    description: "",
    managerId: 0,
    isActive: true,
    universityId: 0,
  });

  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
    programId: programId ? parseInt(programId) : 0,
  });
  const onClose = () => {
    setIsOpen(false);
  };
  const loadUniversityDetails = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getProgramDetails(parseInt(programId!))).unwrap();
      await dispatch(getProgramUsers(parseInt(programId!))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, programId, t]);
  const courses = program?.courses || [];

  const handleManagerChange = (value: string) => {
    const managerId = parseInt(value);
    setProgramFormData((prev) => ({
      ...prev,
      managerId: isNaN(managerId) ? 0 : managerId,
    }));
  };

  const loadProgramDetails = useCallback(async () => {
    try {
      await dispatch(getProgramDetails(parseInt(programId))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, programId, t]);

  useEffect(() => {
    if (programId) {
      loadProgramDetails();
      dispatch(getProgramUsers(parseInt(programId)));
      setCourseFormData((prev) => ({
        ...prev,
        programId: parseInt(programId),
      }));
    }
  }, [programId, loadProgramDetails, dispatch]);

  const handleProgramInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProgramFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCourseFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setProgramFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleOpenEditDialog = () => {
    if (program) {
      setProgramFormData({
        id: program.id,
        universityId: program.universityId,
        nameAr: program.nameAr,
        nameEn: program.nameEn,
        code: program.code,
        description: program.description || "",
        managerId: program.managerId || 0,
        isActive: program.isActive,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleOpenAddCourseDialog = () => {
    setCourseFormData({
      nameAr: "",
      nameEn: "",
      code: "",
      descriptionAr: "",
      descriptionEn: "",
      programId: programId ? parseInt(programId) : 0,
    });
    setIsAddCourseDialogOpen(true);
  };

  const handleUpdateProgram = async () => {
    if (!program) return;

    setIsUpdating(true);
    try {
      const res = await dispatch(
        updateProgram({
          id: program.id,
          body: programFormData,
        }),
      ).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.updateSuccess"));
      setIsEditDialogOpen(false);
      loadProgramDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.updateFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCourse = async () => {
    if (
      !courseFormData.nameAr ||
      !courseFormData.nameEn ||
      !courseFormData.code
    ) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    setIsUpdating(true);
    try {
      const res = await dispatch(createCourse(courseFormData)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.createCourseSuccess"));
      setIsAddCourseDialogOpen(false);
      loadProgramDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.createCourseFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!program) return;

    setIsUpdating(true);
    try {
      const res = await dispatch(deleteProgram(program.id)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.deleteSuccess"));
      router.back();
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      courseSearch === "" ||
      course.nameEn.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.nameAr.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code.toLowerCase().includes(courseSearch.toLowerCase());

    const matchesFilter =
      courseFilter === "all" ||
      (courseFilter === "active" && course.isActive) ||
      (courseFilter === "inactive" && !course.isActive);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <ProgramDetailsSkeleton />;
  }

  if (!program) {
    return (
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto border border-border-light shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-8 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                {t("notFound.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t("notFound.description")}
              </p>
              <Button
                onClick={() => router.back()}
                className="bg-btn text-white shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
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
          <Background isHeader className="relative">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-center gap-6">
              <div className="flex items-ce nter gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="absolute right-2 bottom-2 sm:static rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-btn shadow-md">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <MainTitle>
                      {locale == "ar" ? program.nameAr : program.nameEn}
                    </MainTitle>
                  </div>
                  <TextMuted className="italic">
                    {locale == "ar" ? program.nameEn : program.nameAr}
                  </TextMuted>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full ${
                    program.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500 dark:border-green-800"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500 dark:border-red-800"
                  }`}
                  variant="outline"
                >
                  {program.isActive ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t("status.active")}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      {t("status.inactive")}
                    </>
                  )}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl border-gray-300 dark:border-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer text-sec hover:!text-white focus:bg-sec focus:text-white "
                      onClick={handleOpenEditDialog}
                    >
                      <Edit className="h-4 w-4 mr-2 text-inherit" />
                      {t("actions.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:!text-white focus:bg-red-500 focus:text-white "
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-inherit" />
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Background>

          <StatsProgram courses={courses} program={program} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1  gap-8">
          {/* Program Info & Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <Tabs
              dir={locale == "en" ? "ltr" : "rtl"}
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full "
            >
              <Background>
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <TabsList className="bg-transparent p-1 rounded-xl">
                    <TabsTrigger
                      value="overview"
                      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all cursor-pointer mx-1 ${
                        activeTab === "overview"
                          ? "!bg-sec text-white border-sec shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-border-light dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {t("tabs.overview")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="courses"
                      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                        activeTab === "courses"
                          ? "!bg-sec text-white border-sec shadow-md shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-border-light dark:hover:bg-gray-700/50"
                      }`}
                    >
                      {t("tabs.courses")}
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === "courses" && (
                    <Button
                      className="gap-2 self-end sm:self-auto rounded-xl bg-btn text-white shadow-lg hover:shadow-xl transition-all"
                      onClick={handleOpenAddCourseDialog}
                    >
                      <Plus className="h-5 w-5" />
                      {t("courses.addCourse")}
                    </Button>
                  )}
                </div>
              </Background>

              <TabsContent value="overview" className="space-y-6">
                {/* Program Details Card */}
                <Card className="rounded-2xl border pt-0 border-border-light shadow-lg bg-white dark:bg-gray-800">
                  <CardHeader className="pb-6 bg-btn !bg-gradient-to-br rounded-tl-2xl rounded-tr-2xl pt-4">
                    <CardTitle className="text-2xl font-bold flex justify-between items-center gap-3 text-white">
                      {t("programInfo.title")}
                      <Button
                        variant="none"
                        onClick={() => setIsOpen(true)}
                        className="gap-2 rounded-xl bg-gray-100 text-prim  hover:scale-[1.05] whitespace-nowrap"
                      >
                        <Users className="h-4 w-4" />
                        عرض المستخدمين
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                          <FileText
                            className="h-4 w-4 text-sec"
                            strokeWidth={2.5}
                          />

                          <span>{t("programInfo.description")}</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          {program.description ||
                            t("programInfo.noDescription")}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Users
                              className="h-4 w-4 text-sec"
                              strokeWidth={2.5}
                            />
                            {t("programInfo.manager")}
                          </Label>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {program.manager ||
                                  t("programInfo.notAvailable")}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building
                              className="h-4 w-4 text-sec"
                              strokeWidth={2.5}
                            />
                            {t("programInfo.university")}
                          </Label>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {program.university ||
                                  t("programInfo.notAvailable")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Calendar
                              className="h-4 w-4 text-sec"
                              strokeWidth={2.5}
                            />
                            {t("programInfo.createdAt")}
                          </Label>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-green-50 dark:from-gray-900/50 dark:to-green-900/20 border border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(program.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Calendar
                              className="h-4 w-4 text-sec"
                              strokeWidth={2.5}
                            />
                            {t("programInfo.updatedAt")}
                          </Label>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-orange-50 dark:from-gray-900/50 dark:to-orange-900/20 border border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(program.updatedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <Card className="rounded-2xl border border-border-light shadow-lg pt-0 bg-white dark:bg-gray-800 overflow-hidden">
                  <CardHeader className="border-b bg-btn !bg-gradient-to-br pt-4 rounded-tl-2xl rounded-tr-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white dark:text-white">
                          {t("courses.title")}
                        </CardTitle>
                        <CardDescription className="text-md text-gray-100 mt-2">
                          {filteredCourses.length} {t("courses.description")}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Course Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={t("courses.searchPlaceholder")}
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                      <Select
                        value={courseFilter}
                        onValueChange={setCourseFilter}
                      >
                        <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder={t("courses.status")} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectItem value="all">
                            {t("courses.filter.all")}
                          </SelectItem>
                          <SelectItem value="active">
                            {t("courses.filter.active")}
                          </SelectItem>
                          <SelectItem value="inactive">
                            {t("courses.filter.inactive")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th
                              className={`text-left py-4 px-6 font-semibold ${locale === "ar" ? "text-right" : ""} text-gray-900 dark:text-white`}
                            >
                              {locale === "ar" ? "الكود" : "Code"}
                            </th>
                            <th
                              className={`text-left py-4 px-6 font-semibold ${locale === "ar" ? "text-right" : ""} text-gray-900 dark:text-white`}
                            >
                              {locale === "ar" ? "اسم المقرر" : "Course Name"}
                            </th>
                            <th
                              className={`text-left py-4 px-6 font-semibold ${locale === "ar" ? "text-right" : ""} text-gray-900 dark:text-white`}
                            >
                              {locale === "ar" ? "المشرف" : "Supervisor"}
                            </th>
                            <th
                              className={`text-left py-4 px-6 font-semibold ${locale === "ar" ? "text-right" : ""} text-gray-900 dark:text-white`}
                            >
                              {locale === "ar" ? "الوصف" : "Description"}
                            </th>
                            <th
                              className={`text-left py-4 px-6 font-semibold ${locale === "ar" ? "text-right" : ""} text-gray-900 dark:text-white`}
                            >
                              {locale === "ar" ? "الإجراءات" : "Actions"}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCourses.map((course) => (
                            <tr
                              key={course.id}
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                                  {course.code}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {course.nameAr}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {course.nameEn}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                  {course.supervisor ||
                                    t("courses.table.notAssigned")}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                  {course.descriptionAr || "-"}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <Link href={`${programId}/${course.id}`}>
                                  <Button
                                    variant={"none"}
                                    size="sm"
                                    className="gap-2 text-blue-500 text-md hover:bg-blue-300/15"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {t("courses.table.details")}
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    {/* <div className="md:hidden space-y-4 p-6">
                      {filteredCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="border border-gray-200 dark:border-gray-700"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white">
                                    {course.nameAr}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {course.nameEn}
                                  </div>
                                </div>
                                <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                  {course.code}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {locale === "ar" ? "المشرف" : "Supervisor"}
                                </div>
                                <div className="font-medium">
                                  {course.supervisor ||
                                    t("courses.table.notAssigned")}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                  {locale === "ar" ? "الوصف" : "Description"}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {course.descriptionAr || "-"}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                  href={`/${locale}/universities_management/${programId}/${course.id}`}
                                >
                                  <Button
                                    size="sm"
                                    className="w-full gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {t("courses.table.details")}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div> */}
                    {/* Mobile Cards - Modern Redesign */}
                    <div className="md:hidden space-y-5 p-4">
                      {filteredCourses.map((course) => (
                        <Card
                          key={course.id}
                          className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col">
                              {/* 1. Header Section: Identity & Code */}
                              <div className="relative p-5 pb-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b border-gray-100 dark:border-gray-700/50">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">
                                      {locale == "ar"
                                        ? course.nameAr
                                        : course.nameEn}
                                    </h3>
                                    <p className="italic text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                      {locale == "ar"
                                        ? course.nameEn
                                        : course.nameAr}
                                    </p>
                                  </div>

                                  {/* Code Pill */}
                                  <div className="flex-shrink-0">
                                    <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 shadow-sm">
                                      <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {course.code}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Body Section: Details */}
                              <div className="p-5 space-y-4">
                                {/* Supervisor Info Box */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400 mt-0.5">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70 font-bold mb-0.5">
                                      {locale === "ar"
                                        ? "المشرف"
                                        : "Supervisor"}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                      {course.supervisor ||
                                        t("courses.table.notAssigned")}
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                {course.descriptionAr && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-black dark:text-white  font-medium uppercase tracking-wide">
                                      <FileText className="h-3.5 w-3.5 text-sec" />
                                      <span>
                                        {locale === "ar"
                                          ? "الوصف"
                                          : "Description"}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 pl-7">
                                      {course.descriptionAr}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* 3. Footer Section: Action */}
                              <div className="p-5 pt-0 mt-2">
                                <Link
                                  href={`/${locale}/universities_management/${programId}/${course.id}`}
                                  className="block"
                                >
                                  <Button
                                    variant="outline"
                                    className="w-full justify-center gap-2 h-11 rounded-xl border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600 transition-all duration-300 group-hover:shadow-md font-medium"
                                  >
                                    <Eye className="h-4 w-4" />
                                    {t("courses.table.details")}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Empty State */}
                    {filteredCourses.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                          <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                          {courseSearch || courseFilter !== "all"
                            ? t("courses.table.noCourses")
                            : t("courses.table.noCourses")}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                          {courseSearch || courseFilter !== "all"
                            ? t("courses.table.trySearch")
                            : t("courses.table.noCoursesAdded")}
                        </p>
                        <Button
                          onClick={handleOpenAddCourseDialog}
                          className="bg-btn text-white shadow-lg hover:shadow-xl"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          {t("courses.table.addFirstCourse")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Delete Program Dialog */}
      <DeleteProgramDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        program={program}
        t={t}
      />
      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90%] overflow-auto custom-scrollbar sm:max-w-[550px] rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800"
        >
          <DialogHeader className="flex flex-col space-y-2">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Edit className="h-5 w-5 text-white" />
              </div>
              {t("editDialog.title")}
            </DialogTitle>
            <DialogDescription>
              <TextMuted>{t("editDialog.dialogDescription")}</TextMuted>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="nameAr"
                  className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.nameAr")}
                </Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  value={programFormData.nameAr}
                  onChange={handleProgramInputChange}
                  placeholder={t("editDialog.nameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="nameEn"
                  className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.nameEn")}
                </Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  value={programFormData.nameEn}
                  onChange={handleProgramInputChange}
                  placeholder={t("editDialog.nameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="code"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("editDialog.code")}
              </Label>
              <Input
                id="code"
                name="code"
                value={programFormData.code}
                onChange={handleProgramInputChange}
                placeholder={t("editDialog.codePlaceholder")}
                className="rounded-xl font-mono border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <AlignLeft className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("editDialog.description")}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={programFormData.description}
                onChange={handleProgramInputChange}
                placeholder={t("editDialog.descriptionPlaceholder")}
                className="rounded-xl min-h-[120px] border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="managerId"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <UserCog className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("editDialog.managerId")}
              </Label>
              <Select
                value={programFormData.managerId.toString()}
                onValueChange={handleManagerChange}
              >
                <SelectTrigger className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Program Manager" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  {programUsers && programUsers.length > 0 ? (
                    programUsers.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id.toString()}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {item.fullNameAr}{" "}
                        {item.fullNameEn ? `(${item.fullNameEn})` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="0" disabled>
                      No Managers
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div>
                <Label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.status")}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {programFormData.isActive
                    ? t("editDialog.active")
                    : t("editDialog.inactive")}
                </p>
              </div>
              <Switch
                dir="ltr"
                checked={programFormData.isActive}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateProgram}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-btn text-white shadow-lg"
            >
              {isUpdating ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog
        open={isAddCourseDialogOpen}
        onOpenChange={setIsAddCourseDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[550px] rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800"
        >
          <DialogHeader className="flex flex-col space-y-2">
            <DialogTitle className="text-xl font-bold text-prim dark:text-sec flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {t("addCourseDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-start text-gray-600 dark:text-gray-400">
              <TextMuted>
                {t("addCourseDialog.description", {
                  programName: program?.nameAr,
                })}
              </TextMuted>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="course-nameAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseDialog.nameAr")}
                </Label>
                <Input
                  id="course-nameAr"
                  name="nameAr"
                  value={courseFormData.nameAr}
                  onChange={handleCourseInputChange}
                  placeholder={t("addCourseDialog.nameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="course-nameEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseDialog.nameEn")}
                </Label>
                <Input
                  id="course-nameEn"
                  name="nameEn"
                  value={courseFormData.nameEn}
                  onChange={handleCourseInputChange}
                  placeholder={t("addCourseDialog.nameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="course-code"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseDialog.code")}
              </Label>
              <Input
                id="course-code"
                name="code"
                value={courseFormData.code}
                onChange={handleCourseInputChange}
                placeholder={t("addCourseDialog.codePlaceholder")}
                className="rounded-xl font-mono border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="course-descriptionAr"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseDialog.descriptionAr")}
                </Label>
                <Textarea
                  id="course-descriptionAr"
                  name="descriptionAr"
                  value={courseFormData.descriptionAr}
                  onChange={handleCourseInputChange}
                  placeholder={t("addCourseDialog.descriptionArPlaceholder")}
                  className="rounded-xl min-h-20 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="course-descriptionEn"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseDialog.descriptionEn")}
                </Label>
                <Textarea
                  id="course-descriptionEn"
                  name="descriptionEn"
                  value={courseFormData.descriptionEn}
                  onChange={handleCourseInputChange}
                  placeholder={t("addCourseDialog.descriptionEnPlaceholder")}
                  className="rounded-xl min-h-20 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="course-programId"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseDialog.programId")}
              </Label>
              <Input
                id="course-programId"
                name="programId"
                type="number"
                value={courseFormData.programId}
                className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-400 cursor-not-allowed"
                disabled
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddCourseDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-btn text-white shadow-lg"
            >
              {isUpdating
                ? t("common.creating")
                : t("addCourseDialog.createCourse")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProgramUsers
        isOpen={isOpen}
        onClose={onClose}
        programId={parseInt(programId!)}
        programName={program.nameAr}
        users={programUsers || []}
        onUserAssigned={loadUniversityDetails}
      />
    </div>
  );
}

// Enhanced Skeleton Component
function ProgramDetailsSkeleton() {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
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
          </div>

          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-56 rounded-2xl bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
