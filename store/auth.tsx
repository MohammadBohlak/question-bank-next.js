'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface LoginCredentials {
  username: string
  password: string
}

interface UserData {
  id: number
  username: string
  email: string,
  fullNameAr: string,
  fullNameEng: string,
  roles: string[],
  permissions: string[]
}

interface LoginResponse {
  id: number
  success: boolean
  message: string
  errors: string[] | null
  result: {
    token: string
    user: UserData
  }
}

interface AuthState {
  user: UserData | null
  token: string
  loading: boolean
  error: string| null
  initialized: boolean

}

const initialState: AuthState = {
  user: null,
  loading: false,
  token: '',
  error: null,
  initialized: false

}

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: LoginResponse }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/Auth/Login`,
        credentials,
        { withCredentials: true }
      )

      // 🔥 IMPORTANT PART
      if (!response.data.success) {
        return rejectWithValue(response.data)
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: 'Login failed',
          errors: ['Login failed'],
          result: null
        }
      )
    }
  }
)


export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/Auth/Logout`,
        {},
        { withCredentials: true }
      )
      // Cookie is cleared by backend — nothing to do on frontend
    } catch (error: unknown) {
      if (error instanceof Error)
        return rejectWithValue(error.message)
    }
  }
)

import { jwtDecode } from 'jwt-decode'

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const decoded: any = jwtDecode(token)

    const rawRoles =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

    return {
      id: Number(
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      ),
      username:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles], // ✅ FIX
      permissions: []
    }
  }
)



const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = {
        ...state.user,
        ...action.payload
      } as UserData
      state.initialized = true
    },

    clearAuth(state) {
      state.user = null
      state.initialized = true
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.result.user
        state.token = action.payload.result.token
        localStorage.setItem(
          "token",
          action.payload.result.token
        )
        state.initialized = true
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false

        if (action.payload) {
          state.error =
            action.payload.errors?.join(' • ') ||
            action.payload.message ||
            'Login failed'
        } else {
          state.error = action.error.message || 'Login failed'
        }

        state.user = null
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null // still clear local state
      })

      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload as UserData | null
        state.initialized = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null
        state.initialized = true
      })
  },
})
export const { setUser, clearAuth } = authSlice.actions
export default authSlice.reducer

