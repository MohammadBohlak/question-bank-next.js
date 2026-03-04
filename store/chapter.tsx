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
export const updateChapter = createAsyncThunk(
  'Chapters/update',
  async (ChapterData: {
  id: number,
  title: string,
  description: string,
  order: number
}, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/Chapters/${ChapterData.id}`,
      ChapterData)
      return response.data
    } catch (error: unknown) {
      if(error instanceof Error)
      return rejectWithValue(error.message)
    }
  }
)
export const createChapter = createAsyncThunk(
  'Chapters/create',
  async (ChapterData: {
  title:string,
  description:string,
  order:number,
  courseBankId:number
}, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/Chapters`,
        ChapterData
      )
      return response.data
    } catch (error: unknown) {
      if(error instanceof Error)
      return rejectWithValue(error.message)
    }
  }
)
export const deleteChapter = createAsyncThunk(
  'Chapters/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/Chapters/${id}`
      )
      return response.data
    } catch (error: unknown) {
      if(error instanceof Error)
      return rejectWithValue(error.message)
    }
  }
)


interface ChapterState {
  loading: boolean
  error: string | null
}

const initialState: ChapterState = {
  loading: false,
  error: null,
}

const ChapterSlice = createSlice({
  name: 'Chapters',
  initialState,
  
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChapter.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createChapter.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(updateChapter.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateChapter.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateChapter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(deleteChapter.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteChapter.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteChapter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// export const { clearChapter,addChapter } = ChapterSlice.actions
export default ChapterSlice.reducer
