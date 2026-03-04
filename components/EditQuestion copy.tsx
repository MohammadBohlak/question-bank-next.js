// components/QuestionEditDialog.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,

} from '@/components/ui/dialog'
import { CheckCircle, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { updateQuestion, getUnconfirmedQuestions } from '@/store/question'
import { Question } from '@/app/[locale]/(course-supervisor)/question_recheck/page'

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
  onUpdateSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [editForm, setEditForm] = useState<EditQuestionForm>({
    id: 0,
    questionText: '',
    notes: '',
    difficultyLevel: 1,
    isActive: true,
    questionOptions: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setIsOpen(true)
      setEditForm({
        id: question.id,
        questionText: question.questionText,
        notes: question.notes || '',
        difficultyLevel: question.difficultyLevel,
        isActive: question.isActive,
        questionOptions: question.questionOptions?.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          optionOrder: option.optionOrder,
          isCorrect: option.isCorrect
        })) || []
      })
    }
  }, [question])

  const handleInputChange = (field: keyof EditQuestionForm, value: string | number | boolean) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string | number | boolean) => {
    setEditForm(prev => {
      const newOptions = [...prev.questionOptions]
      newOptions[index] = {
        ...newOptions[index],
        [field]: value
      }
      return { ...prev, questionOptions: newOptions }
    })
  }

  const handleSaveEdit = async () => {
    if (!question) return

    setIsSaving(true)

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
        isCorrect: option.isCorrect
      }))
    }

    console.log('Submitting data:', submitData)

    try {
      const res = await dispatch(
        updateQuestion({
          id: question.id,
          body: submitData
        })
      ).unwrap()
      if (!res.success && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.errors.join(' • '))
        return
      }

      toast.success(res.message)
      await dispatch(getUnconfirmedQuestions())
      onUpdateSuccess()
      handleClose()
    } catch (error: unknown) {
      if (error instanceof Error)
        toast.error(error.message || 'Failed to update question')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const handleCancelEdit = () => {
    handleClose()
  }

  if (!question) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>

      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto border border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Edit className="w-6 h-6 text-primary dark:text-blue-300" />
            <DialogTitle className="text-text-secondary dark:text-blue-300">
              Edit Question
            </DialogTitle>
          </div>
          <DialogDescription className="text-text dark:text-gray-400">
            Update question details: {question.questionText.substring(0, 50)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
              Question Text *
            </label>
            <Textarea
              value={editForm.questionText}
              onChange={(e) => handleInputChange('questionText', e.target.value)}
              placeholder="Enter question text..."
              className="min-h-[100px] resize-none bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 placeholder:text-text/60 dark:placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
              Notes
            </label>
            <Textarea
              value={editForm.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter notes..."
              className="resize-none bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 placeholder:text-text/60 dark:placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
                Difficulty Level
              </label>
              <Select
                value={String(editForm.difficultyLevel)}
                onValueChange={(value) => handleInputChange('difficultyLevel', Number(value))}
              >
                <SelectTrigger className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700">
                  <SelectItem
                    value="1"
                    className="text-text-secondary dark:text-blue-300 focus:bg-bg-alt dark:focus:bg-gray-700 focus:text-text-secondary dark:focus:text-blue-300"
                  >
                    Easy
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className="text-text-secondary dark:text-blue-300 focus:bg-bg-alt dark:focus:bg-gray-700 focus:text-text-secondary dark:focus:text-blue-300"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="3"
                    className="text-text-secondary dark:text-blue-300 focus:bg-bg-alt dark:focus:bg-gray-700 focus:text-text-secondary dark:focus:text-blue-300"
                  >
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
                Status
              </label>
              <Select
                value={editForm.isActive ? "active" : "inactive"}
                onValueChange={(value) => handleInputChange('isActive', value === "active")}
              >
                <SelectTrigger className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700">
                  <SelectItem
                    value="active"
                    className="text-text-secondary dark:text-blue-300 focus:bg-bg-alt dark:focus:bg-gray-700 focus:text-text-secondary dark:focus:text-blue-300"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="text-text-secondary dark:text-blue-300 focus:bg-bg-alt dark:focus:bg-gray-700 focus:text-text-secondary dark:focus:text-blue-300"
                  >
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Options */}
          {question.questionType?.hasOptions && editForm.questionOptions.length > 0 && (
            <div className="border-t border-border-light dark:border-gray-700 pt-6 space-y-4">
              <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
                Options
              </label>
              <div className="space-y-4">
                {editForm.questionOptions.map((option, index) => (
                  <Card
                    key={index}
                    className="border-2 border-border-light dark:border-gray-700 bg-card-bg dark:bg-gray-800 shadow-sm"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-text-secondary dark:text-blue-300">
                          Option {index + 1}
                        </span>
                      </div>

                      {/* Option Text */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
                          Option Text
                        </label>
                        <Input
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                          placeholder={`Enter option ${index + 1} text`}
                          className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 placeholder:text-text/60 dark:placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                          required
                        />
                      </div>

                      {/* Option Order */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary dark:text-blue-300">
                          Option Order
                        </label>
                        <Input
                          type="number"
                          value={option.optionOrder}
                          onChange={(e) => handleOptionChange(index, 'optionOrder', parseInt(e.target.value) || index)}
                          className="bg-card-bg dark:bg-gray-900 border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 placeholder:text-text/60 dark:placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 transition-colors"
                          min="0"
                        />
                      </div>

                      {/* Is Correct */}
                      <label className="flex items-center gap-3 p-2 border border-border-light dark:border-gray-700 rounded-lg hover:bg-bg-alt dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 text-primary dark:text-blue-500 focus:ring-primary/20 dark:focus:ring-blue-500/20"
                        />
                        <span className="font-medium text-text-secondary dark:text-blue-300">
                          Correct Answer
                        </span>
                        {option.isCorrect && (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
                        )}
                      </label>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-light dark:border-gray-700 pt-6">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="border-border-light dark:border-gray-700 text-text-secondary dark:text-blue-300 hover:bg-bg-alt dark:hover:bg-gray-700 hover:border-primary dark:hover:border-blue-500 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={isSaving || !editForm.questionText.trim()}
            className="bg-primary dark:bg-blue-700 hover:bg-button-primary-hover dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuestionEditDialog