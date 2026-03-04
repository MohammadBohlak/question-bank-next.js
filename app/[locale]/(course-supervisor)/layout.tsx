// app/[locale]/(course-supervisor)/layout.tsx
'use client'

import RouteGuard from "@/components/RouteGuard"
import Sidebar from "@/components/Sidebar"
import AuthInitializer from "@/components/AuthInitializer"

import { initializeAuth } from '@/store/auth'
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/store"

export default function CourseSupervisorLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])
  return (
    <>
      <AuthInitializer />
      <RouteGuard allowedRoles={['exm_CourseSupervisor']}>
        <>
          <div className="flex h-screen bg-bg text-text">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </>
      </RouteGuard>
    </>
  )
}