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
  count: number
  title: string
}

interface Question {
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

interface CourseBankDetails {
  id: number,
  code: string,
  programId: null,
  program: null,
  supervisorId: number,
  supervisor: string,
  courseId: number,
  course: string,
  questionsCount: number,
  chaptersCount: number,
  createdAt: string,
  isActive: true,
  chapters: [
    {
      id: number,
      courseBankId: number,
      title: string,
      description: string,
      order: number,
      createdAt: string,
      updatedAt: string,
      questions: Question[]
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
  ]
}
interface CourseDetails {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  isActive: boolean;
  isPrivate: boolean;
  programId: number;
  supervisorId: number;
  courseBanksCount: number;
  program: string;
  supervisor: string;
  courseBanks: CourseBank[];
}

interface Courses {
  id: number,
  nameAr: string,
  nameEn: string,
  code: string,
  descriptionAr: string,
  descriptionEn: string,
  isActive: boolean,
  isPrivate: boolean,
  programId: number,
  supervisorId: number,
  courseBanksCount: number,
  supervisor: string,
  program: string,
  university: string
}

interface CourseBank {
  id: number;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: number;
  supervisorId: number;
  chaptersCount: number;
  questionsCount: number;
  questionsLevels: QuestionLevel[];
  questionsTypes: QuestionType[];
  course: string;
  supervisor: string;
}

interface QuestionLevel {
  id: number;
  title: string;
  count: number;
}
interface CreatePrivateCourse{
  nameAr: string,
  nameEn: string,
  code: string,
  descriptionAr:string,
  descriptionEn:string
}

interface UpdatePrivateCourse{
  id: number,
  nameAr:string,
  nameEn:string,
  code: string,
  descriptionAr: string,
  descriptionEn:string,
  isActive: boolean
}
// Common error handler
const handleError = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) {
    return error.message || defaultMessage
  }
  return String(error) || defaultMessage
}

// Thunks with reusable types
export const getCourses = createAsyncThunk(
  'supervisor/getCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Courses/GetSupervisorCourses`)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'get coursesbanks failed'))
    }
  }
)

export const createPrivateCourse = createAsyncThunk(
  'supervisor/createPrivateCourse',
  async ( body: CreatePrivateCourse , { rejectWithValue }) => {
    try {
      const response = await api.post(`/Courses/CreatePrivateCourse`, body)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'create PrivateCourse failed'))
    }
  }
)

export const updatePrivateCourse = createAsyncThunk(
  'supervisor/updatePrivateCourse',
  async ( body: UpdatePrivateCourse , { rejectWithValue }) => {
    try {
      const response = await api.put(`/Courses/UpdatePrivateCourse/${body.id}`,body)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'get coursesbanks failed'))
    }
  }
)

export const deletePrivateCourse = createAsyncThunk(
  'supervisor/deletePrivateCourse',
  async (id:number , { rejectWithValue }) => {
    try {
      const response = await api.delete(`/Courses/DeletePrivateCourse/${id}`)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'get coursesbanks failed'))
    }
  }
)

export const getCourseDetails = createAsyncThunk(
  'supervisor/getCourseDetails',
  async ({  id }: { id: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/Courses/GetSupervisorCourseDetails/${id}`)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'get coursesbanks failed'))
    }
  }
)

///admin
export const createBank = createAsyncThunk(
  'supervisor/createbank',
  async (body :{ courseId: number, supervisorId: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/CourseBanks`, body)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'create bank failed'))
    }
  }
)

export const updateBank = createAsyncThunk(
  'supervisor/updateBank',
  async ( body : {id:number, isActive: boolean, supervisorId: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/CourseBanks/${body.id}`, body)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'create bank failed'))
    }
  }
)

export const getCourseBankDetails = createAsyncThunk(
  'supervisor/getCourseBankDetails',
  async ( id : number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/CourseBanks/${id}`
      )
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'get bankDetails failed'))
    }
  }
)

export const getQuestionTypes = createAsyncThunk(
  'supervisor/getQuestionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/QuestionTypes`      )
      return response.data
    } catch (err: unknown) {
      return rejectWithValue(handleError(err, 'fetching questionTypes failed'))
    }
  }
)

interface SupervisorState {
  courses?: Courses[]
  courseDetail?: CourseDetails
  courseBankDetails?: CourseBankDetails | null
  loading: boolean
  error: string | null
}

const initialState: SupervisorState = {
  courseBankDetails: null,
  courses: [],
  loading: false,
  error: null,
}

const supervisorSlice = createSlice({
  name: 'supervisor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== Courses =====
      .addCase(getCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getCourseDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCourseDetails.fulfilled, (state, action) => {
        state.loading = false
        state.courseDetail = action.payload
      })
      .addCase(getCourseDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getCourseBankDetails.fulfilled, (state, action) => {
        state.courseBankDetails = action.payload
      })
  },
})

export default supervisorSlice.reducer