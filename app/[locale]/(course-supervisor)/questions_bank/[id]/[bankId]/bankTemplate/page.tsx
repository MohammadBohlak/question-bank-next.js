"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Trash2,
  Plus,
  Search,
  FileText,
  Clock,
  Layers,
  Eye,
  Loader2,
  AlertCircle,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Calendar,
  Copy,
  Database,
  Zap,
  ToggleLeft,
  UserCog,
  Hash,
  BookOpen,
  Key,
  Info,
  PenTool,
  ListChecks,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { getBankTemplates, deleteTemplate } from "@/store/question";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Background from "@/components/custom/Background";
import MainTitle from "@/components/custom/common/texts/MainTitle";
import TextMuted from "@/components/custom/common/texts/TextMuted";

interface Template {
  id: number;
  code: string;
  instructions: string;
  totalMark: number;
  totalTime: number;
  questionsCount: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

interface TemplateGroup {
  createdAt: string; // Exact createdAt timestamp from the data
  dateFormatted: string; // Formatted date for display
  timeFormatted: string; // Formatted time for display
  templates: Template[];
  templatesCount: number;
}

export default function BankTemplatesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("bankTemplates");
  const { id, bankId } = useParams<{ id: string; bankId: string }>();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const bankData = useSelector(
    (state: RootState) => state.questions.bankTemplates,
  );

  useEffect(() => {
    setLoading(true);
    try {
      dispatch(getBankTemplates(parseInt(bankId)));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.loadTemplatesFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [bankId, dispatch, router, t]);

  const groupTemplatesByExactTime = (): TemplateGroup[] => {
    if (!bankData?.templates) return [];

    // خريطة لتجميع النماذج حسب وقت الإنشاء الدقيق
    const timeMap = new Map<string, Template[]>();

    bankData.templates.forEach((template) => {
      const createdAt = template.createdAt;
      if (!createdAt) return;

      // استخدام createdAt كاملاً كـ key للتجميع
      if (!timeMap.has(createdAt)) {
        timeMap.set(createdAt, []);
      }
      timeMap.get(createdAt)!.push(template);
    });

    // تحويل الخريطة إلى مصفوفة
    const groups: TemplateGroup[] = Array.from(timeMap.entries())
      .map(([createdAt, templates]) => {
        const date = new Date(createdAt);

        // تنسيق التاريخ للعرض
        const dateFormatted = date.toLocaleDateString("ar-SA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const timeFormatted = date.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        // ترتيب النماذج حسب الكود
        const sortedTemplates = templates.sort((a, b) =>
          a.code.localeCompare(b.code),
        );

        return {
          createdAt,
          dateFormatted,
          timeFormatted,
          templates: sortedTemplates,
          templatesCount: templates.length,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ); // ترتيب تنازلي حسب التاريخ

    return groups;
  };

  // ترشيح المجموعات والنماذج حسب البحث
  const filteredGroups = (): TemplateGroup[] => {
    const groups = groupTemplatesByExactTime();

    if (!searchTerm.trim()) return groups;

    return groups
      .map((group) => {
        const filteredTemplates = group.templates.filter((template) => {
          const matchesSearch =
            template.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.instructions
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            group.dateFormatted
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            group.timeFormatted
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          return matchesSearch;
        });

        return {
          ...group,
          templates: filteredTemplates,
          templatesCount: filteredTemplates.length,
        };
      })
      .filter((group) => group.templates.length > 0);
  };

  // تبديل توسيع/طي المجموعة
  const toggleGroup = (createdAt: string) => {
    setExpandedGroups((prev) =>
      prev.includes(createdAt)
        ? prev.filter((key) => key !== createdAt)
        : [...prev, createdAt],
    );
  };

  // توسيع أو طي كل المجموعات
  const toggleAllGroups = (expand: boolean) => {
    const groups = groupTemplatesByExactTime();
    if (expand) {
      setExpandedGroups(groups.map((g) => g.createdAt));
    } else {
      setExpandedGroups([]);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const res = await dispatch(deleteTemplate(selectedTemplate.id)).unwrap();
      dispatch(getBankTemplates(parseInt(bankId)));
      setIsDeleteDialogOpen(false);
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.deleteTemplateFailed"),
      );
    }
  };

  const handleCreateTemplate = () => {
    router.push(`/questions_bank/${id}/${bankId}/create-templates`);
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const calculateStats = () => {
    if (!bankData)
      return {
        total: 0,
        totalQuestions: 0,
        avgTime: 0,
        avgMark: 0,
        uniqueTimes: 0,
        avgTemplatesPerBatch: 0,
      };

    const total = bankData.templates.length;
    const totalQuestions = bankData.templates.reduce(
      (sum, t) => sum + t.questionsCount,
      0,
    );
    const avgTime =
      bankData.templates.reduce((sum, t) => sum + t.totalTime, 0) / total || 0;
    const avgMark =
      bankData.templates.reduce((sum, t) => sum + t.totalMark, 0) / total || 0;
    const groups = groupTemplatesByExactTime();
    const uniqueTimes = groups.length;
    const avgTemplatesPerBatch = total / uniqueTimes || 0;

    return {
      total,
      totalQuestions,
      avgTime,
      avgMark,
      uniqueTimes,
      avgTemplatesPerBatch,
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("errors.unknownDate");
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("loadingTemplates")}
          </p>
        </div>
      </div>
    );
  }

  const groups = filteredGroups();

  return (
    <div
      className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          {/* Header */}
          <Background isHeader className="relative">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="border-[1px] border-border-light absolute bottom-3 rtl:right-3 ltr:left-3 sm:static rounded-xl border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  //   className="rounded-lg border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <MainTitle>{bankData?.code}</MainTitle>
                    <Badge
                      className={
                        bankData?.isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-border-light dark:border-gray-700"
                      }
                    >
                      {bankData?.isActive
                        ? t("stats.active")
                        : t("stats.inactive")}
                    </Badge>
                  </div>
                  <TextMuted className="mt-1">
                    {bankData?.course} • {t("stats.courseId")}: {bankData?.id}
                  </TextMuted>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateTemplate}
                  className="bg-btn hover:opacity-80 text-white transition-colors shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {t("createTemplate")}
                </Button>
              </div>
            </div>
          </Background>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("stats.totalTemplates")}
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stats.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("stats.totalQuestions")}
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stats.uniqueTimes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("stats.creationBatches")}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stats.avgTemplatesPerBatch.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("stats.averagePerBatch")}
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Copy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Templates Table */}
          <div className="lg:col-span-2">
            <Card className="pt-0 border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="pt-4 pb-2 bg-btn bg-linear-to-br rounded-tl-xl rounded-tr-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="p-2 bg-sec rounded-lg">
                        <FileText
                          className="h-5 w-5 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      {t("title")}
                    </CardTitle>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 h-4 w-4" />
                    <Input
                      placeholder={t("table.searchPlaceholder")}
                      className="pr-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-colors w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Templates Table by Creation Time */}
                <div className="space-y-4">
                  {groups.map((group) => {
                    const isExpanded = expandedGroups.includes(group.createdAt);
                    return (
                      <div
                        key={group.createdAt}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                      >
                        {/* Group Header */}
                        <div
                          className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
                          onClick={() => toggleGroup(group.createdAt)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <h3 className="font-semibold text-gray-800 dark:text-white">
                                    {group.dateFormatted}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {group.timeFormatted}
                                    <span className="mx-2">•</span>
                                    <Copy className="h-3 w-3" />
                                    {group.templatesCount}{" "}
                                    {t("group.templates")}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Group Content (Templates Table) */}
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.code")}
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.instructions")}
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.questions")}
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.mark")}
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.time")}
                                  </th>
                                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    {t("table.actions")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {group.templates.map((template) => (
                                  <tr
                                    key={template.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                  >
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <div className="font-medium text-gray-800 dark:text-white">
                                        {template.code}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                        {template.instructions ||
                                          t("table.noInstructions")}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        {template.questionsCount}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                        {template.totalMark}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                        {template.totalTime}{" "}
                                        {t("previewDialog.minutes")}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-100 dark:border-gray-800">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                          onClick={() => {
                                            setSelectedTemplate(template);
                                            setIsDeleteDialogOpen(true);
                                          }}
                                          title={t("table.delete")}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                          onClick={() =>
                                            handlePreviewTemplate(template)
                                          }
                                          title={t("table.preview")}
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                          title={t("table.attach")}
                                        >
                                          <Link
                                            href={`/questions_bank/${id}/${bankId}/bankTemplate/${template.id}`}
                                            className="flex items-center"
                                          >
                                            <Paperclip className="h-3.5 w-3.5" />
                                          </Link>
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {groups.length === 0 && (
                    <div className="text-center py-12">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-sec" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {t("noTemplates.title")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm
                          ? t("noTemplates.searchMessage")
                          : t("noTemplates.emptyMessage")}
                      </p>
                      <Button
                        onClick={handleCreateTemplate}
                        className="bg-btn hover:opacity-80 transition-colors duration-200 text-white transition-colors shadow-md hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        {t("createTemplate")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bank Info & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="pt-0 border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="pt-4 pb-2 bg-btn bg-linear-to-br rounded-tl-xl rounded-tr-xl">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="p-2 bg-sec rounded-lg">
                    <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  {t("quickActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                  onClick={() => toggleAllGroups(true)}
                >
                  <ChevronDown className="h-4 w-4 ml-2" />
                  {t("quickActionsButtons.expandAllGroups")}
                </Button>
                <Button
                  className="w-full justify-start bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700"
                  onClick={() => toggleAllGroups(false)}
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  {t("quickActionsButtons.collapseAllGroups")}
                </Button>
              </CardContent>
            </Card>
            {/* Bank Information */}
            <Card className="pt-0 border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <CardHeader className="pt-4 pb-2 bg-btn bg-linear-to-br rounded-tl-xl rounded-tr-xl">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className="p-2 bg-sec rounded-lg">
                    <Database
                      className="h-5 w-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  {t("bankInfo")}
                </CardTitle>
                <CardDescription className="text-gray-100">
                  {t("bankDetails")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Hash
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.bankCode")}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {bankData?.code}
                    </span>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.course")}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white text-left">
                      {bankData?.course}
                    </span>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Hash
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.courseId")}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {bankData?.courseId}
                    </span>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserCog
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.supervisor")}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {bankData?.supervisor}
                    </span>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.creationDate")}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatDate(bankData?.createdAt)}
                    </span>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ToggleLeft
                        className="h-4 w-4 text-gray-600 dark:text-gray-400"
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("stats.status")}
                      </span>
                    </div>
                    <Badge
                      className={
                        bankData?.isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      }
                    >
                      {bankData?.isActive
                        ? t("stats.active")
                        : t("stats.inactive")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* بقية الـ Dialogs (Delete, Edit, Preview) */}
      {/* Delete Template Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[425px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          <DialogHeader>
            <DialogTitle className="text-start text-gray-800 dark:text-white">
              {t("deleteDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-start text-gray-600 dark:text-gray-400">
              {t("deleteDialog.description", {
                code: selectedTemplate?.code || "",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-start text-sm text-red-600 dark:text-red-300">
              {t("deleteDialog.warning")}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 close-hover"
            >
              {t("deleteDialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
            >
              {t("deleteDialog.deleteTemplate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[600px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-sec" strokeWidth={2.5} />
              {t("previewDialog.title", { code: selectedTemplate?.code || "" })}
            </DialogTitle>
            <DialogDescription className="text-start text-gray-600 dark:text-gray-400">
              {t("previewDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("previewDialog.instructions")}
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-800 dark:text-gray-300">
                      {selectedTemplate.instructions ||
                        t("table.noInstructions")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white flex justify-center items-center gap-2 mb-1">
                          <ListChecks
                            className="h-6 w-6 text-sec"
                            strokeWidth={2.5}
                          />
                          {selectedTemplate.questionsCount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("previewDialog.questions")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white flex justify-center items-center gap-2 mb-1">
                          <PenTool
                            className="h-6 w-6 text-sec"
                            strokeWidth={2.5}
                          />
                          {selectedTemplate.totalMark}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("previewDialog.totalMark")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white flex justify-center items-center gap-2 mb-1">
                          <Clock
                            className="h-6 w-6 text-sec"
                            strokeWidth={2.5}
                          />
                          {selectedTemplate.totalTime}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("previewDialog.minutes")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-sec" strokeWidth={2.5} />
                    {t("previewDialog.templateInfo")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-sec" strokeWidth={2.5} />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("previewDialog.templateId")}:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {selectedTemplate.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar
                        className="h-4 w-4 text-sec"
                        strokeWidth={2.5}
                      />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("previewDialog.creationDate")}:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {formatDate(selectedTemplate.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-sec" strokeWidth={2.5} />
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("previewDialog.code")}:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {selectedTemplate.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
              className="close-hover"
            >
              {t("previewDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
