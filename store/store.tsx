'use client';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import questionReducer from './question';
import supervisorReducer from './supervisor'
import adminReducer from './admin'
import chapterReducer from './chapter';
import getData from './getData'
import userReducer from './user'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionReducer,
    data: getData,
    admin:adminReducer,
    chapter:chapterReducer,
    supervisor:supervisorReducer,
    user:userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch