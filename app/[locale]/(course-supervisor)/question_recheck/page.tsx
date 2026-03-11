"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppDispatch } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import QuestionEditDialog from "@/components/EditQuestion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { confirmQuestion, deleteQuestion } from "@/store/question";
import { getUnconfirmedQuestions } from "@/store/question";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Edit,
  Trash2,
  Clock,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { RootState } from "@/store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";
import Background from "@/components/custom/common/Background";

export interface Question {
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
  difficultyLevel: number;
  confirmed: boolean;
  courseId: number;
  course: string;
  chapter: {
    id: number;
    courseBankId: number;
    title: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  };
  questionOptions: Array<{
    id: number;
    questionId: number;
    optionText: string;
    optionOrder: number;
    isCorrect: boolean;
    createdAt: string;
  }>;
  questionType: {
    id: number;
    name: string;
    code: string;
    hasOptions: boolean;
    hasCorrectAnswer: boolean;
    allowMultipleAnswers: boolean;
    isAutoCorrect: boolean;
  };
}

export interface ChapterGroup {
  chapter: {
    id: number;
    courseBankId: number;
    title: string;
    description: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  };
  questions: Question[];
}
interface CourseGroup {
  course: {
    id: number;
    name: string;
  };
  chapters: {
    [chapterId: number]: ChapterGroup;
  };
}

interface GroupedQuestions {
  [courseId: number]: CourseGroup;
}

const QuestionRecheck = () => {
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("questionRecheck");
  const unconfirmedQuestions = useSelector(
    (state: RootState): Question[] =>
      state.questions.unConfirmedQuestions ?? [],
  );

  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set(),
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(),
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [expandAllLoading, setExpandAllLoading] = useState(false);

  const fetchUnconfirmedQuestions = useCallback(async () => {
    setInitialLoading(true);
    try {
      await dispatch(getUnconfirmedQuestions()).unwrap();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("errors.loadFailed"),
      );
    } finally {
      setInitialLoading(false);
    }
  }, [dispatch, t]);
  useEffect(() => {
    fetchUnconfirmedQuestions();
  }, [fetchUnconfirmedQuestions]);

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-success/15 dark:bg-success/30 dark:text-white text-text  border border-success/30 dark:border-success/50";
      case 2:
        return "bg-info/15 dark:bg-info/30 dark:text-white text-text  border border-info/30 dark:border-info/50";
      case 3:
        return "bg-warning/15 dark:bg-warning/30 dark:text-white text-text  border border-warning/30 dark:border-warning/50";
      default:
        return "bg-muted dark:bg-muted/50 text-text dark:text-muted-foreground border border-border dark:border-border";
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return t("table.difficultyEasy");
      case 2:
        return t("table.difficultyMedium");
      case 3:
        return t("table.difficultyHard");
      default:
        return t("table.difficultyUnknown");
    }
  };

  const getQuestionTypeColor = (type: string) => {
    if (!type)
      return "bg-[#3d3a3b]/20 dark:bg-[#3d3a3b]/40 text-text dark:text-muted-foreground border border-border/30 dark:border-border/60";

    const typeLower = type.toLowerCase();
    if (typeLower.includes("multiple") || typeLower.includes("اختيار")) {
      return "bg-accent/20 dark:bg-accent/40 text-text dark:text-white dark:text-accent-foreground border border-[#428177]/30 dark:border-accent/60";
    } else if (typeLower.includes("essay") || typeLower.includes("مقال")) {
      return "bg-error/20 dark:bg-error/40 text-text dark:text-white dark:text-error-foreground border border-[#4a151e]/30 dark:border-error/60";
    } else if (typeLower.includes("true") || typeLower.includes("صح")) {
      return "bg-[#3d3a3b]/30 dark:bg-[#3d3a3b]/60 dark:text-white text-text dark:text-muted-foreground border border-border/40 dark:border-border/70";
    } else {
      return "bg-[#3d3a3b]/20 dark:bg-[#3d3a3b]/40 text-text dark:text-muted-foreground border border-border/30 dark:border-border/60";
    }
  };

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleAllCourses = () => {
    setExpandAllLoading(true);
    setTimeout(() => {
      if (expandedCourses.size === Object.keys(groupedQuestions).length) {
        setExpandedCourses(new Set());
      } else {
        setExpandedCourses(new Set(Object.keys(groupedQuestions).map(Number)));
      }
      setExpandAllLoading(false);
    }, 300); // Small delay for visual feedback
  };

  const toggleAllChapters = () => {
    setExpandAllLoading(true);
    setTimeout(() => {
      if (expandedChapters.size === totalChapters) {
        setExpandedChapters(new Set());
      } else {
        const allChapters = new Set<number>();
        Object.values(groupedQuestions).forEach((course) => {
          const chapters = Object.values(course.chapters) as ChapterGroup[];
          chapters.forEach((chapter) => {
            allChapters.add(chapter.chapter.id);
          });
        });
        setExpandedChapters(allChapters);
      }
      setExpandAllLoading(false);
    }, 300);
  };

  // Group questions by course and chapter
  const groupedQuestions: GroupedQuestions = unconfirmedQuestions.reduce(
    (acc: GroupedQuestions, question: Question) => {
      const courseId = question.courseId;
      const courseName = question.course;
      const chapter = question.chapter;

      if (!courseId || !chapter) return acc;

      if (!acc[courseId]) {
        acc[courseId] = {
          course: {
            id: courseId,
            name: courseName,
          },
          chapters: {},
        };
      }
      if (!acc[courseId].chapters[chapter.id]) {
        acc[courseId].chapters[chapter.id] = { chapter, questions: [] };
      }

      acc[courseId].chapters[chapter.id].questions.push(question);
      return acc;
    },
    {} as GroupedQuestions,
  );

  const totalChapters = Object.values(groupedQuestions).reduce(
    (total, course) => total + Object.keys(course.chapters).length,
    0,
  );

  const handleConfirmQuestion = async (questionId: number) => {
    setConfirmLoading(questionId);
    try {
      const res = await dispatch(confirmQuestion(questionId)).unwrap();
      toast.success(res.message);
      await fetchUnconfirmedQuestions();
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || t("errors.confirmFailed"));
      } else {
        toast.error(t("errors.confirmFailed"));
      }
    } finally {
      setConfirmLoading(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setDeleteLoading(questionId);
    try {
      const res = await dispatch(deleteQuestion(questionId)).unwrap();
      toast.success(res.message);
      await fetchUnconfirmedQuestions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || t("errors.deleteFailed"));
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleCloseEdit = () => {
    setEditingQuestion(null);
  };

  const handleUpdateSuccess = () => {
    fetchUnconfirmedQuestions();
  };

  // Calculate course difficulty average
  const calculateCourseDifficulty = (courseGroup: CourseGroup) => {
    let totalDifficulty = 0;
    let totalQuestions = 0;

    Object.values(courseGroup.chapters).forEach((chapterGroup) => {
      chapterGroup.questions.forEach((question) => {
        totalDifficulty += question.difficultyLevel;
        totalQuestions++;
      });
    });

    return totalQuestions > 0
      ? Math.round(totalDifficulty / totalQuestions)
      : 0;
  };

  // Calculate chapter difficulty average
  const calculateChapterDifficulty = (chapterGroup: ChapterGroup) => {
    if (chapterGroup.questions.length === 0) return 0;

    const totalDifficulty = chapterGroup.questions.reduce(
      (sum, q) => sum + q.difficultyLevel,
      0,
    );
    return Math.round(totalDifficulty / chapterGroup.questions.length);
  };

  // Show initial loading spinner
  if (initialLoading) {
    return (
      <div
        className="min-h-screen bg-bg dark:bg-gray-900 flex items-center justify-center p-6"
        dir="rtl"
      >
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-accent dark:text-accent/80 relative" />
          </div>
        </div>
      </div>
    );
  }

  if (!unconfirmedQuestions || unconfirmedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-bg dark:bg-gray-900 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center p-12 bg-card-bg dark:bg-gray-800 border-2 border-dashed border-border/40 dark:border-gray-700 rounded-2xl">
            <div className="w-16 h-16 bg-bg dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-text-secondary/60 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-text dark:text-white mb-2">
              {t("noQuestionsTitle")}
            </h3>
            <p className="text-text-secondary/80 dark:text-gray-400 max-w-md mx-auto">
              {t("noQuestionsDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-5 shadow-lg rounded-lg  transition-all duration-200 hover:shadow-l dark:hover:shadow-gray-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-btn rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <MainTitle>{t("title")}</MainTitle>
                <TextMuted className="mt-1">{t("description")}</TextMuted>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4a151e] dark:text-red-300">
                  {unconfirmedQuestions.length}
                </p>
                <p className="text-sm text-text-secondary/70 dark:text-gray-500 font-arabic">
                  {t("pending")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#428177] dark:text-emerald-300">
                  {totalChapters}
                </p>
                <p className="text-sm text-text-secondary/70 dark:text-gray-500 font-arabic">
                  {t("chapters")}
                </p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllCourses}
              disabled={expandAllLoading}
              className="flex items-center gap-2 dark:text-white border-border dark:border-gray-600 hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-text dark:hover:text-white hover:border-accent dark:hover:border-accent font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {expandedCourses.size === Object.keys(groupedQuestions).length ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  {t("foldAllCourses")}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {t("expandAllCourses")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllChapters}
              disabled={expandAllLoading}
              className="flex items-center gap-2 dark:text-white border-border dark:border-gray-600 hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-text dark:hover:text-white hover:border-accent dark:hover:border-accent font-arabic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {expandedChapters.size === totalChapters ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  {t("foldAllChapters")}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {t("expandAllChapters")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-card-bg dark:bg-gray-800 border border-border dark:border-gray-700 shadow-md dark:shadow-gray-900/50 rounded-xl overflow-hidden transition-all duration-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-bg dark:bg-gray-900">
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="w-[50px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.serial")}
                  </TableHead>
                  <TableHead className="w-[300px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.courseChapter")}
                  </TableHead>
                  <TableHead className="w-[100px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.questions")}
                  </TableHead>
                  <TableHead className="w-[150px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.difficulty")}
                  </TableHead>
                  <TableHead className="w-[150px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.questionType")}
                  </TableHead>
                  <TableHead className="w-[100px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.time")}
                  </TableHead>
                  <TableHead className="w-[200px] text-right font-arabic font-bold text-text dark:text-white">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(groupedQuestions).map(
                  (courseGroup: CourseGroup) => {
                    const isCourseExpanded = expandedCourses.has(
                      courseGroup.course.id,
                    );
                    const courseChapters = Object.values(courseGroup.chapters);
                    const totalCourseQuestions = courseChapters.reduce(
                      (total, chapter) => total + chapter.questions.length,
                      0,
                    );
                    const courseDifficulty =
                      calculateCourseDifficulty(courseGroup);

                    return (
                      <React.Fragment key={courseGroup.course.id}>
                        {/* Course Row */}
                        <TableRow className="bg-bg dark:bg-gray-900 hover:bg-bg/80 dark:hover:bg-gray-800/80 transition-colors duration-150">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleCourse(courseGroup.course.id)
                              }
                              disabled={expandAllLoading}
                              className="p-0 h-8 w-8 dark:text-white hover:bg-accent/20 dark:hover:bg-accent/30 disabled:opacity-50"
                            >
                              {isCourseExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-sec rounded-lg">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-text dark:text-white font-arabic">
                                  {courseGroup.course.name ||
                                    t("table.noCourseName")}
                                </div>
                                <div className="text-sm text-text-secondary/70 dark:text-gray-400 font-arabic">
                                  {t("table.courseNumber")}:{" "}
                                  {courseGroup.course.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-text dark:text-white">
                              {totalCourseQuestions}
                            </div>
                            <div className="text-sm text-text-secondary/70 dark:text-gray-400 font-arabic">
                              {courseChapters.length} {t("table.chapterCount")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`font-arabic dark:text-white ${getDifficultyColor(courseDifficulty)}`}
                            >
                              {getDifficultyText(courseDifficulty)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-text-secondary dark:text-gray-400 font-arabic">
                              {courseChapters.length > 0 &&
                              courseChapters[0].questions.length > 0
                                ? courseChapters[0].questions[0].questionType
                                    ?.name || t("table.questionTypeUnknown")
                                : t("table.noQuestions")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-text-secondary dark:text-gray-400 font-arabic">
                              <Clock className="w-4 h-4" />
                              {courseChapters.length > 0 &&
                              courseChapters[0].questions.length > 0
                                ? `${courseChapters[0].questions[0].timeLimit || 180} ${t("table.seconds")}`
                                : t("table.timeUnavailable")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleCourse(courseGroup.course.id)
                              }
                              disabled={expandAllLoading}
                              className="flex items-center gap-2 dark:text-white border-border dark:border-gray-600 hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-text dark:hover:text-white hover:border-accent dark:hover:border-accent font-arabic disabled:opacity-50"
                            >
                              {expandAllLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isCourseExpanded ? (
                                t("table.fold")
                              ) : (
                                t("table.expand")
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Chapters Rows - Show only when course is expanded */}
                        {isCourseExpanded &&
                          courseChapters.map((chapterGroup: ChapterGroup) => {
                            const isChapterExpanded = expandedChapters.has(
                              chapterGroup.chapter.id,
                            );
                            const chapterDifficulty =
                              calculateChapterDifficulty(chapterGroup);

                            return (
                              <React.Fragment key={chapterGroup.chapter.id}>
                                {/* Chapter Row */}
                                <TableRow className="bg-card-bg dark:bg-gray-800 hover:bg-bg/50 dark:hover:bg-gray-700/50">
                                  <TableCell>
                                    <div className="pr-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleChapter(chapterGroup.chapter.id)
                                        }
                                        disabled={expandAllLoading}
                                        className="p-0 h-8 w-8 dark:text-white hover:bg-accent/20 dark:hover:bg-accent/30 disabled:opacity-50"
                                      >
                                        {isChapterExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="pr-10 flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-accent dark:bg-accent/80"></div>
                                      <div>
                                        <div className="font-medium text-text dark:text-white font-arabic">
                                          {chapterGroup.chapter.title}
                                        </div>
                                        {chapterGroup.chapter.description && (
                                          <div className="text-sm text-text-secondary/70 dark:text-gray-400 font-arabic truncate max-w-xs">
                                            {chapterGroup.chapter.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium text-text dark:text-white">
                                      {chapterGroup.questions.length}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`font-arabic dark:text-white ${getDifficultyColor(chapterDifficulty)}`}
                                    >
                                      {getDifficultyText(chapterDifficulty)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm text-text-secondary dark:text-gray-400 font-arabic">
                                      {chapterGroup.questions.length > 0
                                        ? chapterGroup.questions[0].questionType
                                            ?.name ||
                                          t("table.questionTypeUnknown")
                                        : t("table.noQuestions")}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm text-text-secondary dark:text-gray-400 font-arabic">
                                      <Clock className="w-4 h-4" />
                                      {chapterGroup.questions.length > 0
                                        ? `${chapterGroup.questions[0].timeLimit || 180} ${t("table.seconds")}`
                                        : t("table.timeUnavailable")}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          toggleChapter(chapterGroup.chapter.id)
                                        }
                                        disabled={expandAllLoading}
                                        className="flex items-center gap-2 dark:text-white border-border dark:border-gray-600 hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-text dark:hover:text-white hover:border-accent dark:hover:border-accent font-arabic disabled:opacity-50"
                                      >
                                        {expandAllLoading ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isChapterExpanded ? (
                                          t("table.fold")
                                        ) : (
                                          t("table.expand")
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>

                                {/* Questions Rows - Show only when chapter is expanded */}
                                {isChapterExpanded &&
                                  chapterGroup.questions.map(
                                    (
                                      question: Question,
                                      questionIndex: number,
                                    ) => (
                                      <TableRow
                                        key={question.id}
                                        className="hover:bg-bg/30 dark:hover:bg-gray-800/30 transition-colors duration-150"
                                      >
                                        <TableCell></TableCell>
                                        <TableCell>
                                          <div className="pr-16">
                                            <div className="font-medium text-text dark:text-white mb-1 font-arabic">
                                              س{questionIndex + 1}:{" "}
                                              {question.questionText.substring(
                                                0,
                                                100,
                                              )}
                                              {question.questionText.length >
                                              100
                                                ? "..."
                                                : ""}
                                            </div>
                                            {question.notes && (
                                              <div className="text-sm text-[#4a151e] dark:text-red-300 mt-1 font-arabic">
                                                <span className="font-medium">
                                                  {t("table.note")}
                                                </span>{" "}
                                                {question.notes.substring(
                                                  0,
                                                  50,
                                                )}
                                                {question.notes.length > 50
                                                  ? "..."
                                                  : ""}
                                              </div>
                                            )}
                                            {question.questionOptions &&
                                              question.questionOptions.length >
                                                0 && (
                                                <div className="text-sm text-text-secondary/70 dark:text-gray-500 mt-1 font-arabic">
                                                  {
                                                    question.questionOptions
                                                      .length
                                                  }{" "}
                                                  {t("table.optionsCount")}
                                                </div>
                                              )}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="text-sm dark:text-white text-text-secondary/70 font-arabic">
                                            {t("table.questionId")}:{" "}
                                            {question.id}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={`font-arabic dark:text-white ${getDifficultyColor(question.difficultyLevel)}`}
                                          >
                                            {getDifficultyText(
                                              question.difficultyLevel,
                                            )}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={`font-arabic ${getQuestionTypeColor(question.questionType?.name || "")}`}
                                          >
                                            {question.questionType?.name}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1 font-arabic">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-text dark:text-white">
                                              {question.timeLimit || 180}{" "}
                                              {t("table.seconds")}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleEditQuestion(question)
                                              }
                                              disabled={
                                                confirmLoading ===
                                                  question.id ||
                                                deleteLoading === question.id
                                              }
                                              className="h-8 w-8 p-0 border-border dark:border-gray-600 hover:bg-accent/10 dark:hover:bg-accent/20 hover:border-accent dark:hover:border-accent disabled:opacity-50"
                                              title={t("table.edit")}
                                            >
                                              <Edit className="w-4 h-4 dark:text-white" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="h-8 w-8 p-0 bg-accent dark:bg-accent/80 hover:bg-success/90 dark:hover:bg-success text-text-on-dark disabled:opacity-50"
                                              onClick={() =>
                                                handleConfirmQuestion(
                                                  question.id,
                                                )
                                              }
                                              disabled={
                                                confirmLoading ===
                                                  question.id ||
                                                deleteLoading === question.id
                                              }
                                              title={t("table.confirm")}
                                            >
                                              {confirmLoading ===
                                              question.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <CheckCircle className="w-4 h-4" />
                                              )}
                                            </Button>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  className="h-8 w-8 p-0 bg-error dark:bg-error/80 hover:bg-error/80 dark:hover:bg-error text-text-on-dark disabled:opacity-50"
                                                  disabled={
                                                    confirmLoading ===
                                                      question.id ||
                                                    deleteLoading ===
                                                      question.id
                                                  }
                                                  title={t("table.delete")}
                                                >
                                                  {deleteLoading ===
                                                  question.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                  ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                  )}
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent className="bg-card-bg dark:bg-gray-800 border-2 border-border dark:border-gray-700">
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle className="text-text dark:text-white font-arabic">
                                                    {t("deleteDialog.title")}
                                                  </AlertDialogTitle>
                                                  <AlertDialogDescription className="text-text-secondary dark:text-gray-400 font-arabic">
                                                    {t(
                                                      "deleteDialog.description",
                                                    )}
                                                    {question.questionText && (
                                                      <span className="mt-2 p-2 block bg-bg dark:bg-gray-900 rounded text-sm text-text dark:text-gray-300">
                                                        {t(
                                                          "deleteDialog.questionPreview",
                                                        )}{" "}
                                                        {question.questionText.substring(
                                                          0,
                                                          100,
                                                        )}
                                                        {question.questionText
                                                          .length > 100
                                                          ? "..."
                                                          : ""}
                                                      </span>
                                                    )}
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel
                                                    className="border-border dark:border-gray-600 hover:bg-bg dark:hover:bg-gray-700 text-text dark:text-gray-300 font-arabic"
                                                    disabled={
                                                      deleteLoading ===
                                                      question.id
                                                    }
                                                  >
                                                    {t("deleteDialog.cancel")}
                                                  </AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() =>
                                                      handleDeleteQuestion(
                                                        question.id,
                                                      )
                                                    }
                                                    className="bg-error dark:bg-error/80 hover:bg-error/80 dark:hover:bg-error text-text-on-dark font-arabic disabled:opacity-50"
                                                    disabled={
                                                      deleteLoading ===
                                                      question.id
                                                    }
                                                  >
                                                    {deleteLoading ===
                                                    question.id ? (
                                                      <div className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        {t(
                                                          "deleteDialog.deleting",
                                                        )}
                                                      </div>
                                                    ) : (
                                                      t(
                                                        "deleteDialog.deleteQuestion",
                                                      )
                                                    )}
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ),
                                  )}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Render the Edit Dialog */}
      {editingQuestion && (
        <QuestionEditDialog
          question={editingQuestion}
          onClose={handleCloseEdit}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default QuestionRecheck;
