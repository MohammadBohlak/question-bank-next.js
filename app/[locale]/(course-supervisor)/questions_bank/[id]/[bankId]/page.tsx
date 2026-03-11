"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useParams } from "next/navigation";
import QuestionEditDialog from "@/components/EditQuestion";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Plus,
  Search,
  BookOpen,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Layers,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronsRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart,
  FolderTree,
  PenLine,
  EyeOff,
  Save,
  Hash,
  BookText,
  FolderPlus,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { getCourseBankDetails } from "@/store/supervisor";
import { RootState, AppDispatch } from "@/store/store";
import { createChapter, updateChapter, deleteChapter } from "@/store/chapter";
import { deleteQuestion } from "@/store/question";
import AddQuestion from "@/components/AddQuestion";
import { useTranslations } from "next-intl";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import Background from "@/components/custom/common/Background";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import StatsBank from "@/components/custom/supervisorPagesComponents/stats/StatsBank";

interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
  createdAt: string;
}

interface QuestionType {
  id: number;
  name: string;
  code: string;
  hasOptions: boolean;
  hasCorrectAnswer: boolean;
  allowMultipleAnswers: boolean;
  isAutoCorrect: boolean;
}

interface Chapter {
  id: number;
  courseBankId: number;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  questionsLevels: Array<{ id: number; title: string; count: number }>;
  questionsTypes: Array<{ id: number; title: string; count: number }>;
}

interface Question {
  id: number;
  chapterId: number;
  questionTypeId: number;
  questionText: string;
  notes: string;
  timeLimit: number | null;
  wordsLimit: number;
  isActive: boolean;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  courseId: number;
  course: string;
  difficultyLevel: number;
  confirmed: boolean;
  chapter: {
    id: number;
    courseBankId: number;
    title: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  };
  questionOptions: QuestionOption[];
  questionType: QuestionType;
}

export default function BankDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("bankDetails");
  const { bankId } = useParams<{ bankId: string }>();

  const bank = useSelector(
    (state: RootState) => state.supervisor.courseBankDetails,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddChapterDialogOpen, setIsAddChapterDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chapters");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [chapterSearch, setChapterSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const { locale } = useParams();
  const [dir, setDir] = useState("rtl");

  useEffect(() => {
    if (dir == "ar") setDir("rtl");
    else setDir("lrt");
  }, [locale]);
  // Chapter management states
  const [isEditChapterDialogOpen, setIsEditChapterDialogOpen] = useState(false);
  const [isDeleteChapterDialogOpen, setIsDeleteChapterDialogOpen] =
    useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editChapterForm, setEditChapterForm] = useState({
    id: 0,
    title: "",
    description: "",
    order: 0,
    courseBankId: 0,
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [newChapter, setNewChapter] = useState({
    title: "",
    description: "",
    order: bank?.chapters?.length ? bank.chapters.length + 1 : 1,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(20);

  const fetchBankDetails = useCallback(async () => {
    setActionLoading("fetch");
    try {
      await dispatch(getCourseBankDetails(parseInt(bankId))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadBankFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  }, [bankId, dispatch, t]);

  useEffect(() => {
    fetchBankDetails();
  }, [, fetchBankDetails]);

  const getDifficultyLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return {
          label: t("stats.easy"),
          color:
            "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
          icon: CheckCircle2,
          bg: "from-emerald-500/10 to-emerald-500/5",
        };
      case 2:
        return {
          label: t("stats.medium"),
          color:
            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
          icon: BarChart,
          bg: "from-blue-500/10 to-blue-500/5",
        };
      case 3:
        return {
          label: t("stats.hard"),
          color:
            "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
          icon: AlertTriangle,
          bg: "from-amber-500/10 to-amber-500/5",
        };
      default:
        return {
          label: t("questionTypes.unknown"),
          color:
            "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border border-border-light dark:border-gray-800",
          icon: HelpCircle,
          bg: "from-gray-500/10 to-gray-500/5",
        };
    }
  };

  const getQuestionTypeColor = (code: string) => {
    switch (code.toLowerCase()) {
      case "true_false":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      case "multiple_choice":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      case "essay":
        return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
      case "multiple_response":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border border-border-light dark:border-gray-800";
    }
  };

  const getQuestionTypeIcon = (code: string) => {
    switch (code.toLowerCase()) {
      case "true_false":
        return CheckCircle2;
      case "multiple_choice":
        return HelpCircle;
      case "essay":
        return PenLine;
      case "multiple_response":
        return Layers;
      default:
        return FileText;
    }
  };

  const getQuestionTypeDisplayName = (code: string) => {
    switch (code) {
      case "true_false":
        return t("questionTypes.true_false");
      case "multiple_choice":
        return t("questionTypes.multiple_choice");
      case "multiple_response":
        return t("questionTypes.multiple_response");
      case "essay":
        return t("questionTypes.essay");
      default:
        return code;
    }
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const handleAddChapter = async () => {
    if (!bank?.id) {
      toast.error(t("errors.bankNotFound"));
      return;
    }

    setActionLoading("addChapter");
    const newChapterObj = {
      courseBankId: bank.id,
      title: newChapter.title,
      description: newChapter.description,
      order: newChapter.order,
    };

    try {
      const res = await dispatch(createChapter(newChapterObj)).unwrap();
      await fetchBankDetails();
      setIsAddChapterDialogOpen(false);
      setNewChapter({
        title: "",
        description: "",
        order: (bank.chapters?.length || 0) + 1,
      });
      toast.success(res.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.createChapterFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setEditChapterForm({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description || "",
      order: chapter.order,
      courseBankId: chapter.courseBankId,
    });
    setIsEditChapterDialogOpen(true);
  };

  const handleUpdateChapter = async () => {
    if (!selectedChapter) {
      toast.error(t("errors.missingData"));
      return;
    }

    setActionLoading("updateChapter");
    try {
      const res = await dispatch(updateChapter(editChapterForm)).unwrap();
      await fetchBankDetails();
      setIsEditChapterDialogOpen(false);
      setSelectedChapter(null);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.errors);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.updateChapterFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteChapter = async () => {
    if (!selectedChapter) {
      toast.error(t("errors.missingData"));
      return;
    }

    setActionLoading("deleteChapter");
    try {
      const res = await dispatch(deleteChapter(selectedChapter.id)).unwrap();
      await fetchBankDetails();
      setIsDeleteChapterDialogOpen(false);
      setSelectedChapter(null);
      toast.success(res.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.deleteChapterFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setActionLoading(`deleteQuestion-${questionId}`);
    try {
      const res = await dispatch(deleteQuestion(questionId)).unwrap();
      await fetchBankDetails();
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }
      toast.success(res.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.deleteQuestionFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSuccess = () => {
    fetchBankDetails();
  };

  const filteredChapters =
    bank?.chapters?.filter(
      (chapter) =>
        chapter.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
        (chapter.description &&
          chapter.description
            .toLowerCase()
            .includes(chapterSearch.toLowerCase())),
    ) || [];

  // Get all questions and filter them
  const allQuestions =
    bank?.chapters?.flatMap((chapter) =>
      chapter.questions.map((question) => ({
        ...question,
        chapterTitle: chapter.title,
        chapterOrder: chapter.order,
      })),
    ) || [];

  const filteredQuestions = allQuestions.filter(
    (question) =>
      question.questionText
        .toLowerCase()
        .includes(questionSearch.toLowerCase()) ||
      (question.notes &&
        question.notes.toLowerCase().includes(questionSearch.toLowerCase())) ||
      question.chapterTitle
        .toLowerCase()
        .includes(questionSearch.toLowerCase()),
  );

  // Calculate pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion,
  );
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of questions list
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  const calculateQuestionStats = () => {
    const stats = {
      total: bank?.questionsCount || 0,
      confirmed: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      distinguish: 0,
    };

    bank?.chapters?.forEach((chapter) => {
      chapter.questions.forEach((question) => {
        if (question.confirmed) stats.confirmed++;
        const difficulty = getDifficultyLevelInfo(question.difficultyLevel);
        if (difficulty.label === t("stats.easy")) stats.easy++;
        if (difficulty.label === t("stats.medium")) stats.medium++;
        if (difficulty.label === t("stats.hard")) stats.hard++;
      });
    });

    return stats;
  };

  const stats = calculateQuestionStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Reset pagination when search changes or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [questionSearch, activeTab]);

  if (actionLoading === "fetch" && !bank) {
    return (
      <div
        className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400 relative" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t("loadingBank")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background " dir="rtl">
      {/* Header with linear */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Background isHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="rounded-xl border border-border-light dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <MainTitle>{bank?.code}</MainTitle>
                    <Badge
                      className={
                        bank?.isActive
                          ? "bg-linear-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-100 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-linear-to-r from-gray-500/10 to-gray-600/10 text-gray-100 dark:text-gray-300 border-border-light dark:border-gray-700"
                      }
                    >
                      {bank?.isActive ? t("stats.active") : t("stats.inactive")}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    {bank?.course} •{" "}
                    <span className="text-gray-400">
                      {t("bankInfo.courseId")}: {bank?.id}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Background>

          <StatsBank bank={bank} stats={stats} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-1 border border-border-light dark:border-gray-700 inline-flex">
            <button
              onClick={() => setActiveTab("chapters")}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "chapters"
                  ? "bg-sec text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:text-sec"
              }`}
            >
              <FolderTree className="h-4 w-4" />
              {t("tabs.chapters")}
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "questions"
                  ? "bg-sec text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:text-sec"
              }`}
            >
              <FileText className="h-4 w-4" />
              {t("tabs.questions")}
            </button>
          </div>
        </div>

        {activeTab === "chapters" ? (
          <div className="space-y-6">
            {/* Header with Search and Add Button */}
            <Background className="w-full">
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full relative flex-1 max-w-md">
                  <Search className="absolute z-1 right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t("chaptersTab.searchPlaceholder")}
                    className="pr-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border-light dark:border-gray-700 transition-all rounded-xl "
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setIsAddChapterDialogOpen(true)}
                  className="bg-btn hover:opacity-80 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-6"
                  disabled={actionLoading === "addChapter"}
                >
                  {actionLoading === "addChapter" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {t("chaptersTab.addChapter")}
                </Button>
              </div>
            </Background>

            {/* Chapters List */}
            <div className="space-y-4">
              {filteredChapters.length > 0 ? (
                filteredChapters.map((chapter) => {
                  return (
                    <div
                      key={chapter.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border
                                             border-border-light dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      {/* linear Border on Hover */}
                      {/* <div className="absolute inset-0 bg-linear-to-r from-sec/5 to-sec/10 opacity-0 group-hover:opacity-80 transition-opacity"></div> */}

                      <div className="relative p-6 hover:bg-prim/10 dark:hover:bg-sec/10 transition-colors duration-300">
                        {/* Header */}
                        <div
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-2 bg-sec rounded-xl">
                              <BookOpen className="h-6 w-6  text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {chapter.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                  {t("chaptersTab.order")} {chapter.order}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                                {chapter.description ||
                                  t("chaptersTab.noDescription")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-blue-900/20 rounded-xl">
                              <FileText
                                className="h-4 w-4 text-sec"
                                strokeWidth={2.2}
                              />
                              <span className=" text-sec font-bold">
                                {chapter.questions.length}
                              </span>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="transition-colors duration-300 h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditChapter(chapter);
                                }}
                                disabled={actionLoading === "updateChapter"}
                              >
                                {actionLoading === "updateChapter" &&
                                selectedChapter?.id === chapter.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Edit className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="transition-colors duration-300 h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedChapter(chapter);
                                  setIsDeleteChapterDialogOpen(true);
                                }}
                                disabled={actionLoading === "deleteChapter"}
                              >
                                {actionLoading === "deleteChapter" &&
                                selectedChapter?.id === chapter.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>

                            {expandedChapter === chapter.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedChapter === chapter.id && (
                          <div className="mt-6 pt-6 border-t border-border-light dark:border-gray-700">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  {t("chaptersTab.createdDate")}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(chapter.createdAt)}
                                </div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  {t("chaptersTab.updatedDate")}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(chapter.updatedAt)}
                                </div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  {t("chaptersTab.order")}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {chapter.order}
                                </div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  {t("chaptersTab.chapterId")}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {chapter.id}
                                </div>
                              </div>
                            </div>

                            {/* Question Levels */}
                            {chapter.questionsLevels.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                  <BarChart
                                    className="h-4 w-4 text-sec"
                                    strokeWidth={2.5}
                                  />
                                  {t("chaptersTab.questionLevels")}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {chapter.questionsLevels.map((level) => {
                                    const info = getDifficultyLevelInfo(
                                      level.id,
                                    );
                                    const Icon = info.icon;
                                    return (
                                      <Badge
                                        key={level.id}
                                        className={`${info.color} px-3 py-1.5 flex items-center gap-2`}
                                      >
                                        <Icon className="h-3 w-3" />
                                        {level.title} ({level.count})
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Question Types */}
                            {chapter.questionsTypes.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                  <Layers
                                    className="h-4 w-4 text-sec"
                                    strokeWidth={2.5}
                                  />
                                  {t("chaptersTab.questionTypes")}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {chapter.questionsTypes.map((type) => {
                                    const TypeIcon = getQuestionTypeIcon(
                                      type.title,
                                    );
                                    return (
                                      <Badge
                                        key={type.id}
                                        className={`${getQuestionTypeColor(type.title)} px-3 py-1.5 flex items-center gap-2`}
                                      >
                                        <TypeIcon className="h-3 w-3" />
                                        {type.title.replace("_", " ")} (
                                        {type.count})
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Questions in this chapter */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <FileText
                                    className="h-4 w-4 text-sec"
                                    strokeWidth={2.5}
                                  />
                                  {t("chaptersTab.chapterQuestions")}
                                </h4>
                                <AddQuestion
                                  chapterId={chapter.id}
                                  chapterName={chapter.title}
                                />
                              </div>

                              <div className="space-y-3">
                                {chapter.questions.map((question) => {
                                  const TypeIcon = getQuestionTypeIcon(
                                    question.questionType.code,
                                  );
                                  const difficultyInfo = getDifficultyLevelInfo(
                                    question.difficultyLevel,
                                  );
                                  const DifficultyIcon = difficultyInfo.icon;

                                  return (
                                    <div
                                      key={question.id}
                                      className="group relative overflow-hidden rounded-xl bg-linear-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 border border-border-light dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                                    >
                                      <div className="absolute right-0 top-0 w-1 h-full bg-linear-to-b from-prim to-sec"></div>

                                      <div className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge
                                                className={`${getQuestionTypeColor(question.questionType.code)} px-2 py-1 font-bold flex items-center gap-1`}
                                              >
                                                <TypeIcon
                                                  strokeWidth={2.2}
                                                  className="h-3 w-3"
                                                />
                                                {getQuestionTypeDisplayName(
                                                  question.questionType.code,
                                                )}
                                              </Badge>
                                              <Badge
                                                className={`${difficultyInfo.color} px-2 py-1 font-bold flex items-center gap-1`}
                                              >
                                                <DifficultyIcon
                                                  strokeWidth={2.2}
                                                  className="h-3 w-3"
                                                />
                                                {difficultyInfo.label}
                                              </Badge>
                                              {!question.confirmed && (
                                                <Badge
                                                  variant="outline"
                                                  className="border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300"
                                                >
                                                  <EyeOff
                                                    strokeWidth={2.2}
                                                    className="h-3 w-3 ml-1"
                                                  />
                                                  {t("chaptersTab.unconfirmed")}
                                                </Badge>
                                              )}
                                            </div>

                                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                                              {question.questionText}
                                            </p>

                                            {question.notes && (
                                              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <span>{question.notes}</span>
                                              </div>
                                            )}

                                            {question.questionOptions.length >
                                              0 && (
                                              <div className="mt-3 space-y-2">
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                  {t("chaptersTab.options")}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                  {[...question.questionOptions]
                                                    .sort(
                                                      (a, b) =>
                                                        a.optionOrder -
                                                        b.optionOrder,
                                                    )
                                                    .map((option) => (
                                                      <div
                                                        key={option.id}
                                                        className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                                                          option.isCorrect
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                                            : "bg-gray-50 dark:bg-gray-900/50 border border-border-light dark:border-gray-700"
                                                        }`}
                                                      >
                                                        {option.isCorrect ? (
                                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                          <XCircle className="h-4 w-4 text-gray-400" />
                                                        )}
                                                        <span
                                                          className={
                                                            option.isCorrect
                                                              ? "text-emerald-700 dark:text-emerald-300 font-medium"
                                                              : "text-gray-600 dark:text-gray-300"
                                                          }
                                                        >
                                                          {option.optionText}
                                                        </span>
                                                      </div>
                                                    ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                              onClick={() =>
                                                setEditingQuestion(question)
                                              }
                                              disabled={
                                                actionLoading ===
                                                `deleteQuestion-${question.id}`
                                              }
                                            >
                                              {actionLoading ===
                                              `deleteQuestion-${question.id}` ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                              ) : (
                                                <Edit className="h-3.5 w-3.5" />
                                              )}
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleDeleteQuestion(
                                                  question.id,
                                                )
                                              }
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                              disabled={
                                                actionLoading ===
                                                `deleteQuestion-${question.id}`
                                              }
                                            >
                                              {actionLoading ===
                                              `deleteQuestion-${question.id}` ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                              ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-border-light dark:border-gray-700">
                  <div className="p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FolderTree className="h-10 w-10 text-sec" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {chapterSearch
                      ? t("chaptersTab.noSearchResults")
                      : locale == "en"
                        ? "No Chapters"
                        : "لا يوجد فصول"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {chapterSearch
                      ? t("chaptersTab.tryAdjustingSearch")
                      : locale == "en"
                        ? "Add First Chapter"
                        : "قم بإضافة أول فصل"}
                  </p>
                  {!chapterSearch && (
                    <Button
                      onClick={() => setIsAddChapterDialogOpen(true)}
                      className="mx-auto flex items-center gap-1 bg-btn hover:opacity-80 hover:-translate-y-1  text-white shadow-xl transition-all rounded-xl px-6"
                    >
                      <Plus className="h-4 w-4" />
                      {t("chaptersTab.addChapter")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Background className="flex-col space-y-6">
              {/* Search and Filters */}
              <div className="w-full relative">
                <Search className="absolute z-1 right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("questionsTab.searchPlaceholder")}
                  className="pr-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border-light dark:border-gray-700"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                />
              </div>

              {/* Results Info */}
              <div className="w-full flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {t("questionsTab.showingQuestions", {
                    start: indexOfFirstQuestion + 1,
                    end: Math.min(
                      indexOfLastQuestion,
                      filteredQuestions.length,
                    ),
                    total: filteredQuestions.length,
                  })}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {t("questionsTab.pageInfo", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>
              </div>
            </Background>

            {/* Questions List */}
            <div className="space-y-4">
              {currentQuestions.length > 0 ? (
                currentQuestions.map((question) => {
                  const TypeIcon = getQuestionTypeIcon(
                    question.questionType.code,
                  );
                  const difficultyInfo = getDifficultyLevelInfo(
                    question.difficultyLevel,
                  );
                  const DifficultyIcon = difficultyInfo.icon;

                  return (
                    <div
                      key={question.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border-light dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute right-0 top-0 w-1 h-full bg-linear-to-b from-prim to-sec"></div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                variant="outline"
                                className="border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50"
                              >
                                {t("questionsTab.chapter", {
                                  order: question.chapterOrder,
                                  title: question.chapterTitle,
                                })}
                              </Badge>
                              <Badge
                                className={`${getQuestionTypeColor(question.questionType.code)} px-3 py-1 flex items-center gap-1`}
                              >
                                <TypeIcon className="h-3 w-3" />
                                {getQuestionTypeDisplayName(
                                  question.questionType.code,
                                )}
                              </Badge>
                              <Badge
                                className={`${difficultyInfo.color} px-3 py-1 flex items-center gap-1`}
                              >
                                <DifficultyIcon className="h-3 w-3" />
                                {difficultyInfo.label}
                              </Badge>
                              {!question.confirmed && (
                                <Badge
                                  variant="outline"
                                  className="border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                  <EyeOff className="h-3 w-3 ml-1" />
                                  {t("chaptersTab.unconfirmed")}
                                </Badge>
                              )}
                            </div>

                            <p className="font-medium text-gray-900 dark:text-white text-lg mb-3">
                              {question.questionText}
                            </p>

                            {question.notes && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl mb-4">
                                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span>{question.notes}</span>
                              </div>
                            )}

                            {question.questionOptions.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-sec" />
                                  {t("questionsTab.options")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {[...question.questionOptions]
                                    .sort(
                                      (a, b) => a.optionOrder - b.optionOrder,
                                    )
                                    .map((option) => (
                                      <div
                                        key={option.id}
                                        className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
                                          option.isCorrect
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                            : "bg-gray-50 dark:bg-gray-900/50 border border-border-light dark:border-gray-700"
                                        }`}
                                      >
                                        {option.isCorrect ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-gray-400" />
                                        )}
                                        <span
                                          className={
                                            option.isCorrect
                                              ? "text-emerald-700 dark:text-emerald-300 font-medium"
                                              : "text-gray-600 dark:text-gray-300"
                                          }
                                        >
                                          {option.optionText}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              onClick={() => setEditingQuestion(question)}
                              disabled={
                                actionLoading ===
                                `deleteQuestion-${question.id}`
                              }
                            >
                              {actionLoading ===
                              `deleteQuestion-${question.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Edit className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuestion(question.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              disabled={
                                actionLoading ===
                                `deleteQuestion-${question.id}`
                              }
                            >
                              {actionLoading ===
                              `deleteQuestion-${question.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-border-light dark:border-gray-700">
                  <div className="p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-sec" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {questionSearch
                      ? t("questionsTab.noSearchResults")
                      : t("questionsTab.noQuestions")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {questionSearch
                      ? t("questionsTab.tryAdjustingSearch")
                      : t("questionsTab.addFirstQuestion")}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border-light dark:border-gray-700">
                <div className="text-sm text-gray-100 dark:text-gray-300">
                  {t("questionsTab.questionsPerPage", {
                    count: questionsPerPage,
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300
                                         hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <ChevronsRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-border-light dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-8 w-8 p-0 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-sec text-white shadow-md"
                              : "border border-border-light dark:border-gray-700 text-gray-100 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <Button
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="h-8 w-8 p-0 border border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-border-light dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t("questionsTab.goTo")}
                  </span>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-20 text-center border-border-light dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <QuestionEditDialog
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {/* Add Chapter Dialog */}
      <Dialog
        open={isAddChapterDialogOpen}
        onOpenChange={setIsAddChapterDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[500px] bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          dir={dir}
        >
          <DialogHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-btn">
                <FolderPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("addChapterDialog.title")}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {t("addChapterDialog.description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4 px-2 ">
            <div className="space-y-2">
              <Label
                htmlFor="chapterTitle"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <BookText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addChapterDialog.chapterTitle")}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="chapterTitle"
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                placeholder={t("addChapterDialog.chapterTitlePlaceholder")}
                className=" border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white  transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="chapterDescription"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addChapterDialog.chapterDescription")}
              </Label>
              <Textarea
                id="chapterDescription"
                value={newChapter.description}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    description: e.target.value,
                  })
                }
                placeholder={t(
                  "addChapterDialog.chapterDescriptionPlaceholder",
                )}
                rows={3}
                className=" border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white  transition-all rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="chapterOrder"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {t("addChapterDialog.chapterOrder")}
              </Label>
              <Input
                id="chapterOrder"
                type="number"
                value={newChapter.order}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder={t("addChapterDialog.chapterOrderPlaceholder")}
                className=" font-mono border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white  transition-all rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 pt-6 px-6">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddChapterDialogOpen(false)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 close-hover transition-all rounded-xl px-6 font-arabic"
                disabled={actionLoading === "addChapter"}
              >
                {t("addChapterDialog.cancel")}
              </Button>
              <Button
                onClick={handleAddChapter}
                disabled={
                  !newChapter.title.trim() || actionLoading === "addChapter"
                }
                className="flex items-center gap-1 bg-linear-to-r bg-btn hover:opacity-80 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-6 font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "addChapter" ? (
                  <>
                    <Loader2 className="h-4 w-4  animate-spin" />
                    {t("addChapterDialog.creating")}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 " />
                    {t("addChapterDialog.createChapter")}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog
        open={isEditChapterDialogOpen}
        onOpenChange={setIsEditChapterDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[500px] bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-2xl shadow-2xl"
          //   dir="rtl"
        >
          <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-btn">
                <Edit2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="rtl:text-right ltr:text-left text-2xl font-bold text-gray-900 dark:text-white">
                  {t("editChapterDialog.title")}
                </DialogTitle>
                <DialogDescription className=" mt-1">
                  <TextMuted>
                    {t("editChapterDialog.description", {
                      title: selectedChapter?.title || "",
                    })}
                  </TextMuted>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedChapter && (
            <div className="space-y-6 py-4 px-2">
              <div className="space-y-3">
                <Label
                  htmlFor="editChapterTitle"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addChapterDialog.chapterTitle")}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editChapterTitle"
                  value={editChapterForm.title}
                  onChange={(e) =>
                    setEditChapterForm({
                      ...editChapterForm,
                      title: e.target.value,
                    })
                  }
                  placeholder={t("addChapterDialog.chapterTitlePlaceholder")}
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white f-input"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="editChapterDescription"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addChapterDialog.chapterDescription")}
                </Label>
                <Textarea
                  id="editChapterDescription"
                  value={editChapterForm.description || ""}
                  onChange={(e) =>
                    setEditChapterForm({
                      ...editChapterForm,
                      description: e.target.value,
                    })
                  }
                  placeholder={t(
                    "addChapterDialog.chapterDescriptionPlaceholder",
                  )}
                  rows={3}
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white  transition-all rounded-xl shadow-sm resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="editChapterOrder"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  {t("addChapterDialog.chapterOrder")}
                </Label>
                <Input
                  id="editChapterOrder"
                  type="number"
                  value={editChapterForm.order}
                  onChange={(e) =>
                    setEditChapterForm({
                      ...editChapterForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder={t("addChapterDialog.chapterOrderPlaceholder")}
                  className="font-mono border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all rounded-xl shadow-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 pt-6 px-6">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditChapterDialogOpen(false)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200   transition-all close-hover  rounded-xl px-6 font-arabic"
                disabled={actionLoading === "updateChapter"}
              >
                {t("editChapterDialog.cancel")}
              </Button>
              <Button
                onClick={handleUpdateChapter}
                disabled={
                  !editChapterForm.title.trim() ||
                  actionLoading === "updateChapter"
                }
                className="gap-2 bg-btn hover:opacity-80 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-6 font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "updateChapter" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("editChapterDialog.updating")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("editChapterDialog.updateChapter")}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Chapter Dialog */}
      <Dialog
        open={isDeleteChapterDialogOpen}
        onOpenChange={setIsDeleteChapterDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-border-light dark:border-gray-700 rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="rtl:text-right ltr:text-left text-2xl font-bold text-red-600 dark:text-red-400">
              {t("deleteChapterDialog.title")}
            </DialogTitle>
            <DialogDescription className="rtl:text-right ltr:text-left text-gray-600 dark:text-gray-300">
              {t("deleteChapterDialog.description", {
                title: selectedChapter?.title || "",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {t("deleteChapterDialog.warning", {
                count: selectedChapter?.questions.length || 0,
              })}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteChapterDialogOpen(false)}
              className="border-border-light dark:border-gray-700 text-gray-700 dark:text-gray-200 close-hover transition-all rounded-xl px-6"
              disabled={actionLoading === "deleteChapter"}
            >
              {t("deleteChapterDialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChapter}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading === "deleteChapter"}
            >
              {actionLoading === "deleteChapter" ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  {t("deleteChapterDialog.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  {t("deleteChapterDialog.deleteChapter")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
