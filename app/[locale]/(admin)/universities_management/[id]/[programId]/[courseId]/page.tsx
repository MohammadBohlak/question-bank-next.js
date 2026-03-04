"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  getCourseDetails,
  updateCourse,
  deleteCourse,
  updateBank,
  getProgramUsers,
  deleteBank,
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen,
  FileText,
  Edit,
  Trash2,
  Plus,
  Search,
  BookMarked,
  ArrowLeft,
  Layers,
  GraduationCap,
  Globe,
  Lock,
  Loader2,
  AlertCircle,
  Users,
  Info,
  Filter,
  Calendar,
  ChevronLeft,
  MoreVertical,
  Power,
  Hash,
  UserCog,
  Save,
  ShieldCheck,
  User,
  XCircle,
  CheckCircle,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBank } from "@/store/supervisor";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainTitle from "@/components/custom/texts/MainTitle";
import TextMuted from "@/components/custom/texts/TextMuted";
import Background from "@/components/custom/Background";

interface CourseBank {
  id: number;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: number;
  supervisorId: number | null;
  chaptersCount: number;
  questionsCount: number;
  questionsLevels: Array<{
    id: number;
    title: string;
    count: number;
  }>;
  questionsTypes: Array<{
    id: number;
    title: string;
    count: number;
  }>;
  course: string;
  supervisor: string | null;
}

interface Course {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  isActive: boolean;
  isPrivate: boolean;
  programId: number;
  supervisorId: number | null;
  courseBanksCount: number;
  program: string;
  supervisor: string | null;
  courseBanks: CourseBank[];
}

interface CourseFormData {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  isActive: boolean;
  isPrivate: boolean;
  programId: number;
  supervisorId: number | null;
}

interface EditBankFormData {
  id: number;
  isActive: boolean;
  supervisorId: number | null;
}

export default function CourseDetailsPage() {
  const { programId, courseId, locale } = useParams<{
    programId: string;
    courseId: string;
    locale: string;
  }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("adminCourseDetails");

  const course = useSelector(
    (state: RootState) => state.admin.courseDetails as Course,
  );
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [isEditBankDialogOpen, setIsEditBankDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [supervisor, setSupervisor] = useState(0);
  const [courseBankSearch, setCourseBankSearch] = useState("");
  const [courseBankFilter, setCourseBankFilter] = useState("all");
  const [formData, setFormData] = useState<CourseFormData>({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
    isActive: true,
    isPrivate: false,
    programId: 0,
    supervisorId: null,
  });
  const [editBankForm, setEditBankForm] = useState<EditBankFormData>({
    id: 0,
    isActive: true,
    supervisorId: null,
  });
  const programUsers = useSelector(
    (state: RootState) => state.admin.programUsers,
  );

  const loadCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getCourseDetails(parseInt(courseId))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, dispatch, t]);

  useEffect(() => {
    dispatch(getProgramUsers(parseInt(programId)));
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId, dispatch, programId, loadCourseDetails]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      supervisorId: id,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDeleteBank = (bank: CourseBank) => {
    if (!bank?.id) {
      toast.error(t("errors.missingData"));
      return;
    }

    if (!course?.id) {
      toast.error(t("errors.missingCourse"));
      return;
    }

    dispatch(deleteBank(bank.id))
      .unwrap()
      .then((res) => {
        if (
          !res.success &&
          Array.isArray(res.errors) &&
          res.errors.length > 0
        ) {
          toast.error(res.errors.join(" • "));
          return;
        }

        toast.success(res.message || t("messages.bankDeleted"));
        dispatch(getCourseDetails(course.id));
      })
      .catch((error) => {
        toast.error(error?.message || t("errors.deleteBankFailed"));
      });
  };

  const handleOpenEditBankDialog = (bank: CourseBank) => {
    setEditBankForm({
      id: bank.id,
      isActive: bank.isActive,
      supervisorId: bank.supervisorId,
    });
    setIsEditBankDialogOpen(true);
  };

  const handleUpdateBank = async () => {
    if (!editBankForm.id) return;

    try {
      const res = await dispatch(
        updateBank({
          id: editBankForm.id,
          body: {
            id: editBankForm.id,
            isActive: editBankForm.isActive,
            supervisorId: editBankForm.supervisorId,
          },
        }),
      ).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.bankUpdated"));
      setIsEditBankDialogOpen(false);
      loadCourseDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.updateBankFailed"),
      );
    }
  };

  const handleOpenEditDialog = () => {
    if (course) {
      setFormData({
        id: course.id,
        nameAr: course.nameAr,
        nameEn: course.nameEn,
        code: course.code,
        descriptionAr: course.descriptionAr || "",
        descriptionEn: course.descriptionEn || "",
        isActive: course.isActive,
        isPrivate: course.isPrivate,
        programId: course.programId,
        supervisorId: course.supervisorId,
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateCourse = async () => {
    if (!course) return;

    setIsUpdating(true);
    try {
      const res = await dispatch(
        updateCourse({
          id: course.id,
          body: formData,
        }),
      ).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.courseUpdated"));
      setIsEditDialogOpen(false);
      loadCourseDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.updateCourseFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    setIsUpdating(true);
    try {
      const res = await dispatch(deleteCourse(course.id)).unwrap();
      toast.success(res.message || t("messages.courseDeleted"));
      router.push(`/${locale}/universities_management`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.deleteCourseFailed"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateBank = async () => {
    try {
      const body = { courseId: course.id, supervisorId: supervisor };
      const res = await dispatch(createBank(body)).unwrap();
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message || t("messages.bankCreated"));
      setIsAddBankDialogOpen(false);
      loadCourseDetails();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.createBankFailed"),
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const filteredCourseBanks =
    course?.courseBanks?.filter((bank) => {
      const matchesSearch =
        courseBankSearch === "" ||
        bank.code.toLowerCase().includes(courseBankSearch.toLowerCase()) ||
        (bank.course &&
          bank.course.toLowerCase().includes(courseBankSearch.toLowerCase()));

      const matchesFilter =
        courseBankFilter === "all" ||
        (courseBankFilter === "active" && bank.isActive) ||
        (courseBankFilter === "inactive" && !bank.isActive);

      return matchesSearch && matchesFilter;
    }) || [];

  const totalQuestions =
    course?.courseBanks?.reduce((sum, bank) => sum + bank.questionsCount, 0) ||
    0;
  const totalChapters =
    course?.courseBanks?.reduce((sum, bank) => sum + bank.chaptersCount, 0) ||
    0;

  if (loading) {
    return <CourseDetailsSkeleton />;
  }

  if (!course) {
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
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
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
          <Background className="relative">
            <div className="w-full flex flex-col items-center sm:flex-row justify-between  sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.back()}
                  className="absolute bottom-3 rtl:right-3 ltr:left-3 sm:static rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-btn shadow-md">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <MainTitle className="text-3xl font-bold ">
                      {locale == "ar" ? course.nameAr : course.nameEn}
                    </MainTitle>
                  </div>
                  <TextMuted className="italic">
                    {locale == "ar" ? course.nameEn : course.nameAr}
                  </TextMuted>
                </div>
              </div>

              <div className="flex  flex-wrap items-center gap-3">
                <Badge
                  className={`gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full ${
                    course.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500 dark:border-green-800"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-500 dark:border-red-800"
                  }`}
                  variant="outline"
                >
                  {course.isActive ? t("status.active") : t("status.inactive")}
                </Badge>
                <Badge
                  className={`gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full ${
                    course.isPrivate
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-500 dark:border-purple-800"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-500 dark:border-blue-800"
                  }`}
                  variant="outline"
                >
                  {course.isPrivate ? t("status.private") : t("status.public")}
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
                      className="cursor-pointer text-sec hover:bg-sec hover:text-white"
                      onClick={handleOpenEditDialog}
                    >
                      <Edit className="h-4 w-4 mr-2 text-inherit" />
                      {t("actions.editCourse")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:bg-red-500 hover:text-white "
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
          {/* Stats Cards */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {course.courseBanksCount}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.banks")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                    <BookMarked className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {totalQuestions}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.questions")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light shadow-lg bg-linear-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {totalChapters}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.chapters")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                    <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-light w-fit shadow-lg bg-linear-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center  justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {course.program}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("stats.program")}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40">
                    <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
          {/* Stats Cards - Compact Data List Style */}
          <div className="w-full mb-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-gray-700 overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y divide-border-light dark:divide-gray-700 md:divide-y-0 md:divide-x">
                {/* Banks */}
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {t("stats.banks")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {course.courseBanksCount}
                    </h3>
                    <BookMarked className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>

                {/* Questions */}
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {t("stats.questions")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {totalQuestions}
                    </h3>
                    <FileText className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>

                {/* Chapters */}
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                    <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {t("stats.chapters")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {totalChapters}
                    </h3>
                    <Layers className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                </div>

                {/* Program */}
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                    <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {t("stats.program")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                      {course.program}
                    </h3>
                    <GraduationCap className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 ">
          {/* Course Info & Banks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Details Card */}
            <Card className="rounded-2xl border-border-light dark:border-gray-700 pt-0 shadow-md bg-white dark:bg-gray-800">
              <CardHeader className="pb-6 pt-4 bg-btn !bg-gradient-to-br rounded-tl-2xl rounded-tr-2xl">
                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white">
                  {/* <div className="p-2 rounded-lg bg-btn">
                    <Info className="h-5 w-5 text-white" />
                  </div> */}
                  {t("courseInfo.title")}
                </CardTitle>
                <CardDescription className="text-gray-100 text-md">
                  {t("courseInfo.code")}:{" "}
                  <span className="font-mono font-bold">{course.code}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.arabicDescription")}
                      </Label>
                      <div className="p-4 rounded-xl bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 min-h-[120px]">
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {course.descriptionAr ||
                            t("courseInfo.noArabicDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                        {t("courseInfo.englishDescription")}
                      </Label>
                      <div className="p-4 rounded-xl bg-linear-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700 min-h-[120px]">
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {course.descriptionEn ||
                            t("courseInfo.noEnglishDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <UserCog
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.supervisor")}
                      </Label>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <UserCog
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            strokeWidth={2.5}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {course.supervisor || t("courseInfo.noSupervisor")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <ShieldCheck
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.privacy")}
                      </Label>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-green-50 dark:from-gray-900/50 dark:to-green-900/20 border border-gray-200 dark:border-gray-700">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          {course.isPrivate ? (
                            <Lock
                              className="h-5 w-5 text-purple-600 dark:text-purple-400"
                              strokeWidth={2.5}
                            />
                          ) : (
                            <Globe
                              className="h-5 w-5 text-green-600 dark:text-green-400"
                              strokeWidth={2.5}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {course.isPrivate
                              ? t("courseInfo.private")
                              : t("courseInfo.public")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Banks Section */}
            <Card className="flex-col py-0 gap-0 rounded-2xl border border-border-light dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="border-b bg-btn !bg-gradient-to-br pt-4 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      {t("banks.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-100 mt-1 text-md">
                      {filteredCourseBanks.length} {t("banks.description")}
                    </CardDescription>
                  </div>
                  <Button
                    variant={"none"}
                    className="gap-2 rounded-xl bg-gray-200 text-prim  shadow-lg hover:scale-105 transition-all"
                    onClick={() => setIsAddBankDialogOpen(true)}
                  >
                    <Plus className="h-5 w-5" />
                    {t("banks.addBank")}
                  </Button>
                </div>

                {/* Bank Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("banks.searchPlaceholder")}
                      value={courseBankSearch}
                      onChange={(e) => setCourseBankSearch(e.target.value)}
                      className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                  <Select
                    value={courseBankFilter}
                    onValueChange={setCourseBankFilter}
                  >
                    <SelectTrigger
                      className="f-input dark:hover:!border-sec hover-border-prim w-full border border-border-light sm:w-[180px] rounded-xl  dark:border-gray-700 bg-gray-50 dark:bg-gray-900
                    "
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder={t("banks.status")} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                      <SelectItem value="all">
                        {t("banks.filter.all")}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("banks.filter.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("banks.filter.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0 border-0 flex-col items-center md:items-start md:flex ">
                {/* Desktop Table */}
                <div className="w-full hidden md:block overflow-x-auto custom-scrollbar border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                  <table className="w-full">
                    <thead className="text-lg">
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "الكود" : "Code"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "الحالة" : "Status"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "الفصول" : "Chapters"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "الأسئلة" : "Questions"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "المشرف" : "Supervisor"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "تاريخ الإنشاء" : "Created"}
                        </th>
                        <th className="text-right py-5 px-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {locale === "ar" ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourseBanks.map((bank, index) => (
                        <tr
                          key={bank.id}
                          className={`
            border-b border-gray-100 dark:border-gray-800 
            hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 
            dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20
            transition-all duration-300
            group/row
            ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/50"}
          `}
                        >
                          {/* Code Cell */}
                          <td className="py-5 px-4">
                            <div className="text-nowrap inline-flex items-center gap-2 font-mono font-bold text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 text-[#141a73] dark:text-[#2ab3f7] border-2 border-blue-200 dark:border-blue-800 shadow-sm group-hover/row:shadow-md transition-all">
                              <Hash className="h-3.5 w-3.5" />
                              {bank.code}
                            </div>
                          </td>

                          {/* Status Cell */}
                          <td className="py-5 px-4">
                            <Badge
                              className={`
                gap-2 px-4 py-2 rounded-full font-semibold shadow-md
                group-hover/row:scale-105 transition-transform
                ${
                  bank.isActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800"
                    : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-800"
                }
              `}
                            >
                              {bank.isActive ? (
                                <>
                                  <CheckCircle className="h-4 w-4 animate-pulse" />
                                  {t("banks.statusActive")}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  {t("banks.statusInactive")}
                                </>
                              )}
                            </Badge>
                          </td>

                          {/* Chapters Cell */}
                          <td className="py-5 px-4">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 group-hover/row:shadow-md transition-all">
                              <div className="p-1.5 rounded-lg bg-purple-500 dark:bg-purple-600">
                                <Layers className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-bold text-lg text-gray-900 dark:text-white">
                                {bank.chaptersCount}
                              </span>
                            </div>
                          </td>

                          {/* Questions Cell */}
                          <td className="py-5 px-4">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 group-hover/row:shadow-md transition-all">
                              <div className="p-1.5 rounded-lg bg-blue-500 dark:bg-blue-600">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-bold text-lg text-gray-900 dark:text-white">
                                {bank.questionsCount}
                              </span>
                            </div>
                          </td>

                          {/* Supervisor Cell */}
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover/row:scale-110 transition-transform">
                                <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span className="text-nowrap font-semibold text-gray-700 dark:text-gray-300">
                                {bank.supervisor || t("banks.noSupervisor")}
                              </span>
                            </div>
                          </td>

                          {/* Created Date Cell */}
                          <td className="py-5 px-4">
                            <div className="text-nowrap flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <Calendar className="h-4 w-4" />
                              </div>
                              {formatDate(bank.createdAt)}
                            </div>
                          </td>

                          {/* Actions Cell */}
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant={"none"}
                                size="sm"
                                onClick={() => handleOpenEditBankDialog(bank)}
                                className="
                  gap-2 px-4 py-2 rounded-xl font-semibold
                 text-blue-500 hover:shadow-xl 
                  border-0
                  transform hover:-translate-y-0.5
                  transition-all duration-300
                "
                              >
                                <Edit className="h-4 w-4" />
                                {locale === "ar" ? "تعديل" : "Edit"}
                              </Button>

                              <Button
                                variant={"none"}
                                size="sm"
                                onClick={() => handleDeleteBank(bank)}
                                className="
                  gap-2 px-4 py-2 rounded-xl font-semibold
                 text-red-500
                  border-0
                  transform hover:-translate-y-0.5
                  hover:shadow-lg
                  transition-all duration-300
                "
                              >
                                <Trash2 className="h-4 w-4" />
                                {locale === "ar" ? "حذف" : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-6 p-6 ">
                  {filteredCourseBanks.map((bank) => (
                    <Card
                      key={bank.id}
                      className="relative border-1  border-sec transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                      {/* Top Colored Strip */}
                      <div
                        className={`
          h-2 w-full
          ${
            bank.isActive
              ? "bg-gradient-to-r from-green-500 via-blue-500 to-[#2ab3f7]"
              : "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
          }
        `}
                      />

                      <CardContent className="p-6">
                        <div className="space-y-5">
                          {/* Header with Code and Status */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="inline-flex items-center gap-2 font-mono font-bold text-base px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 text-[#141a73] dark:text-[#2ab3f7] border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                                <Hash className="h-4 w-4" />
                                {bank.code}
                              </div>
                            </div>

                            <Badge
                              className={`
                gap-2 px-4 py-2 rounded-full font-semibold shadow-md flex-shrink-0
                ${
                  bank.isActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800"
                    : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-800"
                }
              `}
                            >
                              {bank.isActive ? (
                                <>
                                  <CheckCircle className="h-4 w-4 animate-pulse" />
                                  {t("banks.statusActive")}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  {t("banks.statusInactive")}
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Chapters and Questions Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Chapters */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800 space-y-3">
                              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                {locale === "ar" ? "الفصول" : "Chapters"}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500 dark:bg-purple-600 shadow-lg">
                                  <Layers className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-2xl text-gray-900 dark:text-white">
                                  {bank.chaptersCount}
                                </span>
                              </div>
                            </div>

                            {/* Questions */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 space-y-3">
                              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                {locale === "ar" ? "الأسئلة" : "Questions"}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500 dark:bg-blue-600 shadow-lg">
                                  <FileText className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-2xl text-gray-900 dark:text-white">
                                  {bank.questionsCount}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Supervisor */}
                          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 space-y-2">
                            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {locale === "ar" ? "المشرف" : "Supervisor"}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-amber-500 dark:bg-amber-600 shadow-lg">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                {bank.supervisor || t("banks.noSupervisor")}
                              </span>
                            </div>
                          </div>

                          {/* Footer with Date and Actions */}
                          <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <Calendar className="h-4 w-4" />
                              </div>
                              {formatDate(bank.createdAt)}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleOpenEditBankDialog(bank)}
                                className="
                  gap-2 px-4 py-2 rounded-xl font-semibold
                  bg-gradient-to-r from-blue-500 to-blue-600 
                  hover:from-blue-600 hover:to-blue-700 
                  text-white shadow-lg hover:shadow-xl 
                  border-0
                  transform hover:scale-105 hover:-translate-y-0.5
                  transition-all duration-300
                "
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => handleDeleteBank(bank)}
                                className="
                  gap-2 px-4 py-2 rounded-xl font-semibold
                  bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700 
                  text-white shadow-lg hover:shadow-xl 
                  border-0
                  transform hover:scale-105 hover:-translate-y-0.5
                  transition-all duration-300
                "
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {filteredCourseBanks.length === 0 && (
                  <div className="py-12 text-center m-auto">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                      <BookMarked className="h-10 w-10 text-sec" />
                    </div>
                    <h3 className="text-xl font-bold text-prim dark:text-sec mb-3">
                      {courseBankSearch || courseBankFilter !== "all"
                        ? t("banks.noBanks")
                        : t("banks.noBanks")}
                    </h3>
                    <TextMuted className="text-center w-fit mb-8 max-w-md mx-auto">
                      {courseBankSearch || courseBankFilter !== "all"
                        ? t("banks.trySearch")
                        : t("banks.noBanksDescription")}
                    </TextMuted>
                    <Button
                      onClick={() => setIsAddBankDialogOpen(true)}
                      className="bg-btn hover:opacity-80 text-white shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                      <span>{t("banks.createFirstBank")}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto custom-scrollbar sm:max-w-[550px] rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader className="flex flex-col space-y-2">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Edit className="h-5 w-5 text-white" />
              </div>
              {t("editDialog.title")}
            </DialogTitle>
            <DialogDescription>
              <TextMuted>{t("editDialog.description")}</TextMuted>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.nameAr")}
                </Label>
                <Input
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  placeholder={t("editDialog.nameArPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.nameEn")}
                </Label>
                <Input
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder={t("editDialog.nameEnPlaceholder")}
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("editDialog.code")}
              </Label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder={t("editDialog.codePlaceholder")}
                className="rounded-xl font-mono border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.descriptionAr")}
                </Label>
                <Textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  placeholder={t("editDialog.descriptionArPlaceholder")}
                  className="rounded-xl min-h-[100px] border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.descriptionEn")}
                </Label>
                <Textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleInputChange}
                  placeholder={t("editDialog.descriptionEnPlaceholder")}
                  className="rounded-xl min-h-[100px] border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white "
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.programId")}
                </Label>
                <Input
                  name="programId"
                  type="number"
                  value={formData.programId}
                  readOnly
                  className="rounded-xl border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("editDialog.supervisorId")}
                </Label>
                <Select
                  value={programUsers
                    ?.filter((user) => user.id == formData.supervisorId)[0]
                    ?.id.toString()}
                  onValueChange={(value) => handleSelectChange(parseInt(value))}
                >
                  <SelectTrigger className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                    <SelectValue
                      placeholder={t("addBankDialog.selectSupervisor")}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    {programUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullNameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <div>
                  <Label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("editDialog.status")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.isActive
                      ? t("editDialog.active")
                      : t("editDialog.inactive")}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isActive", checked)
                  }
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <div>
                  <Label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("editDialog.privacy")}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.isPrivate
                      ? t("editDialog.private")
                      : t("editDialog.public")}
                  </p>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isPrivate", checked)
                  }
                  className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-400"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={
                isUpdating ||
                !formData.nameAr.trim() ||
                !formData.nameEn.trim() ||
                !formData.code.trim()
              }
              className="flex-1 rounded-xl bg-btn hover:opacity-80 text-white shadow-lg"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.updating")}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save />
                  <span>{t("common.saveChanges")}</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Dialog */}
      <Dialog open={isAddBankDialogOpen} onOpenChange={setIsAddBankDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-prim dark:text-sec flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {t("addBankDialog.title")}
            </DialogTitle>
            <DialogDescription>
              <TextMuted>
                {t("addBankDialog.description", { courseName: course.nameAr })}
              </TextMuted>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t("addBankDialog.supervisor")}
              </Label>
              <Select
                value={supervisor.toString()}
                onValueChange={(value) => setSupervisor(parseInt(value))}
              >
                <SelectTrigger className="f-input rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={t("addBankDialog.selectSupervisor")}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  {programUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullNameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddBankDialogOpen(false)}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:!bg-transparent hover:!border-red-500 hover:text-red-500 dark:hover:text-red-500"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateBank}
              className="flex-1 rounded-xl bg-btn hover:opacity-80 text-white shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("addBankDialog.createBank")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Dialog */}
      <Dialog
        open={isEditBankDialogOpen}
        onOpenChange={setIsEditBankDialogOpen}
      >
        <DialogContent className="sm:max-w-[450px] rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-prim dark:text-sec flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn text-white">
                <Edit className="h-5 w-5" />
              </div>
              {t("editBankDialog.title")}
            </DialogTitle>
            <DialogDescription>
              <TextMuted>{t("editBankDialog.description")}</TextMuted>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div>
                <Label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("editBankDialog.status")}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {editBankForm.isActive
                    ? t("editBankDialog.active")
                    : t("editBankDialog.inactive")}
                </p>
              </div>
              <Switch
                checked={editBankForm.isActive}
                onCheckedChange={(checked) =>
                  setEditBankForm((prev) => ({ ...prev, isActive: checked }))
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t("editBankDialog.supervisor")}
              </Label>
              <Select
                value={editBankForm.supervisorId?.toString()}
                onValueChange={(value) =>
                  setEditBankForm((prev) => ({
                    ...prev,
                    supervisorId: value ? parseInt(value) : null,
                  }))
                }
              >
                <SelectTrigger className="f-input rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={t("editBankDialog.selectSupervisor")}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="0">
                    {t("editBankDialog.noSupervisor")}
                  </SelectItem>
                  {programUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullNameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditBankDialogOpen(false)}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:!bg-transparent hover:!text-red-500 hover:!border-red-500"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdateBank}
              className="flex items-center flex-1 rounded-xl bg-btn text-white hover:opacity-80 shadow-lg"
            >
              <Save />
              <span>{t("common.saveChanges")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border-light shadow-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mb-6">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
              {t("deleteDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              {t("deleteDialog.description", { courseName: course.nameAr })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("deleteDialog.warning", {
                banks: course.courseBanksCount,
                questions: totalQuestions,
              })}
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleDeleteCourse}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.deleting")}
                </>
              ) : (
                t("deleteDialog.deleteCourse")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Skeleton Component
function CourseDetailsSkeleton() {
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
            <Skeleton className="h-96 rounded-2xl bg-gray-300 dark:bg-gray-700" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-48 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-56 rounded-2xl bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-64 rounded-2xl bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
