// app/[locale]/unauthorized/page.tsx
"use client"
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export default function UnauthorizedPage() {
  const router = useRouter()
  const locale = useLocale()

  const handleGoBack = () => {
    router.back()
  }
  const roles = useSelector((state:RootState) => state.auth.user?.roles ?? []) || []
    const wtf = useSelector((state:RootState) => state.auth.user) 

  console.log('roles', wtf)

  const handleGoHome = () => {
  if (roles.includes('exm_SuperAdmin')) {
    router.push(`/${locale}/universities_management`)
  } else if (roles.includes('exm_CourseSupervisor')) {
    router.push(`/${locale}/questions_bank`)
  } else {
    router.push(`/${locale}/login`)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            403
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Access Denied
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don`t have permission to access this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}