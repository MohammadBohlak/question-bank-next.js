'use client'
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from './store'
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

interface University {
    id: number;
    nameAr: string;
    nameEn: string;
    code: string;
    country: string;
    city: string;
    isPublic: boolean;
    isActive: boolean;
    programsCount: number | null;
    admin: string | null;
    adminId: number | null;
    programs?: Program[];
}
interface Program {
    id: number,
    nameAr: string,
    nameEn: string,
    code: string,
    description: string,
    universityId: number,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    managerId: number,
    coursesCount: number,
    coursesBanksCount: number,
    manager: string
}
interface CreatedProgram {
    nameAr: string,
    nameEn: string,
    code: string,
    description: string,
    universityId: number,
    managerId: number
    id?: number,
    isActive?: boolean,
}

interface AllUsers {
    id: number,
    username: string
    fullNameAr: string
    fullNameEn: string
}

interface Program {
    nameAr: string,
    nameEn: string,
    code: string,
    description: string,
    universityId: number,
    managerId: number
}
interface ProgramDetails {
    id: number,
    nameAr: string,
    nameEn: string,
    code: string,
    description: string,
    universityId: number,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    managerId: number,
    coursesCount: number,
    coursesBanksCount: number,
    manager: string,
    university: string,
    courses: Course[]
}

interface Course {
    id: number,
    nameAr: string,
    nameEn: string,
    code: string,
    descriptionAr: string,
    descriptionEn: string,
    programId: number,
    supervisorId?: number,
    courseBanksCount?: number,
    supervisor?: string,
    isActive?: boolean,
    isPrivate?: boolean,
}
interface CreatedCourse {
    nameAr: string,
    nameEn: string,
    code: string,
    descriptionAr: string,
    descriptionEn: string,
    programId: number
    id?: number
    isActive?: boolean;
    isPrivate?: boolean;
    supervisorId?: number | null;
}

export interface CourseDetails {
    id: number
    nameAr: string
    nameEn: string
    code: string
    descriptionAr: string
    descriptionEn: string
    isActive: boolean
    isPrivate: boolean
    programId: number
    supervisorId: number
    courseBanksCount: number
    program: string
    supervisor: string
    courseBanks: CourseBank[]
}

export interface CourseBank {
    id: number
    code: string
    isActive: boolean
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
    courseId: number
    supervisorId: number
    chaptersCount: number
    questionsCount: number
    questionsLevels: QuestionStat[]
    questionsTypes: QuestionStat[]
    course: string
    supervisor: string
}

export interface QuestionStat {
    id: number
    title: string
    count: number
}


export const fetchUniversities = createAsyncThunk(
    'admin/fetchUniversities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Universitys`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const createUniversity = createAsyncThunk(
    'admin/createUniversity',
    async (body: University, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Universitys`, body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const deleteUniversity = createAsyncThunk(
    'admin/deleteUniversity',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/Universitys/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const updateUniversity = createAsyncThunk(
    'admin/updateUniversity',
    async (data: { id: number, body: University }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/Universitys/${data.id}`, data.body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const getUniversityDetails = createAsyncThunk(
    'admin/getUniversityDetails',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Universitys/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)


export const createCourse = createAsyncThunk(
    'admin/createCourse',
    async (body: CreatedCourse, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Courses`, body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const updateCourse = createAsyncThunk(
    'admin/updateCourse',
    async (data: { id: number, body: CreatedCourse }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/Courses/${data.id}`, data.body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const deleteCourse = createAsyncThunk(
    'admin/deleteCourse',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/Courses/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const getCourseDetails = createAsyncThunk(
    'admin/getCourseDetails',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Courses/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const createProgram = createAsyncThunk(
    'admin/createProgram',
    async (body: CreatedProgram, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Programs`, body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const updateProgram = createAsyncThunk(
    'admin/updateProgram',
    async (data: { id: number, body: CreatedProgram }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/Programs/${data.id}`, data.body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const deleteProgram = createAsyncThunk(
    'admin/deleteProgram',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/Programs/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const getProgramDetails = createAsyncThunk(
    'admin/getProgramDetails',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Programs/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const getAllUsers = createAsyncThunk(
    'admin/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Users/GetAll`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)
export const getUniversityUsers = createAsyncThunk(
    'admin/getUniversityUsers',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Users/GetUniversityUsers/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const deleteBank = createAsyncThunk(
    'admin/deleteBank',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/CourseBanks/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)


export const updateBank = createAsyncThunk(
    'admin/updateBank',
    async (data: { id: number, body: { id: number, isActive: boolean, supervisorId: number | null } }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/CourseBanks/${data.id}`, data.body)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

export const getProgramUsers = createAsyncThunk(
    'admin/getProgramUsers',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/Users/GetProgramUsers/${id}`)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

interface AdminState {
    updateManager?: string
    universities?: University[]
    universityDetails?: University
    courseDetails?: CourseDetails
    programDetails?: ProgramDetails
    allUsers?: AllUsers[]
    universityUsers?: AllUsers[]
    programUsers?: AllUsers[]
    loading: boolean
    error: string | null
}

const initialState: AdminState = {
    universities: [],
    loading: false,
    error: null,
}

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchUniversities
            .addCase(fetchUniversities.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUniversities.fulfilled, (state, action) => {
                state.loading = false
                state.universities = action.payload
            })
            .addCase(fetchUniversities.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // createUniversity
            .addCase(createUniversity.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createUniversity.fulfilled, (state, action) => {
                state.loading = false
                if (state.universities && action.payload) {
                    state.universities.push(action.payload)
                }
            })
            .addCase(createUniversity.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // deleteUniversity
            .addCase(deleteUniversity.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteUniversity.fulfilled, (state, action) => {
                state.loading = false
                console.log(action.meta)
                if (state.universities && action.meta.arg) {
                    state.universities = state.universities.filter(
                        uni => uni.id !== action.meta.arg
                    )
                }
            })
            .addCase(deleteUniversity.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // updateUniversity
            .addCase(updateUniversity.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUniversity.fulfilled, (state, action) => {
                state.loading = false
                if (state.universities && action.payload) {
                    const index = state.universities.findIndex(
                        uni => uni.id === action.payload.id
                    )
                    if (index !== -1) {
                        state.universities[index] = action.payload
                    }
                }
            })
            .addCase(updateUniversity.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getUniversityDetails
            .addCase(getUniversityDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getUniversityDetails.fulfilled, (state, action) => {
                state.loading = false
                state.universityDetails = action.payload
            })
            .addCase(getUniversityDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // createCourse
            .addCase(createCourse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // updateCourse
            .addCase(updateCourse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(deleteCourse.pending, (state) => {
                state.loading = true
                state.error = null
            })

            .addCase(deleteCourse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getCourseDetails
            .addCase(getCourseDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCourseDetails.fulfilled, (state, action) => {
                state.loading = false
                state.courseDetails = action.payload
            })
            .addCase(getCourseDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // createProgram
            .addCase(createProgram.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createProgram.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(updateProgram.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProgram.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // deleteProgram
            .addCase(deleteProgram.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteProgram.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getProgramDetails
            .addCase(getProgramDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getProgramDetails.fulfilled, (state, action) => {
                state.loading = false
                state.programDetails = action.payload
            })
            .addCase(getProgramDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getAllUsers
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false
                state.allUsers = action.payload
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getUniversityUsers
            .addCase(getUniversityUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getUniversityUsers.fulfilled, (state, action) => {
                state.loading = false
                state.universityUsers = action.payload
            })
            .addCase(getUniversityUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // getProgramUsers
            .addCase(getProgramUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getProgramUsers.fulfilled, (state, action) => {
                state.loading = false
                state.programUsers = action.payload
            })
            .addCase(getProgramUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})
const selectAdmin = (state: RootState) => state.admin;
export const selectAllUsers = createSelector(
    [selectAdmin],
    (admin) => admin.allUsers || []
);
export default adminSlice.reducer
