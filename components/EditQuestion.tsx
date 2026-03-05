// components/QuestionEditDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Badge,
  BarChart3,
  CheckCircle,
  Edit,
  FileText,
  ListCollapse,
  Power,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateQuestion, getUnconfirmedQuestions } from "@/store/question";
import { Question } from "@/app/[locale]/(course-supervisor)/question_recheck/page";
import { useParams } from "next/navigation";
import TextMuted from "./custom/texts/TextMuted";

// Define types matching the API
export interface QuestionOption {
  id: number;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
}

export interface EditQuestionForm {
  id: number;
  questionText: string;
  notes: string;
  difficultyLevel: number;
  isActive: boolean;
  questionOptions: QuestionOption[];
}

interface QuestionEditDialogProps {
  question: Question | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const QuestionEditDialog: React.FC<QuestionEditDialogProps> = ({
  question,
  onClose,
  onUpdateSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editForm, setEditForm] = useState<EditQuestionForm>({
    id: 0,
    questionText: "",
    notes: "",
    difficultyLevel: 1,
    isActive: true,
    questionOptions: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useParams();
  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setIsOpen(true);
      setEditForm({
        id: question.id,
        questionText: question.questionText,
        notes: question.notes || "",
        difficultyLevel: question.difficultyLevel,
        isActive: question.isActive,
        questionOptions:
          question.questionOptions?.map((option) => ({
            id: option.id,
            optionText: option.optionText,
            optionOrder: option.optionOrder,
            isCorrect: option.isCorrect,
          })) || [],
      });
    }
  }, [question]);

  const handleInputChange = (
    field: keyof EditQuestionForm,
    value: string | number | boolean,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (
    index: number,
    field: keyof QuestionOption,
    value: string | number | boolean,
  ) => {
    setEditForm((prev) => {
      const newOptions = [...prev.questionOptions];
      newOptions[index] = {
        ...newOptions[index],
        [field]: value,
      };
      return { ...prev, questionOptions: newOptions };
    });
  };

  const handleSaveEdit = async () => {
    if (!question) return;

    setIsSaving(true);

    // Prepare data exactly as API expects
    const submitData = {
      id: editForm.id,
      questionText: editForm.questionText.trim(),
      notes: editForm.notes.trim(),
      difficultyLevel: editForm.difficultyLevel,
      isActive: editForm.isActive,
      questionOptions: editForm.questionOptions.map((option, index) => ({
        id: option.id || 0,
        optionText: option.optionText.trim(),
        optionOrder: option.optionOrder || index,
        isCorrect: option.isCorrect,
      })),
    };

    console.log("Submitting data:", submitData);

    try {
      const res = await dispatch(
        updateQuestion({
          id: question.id,
          body: submitData,
        }),
      ).unwrap();
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message);
      await dispatch(getUnconfirmedQuestions());
      onUpdateSuccess();
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error)
        toast.error(error.message || "Failed to update question");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleCancelEdit = () => {
    handleClose();
  };

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto custom-scrollbar border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800 shadow-xl rounded-2xl"
      >
        {/* Header: Clean & Centered */}
        <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-btn">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div className="rtl:text-right ltr:text-left">
              <DialogTitle>
                {locale === "ar" ? "تعديل السؤال" : "Edit Question"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm">
                <TextMuted className="mt-1">
                  {locale === "ar"
                    ? "قم بتحديث تفاصيل السؤال والخيارات المتاحة"
                    : "Update question details and available options"}
                </TextMuted>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Text */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {locale === "ar" ? "نص السؤال" : "Question Text"}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={editForm.questionText}
              onChange={(e) =>
                handleInputChange("questionText", e.target.value)
              }
              placeholder={
                locale === "ar"
                  ? "اكتب نص السؤال هنا..."
                  : "Enter question text..."
              }
              className="min-h-[100px] resize-none f-input text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {locale === "ar" ? "ملاحظات" : "Notes"}
            </label>
            <Textarea
              value={editForm.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder={
                locale === "ar"
                  ? "أضف ملاحظات للسؤال (اختياري)..."
                  : "Add notes (optional)..."
              }
              className="resize-none f-input text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "مستوى الصعوبة" : "Difficulty Level"}
              </label>
              <Select
                value={String(editForm.difficultyLevel)}
                onValueChange={(value) =>
                  handleInputChange("difficultyLevel", Number(value))
                }
              >
                <SelectTrigger className="f-input text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={
                      locale === "ar"
                        ? "اختر المستوى..."
                        : "Select difficulty..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="f-input text-gray-900 dark:text-white">
                  <SelectItem value="1">
                    {locale === "ar" ? "سهل (Easy)" : "Easy"}
                  </SelectItem>
                  <SelectItem value="2">
                    {locale === "ar" ? "متوسط (Medium)" : "Medium"}
                  </SelectItem>
                  <SelectItem value="3">
                    {locale === "ar" ? "صعب (Hard)" : "Hard"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Power className="h-4 w-4 text-sec" strokeWidth={2.5} />
                {locale === "ar" ? "الحالة" : "Status"}
              </label>
              <Select
                value={editForm.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  handleInputChange("isActive", value === "active")
                }
              >
                <SelectTrigger className="f-input text-gray-900 dark:text-white">
                  <SelectValue
                    placeholder={
                      locale === "ar" ? "اختر الحالة..." : "Select status..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="f-input text-gray-900 dark:text-white">
                  <SelectItem value="active">
                    {locale === "ar" ? "نشط" : "Active"}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {locale === "ar" ? "غير نشط" : "Inactive"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Options Section */}
          {question.questionType?.hasOptions &&
            editForm.questionOptions.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700/50 pt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ListCollapse
                      className="h-5 w-5 text-sec"
                      strokeWidth={2.5}
                    />
                    {locale === "ar" ? "خيارات السؤال" : "Question Options"}
                  </label>
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {editForm.questionOptions.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {editForm.questionOptions.map((option, index) => (
                    <Card
                      key={index}
                      className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Option Header */}
                      <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {locale === "ar" ? "الخيار" : "Option"} {index + 1}
                          </span>
                        </div>
                        {option.isCorrect && (
                          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                              {locale === "ar"
                                ? "الإجابة الصحيحة"
                                : "Correct Answer"}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 pt-2 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {locale === "ar" ? "نص الخيار" : "Option Text"}
                          </label>
                          <Input
                            value={option.optionText}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                "optionText",
                                e.target.value,
                              )
                            }
                            placeholder={
                              locale === "ar"
                                ? "اكتب نص الخيار..."
                                : "Enter option text..."
                            }
                            className="f-input"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {locale === "ar" ? "الترتيب" : "Order"}
                            </label>
                            <Input
                              type="number"
                              value={option.optionOrder}
                              onChange={(e) =>
                                handleOptionChange(
                                  index,
                                  "optionOrder",
                                  parseInt(e.target.value) || index,
                                )
                              }
                              className="f-input"
                            />
                          </div>

                          {/* Correct Answer Toggle */}
                          <div className="flex items-center justify-end pt-6">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600 select-none">
                              <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={(e) =>
                                  handleOptionChange(
                                    index,
                                    "isCorrect",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-primary dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50"
                              />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {locale === "ar"
                                  ? "ضع علامة على الإجابة الصحيحة"
                                  : "Mark as Correct"}
                              </span>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-6">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="f-input text-gray-700 dark:text-gray-300 close-hover"
          >
            {locale === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={isSaving || !editForm.questionText.trim()}
            className="bg-btn hover:opacity-80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? locale === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : locale === "ar"
                ? "حفظ التعديلات"
                : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditDialog;
