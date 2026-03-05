"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gauge,
  HelpCircle,
  ListChecks,
  ListPlus,
  Pencil,
  Plus,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useCallback } from "react";
import { RootState, AppDispatch } from "@/store/store";
import { QuestionType } from "@/store/question";
import { getQuestionTypes, createQuestion } from "@/store/question";
import { useParams } from "next/navigation";
import { getCourseBankDetails } from "@/store/supervisor";
import { useTranslations } from "next-intl";

interface FormData {
  chapterId: string;
  questionTypeId: string;
  questionText: string;
  notes: string;
  difficultyLevel: string;
  questionOptions: {
    optionText: string;
    optionOrder: number;
    isCorrect: boolean;
  }[];
}

interface FormErrors {
  [key: string]: string;
}

interface CreateQuestionDialogProps {
  chapterId?: number;
  chapterName?: string;
}

const CreateQuestionDialog = ({
  chapterId,
  chapterName,
}: CreateQuestionDialogProps) => {
  const t = useTranslations("createQuestionDialog");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const dispatch = useDispatch<AppDispatch>();
  const { bankId } = useParams<{ bankId: string }>();
  const questionTypes = useSelector(
    (state: RootState) => state.questions?.questionsTypes || [],
  );

  const [formData, setFormData] = useState<FormData>({
    chapterId: chapterId ? chapterId.toString() : "",
    questionTypeId: "",
    questionText: "",
    difficultyLevel: "",
    notes: "",
    questionOptions: [],
  });

  // Use useCallback to memoize the resetForm function
  const resetForm = useCallback(() => {
    setFormData({
      chapterId: chapterId ? chapterId.toString() : "",
      questionTypeId: "",
      questionText: "",
      difficultyLevel: "",
      notes: "",
      questionOptions: [],
    });
    setErrors({});
  }, [chapterId]);

  // Update form when chapterId changes or dialog opens/closes
  useEffect(() => {
    dispatch(getQuestionTypes());
    if (chapterId) {
      setFormData((prev) => ({
        ...prev,
        chapterId: chapterId.toString(),
      }));
    }
  }, [chapterId, dispatch]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | File | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOptionChange = (
    index: number,
    field: keyof FormData["questionOptions"][0],
    value: string | File | null,
  ) => {
    const updatedOptions = [...formData.questionOptions];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      questionOptions: updatedOptions,
    }));
  };

  // Handle correct answer selection based on question type
  const handleCorrectAnswerChange = (index: number) => {
    const selectedQuestionType = questionTypes?.find(
      (type: QuestionType) => type.id.toString() === formData.questionTypeId,
    );

    if (!selectedQuestionType) return;

    const isMultipleResponse =
      selectedQuestionType.code === "multiple_response";

    if (isMultipleResponse) {
      // For multiple response: toggle the selected option
      const updatedOptions = formData.questionOptions.map((option, i) => ({
        ...option,
        isCorrect: i === index ? !option.isCorrect : option.isCorrect,
      }));
      setFormData((prev) => ({
        ...prev,
        questionOptions: updatedOptions,
      }));
    } else {
      // For single choice: only one correct answer allowed
      const updatedOptions = formData.questionOptions.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }));
      setFormData((prev) => ({
        ...prev,
        questionOptions: updatedOptions,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = t("errors.questionTextRequired");
    }

    // Validate required fields
    if (!formData.chapterId) {
      newErrors.chapterId = t("errors.chapterRequired");
    }
    if (!formData.questionTypeId) {
      newErrors.questionTypeId = t("errors.questionTypeRequired");
    }
    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = t("errors.difficultyLevelRequired");
    }

    // Validate options based on question type
    const selectedQuestionType = questionTypes?.find(
      (type: QuestionType) => type.id.toString() === formData.questionTypeId,
    );
    const hasOptions = selectedQuestionType?.hasOptions;
    const isMultipleResponse =
      selectedQuestionType?.code === "multiple_response";

    if (hasOptions && formData.questionOptions.length === 0) {
      newErrors.questionOptions = t("errors.atLeastOneOption");
    }

    // Validate correct answers based on question type
    if (formData.questionOptions.length > 0) {
      const correctOptionsCount = formData.questionOptions.filter(
        (option) => option.isCorrect,
      ).length;

      if (isMultipleResponse) {
        // For multiple response: need at least 1 correct answer
        if (correctOptionsCount === 0) {
          newErrors.questionOptions = t("errors.atLeastOneCorrectAnswer");
        }
      } else {
        // For single choice: need exactly 1 correct answer
        if (correctOptionsCount !== 1) {
          newErrors.questionOptions = t("errors.exactlyOneCorrectAnswer");
        }
      }

      // Validate that each option has text
      formData.questionOptions.forEach((option, index) => {
        if (!option.optionText.trim()) {
          newErrors[`option_${index}`] = t("errors.optionTextRequired");
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add new option
  const addOption = () => {
    if (formData.questionOptions.length >= 5) {
      toast.error(t("errors.maxOptionsLimit"));
      return;
    }

    const newOption = {
      optionText: "",
      optionOrder: formData.questionOptions.length + 1,
      isCorrect: false,
    };

    setFormData((prev) => ({
      ...prev,
      questionOptions: [...prev.questionOptions, newOption],
    }));

    // Clear options error when adding first option
    if (errors.options) {
      setErrors((prev) => ({
        ...prev,
        options: "",
      }));
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    if (formData.questionOptions.length <= 1) {
      toast.error(t("errors.atLeastOneOption"));
      return;
    }

    const updatedOptions = formData.questionOptions.filter(
      (_, i) => i !== index,
    );
    // Reassign option orders
    const reorderedOptions = updatedOptions.map((option, i) => ({
      ...option,
      optionOrder: i + 1,
    }));

    setFormData((prev) => ({
      ...prev,
      questionOptions: reorderedOptions,
    }));

    // Clear the specific option error
    if (errors[`option_${index}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`option_${index}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("errors.fixFormErrors"));
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for API
      const submitData = {
        chapterId: parseInt(formData.chapterId),
        questionTypeId: parseInt(formData.questionTypeId),
        questionText: formData.questionText,
        notes: formData.notes,
        difficultyLevel: parseInt(formData.difficultyLevel),
        questionOptions: formData.questionOptions.map((option) => ({
          optionText: option.optionText,
          optionOrder: option.optionOrder,
          isCorrect: option.isCorrect,
        })),
      };

      const res = await dispatch(createQuestion(submitData)).unwrap();

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(" • "));
        return;
      }

      toast.success(res.message);
      dispatch(getCourseBankDetails(parseInt(bankId))).unwrap();
      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("errors.createQuestionFailed");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get selected question type details
  const selectedQuestionType = questionTypes?.find(
    (type: QuestionType) => type.id.toString() === formData.questionTypeId,
  );
  const hasOptions = selectedQuestionType?.hasOptions;
  const isMultipleResponse = selectedQuestionType?.code === "multiple_response";
  const correctOptionsCount = formData.questionOptions.filter(
    (option) => option.isCorrect,
  ).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center bg-btn hover:opacity-80 text-white gap-2 font-arabic">
          <Plus className="w-4 h-4" />
          {t("createQuestionButton")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="
      max-w-2xl max-h-[90vh] overflow-y-auto 
      bg-card-bg dark:bg-gray-800 
      border border-border dark:border-gray-700
      [&>button[aria-label]]:hidden
    "
      >
        <DialogHeader dir="rtl">
          <DialogTitle className="text-xl font-bold font-arabic flex items-center gap-2">
            <div className="p-2 bg-btn rounded-lg">
              <HelpCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            {t("title")}
            {chapterName && (
              <p className="text-sm font-normal mt-1 text-text-secondary dark:text-gray-300 font-arabic">
                {t("chapterLabel")}: {chapterName}
              </p>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* نوع السؤال */}
          <div className="space-y-2">
            <Label
              htmlFor="questionType"
              className="text-sm font-medium text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
            >
              <ListChecks className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {t("questionTypeLabel")}
            </Label>
            <Select
              value={formData.questionTypeId}
              onValueChange={(value) =>
                handleInputChange("questionTypeId", value)
              }
            >
              <SelectTrigger className="f-input">
                <SelectValue placeholder={t("questionTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent className="f-input">
                {questionTypes?.map((item: QuestionType) => (
                  <SelectItem
                    key={item.id}
                    value={item.id.toString()}
                    className="font-arabic dark:text-gray-300"
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.questionTypeId && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">
                {errors.questionTypeId}
              </p>
            )}
          </div>

          {/* نص السؤال */}
          <div className="space-y-2">
            <Label
              htmlFor="questionText"
              className="text-sm font-medium text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
            >
              <Type className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {t("questionTextLabel")}
            </Label>
            <Textarea
              id="questionText"
              value={formData.questionText}
              onChange={(e) =>
                handleInputChange("questionText", e.target.value)
              }
              placeholder={t("questionTextPlaceholder")}
              rows={3}
              className="f-input resize-none text-right"
            />
            {errors.questionText && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">
                {errors.questionText}
              </p>
            )}
          </div>

          {/* مستوى الصعوبة */}
          <div className="space-y-2">
            <Label
              htmlFor="difficulty"
              className="text-sm font-medium text-dark dark:text-gray-300 font-arabic flex items-center gap-2"
            >
              <Gauge className="h-4 w-4 text-sec" strokeWidth={2.5} />
              {t("difficultyLevelLabel")}
            </Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(value) =>
                handleInputChange("difficultyLevel", value)
              }
            >
              <SelectTrigger className="f-input">
                <SelectValue placeholder={t("difficultyLevelPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="f-input">
                <SelectItem value="1">{t("difficultyLevels.easy")}</SelectItem>
                <SelectItem value="2">
                  {t("difficultyLevels.medium")}
                </SelectItem>
                <SelectItem value="3">{t("difficultyLevels.hard")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficultyLevel && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">
                {errors.difficultyLevel}
              </p>
            )}
          </div>

          {/* الخيارات */}
          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListPlus className="h-4 w-4 text-sec" strokeWidth={2.5} />
                  <div>
                    <Label className="text-sm font-bold text-dark dark:text-gray-300 font-arabic">
                      {t("optionsLabel")} *
                    </Label>
                    {isMultipleResponse ? (
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
                        {t("multipleResponseHint")}
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
                        {t("singleChoiceHint")}
                      </p>
                    )}
                    <p className="text-xs text-primary dark:text-blue-400 font-arabic">
                      {t("correctOptionsCount", { count: correctOptionsCount })}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addOption}
                  disabled={formData.questionOptions.length >= 5}
                  variant="outline"
                  size="sm"
                  className="border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t("addOptionButton", {
                    count: formData.questionOptions.length,
                  })}
                </Button>
              </div>

              {errors.options && (
                <p className="text-sm text-error dark:text-red-400 font-arabic">
                  {errors.options}
                </p>
              )}

              {formData.questionOptions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border-light dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                  <p className="mb-3 text-text-secondary dark:text-gray-400 font-arabic">
                    {t("noOptionsAdded")}
                  </p>
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    className="border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic"
                  >
                    {t("addFirstOptionButton")}
                  </Button>
                </div>
              ) : (
                formData.questionOptions.map((option, index) => (
                  <div
                    key={index}
                    className="group p-4 border-b border-border-light dark:border-gray-700 bg-white dark:bg-gray-900 relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {formData.questionOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الخيار"
                      >
                        <Trash2
                          className="w-4 h-4 text-error"
                          strokeWidth={2.5}
                        />
                      </button>
                    )}

                    <div className="flex items-start gap-4">
                      {/* رقم الخيار */}
                      <div className="flex items-center justify-center min-w-[32px] h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </div>

                      {/* الإجابة الصحيحة */}
                      <div className="flex-1 flex items-center gap-3 pt-1">
                        {isMultipleResponse ? (
                          <>
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="w-5 h-5 accent-primary dark:accent-blue-500 mt-0.5"
                            />
                            <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
                              {option.isCorrect
                                ? t("multipleResponseCorrect")
                                : t("multipleResponseSelect")}
                            </Label>
                          </>
                        ) : (
                          <>
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="w-5 h-5 accent-primary dark:accent-blue-500 mt-0.5"
                            />
                            <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
                              {option.isCorrect
                                ? t("singleChoiceCorrect")
                                : t("singleChoiceSelect")}
                            </Label>
                          </>
                        )}
                      </div>

                      {/* نص الخيار */}
                      <div className="flex-1">
                        <Textarea
                          placeholder={t("optionPlaceholder", {
                            number: index + 1,
                          })}
                          value={option.optionText}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              "optionText",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="f-input resize-none text-right"
                        />
                        {errors[`option_${index}`] && (
                          <p className="text-sm text-error dark:text-red-400 font-arabic mt-1">
                            {errors[`option_${index}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* أزرار الإجراء */}
          <div className="flex gap-3 pt-6 border-t border-border/50 dark:border-gray-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border dark:border-gray-700 text-dark dark:text-gray-300 close-hover font-arabic flex items-center gap-2"
            >
              {t("cancelButton")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-btn hover:opacity-80 text-white font-arabic flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("creatingInProgress")}
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" strokeWidth={2.5} />
                  {t("createQuestionButton")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionDialog;

// <Dialog open={open} onOpenChange={setOpen}>
//   <DialogTrigger asChild>
//     <Button className="flex items-center bg-btn hover:opacity-80 text-white gap-2 font-arabic">
//       <Plus className="w-4 h-4" />
//       {t("createQuestionButton")}
//     </Button>
//   </DialogTrigger>
//   <DialogContent
//     showCloseButton={false}
//     dir="rtl"
//     className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card-bg dark:bg-gray-800 border border-border dark:border-gray-700"
//   >
//     <DialogHeader dir={"rtl"}>
//       <DialogTitle className=" text-xl font-bold font-arabic">
//         {" "}
//         {t("title")}
//         {chapterName && (
//           <p className="text-sm font-normal mt-1 text-text-secondary dark:text-gray-300 font-arabic">
//             {t("chapterLabel")}: {chapterName}
//           </p>
//         )}
//       </DialogTitle>
//     </DialogHeader>

//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Question Type */}
//       <div className="space-y-2">
//         <Label
//           htmlFor="questionType"
//           className="text-sm font-medium text-dark dark:text-gray-300 font-arabic"
//         >
//           {t("questionTypeLabel")}
//         </Label>
//         <Select
//           value={formData.questionTypeId}
//           onValueChange={(value) =>
//             handleInputChange("questionTypeId", value)
//           }
//         >
//           <SelectTrigger className="f-input">
//             <SelectValue placeholder={t("questionTypePlaceholder")} />
//           </SelectTrigger>
//           <SelectContent className="f-input">
//             {questionTypes?.map((item: QuestionType) => (
//               <SelectItem
//                 key={item.id}
//                 value={item.id.toString()}
//                 className="font-arabic dark:text-gray-300"
//               >
//                 {item.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors.questionTypeId && (
//           <p className="text-sm text-error dark:text-red-400 font-arabic">
//             {errors.questionTypeId}
//           </p>
//         )}
//       </div>

//       {/* Question Text */}
//       <div className="space-y-2">
//         <Label htmlFor="text-dark dark:text-gray-300 font-arabic">
//           {t("questionTextLabel")}
//         </Label>
//         <Textarea
//           id="questionText"
//           value={formData.questionText}
//           onChange={(e) =>
//             handleInputChange("questionText", e.target.value)
//           }
//           placeholder={t("questionTextPlaceholder")}
//           rows={3}
//           className="f-input resize-none text-right"
//         />
//         {errors.questionText && (
//           <p className="text-sm text-error dark:text-red-400 font-arabic">
//             {errors.questionText}
//           </p>
//         )}
//       </div>

//       {/* Difficulty Level */}
//       <div className="space-y-2">
//         <Label
//           htmlFor="difficulty"
//           className="text-sm font-medium text-dark dark:text-gray-300 font-arabic"
//         >
//           {t("difficultyLevelLabel")}
//         </Label>
//         <Select
//           value={formData.difficultyLevel}
//           onValueChange={(value) =>
//             handleInputChange("difficultyLevel", value)
//           }
//         >
//           <SelectTrigger className="f-input">
//             <SelectValue placeholder={t("difficultyLevelPlaceholder")} />
//           </SelectTrigger>
//           <SelectContent className="f-input">
//             <SelectItem value="1">{t("difficultyLevels.easy")}</SelectItem>
//             <SelectItem value="2">
//               {t("difficultyLevels.medium")}
//             </SelectItem>
//             <SelectItem value="3">{t("difficultyLevels.hard")}</SelectItem>
//           </SelectContent>
//         </Select>
//         {errors.difficultyLevel && (
//           <p className="text-sm text-error dark:text-red-400 font-arabic">
//             {errors.difficultyLevel}
//           </p>
//         )}
//       </div>

//       {/* Options Section */}
//       {hasOptions && (
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <Label className="text-sm font-bold text-dark dark:text-gray-300 font-arabic">
//                 {t("optionsLabel")} *
//               </Label>
//               {isMultipleResponse && (
//                 <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
//                   {t("multipleResponseHint")}
//                 </p>
//               )}
//               {!isMultipleResponse && (
//                 <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
//                   {t("singleChoiceHint")}
//                 </p>
//               )}
//               <p className="text-xs text-primary dark:text-blue-400 font-arabic">
//                 {t("correctOptionsCount", { count: correctOptionsCount })}
//               </p>
//             </div>
//             <Button
//               type="button"
//               onClick={addOption}
//               disabled={formData.questionOptions.length >= 5}
//               variant="outline"
//               size="sm"
//               className="border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic"
//             >
//               <Plus className="w-4 h-4" />
//               {t("addOptionButton", {
//                 count: formData.questionOptions.length,
//               })}
//             </Button>
//           </div>

//           {errors.options && (
//             <p className="text-sm text-error dark:text-red-400 font-arabic">
//               {errors.options}
//             </p>
//           )}

//           {formData.questionOptions.length === 0 ? (
//             <div className="text-center py-8 border-2 border-dashed border-border-light dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
//               <p className="mb-3 text-text-secondary dark:text-gray-400 font-arabic">
//                 {t("noOptionsAdded")}
//               </p>
//               <Button
//                 type="button"
//                 onClick={addOption}
//                 variant="outline"
//                 className="border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic"
//               >
//                 {t("addFirstOptionButton")}
//               </Button>
//             </div>
//           ) : (
//             formData.questionOptions.map((option, index) => (
//               <div
//                 key={index}
//                 className="group p-4 border-b border-border-light dark:border-gray-700 bg-white dark:bg-gray-900 relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 {/* Remove Button - زويلة عائمة لتنظيف مظهر عند مرور الماوس أو عندما تكون الخيارات أكثر من واحد */}
//                 {formData.questionOptions.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeOption(index)}
//                     className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <X className="w-3 h-3 text-error" />
//                   </button>
//                 )}

//                 <div className="flex items-center justify-between gap-4">
//                   {/* Index Label */}
//                   <Label className="text-sm font-bold text-dark dark:text-gray-300 font-arabic min-w-[30px]">
//                     {t("optionNumber", { number: index + 1 })}
//                   </Label>

//                   {/* Input: Radio or Checkbox based on type */}
//                   <div className="flex-1 flex items-center gap-3">
//                     {isMultipleResponse ? (
//                       <>
//                         <input
//                           type="checkbox"
//                           checked={option.isCorrect}
//                           onChange={() => handleCorrectAnswerChange(index)}
//                           className="w-5 h-5 accent-primary dark:accent-blue-500"
//                         />
//                         <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
//                           {option.isCorrect
//                             ? t("multipleResponseCorrect")
//                             : t("multipleResponseSelect")}
//                         </Label>
//                       </>
//                     ) : (
//                       <>
//                         <input
//                           type="radio"
//                           name="correctAnswer"
//                           checked={option.isCorrect}
//                           onChange={() => handleCorrectAnswerChange(index)}
//                           className="w-5 h-5 accent-primary dark:accent-blue-500"
//                         />
//                         <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
//                           {option.isCorrect
//                             ? t("singleChoiceCorrect")
//                             : t("singleChoiceSelect")}
//                         </Label>
//                       </>
//                     )}
//                   </div>

//                   {/* Option Input Text */}
//                   <Textarea
//                     placeholder={t("optionPlaceholder", {
//                       number: index + 1,
//                     })}
//                     value={option.optionText}
//                     onChange={(e) =>
//                       handleOptionChange(
//                         index,
//                         "optionText",
//                         e.target.value,
//                       )
//                     }
//                     rows={2}
//                     className="f-input resize-none text-right"
//                   />

//                   {errors[`option_${index}`] && (
//                     <p className="text-sm text-error dark:text-red-400 font-arabic">
//                       {errors[`option_${index}`]}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* Submit Button */}
//       <div className="flex gap-3 pt-4">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => setOpen(false)}
//           className="flex-1 border-border dark:border-gray-700 text-dark dark:text-gray-300 hover:bg-bg-alt dark:hover:bg-gray-700 font-arabic"
//         >
//           {t("cancelButton")}
//         </Button>
//         <Button
//           type="submit"
//           disabled={loading}
//           className="flex-1 bg-primary hover:bg-dark dark:bg-blue-700 dark:hover:bg-blue-800 text-text-light font-arabic"
//         >
//           {loading ? t("creatingInProgress") : t("createQuestionButton")}
//         </Button>
//       </div>
//     </form>
//   </DialogContent>
// </Dialog>
