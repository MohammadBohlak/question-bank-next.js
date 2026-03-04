'use client'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from storage (choose one based on your setup)
    const token = localStorage.getItem('token') || ''

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface QuestionType {
  id: number,
  name: string,
  code: string,
  hasOptions: boolean,
  hasCorrectAnswer: boolean,
  allowMultipleAnswers: boolean,
  isAutoCorrect: boolean
}
interface QuestionData {
  id?: number
  chapterId?: number,
  questionTypeId?: number,
  questionText: string,
  notes?: string,
  timeLimit?: number | null,
  courseId?: number;
  wordsLimit?: number,
  isActive?: boolean,
  difficultyLevel: number,
  questionOptions: {
    id?: number
    optionText: string,
    optionOrder: number,
    isCorrect: boolean
  }[]
}

export interface EditQuestion {
  id: number,
  questionText: string,
  notes: string,
  difficultyLevel: number
  isActive: boolean,
  questionOptions: {
    id: number,
    optionText: string,
    optionOrder: number,
    isCorrect: boolean
  }[]
}


interface UnconfirmedQuestion {
  id: number,
  chapterId: number,
  questionTypeId: number,
  questionText: string,
  questionImagePath: string | null,
  notes: string,
  timeLimit: number | null,
  courseId: number;
  course: string;
  wordsLimit: number,
  isActive: boolean,
  userId: number | null,
  createdAt: string,
  updatedAt: string,
  difficultyLevel: number,
  confirmed: boolean,
  chapter: {
    id: number,
    courseBankId: number,
    title: string,
    description: string,
    order: number,
    createdAt: string,
    updatedAt: string
  },
  questionOptions: {
    id: number,
    questionId: number,
    optionText: string,
    optionImagePath: string | null,
    optionOrder: number,
    isCorrect: boolean,
    createdAt: string
  }[]
  ,
  questionType: QuestionType
}

interface TemplateForm {
  templatesCount: number,
  questionsCount: number,
  instructions: string,
  courseBankId: number,
  totalMark: number,
  totalTime: number,
  randomQuestions: boolean,
  lastExamRepeatLimit1: number|null,
  lastExamRepeatLimit2: number|null,
  lastExamRepeatLimit3: number|null,
  lastOthersExamRepeatLimit: number|null,
  chapterSettings: {
    chapterId: number,
    count: number
  }[

  ],
  levelsSettings: {
    level: number,
    count: number
  }[

  ],
  typeSettings: {
    questionTypeId: number,
    count: number
  }[

  ]
}

interface TemplateDetails {
  id: number,
  code: string,
  instructions: string,
  totalMark: number,
  totalTime: number,
  questionsCount: number,
  templateQuestions: {
    id: number,
    templateId: number,
    questionId: number,
    createdAt: string,
    questionOrder: number,
    assignedPoints: number,
    question: {
      id: number,
      chapterId: number,
      questionTypeId: number,
      questionText: string | null,
      questionImagePath: string | null,
      notes: string | null,
      timeLimit: number,
      wordsLimit: number,
      isActive: boolean,
      userId: number,
      createdAt: string,
      updatedAt: string,
      difficultyLevel: number,
      confirmed: boolean,
      chapter: {
        id: number,
        courseBankId: number,
        title: string,
        description: string | null,
        order: number,
        createdAt: string,
        updatedAt: string
      },
      questionOptions: {
        id: number,
        questionId: number,
        optionText: string,
        optionImagePath: string | null,
        optionOrder: number,
        isCorrect: boolean,
        createdAt: string
      }[],
      questionType: {
        id: number,
        name: string,
        code: string,
        hasOptions: boolean,
        hasCorrectAnswer: boolean,
        allowMultipleAnswers: boolean,
        isAutoCorrect: boolean
      }
    }
  }[]

}
interface BankTemplate {
  id: number,
  code: string,
  supervisorId: number,
  supervisor: string,
  courseId: number,
  course: string,
  questionsCount: number,
  chaptersCount: number,
  createdAt: string,
  isActive: boolean,
  templates: {
    id: number,
    createdAt?: string,
    code: string,
    instructions: string,
    totalMark: number,
    totalTime: number,
    questionsCount: number
  }[]
}
export const getUnconfirmedQuestions = createAsyncThunk(
  'questions/getUnconfirmed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Questions/GetNotConfirmedQuestions`)
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const createQuestion = createAsyncThunk(
  'questions/create',
  async ( questionData: QuestionData , { rejectWithValue }) => {
    try {
      const response = await api.post(`/Questions`,questionData
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'questions/update',
  async (data: { body: EditQuestion, id: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/Questions/${data.id}`,
        data.body
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const confirmQuestion = createAsyncThunk(
  'questions/confirm',
  async ( id: number , { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/Questions/ConfirmQuestion/${id}/`,
        {}
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'questions/delete',
  async ( id: number , { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/Questions/${id}`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const getQuestionTypes = createAsyncThunk(
  'questions/getQuestionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/QuestionTypes`)
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const createTemplate = createAsyncThunk(
  'questions/createTemplate',
  async ( body: TemplateForm , { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/Template/GenerateTemplates`,
        body
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const getBankTemplates = createAsyncThunk(
  'questions/getBankTemplates',
  async ( id: number , { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/CourseBanks/GetCourseBankTemplates/${id}`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const getTemplateById = createAsyncThunk(
  'questions/getTemplateById',
  async ( id: number , { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/Template/${id}`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

export const deleteTemplate = createAsyncThunk(
  'questions/deleteTemplate',
  async ( id: number , { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/Template/${id}`
      )
      return response.data
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

interface QuestionState {
  unConfirmedQuestions: UnconfirmedQuestion[]
  questionsTypes: QuestionType[]
  templateDetails: TemplateDetails | null
  bankTemplates: BankTemplate | null
  loading: boolean
  error: string | null
}

const initialState: QuestionState = {
  unConfirmedQuestions: [],
  questionsTypes: [],
  bankTemplates: null,
  templateDetails: null,
  loading: false,
  error: null,
}

const questionSlice = createSlice({
  name: 'questions',
  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUnconfirmedQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUnconfirmedQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.unConfirmedQuestions = action.payload

      })
      .addCase(getUnconfirmedQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(createQuestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createQuestion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(updateQuestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateQuestion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteQuestion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(confirmQuestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(confirmQuestion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(confirmQuestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(getQuestionTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getQuestionTypes.fulfilled, (state, action) => {
        state.loading = false
        state.questionsTypes = action.payload
      })
      .addCase(getQuestionTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(getBankTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBankTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.bankTemplates = action.payload
      })
      .addCase(getBankTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(getTemplateById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTemplateById.fulfilled, (state, action) => {
        state.loading = false
        state.templateDetails = action.payload
      })
      .addCase(getTemplateById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })


  },
})

export default questionSlice.reducer
