'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect, useCallback } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import { QuestionType } from '@/store/question'
import { getQuestionTypes, createQuestion } from '@/store/question'
import { useParams } from 'next/navigation'
import { getCourseBankDetails } from '@/store/supervisor'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('createQuestionDialog');
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const dispatch = useDispatch<AppDispatch>()
  const { bankId } = useParams<{ bankId: string }>();
  const questionTypes = useSelector((state: RootState) =>
    (state.questions?.questionsTypes || [])
  )

  const [formData, setFormData] = useState<FormData>({
    chapterId: chapterId ? chapterId.toString() : '',
    questionTypeId: '',
    questionText: '',
    difficultyLevel: '',
    notes: '',
    questionOptions: []
  })

  // Use useCallback to memoize the resetForm function
  const resetForm = useCallback(() => {
    setFormData({
      chapterId: chapterId ? chapterId.toString() : '',
      questionTypeId: '',
      questionText: '',
      difficultyLevel: '',
      notes: '',
      questionOptions: []
    })
    setErrors({})
  }, [chapterId])

  // Update form when chapterId changes or dialog opens/closes
  useEffect(() => {
    dispatch(getQuestionTypes())
    if (chapterId) {
      setFormData(prev => ({
        ...prev,
        chapterId: chapterId.toString()
      }))
    }
  }, [chapterId, dispatch])

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleOptionChange = (index: number, field: keyof FormData['questionOptions'][0], value: string | File | null) => {
    const updatedOptions = [...formData.questionOptions]
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      questionOptions: updatedOptions
    }))
  }

  // Handle correct answer selection based on question type
  const handleCorrectAnswerChange = (index: number) => {
    const selectedQuestionType = questionTypes?.find((type: QuestionType) =>
      type.id.toString() === formData.questionTypeId
    )

    if (!selectedQuestionType) return;

    const isMultipleResponse = selectedQuestionType.code === 'multiple_response';

    if (isMultipleResponse) {
      // For multiple response: toggle the selected option
      const updatedOptions = formData.questionOptions.map((option, i) => ({
        ...option,
        isCorrect: i === index ? !option.isCorrect : option.isCorrect
      }));
      setFormData(prev => ({
        ...prev,
        questionOptions: updatedOptions
      }));
    } else {
      // For single choice: only one correct answer allowed
      const updatedOptions = formData.questionOptions.map((option, i) => ({
        ...option,
        isCorrect: i === index
      }));
      setFormData(prev => ({
        ...prev,
        questionOptions: updatedOptions
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.questionText.trim()) {
      newErrors.questionText = t('errors.questionTextRequired')
    }

    // Validate required fields
    if (!formData.chapterId) {
      newErrors.chapterId = t('errors.chapterRequired')
    }
    if (!formData.questionTypeId) {
      newErrors.questionTypeId = t('errors.questionTypeRequired')
    }
    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = t('errors.difficultyLevelRequired')
    }

    // Validate options based on question type
    const selectedQuestionType = questionTypes?.find((type: QuestionType) => type.id.toString() === formData.questionTypeId)
    const hasOptions = selectedQuestionType?.hasOptions
    const isMultipleResponse = selectedQuestionType?.code === 'multiple_response'

    if (hasOptions && formData.questionOptions.length === 0) {
      newErrors.questionOptions = t('errors.atLeastOneOption')
    }

    // Validate correct answers based on question type
    if (formData.questionOptions.length > 0) {
      const correctOptionsCount = formData.questionOptions.filter(option => option.isCorrect).length

      if (isMultipleResponse) {
        // For multiple response: need at least 1 correct answer
        if (correctOptionsCount === 0) {
          newErrors.questionOptions = t('errors.atLeastOneCorrectAnswer')
        }
      } else {
        // For single choice: need exactly 1 correct answer
        if (correctOptionsCount !== 1) {
          newErrors.questionOptions = t('errors.exactlyOneCorrectAnswer')
        }
      }

      // Validate that each option has text
      formData.questionOptions.forEach((option, index) => {
        if (!option.optionText.trim()) {
          newErrors[`option_${index}`] = t('errors.optionTextRequired')
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Add new option
  const addOption = () => {
    if (formData.questionOptions.length >= 5) {
      toast.error(t('errors.maxOptionsLimit'))
      return
    }

    const newOption = {
      optionText: '',
      optionOrder: formData.questionOptions.length + 1,
      isCorrect: false
    }

    setFormData(prev => ({
      ...prev,
      questionOptions: [...prev.questionOptions, newOption]
    }))

    // Clear options error when adding first option
    if (errors.options) {
      setErrors(prev => ({
        ...prev,
        options: ''
      }))
    }
  }

  // Remove option
  const removeOption = (index: number) => {
    if (formData.questionOptions.length <= 1) {
      toast.error(t('errors.atLeastOneOption'))
      return
    }

    const updatedOptions = formData.questionOptions.filter((_, i) => i !== index)
    // Reassign option orders
    const reorderedOptions = updatedOptions.map((option, i) => ({
      ...option,
      optionOrder: i + 1
    }))

    setFormData(prev => ({
      ...prev,
      questionOptions: reorderedOptions
    }))

    // Clear the specific option error
    if (errors[`option_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`option_${index}`]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(t('errors.fixFormErrors'))
      return
    }

    setLoading(true)

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
          isCorrect: option.isCorrect
        }))
      }

      const res = await dispatch(
        createQuestion(submitData)
      ).unwrap()

      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(' • '))
        return
      }

      toast.success(res.message)
      dispatch(getCourseBankDetails(parseInt(bankId))).unwrap();
      setOpen(false)
      resetForm()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('errors.createQuestionFailed')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Get selected question type details
  const selectedQuestionType = questionTypes?.find((type: QuestionType) => type.id.toString() === formData.questionTypeId)
  const hasOptions = selectedQuestionType?.hasOptions
  const isMultipleResponse = selectedQuestionType?.code === 'multiple_response'
  const correctOptionsCount = formData.questionOptions.filter(option => option.isCorrect).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center bg-primary hover:bg-dark dark:bg-blue-700 dark:hover:bg-blue-800 text-text-light gap-2 font-arabic"
        >
          <Plus className="w-4 h-4 ml-2" />
          {t('createQuestionButton')}
        </Button>
      </DialogTrigger>
      <DialogContent
        dir="rtl"
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card-bg dark:bg-gray-800 border border-border dark:border-gray-700"
      >
        <DialogHeader dir='rtl'>
          <DialogTitle className="text-xl text-right text-dark dark:text-white font-semibold font-arabic">
            {t('title')}
            {chapterName && (
              <p className="text-sm font-normal mt-1 text-text-secondary dark:text-gray-300 font-arabic">
                {t('chapterLabel')}: {chapterName}
              </p>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="questionType" className="text-sm font-medium text-dark dark:text-gray-300 font-arabic">
              {t('questionTypeLabel')} *
            </Label>
            <Select
              value={formData.questionTypeId}
              onValueChange={(value) => handleInputChange('questionTypeId', value)}
            >
              <SelectTrigger
                className={errors.questionTypeId ? 'border-red-500' : 'border-border dark:border-gray-700 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-900 dark:text-white font-arabic'}
              >
                <SelectValue placeholder={t('questionTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700">
                {questionTypes?.map((item: QuestionType) => (
                  <SelectItem key={item.id} value={item.id.toString()} className="font-arabic dark:text-gray-300 dark:focus:bg-gray-700">
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.questionTypeId && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">{errors.questionTypeId}</p>
            )}
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText" className="text-sm font-medium text-dark dark:text-gray-300 font-arabic">
              {t('questionTextLabel')}
            </Label>
            <Textarea
              id="questionText"
              value={formData.questionText}
              onChange={(e) => handleInputChange('questionText', e.target.value)}
              placeholder={t('questionTextPlaceholder')}
              rows={3}
              className={errors.questionText ? 'border-red-500' : 'border-border dark:border-gray-700 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-900 dark:text-white'}
              style={{
                textAlign: 'right'
              }}
            />
            {errors.questionText && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">{errors.questionText}</p>
            )}
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-medium text-dark dark:text-gray-300 font-arabic">
              {t('difficultyLevelLabel')} *
            </Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(value) => handleInputChange('difficultyLevel', value)}
            >
              <SelectTrigger
                className={errors.difficultyLevel ? 'border-red-500' : 'border-border dark:border-gray-700 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-900 dark:text-white font-arabic'}
              >
                <SelectValue placeholder={t('difficultyLevelPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700">
                <SelectItem value="1" className="font-arabic dark:text-gray-300 dark:focus:bg-gray-700">{t('difficultyLevels.easy')}</SelectItem>
                <SelectItem value="2" className="font-arabic dark:text-gray-300 dark:focus:bg-gray-700">{t('difficultyLevels.medium')}</SelectItem>
                <SelectItem value="3" className="font-arabic dark:text-gray-300 dark:focus:bg-gray-700">{t('difficultyLevels.hard')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficultyLevel && (
              <p className="text-sm text-error dark:text-red-400 font-arabic">{errors.difficultyLevel}</p>
            )}
          </div>

          {/* Options Section */}
          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-dark dark:text-gray-300 font-arabic">{t('optionsLabel')} *</Label>
                  {isMultipleResponse && (
                    <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
                      {t('multipleResponseHint')}
                    </p>
                  )}
                  {!isMultipleResponse && (
                    <p className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
                      {t('singleChoiceHint')}
                    </p>
                  )}
                  <p className="text-xs text-primary dark:text-blue-400 font-arabic">
                    {t('correctOptionsCount', { count: correctOptionsCount })}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addOption}
                  disabled={formData.questionOptions.length >= 5}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic"
                >
                  <Plus className="w-4 h-4" />
                  {t('addOptionButton', { count: formData.questionOptions.length })}
                </Button>
              </div>

              {errors.options && (
                <p className="text-sm text-error dark:text-red-400 font-arabic">{errors.options}</p>
              )}

              {formData.questionOptions.length === 0 ? (
                <div
                  className="text-center py-8 border-2 border-dashed rounded-lg border-border-light dark:border-gray-700"
                >
                  <p className="mb-3 text-text-secondary dark:text-gray-400 font-arabic">{t('noOptionsAdded')}</p>
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    className="border-border dark:border-gray-700 text-dark hover:border-primary hover:text-primary dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400 font-arabic"
                  >
                    {t('addFirstOptionButton')}
                  </Button>
                </div>
              ) : (
                formData.questionOptions.map((option, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 relative border-border-light dark:border-gray-700 bg-white dark:bg-gray-900"
                    style={{
                      borderColor: option.isCorrect ? 'var(--primary)' : '',
                      backgroundColor: option.isCorrect ? 'rgba(var(--primary-rgb), 0.1)' : ''
                    }}
                  >
                    {/* Remove Option Button */}
                    {formData.questionOptions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeOption(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 left-2 h-6 w-6 p-0 text-error hover:text-error hover:bg-error/10 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-dark dark:text-gray-300 font-arabic">{t('optionNumber', { number: index + 1 })}</Label>
                      <div className="flex items-center gap-2">
                        {isMultipleResponse ? (
                          <>
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="w-4 h-4 rounded accent-primary dark:accent-blue-500"
                            />
                            <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
                              {option.isCorrect ? t('multipleResponseCorrect') : t('multipleResponseSelect')}
                            </Label>
                          </>
                        ) : (
                          <>
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerChange(index)}
                              className="w-4 h-4 accent-primary dark:accent-blue-500"
                            />
                            <Label className="text-sm text-dark dark:text-gray-300 font-arabic">
                              {option.isCorrect ? t('singleChoiceCorrect') : t('singleChoiceSelect')}
                            </Label>
                          </>
                        )}
                      </div>
                    </div>

                    <Textarea
                      placeholder={t('optionPlaceholder', { number: index + 1 })}
                      value={option.optionText}
                      onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                      rows={2}
                      className={errors[`option_${index}`] ? 'border-red-500' : 'border-border-light dark:border-gray-700 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 bg-white dark:bg-gray-900 dark:text-white'}
                      style={{
                        textAlign: 'right'
                      }}
                    />

                    {errors[`option_${index}`] && (
                      <p className="text-sm text-error dark:text-red-400 font-arabic">{errors[`option_${index}`]}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border dark:border-gray-700 text-dark dark:text-gray-300 hover:bg-bg dark:hover:bg-gray-700 font-arabic"
            >
              {t('cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-dark dark:bg-blue-700 dark:hover:bg-blue-800 text-text-light font-arabic"
            >
              {loading ? t('creatingInProgress') : t('createQuestionButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateQuestionDialog