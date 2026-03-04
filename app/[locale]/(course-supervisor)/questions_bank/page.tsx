"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  getCourses,
  createPrivateCourse,
  updatePrivateCourse,
  deletePrivateCourse,
} from "@/store/supervisor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  BookOpen,
  Lock,
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Building,
  Loader2,
  X,
  FileText,
  Hash,
  Save,
  Power,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import MainTitle from "@/components/custom/texts/MainTitle";
import TextMuted from "@/components/custom/texts/TextMuted";
import Background from "@/components/custom/Background";
import { useParams } from "next/navigation";

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
  supervisor: string | null;
  program: string;
  university: string;
}

export default function CoursesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useParams();
  const courses = useSelector(
    (state: RootState) => state.supervisor.courses || [],
  );
  const t = useTranslations("questionbank");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterVisibility, setFilterVisibility] = useState<
    "all" | "private" | "public"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "banks">("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true); // Changed from false to true
  const [isLoading, setIsLoading] = useState(true); // Changed from false to true
  const [newCourse, setNewCourse] = useState({
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
  });
  const [editCourse, setEditCourse] = useState({
    id: 0,
    nameAr: "",
    nameEn: "",
    code: "",
    descriptionAr: "",
    descriptionEn: "",
    isActive: false,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setIsLoading(true);
      try {
        await dispatch(getCourses());
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("فشل في تحميل المقررات");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [dispatch]);

  const filteredCourses = courses
    ?.filter((course) => {
      const matchesSearch =
        course.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.program?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && course.isActive) ||
        (filterStatus === "inactive" && !course.isActive);

      const matchesVisibility =
        filterVisibility === "all" ||
        (filterVisibility === "private" && course.isPrivate) ||
        (filterVisibility === "public" && !course.isPrivate);

      return matchesSearch && matchesStatus && matchesVisibility;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.nameAr.localeCompare(b.nameAr);
        case "code":
          return a.code.localeCompare(b.code);
        case "banks":
          return b.courseBanksCount - a.courseBanksCount;
        default:
          return 0;
      }
    });

  const handleAddCourse = async () => {
    setLoading(true);
    try {
      await dispatch(createPrivateCourse(newCourse));
      await dispatch(getCourses());
      setIsAddDialogOpen(false);
      setNewCourse({
        nameAr: "",
        nameEn: "",
        code: "",
        descriptionAr: "",
        descriptionEn: "",
      });
      toast.success("تم إضافة المقرر بنجاح");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "فشل في إضافة المقرر",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditCourse({
      id: course.id,
      nameAr: course.nameAr,
      nameEn: course.nameEn,
      code: course.code,
      descriptionAr: course.descriptionAr,
      descriptionEn: course.descriptionEn,
      isActive: course.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await dispatch(
        deletePrivateCourse(selectedCourse!.id),
      ).unwrap();
      toast.success(res.message);
      await dispatch(getCourses());
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل في حذف المقرر");
    } finally {
      setLoading(false);
    }
  };

  // Show spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary dark:text-gray-300 font-arabic text-lg">
            جاري تحميل المقررات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Background>
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <MainTitle>{t("title")}</MainTitle>
                <TextMuted>{t("description")}</TextMuted>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-btn hover:opacity-80 text-text-light font-arabic"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 ml-2" />
                )}
                {t("addNewCourse")}
              </Button>
            </div>
          </Background>
        </div>

        {/* Stats Summary */}

        <div className="w-full mb-8">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y divide-border-light dark:divide-gray-700 md:divide-y-0 md:divide-x">
              {/* Total Courses */}
              <div className="p-6 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                  <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("totalCourses")}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {courses.length}
                  </h3>
                  <BookOpen className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>

              {/* Active Courses */}
              <div className="p-6 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("activeCourses")}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {courses.filter((c) => c.isActive).length}
                  </h3>
                  <Eye className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>

              {/* Public Courses */}
              <div className="p-6 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                  <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("publicCourses")}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {courses.filter((c) => !c.isPrivate).length}
                  </h3>
                  <Globe className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>

              {/* Total Banks */}
              <div className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                  <span className="text-md font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("totalBanks")}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {courses.reduce((sum, c) => sum + c.courseBanksCount, 0)}
                  </h3>
                  <BookMarked className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Filters and Search */}
        <Background>
          <div className="w-full flex items-center flex-col lg:flex-row gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary/60 dark:text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchPlaceHolder")}
                className="pr-10 bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 font-arabic dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center justify-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary/60 dark:text-gray-400" />
                <Tabs
                  value={filterStatus}
                  onValueChange={(value: string) => {
                    setFilterStatus(value as "all" | "active" | "inactive");
                  }}
                >
                  <TabsList className="bg-bg dark:bg-gray-800">
                    <TabsTrigger
                      value="all"
                      className={`font-arabic  data-[state=active]:text-white data-[state=active]:bg-sec  dark:text-gray-300 `}
                    >
                      {t("all")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="active"
                      className={`font-arabic  data-[state=active]:text-white data-[state=active]:bg-sec  dark:text-gray-300 `}
                    >
                      {t("active")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="inactive"
                      className={`font-arabic  data-[state=active]:text-white data-[state=active]:bg-sec  dark:text-gray-300 `}
                    >
                      {t("inactive")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-2">
                <Select
                  value={filterVisibility}
                  onValueChange={(v: "all" | "private" | "public") =>
                    setFilterVisibility(v)
                  }
                >
                  <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 font-arabic dark:text-white ">
                    <SelectValue placeholder="الرؤية" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700">
                    <SelectItem
                      value="all"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("allTypes")}
                    </SelectItem>
                    <SelectItem
                      value="private"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("privateOnly")}
                    </SelectItem>
                    <SelectItem
                      value="public"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("PublicOnly")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(v: "name" | "code" | "banks") => setSortBy(v)}
                >
                  <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border border-border-light dark:border-gray-700 font-arabic dark:text-white">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-border-light dark:border-gray-700">
                    <SelectItem
                      value="name"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("name")}
                    </SelectItem>
                    <SelectItem
                      value="code"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("code")}
                    </SelectItem>
                    <SelectItem
                      value="banks"
                      className="font-arabic dark:text-gray-300 "
                    >
                      {t("numberOfBanks")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Background>
        {/* Courses Grid - Show spinner if loading, show no courses only after loading is complete */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-prim mx-auto mb-4" />
              <p className="text-prim dark:text-gray-300 font-arabic">
                جاري تحميل المقررات...
              </p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border-light-light dark:border-gray-700 rounded-xl bg-card-bg dark:bg-gray-800">
            <BookOpen className="h-16 w-16 text-text-secondary/60 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2 font-arabic">
              {t("noCourses")}
            </h3>
            <p className="text-text-secondary dark:text-gray-400 mb-6 font-arabic">
              {searchTerm
                ? "حاول تعديل معايير البحث الخاصة بك"
                : "لا توجد مقررات متاحة بعد"}
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-dark dark:bg-blue-700 dark:hover:bg-blue-800 text-text-light font-arabic"
              disabled={loading}
            >
              <Plus className="h-4 w-4 ml-2" />
              {t("addNewCourse")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden"
              >
                {/* Decorative Top Border (Optional visual flair) */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    course.isActive
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                  }`}
                />

                <CardHeader className="pb-4 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Title Section */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white font-arabic leading-tight">
                        {locale == "ar" ? course.nameAr : course.nameEn}
                      </CardTitle>
                      <CardDescription className="italic text-sm text-gray-500 dark:text-gray-400 font-arabic truncate">
                        {locale == "ar" ? course.nameEn : course.nameAr}
                      </CardDescription>
                    </div>

                    {/* Status & Type Badges */}
                    <div className="flex gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`gap-1 px-2.5 py-1 rounded-md text-xs font-semibold font-arabic border-0 ${
                          course.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {course.isActive ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {course.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`gap-1 px-2.5 py-1 rounded-md text-xs font-semibold font-arabic border-0 ${
                          course.isPrivate
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {course.isPrivate ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        {course.isPrivate ? "خاص" : "عام"}
                      </Badge>
                    </div>
                  </div>

                  {/* Code & Stats Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {/* Code Pill */}
                    <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      <code className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                        {course.code}
                      </code>
                    </div>

                    {/* Banks Count */}
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-md flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {course.courseBanksCount} {t("banks")}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 px-6 pb-4 space-y-4">
                  {/* Program & University Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                      <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                        <GraduationCap className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                          البرنامج
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {course.program}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                      <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                        <Building className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                          الجامعة
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {course.university}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-arabic">
                      {course.descriptionAr ||
                        course.descriptionEn ||
                        t("noDescription")}
                    </p>
                  </div>
                </CardContent>

                {/* Action Bar Footer */}
                <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 mt-auto">
                  <div className="flex items-center justify-between w-full gap-2">
                    {/* Primary Action: View Details */}
                    <Link
                      href={`questions_bank/${course.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="none"
                        className="w-full h-10 gap-2 hover:gap-5 rounded-xl border-1 bg-sec hover:bg-transparent hover:border-sec hover:text-sec text-white shadow-sm transition-all"
                      >
                        {/* <Eye className="h-4 w-4" /> */}
                        {locale == "en" && <ArrowRight />}
                        <span className="">{t("viewDetails")}</span>
                        {locale == "ar" && <ArrowLeft />}
                      </Button>
                    </Link>

                    {/* Secondary Actions: Edit & Delete (Icon Buttons) */}
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!course.isPrivate || loading}
                        onClick={() => handleEditCourse(course)}
                        className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title={t("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!course.isPrivate || loading}
                        onClick={() => handleDeleteCourse(course)}
                        className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredCourses.length > 0 && (
          <div className="mt-8 text-center text-sm text-prim dark:text-gray-400 font-arabic">
            {t("showing")} {filteredCourses.length} {t("of")} {courses.length}{" "}
            {t("courses")}
          </div>
        )}
      </div>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700">
          <DialogHeader className="flex flex-col space-y-2">
            <DialogTitle className="text-dark dark:text-white font-arabic flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {t("addNewCourse")}
            </DialogTitle>
            <DialogDescription className="text-text-secondary dark:text-gray-300 font-arabic">
              <TextMuted>{t("addCourseDescription")}</TextMuted>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="newNameAr"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseARName")}
                </Label>
                <Input
                  id="newNameAr"
                  value={newCourse.nameAr}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, nameAr: e.target.value })
                  }
                  placeholder={t("addCourseARName")}
                  className="font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="newNameEn"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseENName")}
                </Label>
                <Input
                  id="newNameEn"
                  value={newCourse.nameEn}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, nameEn: e.target.value })
                  }
                  placeholder={t("addCourseENName")}
                  className="border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newCode"
                className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addCourseCode")}
              </Label>
              <Input
                id="newCode"
                value={newCourse.code}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, code: e.target.value })
                }
                placeholder={t("addCourseCode")}
                className="font-mono border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="newDescAr"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseARDescription")}
                </Label>
                <Textarea
                  id="newDescAr"
                  value={newCourse.descriptionAr}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      descriptionAr: e.target.value,
                    })
                  }
                  placeholder={t("addCourseARDescription")}
                  className="min-h-20 font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="newDescEn"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseENDescription")}
                </Label>
                <Textarea
                  id="newDescEn"
                  value={newCourse.descriptionEn}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      descriptionEn: e.target.value,
                    })
                  }
                  placeholder={t("addCourseENDescription")}
                  className="min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-border-light dark:border-gray-700 text-dark dark:text-gray-300 close-hover font-arabic"
              disabled={loading}
            >
              <X className="h-4 w-4 ml-2" />
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddCourse}
              disabled={
                !newCourse.nameAr.trim() ||
                !newCourse.nameEn.trim() ||
                !newCourse.code.trim() ||
                loading
              }
              className="bg-btn hover:opacity-80 text-white font-arabic"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-2" />
                  {t("addCourse")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card-bg dark:bg-gray-800 border border-border-light dark:border-gray-700">
          <DialogHeader className="flex flex-col space-y-2">
            <DialogTitle className="text-dark dark:text-white font-arabic flex items-center gap-3">
              <div className="p-2 rounded-lg bg-btn">
                <Edit className="h-5 w-5 text-white" />
              </div>
              {t("editCourse")}
            </DialogTitle>
            <DialogDescription>
              <TextMuted>{t("editCourseDescription")}</TextMuted>
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="editNameAr"
                    className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("addCourseARName")}
                  </Label>
                  <Input
                    id="editNameAr"
                    value={editCourse.nameAr}
                    onChange={(e) =>
                      setEditCourse({ ...editCourse, nameAr: e.target.value })
                    }
                    className="font-arabic text-right border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editNameEn"
                    className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("addCourseENName")}
                  </Label>
                  <Input
                    id="editNameEn"
                    value={editCourse.nameEn}
                    onChange={(e) =>
                      setEditCourse({ ...editCourse, nameEn: e.target.value })
                    }
                    className="border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editCode"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addCourseCode")}
                </Label>
                <Input
                  id="editCode"
                  value={editCourse.code}
                  onChange={(e) =>
                    setEditCourse({ ...editCourse, code: e.target.value })
                  }
                  className="font-mono border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="editDescAr"
                    className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("addCourseARDescription")}
                  </Label>
                  <Textarea
                    id="editDescAr"
                    value={editCourse.descriptionAr}
                    onChange={(e) =>
                      setEditCourse({
                        ...editCourse,
                        descriptionAr: e.target.value,
                      })
                    }
                    className="font-arabic text-right min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editDescEn"
                    className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("addCourseENDescription")}
                  </Label>
                  <Textarea
                    id="editDescEn"
                    value={editCourse.descriptionEn || ""}
                    onChange={(e) =>
                      setEditCourse({
                        ...editCourse,
                        descriptionEn: e.target.value,
                      })
                    }
                    className="min-h-20 border border-border-light dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="course-status-switch"
                  className="text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
                >
                  <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("courseStatus")}
                </Label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-alt dark:bg-gray-700/50 border border-border-light dark:border-gray-700">
                  <Switch
                    id="course-status-switch"
                    checked={editCourse.isActive}
                    onCheckedChange={(checked) =>
                      setEditCourse({ ...editCourse, isActive: checked })
                    }
                    className="data-[state=checked]:bg-success data-[state=unchecked]:bg-border-light dark:data-[state=checked]:bg-green-700 dark:data-[state=unchecked]:bg-gray-600"
                    dir="ltr"
                    disabled={loading}
                  />
                  <span className="font-medium dark:text-gray-300">
                    {editCourse.isActive ? t("active") : t("inactive")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-border-light dark:border-gray-700 text-dark dark:text-gray-300 close-hover font-arabic"
              disabled={loading}
            >
              <X className="h-4 w-4 ml-2" />
              {t("cancel")}
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await dispatch(updatePrivateCourse(editCourse));
                  await dispatch(getCourses());
                  setIsEditDialogOpen(false);
                  toast.success("تم تحديث المقرر بنجاح");
                } catch (error: unknown) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "فشل في تحديث المقرر",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              disabled={
                !editCourse.nameAr.trim() ||
                !editCourse.nameEn.trim() ||
                !editCourse.code.trim() ||
                loading
              }
              className="bg-btn hover:opacity-80 text-white font-arabic"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card-bg dark:bg-gray-800 border border-error dark:border-red-700">
          <DialogHeader>
            <DialogTitle className="text-dark dark:text-white font-arabic">
              {t("deleteCourse")}
            </DialogTitle>
            <DialogDescription className="text-text-secondary dark:text-gray-300 font-arabic">
              {t("deleteConfirmation", { name: selectedCourse?.nameAr || "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-error/10 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="h-4 w-4 text-error dark:text-red-400" />
            <p className="text-sm text-error dark:text-red-400 font-arabic">
              {t("deleteWarning", {
                count: selectedCourse?.courseBanksCount || 0,
              })}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border-light dark:border-gray-700 text-dark dark:text-gray-300 hover:bg-bg dark:hover:bg-gray-700 font-arabic"
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-error hover:bg-error/80 dark:bg-red-700 dark:hover:bg-red-800 text-text-light font-arabic"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                t("deleteCourse")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
