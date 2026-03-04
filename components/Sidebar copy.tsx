'use client'
import React, { useEffect, useState } from 'react'
// import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Moon,
  Sun,
  Menu,
  ClipboardList,
  Languages, Building , User2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useTranslations } from 'next-intl'
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [roleFromStorage, setRoleFromStorage] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('sidebar')
  const router = useRouter()
  const pathname = usePathname()
  // const t = useTranslations('sidebar')
  const locale = useLocale()

  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize dark mode from localStorage
  useEffect(() => {
    if (!mounted) return

    const savedMode = localStorage.getItem('mod')
    if (savedMode) {
      const isDark = savedMode === 'dark'
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [mounted])

  const toggleDarkMode = () => {
    if (!mounted) return
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('mod', newDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const toggleLanguage = () => {
    if (!mounted) return

    const newLocale = locale === 'en' ? 'ar' : 'en'

    // Remove current locale from path
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.slice(`/${locale}`.length)
      : pathname

    const newPath = `/${newLocale}${pathWithoutLocale || ''}`

    router.replace(newPath)
  }

  const reduxRoles = useSelector(
    (state: RootState) => state.auth.user?.roles
  )

  useEffect(() => {
    if (!mounted) return
    const stored = localStorage.getItem('roles')
    if (stored) setRoleFromStorage(stored)
  }, [mounted])

  const normalizeRoles = (r: unknown): string[] => {
    if (!Array.isArray(r)) return []
    if (Array.isArray(r[0])) return r.flat()
    return r
  }

  const adminLinks = [
    {
      name: t('universities'),
      icon: Building,
      value: 'universities_management'
    },
    {
      name: t('users'),
      icon: User2,
      value: 'users'
    },
  ]

  const logout = () => {
    if (!mounted) return
    localStorage.removeItem('token')
    localStorage.removeItem('roles')
    router.push('/')
  }

  const rawRoles = reduxRoles ?? (roleFromStorage ? JSON.parse(roleFromStorage) : [])
  const roles = normalizeRoles(rawRoles)

  const isAdmin = roles.includes('exm_SuperAdmin')
  const isSupervisor = roles.includes('exm_CourseSupervisor')

  const supervisorLinks = [
    {
      name: t('programBanks'),
      icon: Building,
      value: 'questions_bank'
    },
    {
      name: t('recheckQuestions'),
      icon: ClipboardList,
      value: 'question_recheck'
    },
  ]
  const menuLinks = isAdmin
    ? adminLinks
    : isSupervisor
      ? supervisorLinks
      : []

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <aside className={cn(
        'h-screen bg-card-bg shadow-2xl dark:bg-gray-900 border-r border-border dark:border-gray-800 no-print flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}>
        {/* Loading skeleton */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-800 bg-primary dark:bg-blue-800">
          <div className="h-6 bg-muted/50 dark:bg-gray-700/50 rounded"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'h-screen bg-card-bg shadow-2xl border-l border-2 dark:bg-gray-900 border-r  border-border dark:border-gray-800 no-print md:flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
      dir="rtl"
    >
      <div className="flex items-center gap-3 p-4 border-b border-border
                dark:border-gray-800
                bg-linear-to-l from-primary to-secondary
                dark:from-blue-800 dark:to-blue-900">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo3.png"
            alt={t('questionBank')}
            width={90}
            height={90}
            priority
          />

          {!collapsed && (
            <div className="leading-tight">
              <h2 className="text-sm font-bold text-white font-arabic">
                {t('questionBank')}
              </h2>
              <p className="text-xs text-white/70 font-arabic">
                {t('dashboard')}
              </p>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mr-auto text-white hover:bg-white/10"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-6 space-y-2 px-3">
        {menuLinks.map((item, idx) => {
          const Icon = item.icon
          const isActive = pathname.endsWith(item.value)
          return (
            <button
              onClick={() => router.push(`/${locale}/${item.value.toLowerCase()}`)}
              key={idx}
              className={cn(
                'flex items-center cursor-pointer gap-3 font-medium text-l w-full px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-linear-to-l from-primary to-secondary dark:from-blue-700 dark:to-blue-800 text-white font-semibold'
                  : 'text-text dark:text-gray-300 border border-border dark:border-gray-700 hover:bg-muted dark:hover:bg-gray-800'
              )}

            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isActive ? 'text-white' : 'text-primary dark:text-blue-400'
                )}
              />
              {!collapsed && (
                <span className="font-arabic transition-all duration-300">
                  {item.name}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="mr-auto w-2 h-2 rounded-full bg-accent dark:bg-blue-400"></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Language Toggle */}
      <div className="p-4 border-t border-border dark:border-gray-800">
        <button
          onClick={toggleLanguage}
          className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 rounded-lg
           border border-border dark:border-gray-700 text-text-secondary dark:text-gray-300
           bg-card-bg dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700/50 transition-colors duration-200"
          style={{
            justifyContent: collapsed ? 'center' : 'space-between',
            flexDirection: locale === 'ar' ? 'row' : 'row-reverse'
          }}
        >
          <div className="relative z-10 flex items-center gap-3">
            <Languages className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            {!collapsed && (
              <span className="relative transition-all duration-300 font-arabic ">
                {locale === 'en' ? t('switchToArabic') : t('switchToEnglish')}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="mr-auto px-3 py-1 text-xs bg-muted dark:bg-gray-700 rounded-lg border border-border-light dark:border-gray-600 font-arabic">
              {locale === 'en' ? 'عربي' : 'English'}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-gray-600/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>

      {/* Dark/Light Mode Toggle */}
      <div className="p-4 bg border-t border-border dark:border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 rounded-lg
           border border-border dark:border-gray-700 text-text-secondary dark:text-gray-300
           bg-card-bg dark:bg-gray-800 hover:bg-muted dark:hover:bg-gray-700/50 transition-colors duration-200"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative w-5 h-5">
              <Sun className={cn(
                "w-5 h-5 absolute transition-all duration-500 transform",
                darkMode
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              )} />
              <Moon className={cn(
                "w-5 h-5 absolute transition-all duration-500 transform",
                darkMode
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              )} />
            </div>

            {!collapsed && (
              <span className="relative transition-all duration-300 font-arabic ">
                {darkMode ? t('lightMode') : t('darkMode')}
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="mr-auto  flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all  duration-500 border-2",
                darkMode
                  ? "bg-yellow-300 dark:bg-yellow-400 border-yellow-300 dark:border-yellow-400"
                  : "bg-muted dark:bg-gray-600 border-border-light dark:border-gray-500"
              )} />
              <span className="text-xs text-text-secondary dark:text-gray-400 font-arabic">
                {darkMode
                  ? (locale === 'ar' ? 'ليلي' : 'Dark')
                  : (locale === 'ar' ? 'نهاري' : 'Light')
                }
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-gray-600/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg
           bg-error dark:bg-red-700 text-white dark:text-gray-100
           hover:bg-error/90 dark:hover:bg-red-800 transition-colors duration-200 relative overflow-hidden group"
        >
          <LogOut className="w-5 h-5 cursor-pointer transition-transform duration-300 group-hover:-translate-x-1" />
          {!collapsed && (
            <span className="font-arabic transition-all duration-300 ">
              {t('logout')}
            </span>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-gray-600/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar