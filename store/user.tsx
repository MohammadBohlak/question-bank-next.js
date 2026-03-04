'use client'
// /* eslint-disable @typescript-eslint/no-explicit-any */

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

interface SearchedUser {
    id: number,
    username: string,
    fullNameAr: string,
    fullNameEn: string,
    gender: number,
    address: string,
    mobile: string,
    email: string,
    lastLogin: string,
    createDate: string,
    isActive: boolean
}

export const searchUsers = createAsyncThunk(
    'users/search',
    async (data: {
        id?: number,
        nameAr?: string,
        fatherNameAr?: string,
        surnameAr?: string,
        userName?: string,
        email?: string,
        mobile?: string
    }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Users/UsersSearch`, data)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)

export const assignUserToUnivsersity = createAsyncThunk(
    'users/assignToUniversity',
    async (data: {
        userId: number,
        universityId: number
    }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Users/AddUserToUiversity`, data)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)

export const assignUserToProgram = createAsyncThunk(
    'users/assignToProgram',
    async (data: {
        userId: number,
        programId: number
    }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Users/AddUserToProgram`, data)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)
export const createNewUser = createAsyncThunk(
    'users/create',
    async (user: {
        nameAr: string,
        fatherNameAr: string,
        surnameAr: string,
        nameEn: string,
        fatherNameEn: string,
        surnameEn: string,
        gender: number,
        userName: string,
        password: string,
        email: string,
        mobile: string,
        address: string
    }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Users`, user)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)

export const updateUser = createAsyncThunk(
    'users/update',
    async (body: {
        id: number, user: {
            nameAr: string, fatherNameAr: string, surnameAr: string, nameEn: string,
            fatherNameEn: string, surnameEn: string, gender: number, userName: string, password: string, email: string,
            mobile: string,
            address: string
        }
    }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/Users/${body.id}`, body.user)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)

export const deleteUser = createAsyncThunk(
    'users/update',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/Users/${id}`)
            return response.data
        } catch (error: unknown) {
            if (error instanceof Error)
                return rejectWithValue(error.message)
        }
    }
)


interface UsersState {
    searchedUser: SearchedUser | null
    loading: boolean
    error: string | string[] | null
}

const initialState: UsersState = {
    searchedUser: null,
    loading: false,
    error: null,
}


const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(createNewUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createNewUser.fulfilled, (state) => {
                state.loading = false
            })

            .addCase(createNewUser.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as string[]) || 'Login failed'
            })
            .addCase(searchUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.loading = false
                state.searchedUser = action.payload
            })

            .addCase(searchUsers.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as string[]) || 'Login failed'
            })

    },
})
export default usersSlice.reducer





