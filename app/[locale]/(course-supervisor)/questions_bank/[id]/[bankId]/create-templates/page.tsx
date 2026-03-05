"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  BookOpen,
  Award,
  Settings,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  ListChecks,
  PenTool,
  Clock,
  RotateCcw,
  RotateCw,
  RotateCcw as RotateCcw3,
  Layers,
  FileWarning,
  TableOfContents,
  Shuffle,
  Sliders,
} from "lucide-react";
import {} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getCourseBankDetails } from "@/store/supervisor";
import { createTemplate } from "@/store/question";
import { useTranslations } from "next-intl";
import Background from "@/components/custom/Background";
import MainTitle from "@/components/custom/texts/MainTitle";
import TextMuted from "@/components/custom/texts/TextMuted";
import { cn } from "@/lib/utils";
interface Question {
  id: number;
  chapterId: number;
  questionTypeId: number;
  questionText: string;
  notes: string;
  timeLimit: number | null;
  courseId: number;
  course: string;
  wordsLimit: number;
  isActive: boolean;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
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
  questionOptions: {
    id: number;
    questionId: number;
    optionText: string;
    optionOrder: number;
    isCorrect: boolean;
    createdAt: string;
  }[];
  questionType: QuestionType;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  order: number;
  questions: Array<Question>;
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

interface LevelStats {
  [key: number]: {
    name: string;
    count: number;
    color: string;
  };
}

interface TypeStats {
  [key: number]: {
    name: string;
    code: string;
    count: number;
  };
}

interface ExamTemplateForm {
  templatesCount: number;
  questionsCount: number; // Total questions desired
  instructions: string;
  courseBankId: number;
  totalMark: number;
  totalTime: number;
  randomQuestions: boolean;
  lastExamRepeatLimit1: number | null;
  lastExamRepeatLimit2: number | null;
  lastExamRepeatLimit3: number | null;
  lastOthersExamRepeatLimit: number | null;
  chapterSettings: Array<{
    chapterId: number;
    count: number;
    percentage: number; // Percentage of total questions
  }>;
  levelsSettings: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
  typeSettings: Array<{
    questionTypeId: number;
    count: number;
    percentage: number;
  }>;
}

const QUESTION_LEVELS = [
  {
    id: 1,
    name: "سهل",
    color:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
  },
  {
    id: 2,
    name: "متوسط",
    color:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
  },
  {
    id: 3,
    name: "صعب",
    color:
      "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700",
  },
];

// Generic distribution function
function distributeQuestions<T extends { count: number; percentage: number }>(
  items: T[],
  totalQuestions: number,
): T[] {
  if (items.length === 0) return items;

  const equalCount = Math.floor(totalQuestions / items.length);
  const remainder = totalQuestions % items.length;

  return items.map((item, index) => ({
    ...item,
    count: equalCount + (index < remainder ? 1 : 0),
    percentage:
      ((equalCount + (index < remainder ? 1 : 0)) / totalQuestions) * 100,
  }));
}

export default function ExamTemplatePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { bankId } = useParams<{ bankId: string }>();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<
    QuestionType[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStats>({});
  const [typeStats, setTypeStats] = useState<TypeStats>({});
  const t = useTranslations("examTemplate");
  const [formData, setFormData] = useState<ExamTemplateForm>({
    templatesCount: 1,
    questionsCount: 20, // Default total questions
    instructions: "",
    courseBankId: parseInt(bankId),
    totalMark: 100,
    totalTime: 120,
    randomQuestions: true,
    lastExamRepeatLimit1: null,
    lastExamRepeatLimit2: null,
    lastExamRepeatLimit3: null,
    lastOthersExamRepeatLimit: null,
    chapterSettings: [],
    levelsSettings: [],
    typeSettings: [],
  });

  const bank = useSelector(
    (state: RootState) => state.supervisor.courseBankDetails,
  );

  const fetchBankDetails = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(getCourseBankDetails(parseInt(bankId))).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadBankFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [bankId, dispatch, t]);

  const extractBankData = useCallback(() => {
    if (!bank || !bank.chapters) return;

    // Extract chapters
    const chapters: Chapter[] = bank.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description || "",
      order: chapter.order,
      questions: chapter.questions || [],
      questionsLevels: chapter.questionsLevels || [],
      questionsTypes: chapter.questionsTypes || [],
    }));
    setAvailableChapters(chapters);

    // Extract unique question types from all chapters
    const typeMap = new Map<number, QuestionType>();
    const typeCounts: TypeStats = {};

    bank.chapters.forEach((chapter) => {
      chapter.questions?.forEach((question) => {
        const type = question.questionType;
        if (!typeMap.has(type.id)) {
          typeMap.set(type.id, type);
        }
      });

      if (chapter.questionsTypes) {
        chapter.questionsTypes.forEach((type) => {
          if (!typeCounts[type.id]) {
            typeCounts[type.id] = {
              name: type.title,
              code: type.title,
              count: 0,
            };
          }
          typeCounts[type.id].count += type.count;
        });
      }
    });

    setAvailableQuestionTypes(Array.from(typeMap.values()));
    setTypeStats(typeCounts);

    // Calculate level statistics
    const levelCounts: LevelStats = {};

    bank.chapters.forEach((chapter) => {
      if (chapter.questionsLevels) {
        chapter.questionsLevels.forEach((level) => {
          if (!levelCounts[level.id]) {
            const levelInfo = QUESTION_LEVELS.find((l) => l.id === level.id);
            levelCounts[level.id] = {
              name: level.title,
              count: 0,
              color:
                levelInfo?.color ||
                "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700",
            };
          }
          levelCounts[level.id].count += level.count;
        });
      }
    });

    setLevelStats(levelCounts);
  }, [bank]);

  useEffect(() => {
    if (bankId) {
      fetchBankDetails();
    }
  }, [bankId, fetchBankDetails]);

  useEffect(() => {
    if (bank) {
      extractBankData();
    }
  }, [bank, extractBankData]);

  // Validate the template configuration
  const validateTemplate = useCallback(() => {
    const errors: string[] = [];

    // Check if total questions is positive
    if (formData.questionsCount <= 0) {
      errors.push(t("errors.totalQuestionsZero"));
    }

    // Check if at least one chapter is selected
    if (formData.chapterSettings.length === 0) {
      errors.push(t("errors.atLeastOneChapter"));
      return errors;
    }

    // Check chapter distribution sums to total questions
    const chaptersTotal = formData.chapterSettings.reduce(
      (sum, setting) => sum + setting.count,
      0,
    );
    if (chaptersTotal !== formData.questionsCount) {
      errors.push(
        t("errors.chapterDistributionMismatch", {
          chaptersTotal,
          questionsTotal: formData.questionsCount,
        }),
      );
    }

    // Check each chapter doesn't exceed available questions
    formData.chapterSettings.forEach((setting) => {
      const chapter = availableChapters.find((c) => c.id === setting.chapterId);
      const availableCount = chapter?.questions?.length || 0;
      if (setting.count > availableCount) {
        errors.push(
          t("errors.exceedsAvailableChapter", {
            chapter: chapter?.title || "",
            required: setting.count,
            available: availableCount,
          }),
        );
      }
    });

    // If levels are specified, validate
    if (formData.levelsSettings.length > 0) {
      const levelsTotal = formData.levelsSettings.reduce(
        (sum, setting) => sum + setting.count,
        0,
      );
      if (levelsTotal !== formData.questionsCount) {
        errors.push(
          t("errors.levelsMismatch", {
            levelsTotal,
            questionsTotal: formData.questionsCount,
          }),
        );
      }

      formData.levelsSettings.forEach((setting) => {
        const availableCount = levelStats[setting.level]?.count || 0;
        if (setting.count > availableCount) {
          const levelName =
            QUESTION_LEVELS.find((l) => l.id === setting.level)?.name ||
            `المستوى ${setting.level}`;
          errors.push(
            t("errors.exceedsAvailableLevel", {
              level: levelName,
              required: setting.count,
              available: availableCount,
            }),
          );
        }
      });
    }

    // If types are specified, validate
    if (formData.typeSettings.length > 0) {
      const typesTotal = formData.typeSettings.reduce(
        (sum, setting) => sum + setting.count,
        0,
      );
      if (typesTotal !== formData.questionsCount) {
        errors.push(
          t("errors.typesMismatch", {
            typesTotal,
            questionsTotal: formData.questionsCount,
          }),
        );
      }

      formData.typeSettings.forEach((setting) => {
        const availableCount = typeStats[setting.questionTypeId]?.count || 0;
        if (setting.count > availableCount) {
          const typeName =
            availableQuestionTypes.find((t) => t.id === setting.questionTypeId)
              ?.name || `النوع ${setting.questionTypeId}`;
          errors.push(
            t("errors.exceedsAvailableType", {
              type: typeName,
              required: setting.count,
              available: availableCount,
            }),
          );
        }
      });
    }

    setValidationErrors(errors);
    return errors;
  }, [
    formData,
    availableChapters,
    levelStats,
    typeStats,
    availableQuestionTypes,
    t,
  ]);

  const handleAddChapterSetting = (chapterId: number) => {
    const newChapterSetting = {
      chapterId,
      count: 0,
      percentage: 0,
    };

    const newChapterSettings = [...formData.chapterSettings, newChapterSetting];
    const distributedChapters = distributeQuestions(
      newChapterSettings,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      chapterSettings: distributedChapters,
    }));
  };

  const handleRemoveChapterSetting = (chapterId: number) => {
    if (formData.chapterSettings.length <= 1) {
      toast.error(t("errors.oneChapterMinimum"));
      return;
    }

    const remainingChapters = formData.chapterSettings.filter(
      (setting) => setting.chapterId !== chapterId,
    );
    const distributedChapters = distributeQuestions(
      remainingChapters,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      chapterSettings: distributedChapters,
    }));
  };

  const handleUpdateChapterCount = (chapterId: number, count: number) => {
    const chapter = availableChapters.find((c) => c.id === chapterId);
    const maxQuestions = chapter?.questions?.length || 0;
    const validCount = Math.min(Math.max(0, count), maxQuestions);

    setFormData((prev) => ({
      ...prev,
      chapterSettings: prev.chapterSettings.map((setting) =>
        setting.chapterId === chapterId
          ? {
              ...setting,
              count: validCount,
              percentage: (validCount / prev.questionsCount) * 100,
            }
          : setting,
      ),
    }));
  };

  const handleAddLevelSetting = (level: number) => {
    const newLevelSetting = {
      level,
      count: 0,
      percentage: 0,
    };

    const newLevelSettings = [...formData.levelsSettings, newLevelSetting];
    const distributedLevels = distributeQuestions(
      newLevelSettings,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      levelsSettings: distributedLevels,
    }));
  };

  const handleRemoveLevelSetting = (level: number) => {
    const remainingLevels = formData.levelsSettings.filter(
      (setting) => setting.level !== level,
    );
    const distributedLevels = distributeQuestions(
      remainingLevels,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      levelsSettings: distributedLevels,
    }));
  };

  const handleUpdateLevelCount = (level: number, count: number) => {
    const availableCount = levelStats[level]?.count || 0;
    const validCount = Math.min(Math.max(0, count), availableCount);

    setFormData((prev) => ({
      ...prev,
      levelsSettings: prev.levelsSettings.map((setting) =>
        setting.level === level
          ? {
              ...setting,
              count: validCount,
              percentage: (validCount / prev.questionsCount) * 100,
            }
          : setting,
      ),
    }));
  };

  const handleAddTypeSetting = (questionTypeId: number) => {
    const newTypeSetting = {
      questionTypeId,
      count: 0,
      percentage: 0,
    };

    const newTypeSettings = [...formData.typeSettings, newTypeSetting];
    const distributedTypes = distributeQuestions(
      newTypeSettings,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      typeSettings: distributedTypes,
    }));
  };

  const handleRemoveTypeSetting = (questionTypeId: number) => {
    const remainingTypes = formData.typeSettings.filter(
      (setting) => setting.questionTypeId !== questionTypeId,
    );
    const distributedTypes = distributeQuestions(
      remainingTypes,
      formData.questionsCount,
    );

    setFormData((prev) => ({
      ...prev,
      typeSettings: distributedTypes,
    }));
  };

  const handleUpdateTypeCount = (questionTypeId: number, count: number) => {
    const availableCount = typeStats[questionTypeId]?.count || 0;
    const validCount = Math.min(Math.max(0, count), availableCount);

    setFormData((prev) => ({
      ...prev,
      typeSettings: prev.typeSettings.map((setting) =>
        setting.questionTypeId === questionTypeId
          ? {
              ...setting,
              count: validCount,
              percentage: (validCount / prev.questionsCount) * 100,
            }
          : setting,
      ),
    }));
  };

  const handleUpdateTotalQuestions = (total: number) => {
    if (total <= 0) {
      toast.error(t("errors.totalQuestionsZero"));
      return;
    }

    const maxAvailableQuestions = getTotalQuestionsInBank();
    if (total > maxAvailableQuestions) {
      toast.error(
        t("errors.questionsExceedAvailable", { count: maxAvailableQuestions }),
      );
      return;
    }

    // Update chapter counts proportionally
    const updatedChapters = distributeQuestions(
      formData.chapterSettings,
      total,
    );

    // Update level counts proportionally
    const updatedLevels = distributeQuestions(formData.levelsSettings, total);

    // Update type counts proportionally
    const updatedTypes = distributeQuestions(formData.typeSettings, total);

    setFormData((prev) => ({
      ...prev,
      questionsCount: total,
      chapterSettings: updatedChapters,
      levelsSettings: updatedLevels,
      typeSettings: updatedTypes,
    }));
  };

  // Update validation when form data changes
  useEffect(() => {
    if (formData.chapterSettings.length > 0) {
      validateTemplate();
    }
  }, [
    formData.chapterSettings,
    formData.levelsSettings,
    formData.typeSettings,
    formData.questionsCount,
    validateTemplate,
  ]);

  const getSelectedChapter = (chapterId: number) => {
    return availableChapters.find((chapter) => chapter.id === chapterId);
  };

  const getTotalQuestionsInBank = () => {
    return bank?.questionsCount || 0;
  };

  const getQuestionTypeDisplayName = (code: string) => {
    switch (code) {
      case "true_false":
        return t("questionTypes.trueFalse");
      case "multiple_choice":
        return t("questionTypes.multipleChoice");
      case "multiple_response":
        return t("questionTypes.multipleResponse");
      case "essay":
        return t("questionTypes.essay");
      default:
        return code;
    }
  };

  const getQuestionTypeColor = (code: string) => {
    switch (code.toLowerCase()) {
      case "true_false":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700";
      case "multiple_choice":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700";
      case "multiple_response":
        return "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700";
      case "essay":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  const handleSubmit = async () => {
    const errors = validateTemplate();
    if (errors.length > 0) {
      toast.error(t("errors.validationFailed"));
      return;
    }

    if (formData.questionsCount <= 0) {
      toast.error(t("errors.totalQuestionsZero"));
      return;
    }

    if (formData.chapterSettings.length === 0) {
      toast.error(t("errors.atLeastOneChapter"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await dispatch(createTemplate(formData)).unwrap();
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message);
      setTimeout(() => router.back(), 1500);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.saveTemplateFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      templatesCount: 1,
      questionsCount: 20,
      instructions: "",
      courseBankId: parseInt(bankId),
      totalMark: 100,
      totalTime: 120,
      randomQuestions: true,
      lastExamRepeatLimit1: null,
      lastExamRepeatLimit2: null,
      lastExamRepeatLimit3: null,
      lastOthersExamRepeatLimit: null,
      chapterSettings: [],
      levelsSettings: [],
      typeSettings: [],
    });
    setValidationErrors([]);
    toast.info(t("templateResetted"));
  };

  // Calculate distribution summary
  const calculateDistributionSummary = () => {
    const summary = {
      chaptersTotal: formData.chapterSettings.reduce(
        (sum, s) => sum + s.count,
        0,
      ),
      levelsTotal: formData.levelsSettings.reduce((sum, s) => sum + s.count, 0),
      typesTotal: formData.typeSettings.reduce((sum, s) => sum + s.count, 0),
      isBalanced: true,
    };

    // Check if any dimension sums to total questions
    if (summary.chaptersTotal !== formData.questionsCount)
      summary.isBalanced = false;
    if (
      formData.levelsSettings.length > 0 &&
      summary.levelsTotal !== formData.questionsCount
    )
      summary.isBalanced = false;
    if (
      formData.typeSettings.length > 0 &&
      summary.typesTotal !== formData.questionsCount
    )
      summary.isBalanced = false;

    return summary;
  };

  const distributionSummary = calculateDistributionSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-700 dark:text-gray-300">{t("loadingBank")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Background className="relative">
          <div className="w-full">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  aria-label={t("back")}
                  className="border-[1px] border-border-light absolute bottom-3 rtl:right-3 ltr:left-3 sm:static rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <MainTitle className="flex items-center gap-2 !text-start">
                    <div className="bg-btn rounded-2xl w-12 h-12 flex items-center justify-center">
                      <BarChart3
                        className="h-6 w-6 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    {t("title")}
                  </MainTitle>
                  <TextMuted className="mt-1">
                    {bank?.code} • {bank?.course} • {bank?.questionsCount}{" "}
                    {t("questionsAvailable")}
                  </TextMuted>
                </div>
              </div>

              <div className="flex items-center justify-end sm:justify-start gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                  className=" gap-2 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("reset")}
                </Button>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium text-rose-700 dark:text-rose-300">
                      {t("validationErrors")}
                    </h4>
                    <ul className="space-y-1">
                      {validationErrors.slice(0, 3).map((error, index) => (
                        <li
                          key={index}
                          className="text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2"
                        >
                          <XCircle className="h-3 w-3" />
                          {error}
                        </li>
                      ))}
                      {validationErrors.length > 3 && (
                        <li className="text-sm text-rose-700 dark:text-rose-300">
                          {t("andMoreWarnings", {
                            count: validationErrors.length - 3,
                          })}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Background>

        {/* Main Cascade Layout */}
        <div className="space-y-6">
          {/* Level 1: General Settings */}
          <Card className="pt-0 border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pt-4 border-b border-gray-100 dark:border-gray-800 pb-4 bg-btn !bg-linear-to-br rounded-tl-xl rounded-tr-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sec rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {t("generalSettings.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-100 mt-1">
                      {t("generalSettings.description")}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="templatesCount"
                    className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    <span>{t("generalSettings.templatesCount")}</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="templatesCount"
                    type="number"
                    min="1"
                    value={formData.templatesCount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        templatesCount: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="f-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="questionsCount"
                    className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <ListChecks
                      className="h-4 w-4 text-sec"
                      strokeWidth={2.5}
                    />
                    <span>{t("generalSettings.totalQuestions")}</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="questionsCount"
                    type="number"
                    min="1"
                    max={getTotalQuestionsInBank()}
                    value={formData.questionsCount}
                    onChange={(e) =>
                      handleUpdateTotalQuestions(parseInt(e.target.value) || 1)
                    }
                    className="f-input"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("generalSettings.available")}:{" "}
                    {getTotalQuestionsInBank()} {t("questionsAvailable")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="totalMark"
                    className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    <span>{t("generalSettings.totalMark")}</span>
                  </Label>
                  <Input
                    id="totalMark"
                    type="number"
                    min="1"
                    value={formData.totalMark}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalMark: parseInt(e.target.value) || 100,
                      }))
                    }
                    className="f-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="totalTime"
                    className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    <span>{t("generalSettings.totalTime")}</span>
                  </Label>
                  <Input
                    id="totalTime"
                    type="number"
                    min="1"
                    value={formData.totalTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalTime: parseInt(e.target.value) || 120,
                      }))
                    }
                    className="f-input"
                  />
                </div>
              </div>

              {/* Second row - Exam repeat limits */}
              <div className="mb-6 border-t-[1px] border-t-gray-200 dark:border-t-gray-700 pt-5">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  <span className="text-lg font-semibold my-2">
                    {t("generalSettings.repeatLimits")}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {t("generalSettings.optional")}
                  </Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastExamRepeatLimit1"
                      className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <RotateCcw
                        className="h-4 w-4 text-sec"
                        strokeWidth={2.5}
                      />
                      <span>{t("generalSettings.repeatPreviousExam")}</span>
                    </Label>
                    <Input
                      id="lastExamRepeatLimit1"
                      type="number"
                      min="0"
                      value={formData.lastExamRepeatLimit1 || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastExamRepeatLimit1: parseInt(e.target.value),
                        }))
                      }
                      className="f-input"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("generalSettings.allowedRepeatPercentage")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastExamRepeatLimit2"
                      className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <RotateCw
                        className="h-4 w-4 text-sec"
                        strokeWidth={2.5}
                      />
                      <span>{t("generalSettings.repeatTwoExamsAgo")}</span>
                    </Label>
                    <Input
                      id="lastExamRepeatLimit2"
                      type="number"
                      min="0"
                      value={formData.lastExamRepeatLimit2 || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastExamRepeatLimit2: parseInt(e.target.value),
                        }))
                      }
                      className="f-input"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("generalSettings.allowedRepeatPercentage")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastExamRepeatLimit3"
                      className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <RotateCcw3
                        className="h-4 w-4 text-sec"
                        strokeWidth={2.5}
                      />
                      <span>{t("generalSettings.repeatThreeExamsAgo")}</span>
                    </Label>
                    <Input
                      id="lastExamRepeatLimit3"
                      type="number"
                      min="0"
                      value={formData.lastExamRepeatLimit3 || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastExamRepeatLimit3: parseInt(e.target.value),
                        }))
                      }
                      className="f-input"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("generalSettings.allowedRepeatPercentage")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastOthersExamRepeatLimit"
                      className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <Layers className="h-4 w-4 text-sec" strokeWidth={2.5} />
                      <span>{t("generalSettings.repeatOtherExams")}</span>
                    </Label>
                    <Input
                      id="lastOthersExamRepeatLimit"
                      type="number"
                      min="0"
                      value={formData.lastOthersExamRepeatLimit || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastOthersExamRepeatLimit: parseInt(e.target.value),
                        }))
                      }
                      className="f-input"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("generalSettings.allowedRepeatPercentage")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Label
                  htmlFor="instructions"
                  className="text-md text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <FileWarning className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  <span>{t("generalSettings.examInstructions")}</span>
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  placeholder={t("generalSettings.instructionsPlaceholder")}
                  rows={2}
                  className="f-input resize-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">
                    {t("generalSettings.randomQuestions")}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.randomQuestions
                      ? t("generalSettings.randomDescription")
                      : t("generalSettings.fixedDescription")}
                  </p>
                </div>
                <Switch
                  dir="ltr"
                  checked={formData.randomQuestions}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      randomQuestions: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                />
              </div>
            </CardContent>
          </Card>
          {/* Level 2: Chapters Distribution */}
          <Card className="pt-0 border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 bg-btn bg-linear-to-br pt-4 rounded-tr-xl rounded-tl-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sec rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">
                      {t("chaptersDistribution.title")}
                    </CardTitle>
                    <CardDescription className="text-gray-100 mt-1">
                      {t("chaptersDistribution.description")}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-white text-white w-24 text-md sm:w-32 sm:text-xl"
                >
                  {distributionSummary.chaptersTotal}/{formData.questionsCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-gray-700 dark:text-gray-300 text-lg">
                      <TableOfContents className="text-sec" />
                      {t("chaptersDistribution.availableChapters")} (
                      {availableChapters.length})
                    </Label>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-800 text-md"
                    >
                      {t("chaptersDistribution.totalQuestions")}:{" "}
                      {getTotalQuestionsInBank()}
                    </Badge>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                          <TableHead className="w-12 text-right">#</TableHead>
                          <TableHead className="text-right">
                            {t("chaptersDistribution.chapter")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("chaptersDistribution.descriptionColumn")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("chaptersDistribution.availableQuestions")}
                          </TableHead>
                          <TableHead className="text-center">
                            {t("chaptersDistribution.action")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableChapters.map((chapter, index) => {
                          const isSelected = formData.chapterSettings.some(
                            (s) => s.chapterId === chapter.id,
                          );
                          const selectedSetting = formData.chapterSettings.find(
                            (s) => s.chapterId === chapter.id,
                          );

                          return (
                            <TableRow
                              key={chapter.id}
                              className={`dark:border-b-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                            >
                              <TableCell className="text-center font-medium text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-gray-800 dark:text-white">
                                  {chapter.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                                  {chapter.description ||
                                    t("chaptersDistribution.noDescription")}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className="border-gray-200 dark:border-gray-700"
                                >
                                  {chapter.questions?.length || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {!isSelected ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      max={chapter.questions?.length || 0}
                                      value={selectedSetting?.count || 0}
                                      onChange={(e) =>
                                        handleUpdateChapterCount(
                                          chapter.id,
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-24 border-gray-300 dark:border-gray-700"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleRemoveChapterSetting(chapter.id)
                                      }
                                      className="h-8 w-8 p-0 remove-icon"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleAddChapterSetting(chapter.id)
                                    }
                                    className="bg-transparent text-sec border-sec hover:bg-sec hover:text-white gap-1"
                                  >
                                    <Plus className="h-4 w-4" />
                                    {t("chaptersDistribution.add")}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Selected Chapters Summary */}
                {formData.chapterSettings.length > 0 && (
                  <div className="bg-linear-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                      {t("chaptersDistribution.selectedChapters")}
                    </h4>
                    <div className="space-y-2">
                      {formData.chapterSettings.map((setting) => {
                        const chapter = getSelectedChapter(setting.chapterId);
                        if (!chapter) return null;

                        const availableCount = chapter.questions?.length || 0;
                        const percentage =
                          availableCount > 0
                            ? (setting.count / availableCount) * 100
                            : 0;

                        return (
                          <div
                            key={setting.chapterId}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {chapter.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {setting.count}{" "}
                                {t("difficultyLevels.questions")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32">
                                <Progress
                                  value={percentage}
                                  className="h-2 bg-gray-200 dark:bg-gray-700"
                                />
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {setting.count}/{availableCount} (
                                {setting.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Level 3: Difficulty & Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Difficulty Levels */}
            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800 dark:text-white">
                        {t("difficultyLevels.title")}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {t("difficultyLevels.description")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                  >
                    {distributionSummary.levelsTotal}/{formData.questionsCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {QUESTION_LEVELS.map((level) => {
                    const isSelected = formData.levelsSettings.some(
                      (s) => s.level === level.id,
                    );
                    const setting = formData.levelsSettings.find(
                      (s) => s.level === level.id,
                    );
                    const availableCount = levelStats[level.id]?.count || 0;

                    return (
                      <div
                        key={level.id}
                        className={`p-3 rounded-lg border transition-all ${isSelected ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10" : "border-gray-200 dark:border-gray-800"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${level.color} px-3 py-1`}>
                            {level.name}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {availableCount} {t("difficultyLevels.available")}
                          </span>
                        </div>

                        {isSelected ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={availableCount}
                                value={setting?.count || 0}
                                onChange={(e) =>
                                  handleUpdateLevelCount(
                                    level.id,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="border-gray-300 dark:border-gray-700"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleRemoveLevelSetting(level.id)
                                }
                                className="remove-icon"
                              >
                                {/* todo */}
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {setting?.percentage.toFixed(1)}%{" "}
                                  {t("difficultyLevels.totalPercentage")}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {setting?.count}{" "}
                                  {t("difficultyLevels.questions")}
                                </span>
                              </div>
                              <Progress
                                value={setting?.percentage || 0}
                                className="h-1.5 bg-gray-200 dark:bg-gray-700"
                              />
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddLevelSetting(level.id)}
                            disabled={availableCount === 0}
                            className="w-full border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-600 dark:hover:bg-amber-700 hover:text-white"
                          >
                            <Plus className="h-4 w-4 ml-1" />
                            {t("difficultyLevels.addLevel")}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Question Types */}
            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-800 dark:text-white">
                        {t("questionTypes.title")}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {t("questionTypes.description")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                  >
                    {distributionSummary.typesTotal}/{formData.questionsCount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {availableQuestionTypes.map((type) => {
                    const isSelected = formData.typeSettings.some(
                      (s) => s.questionTypeId === type.id,
                    );
                    const setting = formData.typeSettings.find(
                      (s) => s.questionTypeId === type.id,
                    );
                    const availableCount = typeStats[type.id]?.count || 0;

                    return (
                      <div
                        key={type.id}
                        className={`p-3 rounded-lg border transition-all ${isSelected ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10" : "border-gray-200 dark:border-gray-800"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getQuestionTypeColor(type.code)}>
                              {getQuestionTypeDisplayName(type.code)}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {availableCount} {t("difficultyLevels.available")}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={availableCount}
                                value={setting?.count || 0}
                                onChange={(e) =>
                                  handleUpdateTypeCount(
                                    type.id,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="border-gray-300 dark:border-gray-700"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveTypeSetting(type.id)}
                                className="remove-icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {setting?.percentage.toFixed(1)}%{" "}
                                  {t("difficultyLevels.totalPercentage")}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {setting?.count}{" "}
                                  {t("difficultyLevels.questions")}
                                </span>
                              </div>
                              <Progress
                                value={setting?.percentage || 0}
                                className="h-1.5 bg-gray-200 dark:bg-gray-700"
                              />
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddTypeSetting(type.id)}
                            disabled={availableCount === 0}
                            className="w-full border-violet-500 dark:border-violet-400 text-violet-600 dark:text-violet-400 hover:bg-violet-600 dark:hover:bg-violet-700 hover:text-white"
                          >
                            <Plus className="h-4 w-4 ml-1" />
                            {t("questionTypes.addType")}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Level 4: Final Review & Submit */}
          {false && (
            <Card className="pt-0 border border-border-light dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pt-4 bg-btn bg-linear-to-br rounded-tr-xl rounded-tk-xl border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sec rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">
                        {t("finalReview.title")}
                      </CardTitle>
                      <CardDescription className="bg-amber-600 dark:bg-amber-400 text-gray-100 p-1 mt-1 rounded-full px-2">
                        {distributionSummary.isBalanced ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {t("finalReview.description")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {t("finalReview.needsReview")}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={`${distributionSummary.isBalanced ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"}`}
                  >
                    {distributionSummary.isBalanced
                      ? t("finalReview.ready")
                      : t("finalReview.needsReviewBadge")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {t("finalReview.templateSummary")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("generalSettings.templatesCount")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.templatesCount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("generalSettings.totalQuestions")}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formData.questionsCount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("generalSettings.totalMark")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.totalMark}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("generalSettings.totalTime")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.totalTime} {t("generalSettings.minutes")}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("generalSettings.randomQuestions")}
                        </span>
                        <Badge
                          variant={
                            formData.randomQuestions ? "default" : "outline"
                          }
                          className={
                            formData.randomQuestions
                              ? "bg-blue-600 dark:bg-blue-700"
                              : ""
                          }
                        >
                          {formData.randomQuestions
                            ? t("finalReview.enabled")
                            : t("finalReview.disabled")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("finalReview.repeatExam1")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.lastExamRepeatLimit1}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("finalReview.repeatExam2")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.lastExamRepeatLimit2}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("finalReview.repeatExam3")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.lastExamRepeatLimit3}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("finalReview.repeatOther")}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formData.lastOthersExamRepeatLimit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Preview */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {t("finalReview.distributionPreview")}
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("finalReview.chaptersPreview")}
                          </span>
                          <Badge variant="outline">
                            {formData.chapterSettings.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {formData.chapterSettings
                            .slice(0, 3)
                            .map((setting) => {
                              const chapter = getSelectedChapter(
                                setting.chapterId,
                              );
                              return chapter ? (
                                <div
                                  key={setting.chapterId}
                                  className="flex justify-between"
                                >
                                  <span className="truncate">
                                    {chapter.title}
                                  </span>
                                  <span>
                                    {setting.count}{" "}
                                    {t("difficultyLevels.questions")}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          {formData.chapterSettings.length > 3 && (
                            <div className="text-center pt-1 text-gray-500">
                              {t("finalReview.andMore", {
                                count: formData.chapterSettings.length - 3,
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {formData.levelsSettings.length > 0 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t("finalReview.difficultyPreview")}
                            </span>
                            <Badge variant="outline">
                              {formData.levelsSettings.length}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {formData.levelsSettings.map((setting) => {
                              const level = QUESTION_LEVELS.find(
                                (l) => l.id === setting.level,
                              );
                              return level ? (
                                <Badge
                                  key={setting.level}
                                  className={level.color}
                                >
                                  {level.name}: {setting.count}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {formData.typeSettings.length > 0 && (
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t("finalReview.typesPreview")}
                            </span>
                            <Badge variant="outline">
                              {formData.typeSettings.length}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.typeSettings.map((setting) => {
                              const type = availableQuestionTypes.find(
                                (t) => t.id === setting.questionTypeId,
                              );
                              return type ? (
                                <Badge
                                  key={setting.questionTypeId}
                                  className={getQuestionTypeColor(type.code)}
                                >
                                  {getQuestionTypeDisplayName(type.code)}:{" "}
                                  {setting.count}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSaving ||
                    validationErrors.length > 0 ||
                    formData.questionsCount === 0 ||
                    formData.chapterSettings.length === 0
                  }
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                      {t("savingTemplate")}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 ml-2" />
                      {t("saveTemplate")} ({formData.templatesCount}{" "}
                      {t("generalSettings.templates")})
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          <Card className="pt-0 border border-border-light dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pt-4 bg-btn bg-linear-to-br rounded-tr-xl rounded-tk-xl border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sec rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">
                      {t("finalReview.title")}
                    </CardTitle>
                    <CardDescription className="bg-amber-600 dark:bg-amber-400 text-gray-100 p-1 mt-1 rounded-full px-2">
                      {distributionSummary.isBalanced ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {t("finalReview.description")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {t("finalReview.needsReview")}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className={`${distributionSummary.isBalanced ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"}`}
                >
                  {distributionSummary.isBalanced
                    ? t("finalReview.ready")
                    : t("finalReview.needsReviewBadge")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sec" strokeWidth={2.5} />
                    {t("finalReview.templateSummary")}
                  </h4>
                  <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("generalSettings.templatesCount")}
                      </span>
                      <span className="font-medium">
                        {formData.templatesCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <ListChecks
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("generalSettings.totalQuestions")}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formData.questionsCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <PenTool
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("generalSettings.totalMark")}
                      </span>
                      <span className="font-medium">{formData.totalMark}</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Clock
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("generalSettings.totalTime")}
                      </span>
                      <span className="font-medium">
                        {formData.totalTime} {t("generalSettings.minutes")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Shuffle
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("generalSettings.randomQuestions")}
                      </span>
                      <Badge
                        variant={
                          formData.randomQuestions ? "default" : "outline"
                        }
                        className={
                          formData.randomQuestions
                            ? "bg-blue-600 dark:bg-blue-700"
                            : ""
                        }
                      >
                        {formData.randomQuestions
                          ? t("finalReview.enabled")
                          : t("finalReview.disabled")}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <RotateCcw
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("finalReview.repeatExam1")}
                      </span>
                      <span className="font-medium">
                        {formData.lastExamRepeatLimit1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <RotateCcw
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("finalReview.repeatExam2")}
                      </span>
                      <span className="font-medium">
                        {formData.lastExamRepeatLimit2}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <RotateCcw
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("finalReview.repeatExam3")}
                      </span>
                      <span className="font-medium">
                        {formData.lastExamRepeatLimit3}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-md px-1 transition-colors">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Layers
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={2.5}
                        />
                        {t("finalReview.repeatOther")}
                      </span>
                      <span className="font-medium">
                        {formData.lastOthersExamRepeatLimit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distribution Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-sec" strokeWidth={2.5} />
                    {t("finalReview.distributionPreview")}
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" strokeWidth={2.5} />
                          {t("finalReview.chaptersPreview")}
                        </span>
                        <Badge variant="outline">
                          {formData.chapterSettings.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                        {formData.chapterSettings.slice(0, 3).map((setting) => {
                          const chapter = getSelectedChapter(setting.chapterId);
                          return chapter ? (
                            <div
                              key={setting.chapterId}
                              className="flex justify-between"
                            >
                              <span className="truncate max-w-[180px]">
                                {chapter.title}
                              </span>
                              <span className="font-medium">
                                {setting.count}{" "}
                                {t("difficultyLevels.questions")}
                              </span>
                            </div>
                          ) : null;
                        })}
                        {formData.chapterSettings.length > 3 && (
                          <div className="text-center pt-2 text-gray-500 dark:text-gray-400 italic">
                            {t("finalReview.andMore", {
                              count: formData.chapterSettings.length - 3,
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Difficulty & Types sections remain similar but with icons if needed */}
                    {/* ... (يمكن إضافة أيقونات هنا أيضاً بنفس الطريقة إذا أردت) */}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-5 pb-5">
              <Button
                onClick={handleSubmit}
                disabled={
                  isSaving ||
                  validationErrors.length > 0 ||
                  formData.questionsCount === 0 ||
                  formData.chapterSettings.length === 0
                }
                className="w-full bg-btn hover:opacity-80 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2
                      className="h-5 w-5 mr-2 animate-spin"
                      strokeWidth={2.5}
                    />
                    {t("savingTemplate")}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    {t("saveTemplate")} ({formData.templatesCount}{" "}
                    {t("generalSettings.templates")})
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
