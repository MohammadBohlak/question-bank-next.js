'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface DataState<T> {
  data: T[]
  loading: boolean
  error: string | null
}
interface Programs {
  data: {
    items: [],
    totalCount: null,
    pageNumber: null,
    pageSize: null,
    totalPages: null
  },
  loading: boolean,
  error: string | null
}


interface Course {
  id: number
  code: string
  nameAr: string
  nameEn: string
}

interface ExamCourse {
  id: number
  code: string
  courseName: string
}
interface Assistant {
  id: number,
  fullNameAr: string,
  fullNameEn: string,

}

interface ProgramDetails {
  data: {
    id: number
    programId: number
    programName: string
    code: string
    isActive: boolean
    managerId: number
    managerName: string
    coursesCount: number
    exmCoursesCount: number
    createdAt: string
    updatedAt: string
    courses?: Course[]
    exmCourses?: ExamCourse[]
    assistants: Assistant[]
  } | null
  loading: boolean
  error: string | null
}


interface GetDataState {
  courses: DataState<any>
  tutors: DataState<any>
  banks: DataState<any>
  programs: Programs
  managers: DataState<any>
  programDetails: ProgramDetails
  assistants: DataState<any>
}

const initialState: GetDataState = {
  courses: { data: [], loading: false, error: null },
  tutors: { data: [], loading: false, error: null },
  banks: { data: [], loading: false, error: null },
  programs: {
    data: {
      items: [],
      totalCount: null,
      pageNumber: null,
      pageSize: null,
      totalPages: null
    }, loading: false, error: null
  },
  managers: { data: [], loading: false, error: null },
  programDetails: { data: null, loading: false, error: null } as ProgramDetails,
  assistants: { data: [], loading: false, error: null }
}

// program manager ui data
export const getCourses = createAsyncThunk(
  'getData/getCourses',
  async (programId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/Courses/GetCurrentOpenedCourses/${programId}`,)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses')
    }
  }
)

export const getTutors = createAsyncThunk(
  'getData/getTutors',
  async (courseId: number, { rejectWithValue }) => {
    try {
      console.log(courseId)
      const response = await api.get(`/ProgramManagers/GetCurrentTutors/${courseId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tutors')
    }
  }
)

// admin ui data
export const getPrograms = createAsyncThunk(
  'getData/getPrograms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/Programs`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch programs'
      )
    }
  }
)

export const getProgramsBanks = createAsyncThunk(
  'getData/getProgramsBanks',
  async (_, { rejectWithValue }) => {

    try {
      const response = await api.get(
        `/ExmPrograms`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch programs'
      )
    }
  }
)


export const getManagers = createAsyncThunk(
  'getData/getManagers',
  async (_, { rejectWithValue }) => {

    try {
      const response = await api.get(`/ProgramManagers/GetAll`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch managers')
    }
  }
)

export const getAssistants = createAsyncThunk(
  'getData/getAssistants',
  async ( programId: string , { rejectWithValue }) => {
    try {
      const response = await api.get(`/ProgramManagers/GetProgramManagerAassisstants/${programId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assistants')
    }
  }
)

export const assignAssistant = createAsyncThunk(
  'getData/assignAssistant',
  async ( assistantId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/ProgramManagers/AssignProgramManagerAassisstantToBank/${assistantId}`,
        {},)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign assistant')
    }
  }
)


export const getprogramDetails = createAsyncThunk(
  'getData/getprogramDetails',
  async (id:number, { rejectWithValue }) => {

    try {
      const response = await api.get(`/ExmPrograms/Details/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch managers')
    }
  }
)


const getDataSlice = createSlice({
  name: 'getData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🟦 getCourses
      .addCase(getCourses.pending, (state) => {
        state.courses.loading = true
        state.courses.error = null
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.courses.loading = false
        state.courses.data = action.payload.result || action.payload
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.courses.loading = false
        state.courses.error = action.payload as string
      })

      .addCase(getTutors.pending, (state) => {
        state.tutors.loading = true
        state.tutors.error = null
      })
      .addCase(getTutors.fulfilled, (state, action) => {
        state.tutors.loading = false
        state.tutors.data = action.payload.result || action.payload
      })
      .addCase(getTutors.rejected, (state, action) => {
        state.tutors.loading = false
        state.tutors.error = action.payload as string
      })

      .addCase(getProgramsBanks.pending, (state) => {
        state.banks.loading = true
        state.banks.error = null
      })
      .addCase(getProgramsBanks.fulfilled, (state, action) => {
        state.banks.loading = false
        state.banks.data = action.payload.result || action.payload
      })
      .addCase(getProgramsBanks.rejected, (state, action) => {
        state.banks.loading = false
        state.banks.error = action.payload as string
      })

      .addCase(getPrograms.pending, (state) => {
        state.programs.loading = true
        state.programs.error = null
      })
      .addCase(getPrograms.fulfilled, (state, action) => {
        state.programs.loading = false
        state.programs.data = action.payload.result || action.payload
      })
      .addCase(getPrograms.rejected, (state, action) => {
        state.programs.loading = false
        state.programs.error = action.payload as string
      })

      .addCase(getManagers.pending, (state) => {
        state.managers.loading = true
        state.managers.error = null
      })
      .addCase(getManagers.fulfilled, (state, action) => {
        state.managers.loading = false
        state.managers.data = action.payload.result || action.payload
      })
      .addCase(getManagers.rejected, (state, action) => {
        state.managers.loading = false
        state.managers.error = action.payload as string
      })

      .addCase(getprogramDetails.pending, (state) => {
        state.programDetails.loading = true
        state.programDetails.error = null
      })
      .addCase(getprogramDetails.fulfilled, (state, action) => {
        state.programDetails.loading = false
        state.programDetails.data = action.payload.result || action.payload
      })
      .addCase(getprogramDetails.rejected, (state, action) => {
        state.programDetails.loading = false
        state.programDetails.error = action.payload as string
      })


      // Add to your extraReducers
      .addCase(getAssistants.pending, (state) => {
        state.assistants.loading = true
        state.assistants.error = null
      })
      .addCase(getAssistants.fulfilled, (state, action) => {
        state.assistants.loading = false
        state.assistants.data = action.payload.result || action.payload
      })
      .addCase(getAssistants.rejected, (state, action) => {
        state.assistants.loading = false
        state.assistants.error = action.payload as string
      })
      .addCase(assignAssistant.pending, (state) => {
        state.assistants.loading = true
      })
      .addCase(assignAssistant.fulfilled, (state) => {
        state.assistants.loading = false
      })
      .addCase(assignAssistant.rejected, (state, action) => {
        state.assistants.loading = false
        state.assistants.error = action.payload as string
      })
  },
})

export default getDataSlice.reducer
