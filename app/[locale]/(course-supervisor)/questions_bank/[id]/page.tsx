"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCourseDetails, createBank, updateBank } from "@/store/supervisor";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Lock,
  Globe,
  Trash2,
  GraduationCap,
  Users,
  ChevronLeft,
  FileText,
  Layers,
  CheckCircle,
  XCircle,
  Hash,
  Plus,
  Loader2,
  BookKey,
  Shield,
  Pencil,
  Eye,
  LayoutTemplate,
  PlusSquare,
  MoreVertical,
  UserCog,
  Settings2,
  Calendar,
  Save,
  FileQuestionMark,
  Landmark,
  ChartNoAxesCombined,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { deleteBank } from "@/store/admin";
import { useTranslations } from "next-intl";
import Background from "@/components/custom/Background";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import StatsCourseSupervisor from "@/components/custom/questionsBankComponents/stats/StatsCourseSupervisor";
import CustomSelect from "@/components/custom/common/CustomSelect";
import DeleteBankDialog from "@/components/custom/questionsBankComponents/dialogs/bankDialogs/DeleteBankDialog";

// Define interfaces based on your Redux slice
interface QuestionLevel {
  id: number;
  title: string;
  count: number;
}

interface BankQuestionType {
  id: number;
  title: string;
  count: number;
}

interface CourseBank {
  id: number;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: number;
  supervisorId: number;
  chaptersCount: number;
  questionsCount: number;
  questionsLevels: QuestionLevel[];
  questionsTypes: BankQuestionType[];
  course: string;
  supervisor: string;
}

interface EditBankForm {
  isActive: boolean;
  supervisorId: number;
}

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("courseDetails");
  const { locale } = useParams();
  // Use proper type for course from Redux
  const course = useSelector(
    (state: RootState) => state.supervisor.courseDetail,
  );
  const supervisorId = useSelector((state: RootState) => state.auth.user?.id);
  const [isEditBankDialogOpen, setIsEditBankDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<CourseBank | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [courseBankSearch, setCourseBankSearch] = useState("");
  const [courseBankFilter, setCourseBankFilter] = useState("all");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const handleDeleteCourse = (bank: CourseBank) => {
    setSelectedBank(bank);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    const res = await dispatch(deleteBank(selectedBank!.id)).unwrap();
    toast.success(res.message);
    await dispatch(getCourseDetails({ id: parseInt(id) }));
    setIsDeleteDialogOpen(false);
    setSelectedBank(null);
  };
  const [editBankForm, setEditBankForm] = useState<EditBankForm>({
    isActive: true,
    supervisorId: 0,
  });

  useEffect(() => {
    if (id) {
      dispatch(getCourseDetails({ id: parseInt(id) }));
    }
  }, [id, dispatch]);

  const totalQuestions =
    course?.courseBanks.reduce(
      (sum: number, bank) => sum + bank.questionsCount,
      0,
    ) || 0;
  const totalChapters =
    course?.courseBanks.reduce(
      (sum: number, bank) => sum + bank.chaptersCount,
      0,
    ) || 0;
  const activeBanksCount =
    course?.courseBanks.filter((b) => b.isActive).length || 0;

  const filteredCourseBanks = course?.courseBanks.filter((bank) => {
    const matchesSearch =
      courseBankSearch === "" ||
      bank.code.toLowerCase().includes(courseBankSearch.toLowerCase()) ||
      bank.supervisor.toLowerCase().includes(courseBankSearch.toLowerCase());

    const matchesFilter =
      courseBankFilter === "all" ||
      (courseBankFilter === "active" && bank.isActive) ||
      (courseBankFilter === "inactive" && !bank.isActive);

    return matchesSearch && matchesFilter;
  });

  const calculateQuestionLevelDistribution = () => {
    const distribution: Record<string, number> = {};
    course?.courseBanks.forEach((bank) => {
      bank.questionsLevels.forEach((level) => {
        distribution[level.title] =
          (distribution[level.title] || 0) + level.count;
      });
    });
    return distribution;
  };

  const calculateQuestionTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    course?.courseBanks.forEach((bank) => {
      bank.questionsTypes.forEach((type) => {
        distribution[type.title] = (distribution[type.title] || 0) + type.count;
      });
    });
    return distribution;
  };

  const handleEditBank = (bank: CourseBank) => {
    setSelectedBank(bank);
    setEditBankForm({
      isActive: bank.isActive,
      supervisorId: bank.supervisorId,
    });
    setIsEditBankDialogOpen(true);
  };

  const handleUpdateBank = async () => {
    if (selectedBank) {
      const res = await dispatch(
        updateBank({
          id: selectedBank.id,
          isActive: editBankForm.isActive,
          supervisorId: editBankForm.supervisorId,
        }),
      ).unwrap();
      await dispatch(getCourseDetails({ id: parseInt(id) }));
      setIsEditBankDialogOpen(false);
      toast.success(res.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getQuestionLevelColor = (level: string) => {
    const levelLower = level.toLowerCase();
    switch (levelLower) {
      case "easy":
      case "سهل":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700";
      case "medium":
      case "متوسط":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700";
      case "hard":
      case "صعب":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700";
      case "distinguish":
      case "متميز":
        return "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  const getQuestionTypeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "true_false":
      case "true/false":
      case "صح وخطأ":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700";
      case "multiple_choice":
      case "multiple choice":
      case "اختيار متعدد":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700";
      case "essay":
      case "مقال":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  // Loading state
  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Background isHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="rounded-lg border border-border-light dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Button>
                <div>
                  <MainTitle>
                    {locale == "ar" ? course.nameAr : course.nameEn}
                  </MainTitle>
                  <TextMuted className="italic mt-1">
                    {locale == "ar" ? course.nameEn : course.nameAr}
                  </TextMuted>
                </div>
              </div>
            </div>
          </Background>

          {/* Quick Stats */}
          <StatsCourseSupervisor
            totalQuestions={totalQuestions}
            totalChapters={totalChapters}
            activeBanksCount={activeBanksCount}
          />
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          dir="rtl"
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <TabsTrigger
              value="overview"
              className="font-arabic data-[state=active]:bg-sec data-[state=active]:text-white dark:data-[state=active]:bg-sec data-[state=active]:dark:text-white"
            >
              {t("overview")}
            </TabsTrigger>
            <TabsTrigger
              value="banks"
              className="font-arabic data-[state=active]:bg-sec data-[state=active]:text-white dark:data-[state=active]:bg-sec data-[state=active]:dark:text-white"
            >
              {t("banks")}
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="font-arabic data-[state=active]:bg-sec data-[state=active]:text-white dark:data-[state=active]:bg-sec data-[state=active]:dark:text-white"
            >
              {t("analytics")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border pt-0 border-border-light dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="pt-4 bg-btn !bg-gradient-to-br border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="text-xl font-bold text-white rtl:text-right font-arabic flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sec text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  {t("courseInfo.title")}
                </CardTitle>
                <CardDescription className="text-gray-100 text-right font-arabic mt-2">
                  {t("courseInfo.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Descriptions Section - Text Heavy */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-md font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b pb-2 border-gray-200 dark:border-gray-700">
                        <FileText
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.arabicDescription")}
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 border border-blue-100 dark:border-blue-800/30">
                        <p className="whitespace-pre-wrap font-arabic text-right text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                          {course.descriptionAr ||
                            t("courseInfo.noArabicDescription")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-md font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b pb-2 border-gray-200 dark:border-gray-700">
                        <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                        {t("courseInfo.englishDescription")}
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 border border-purple-100 dark:border-purple-800/30">
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                          {course.descriptionEn ||
                            t("courseInfo.noEnglishDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section - Grid of Data Pills */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200 dark:border-gray-700">
                        <Settings2
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.courseDetails")}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Code Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span className="text-sm  text-gray-500 dark:text-gray-400 font-semibold uppercase">
                              {t("courseInfo.courseCode")}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm">
                            {course.code}
                          </span>
                        </div>

                        {/* Program Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 group hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                            <span className="text-sm  text-gray-500 dark:text-gray-400 font-semibold uppercase">
                              {t("courseInfo.program")}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm truncate max-w-[100px]">
                            {course.program}
                          </span>
                        </div>

                        {/* Visibility Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 group hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                          <div className="flex items-center gap-2">
                            {course.isPrivate ? (
                              <Lock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            ) : (
                              <Globe className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            )}
                            <span className="text-sm  text-gray-500 dark:text-gray-400 font-semibold uppercase">
                              {t("courseInfo.visibility")}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border-0 ${
                              course.isPrivate
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            }`}
                          >
                            {course.isPrivate
                              ? t("courseInfo.private")
                              : t("courseInfo.public")}
                          </Badge>
                        </div>

                        {/* Status Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 group hover:border-green-300 dark:hover:border-green-700 transition-colors">
                          <div className="flex items-center gap-2">
                            {course.isActive ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                            )}
                            <span className="text-sm  text-gray-500 dark:text-gray-400 font-semibold uppercase">
                              {t("courseInfo.status")}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border-0 ${
                              course.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                            }`}
                          >
                            {course.isActive
                              ? t("courseInfo.active")
                              : t("courseInfo.inactive")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Supervisor Card - Highlighted */}
                    <div>
                      <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200 dark:border-gray-700">
                        <UserCog
                          className="h-4 w-4 text-sec"
                          strokeWidth={2.5}
                        />
                        {t("courseInfo.supervisor")}
                      </h3>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                        <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md">
                          <Users className="h-5 w-5 text-sec" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-base">
                            {course.supervisor || t("courseInfo.noSupervisor")}
                          </div>
                          {course.supervisor && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {/* {t("courseInfo.supervisorRole")} */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Banks Tab */}

          {/* Banks Tab */}
          <TabsContent value="banks" className="space-y-6">
            <Card className="border pt-0 border-border-light dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="pt-4  bg-btn !bg-gradient-to-br border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sec">
                        <BookKey className="h-5 w-5 text-white" />
                      </div>
                      {t("banksSection.title")}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-100 font-arabic">
                      {t("banksSection.description")}
                    </CardDescription>
                  </div>
                  {course.isPrivate && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        const res = await dispatch(
                          createBank({
                            courseId: parseInt(id),
                            supervisorId: supervisorId!,
                          }),
                        ).unwrap();
                        toast.success(res.message);
                        await dispatch(getCourseDetails({ id: parseInt(id) }));
                      }}
                      className="flex items-center bg-sec hover:opacity-80 hover:bg-sec hover:scale-105 text-white font-arabic shadow-md transition-all gap-0"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      <span>{t("banksSection.addBank")}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Search and Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t("banksSection.searchPlaceholder")}
                      className="pr-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:focus:ring-blue-500/20 font-arabic text-gray-900 dark:text-white"
                      value={courseBankSearch}
                      onChange={(e) => setCourseBankSearch(e.target.value)}
                    />
                  </div>
                  <CustomSelect
                    value={courseBankFilter}
                    onChange={setCourseBankFilter}
                    placeholder={t("banksSection.statusFilter")}
                    options={[
                      { value: "all", label: t("banksSection.allStatuses") },
                      {
                        value: "active",
                        label: t("banksSection.activeStatus"),
                      },
                      {
                        value: "inactive",
                        label: t("banksSection.inactiveStatus"),
                      },
                    ]}
                    className="w-full sm:w-[180px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                {/* Banks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-2 gap-4">
                  {filteredCourseBanks?.map((bank) => (
                    <Card
                      key={bank.id}
                      className="group relative border pt-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
                    >
                      {/* Colored Top Border */}
                      <div
                        className={`h-1.5 w-full ${bank.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                      />

                      <CardHeader className="pb-4 pt-6 shrink-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="p-1.5 rounded-md bg-sec text-white">
                                <BookKey className="h-4 w-4" />
                              </div>
                              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white font-arabic truncate">
                                {bank.code}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span className="font-arabic text-sm">
                                {formatDate(bank.createdAt)}
                              </span>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={`
                              shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border-0
                              ${
                                bank.isActive
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }
                            `}
                          >
                            {bank.isActive
                              ? t("courseInfo.active")
                              : t("courseInfo.inactive")}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4 flex-1 space-y-5">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {bank.chaptersCount}
                            </div>
                            <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                              {t("banksSection.chapters")}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {bank.questionsCount}
                            </div>
                            <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                              {t("banksSection.questions")}
                            </div>
                          </div>
                        </div>

                        {/* Supervisor */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                          <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                            <UserCog className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-0.5">
                              {/* {t("banksSection.supervisor")} */}
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {bank.supervisor}
                            </div>
                          </div>
                        </div>

                        {/* Question Levels & Types */}
                        <div className="space-y-3">
                          {bank.questionsLevels.length > 0 && (
                            <div>
                              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Layers
                                  className="h-4 w-4 text-sec"
                                  strokeWidth={2.2}
                                />
                                {t("banksSection.questionLevels")}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {bank.questionsLevels
                                  .slice(0, 3)
                                  .map((level) => (
                                    <Badge
                                      key={level.id}
                                      className={`text-[10px] font-medium px-2.5 py-1 rounded-md border-0 truncate max-w-[110px] ${getQuestionLevelColor(level.title)}`}
                                    >
                                      {level.title} ({level.count})
                                    </Badge>
                                  ))}
                                {bank.questionsLevels.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                  >
                                    +{bank.questionsLevels.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {bank.questionsTypes.length > 0 && (
                            <div>
                              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <FileText className="h-4 w-4 text-sec" />
                                {t("banksSection.questionTypes")}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {bank.questionsTypes.slice(0, 3).map((type) => (
                                  <Badge
                                    key={type.id}
                                    className={`text-[10px] font-medium px-2.5 py-1 rounded-md border-0 truncate max-w-[110px] ${getQuestionTypeColor(type.title)}`}
                                  >
                                    {type.title.replace("_", " ")} ({type.count}
                                    )
                                  </Badge>
                                ))}
                                {bank.questionsTypes.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                  >
                                    +{bank.questionsTypes.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Integrated Action Bar (Desktop) */}
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-700">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBank(bank)}
                            className="h-12 flex flex-col items-center justify-center gap-1.5 rounded-none text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-400 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="text-[10px] font-medium">
                              {t("banksSection.edit")}
                            </span>
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCourse(bank)}
                            className="h-12 flex flex-col items-center justify-center gap-1.5 rounded-none text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-[10px] font-medium">
                              {t("banksSection.delete")}
                            </span>
                          </Button>

                          {/* Details */}
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-12 flex flex-col items-center justify-center gap-1.5 rounded-none text-prim dark:text-sec hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Link
                              href={`/questions_bank/${id}/${bank.id}`}
                              className="flex flex-col items-center justify-center w-full h-full"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-[10px] font-medium">
                                {t("banksSection.details")}
                              </span>
                            </Link>
                          </Button>

                          {/* Create */}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-12 flex flex-col items-center justify-center gap-1.5 rounded-none text-prim dark:text-sec hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Link
                              href={`/questions_bank/${id}/${bank.id}/create-templates`}
                              className="flex flex-col items-center justify-center w-full h-full"
                            >
                              <PlusSquare className="h-4 w-4" />
                              <span className="text-[10px] font-medium">
                                {t("banksSection.create")}
                              </span>
                            </Link>
                          </Button>

                          {/* Templates */}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-12 flex flex-col items-center justify-center gap-1.5 rounded-none text-prim dark:text-sec hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Link
                              href={`/questions_bank/${id}/${bank.id}/bankTemplate`}
                              className="flex flex-col items-center justify-center w-full h-full"
                            >
                              <LayoutTemplate className="h-4 w-4" />
                              <span className="text-[10px] font-medium">
                                {t("banksSection.templates")}
                              </span>
                            </Link>
                          </Button>
                        </div>

                        {/* Mobile Actions (Dropdown) */}
                        {/* <div className="flex md:hidden justify-between items-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBank(bank)}
                            className="flex-1 h-10 text-xs border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {t("banksSection.edit")}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-10 w-10 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/questions_bank/${id}/${bank.id}`}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  {t("banksSection.details")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/questions_bank/${id}/${bank.id}/create-templates`}
                                  className="flex items-center gap-2"
                                >
                                  <PlusSquare className="h-4 w-4" />
                                  {t("banksSection.create")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/questions_bank/${id}/${bank.id}/bankTemplate`}
                                  className="flex items-center gap-2"
                                >
                                  <LayoutTemplate className="h-4 w-4" />
                                  {t("banksSection.templates")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCourse(bank)}
                                className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("banksSection.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div> */}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {filteredCourseBanks?.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <BookKey className="h-10 w-10 text-sec" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-arabic">
                      {t("banksSection.noBanks")}
                    </h3>
                    <TextMuted className="w-fit mx-auto mb-5 max-w-sm">
                      {courseBankSearch || courseBankFilter !== "all"
                        ? t("banksSection.adjustSearch")
                        : t("banksSection.noBanksDescription")}
                    </TextMuted>
                    <Button
                      onClick={() =>
                        dispatch(
                          createBank({
                            courseId: parseInt(id),
                            supervisorId: supervisorId!,
                          }),
                        )
                      }
                      className="bg-btn gap-0 hover:opacity-80 text-white shadow-lg hover:shadow-xl transition-all font-arabic"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      {t("banksSection.createFirstBank")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Analytics Tab */}

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border pt-0 border-border-light dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader className="pt-4 pb-4 bg-btn bg-linear-to-br rounded-tl-xl rounded-tr-xl">
                <CardTitle className="text-lg text-white font-arabic flex items-center gap-3">
                  <div className="p-2 rounded-md bg-sec text-white">
                    <ChartNoAxesCombined className="w-5 h-5" />
                  </div>
                  {t("analyticsSection.title")}
                </CardTitle>
                <CardDescription className="text-gray-100 font-arabic">
                  {t("analyticsSection.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Levels Distribution */}
                {totalQuestions > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-white mb-3 font-arabic">
                      <FileQuestionMark className="text-sec" size={18} />
                      {t("analyticsSection.levelDistribution")}
                    </h3>
                    <div
                      dir={"ltr"}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {Object.entries(calculateQuestionLevelDistribution()).map(
                        ([level, count]) => (
                          <div
                            key={level}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge className={getQuestionLevelColor(level)}>
                                {level}
                              </Badge>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {count}
                              </span>
                            </div>
                            <Progress
                              value={(count / totalQuestions) * 100}
                              className="h-2 bg-gray-200 dark:bg-gray-700"
                            />
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-arabic">
                              {((count / totalQuestions) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Question Types Distribution */}
                {totalQuestions > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-white mb-3 font-arabic">
                      <FileQuestionMark className="text-sec" size={18} />

                      {t("analyticsSection.typeDistribution")}
                    </h3>
                    <div
                      dir={"ltr"}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {Object.entries(calculateQuestionTypeDistribution()).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge className={getQuestionTypeColor(type)}>
                                {type.replace("_", " ")}
                              </Badge>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {count}
                              </span>
                            </div>
                            <Progress
                              value={(count / totalQuestions) * 100}
                              className="h-2 bg-gray-200 dark:bg-gray-700"
                            />
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-arabic">
                              {((count / totalQuestions) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Performance */}
                <div>
                  <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-white mb-3 font-arabic">
                    <Landmark className="text-sec" size={18} />
                    {t("analyticsSection.bankPerformance")}
                  </h3>
                  <div className="space-y-4">
                    {course.courseBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className="border border-border-border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookKey className="h-4 w-4 text-sec" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {bank.code}
                            </span>
                            {!bank.isActive && (
                              <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-xs font-arabic">
                                {t("courseInfo.inactive")}
                              </Badge>
                            )}
                          </div>
                          <Badge className="border border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                            {bank.questionsCount} {t("banksSection.questions")}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-arabic">
                              {t("banksSection.chapters")}: {bank.chaptersCount}
                            </span>
                            <span className="font-arabic">
                              {(
                                (bank.questionsCount /
                                  Math.max(totalQuestions, 1)) *
                                100
                              ).toFixed(1)}{" "}
                              {t("analyticsSection.percentageOfTotal")}
                            </span>
                          </div>
                          <Progress
                            value={
                              (bank.questionsCount /
                                Math.max(totalQuestions, 1)) *
                              100
                            }
                            className="h-2 bg-gray-200 dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Bank Dialog */}
      <Dialog
        open={isEditBankDialogOpen}
        onOpenChange={setIsEditBankDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
        >
          <DialogHeader className="rtl:text-right ltr:text-left">
            <DialogTitle className="text-prim dark:text-white font-arabic">
              {t("editBankDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 font-arabic">
              <TextMuted>
                {t("editBankDialog.description", {
                  code: selectedBank?.code || "",
                })}
              </TextMuted>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white font-arabic">
                  {t("editBankDialog.bankStatus")}
                </Label>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                  {editBankForm.isActive
                    ? t("editBankDialog.bankActive")
                    : t("editBankDialog.bankInactive")}
                </div>
              </div>
              <Switch
                dir="ltr"
                checked={editBankForm.isActive}
                onCheckedChange={(checked) =>
                  setEditBankForm({ ...editBankForm, isActive: checked })
                }
                className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditBankDialogOpen(false)}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover font-arabic"
            >
              {t("editBankDialog.cancel")}
            </Button>
            <Button
              onClick={handleUpdateBank}
              className="bg-btn hover:opacity-80 text-white font-arabic"
            >
              <Save />
              {t("editBankDialog.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteBankDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        t={t}
      />
      {/* <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-rose-300 dark:border-rose-700"
        >
          <DialogHeader>
            <DialogTitle className="text-start text-gray-900 dark:text-white font-arabic">
              {t("deleteBankDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-start text-gray-600 dark:text-gray-400 font-arabic">
              {t("deleteBankDialog.description", {
                code: selectedBank?.code || "",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
            <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <p className="text-sm text-rose-700 dark:text-rose-300 font-arabic">
              {t("deleteBankDialog.warning", {
                count: selectedBank?.questionsCount || 0,
              })}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 close-hover font-arabic"
            >
              {t("deleteBankDialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white font-arabic"
            >
              {t("deleteBankDialog.deleteBank")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
