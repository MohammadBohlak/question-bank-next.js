"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getCourses } from "@/store/supervisor";
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
  Search,
  Filter,
  BookOpen,
  Lock,
  Globe,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Building,
  Loader2,
  Hash,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Book,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";
import { useParams } from "next/navigation";
import StatsCourses from "@/components/custom/supervisorPagesComponents/stats/StatsCourses";
import CustomSelect from "@/components/custom/common/CustomSelect";
import AddCourseDialogQB from "@/components/custom/supervisorPagesComponents/dialogs/courseDialogs/AddCourseDialogQB";
import EditCourseDialogQB from "@/components/custom/supervisorPagesComponents/dialogs/courseDialogs/EditCourseDialogQB";
import DeleteCourseDialogQB from "@/components/custom/supervisorPagesComponents/dialogs/courseDialogs/DeleteCourseDialogQB";
import StatusBadge from "@/components/custom/common/badges/StatusBadge";

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

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditCourse({ ...course });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
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
          <Background isHeader>
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <MainTitle className="flex items-center gap-3">
                  <div className="p-2 bg-btn rounded-lg">
                    <Book className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {t("title")}
                </MainTitle>
                <TextMuted className="mt-1">{t("description")}</TextMuted>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-btn hover:opacity-80 text-text-light font-arabic gap-1"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {t("addNewCourse")}
              </Button>
            </div>
          </Background>
        </div>

        <StatsCourses />
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
                <CustomSelect
                  value={filterVisibility}
                  onChange={(v) => setFilterVisibility((v = "all"))}
                  options={[
                    { value: "all", label: t("allTypes") },
                    { value: "private", label: t("privateOnly") },
                    { value: "public", label: t("PublicOnly") },
                  ]}
                />

                <CustomSelect
                  value={sortBy}
                  onChange={(v) => setSortBy(v as "name" | "code" | "banks")}
                  options={[
                    { value: "name", label: t("name") },
                    { value: "code", label: t("code") },
                    { value: "banks", label: t("numberOfBanks") },
                  ]}
                  placeholder="ترتيب حسب"
                />
              </div>
            </div>
          </div>
        </Background>

        {/* Results Count */}
        {!loading && filteredCourses.length > 0 && (
          <div className="my-8 text-start text-lg text-prim dark:text-gray-400 font-arabic">
            {t("showing")} {filteredCourses.length} {t("of")} {courses.length}{" "}
            {t("courses")}
          </div>
        )}
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
            <BookOpen className="h-16 w-16 text-sec dark:text-gray-600 mx-auto mb-4" />
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
              className="gap-1 bg-prim hover:bg-dark dark:bg-blue-700 dark:hover:bg-blue-800 text-text-light font-arabic"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              {t("addNewCourse")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                dir={locale == "ar" ? "rtl" : "ltr"}
                key={course.id}
                className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden"
              >
                {/* Decorative Top Border (Optional visual flair) */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    course.isActive
                      ? "bg-gradient-to-r from-green-200 to-emerald-400"
                      : "bg-gradient-to-r from-red-200 to-red-400"
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
                      <StatusBadge isActive={course.isActive} />
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
      </div>

      <AddCourseDialogQB
        t={t}
        open={isAddDialogOpen}
        setOpen={setIsAddDialogOpen}
      />

      <EditCourseDialogQB
        t={t}
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        selectedCourse={selectedCourse}
      />
      <DeleteCourseDialogQB
        t={t}
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />
    </div>
  );
}
