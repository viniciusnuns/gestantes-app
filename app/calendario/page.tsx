'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Baby, Heart, Lightbulb } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import { useUserHeader, useActivityStore, useAccountCreatedAt } from '@/lib/stores/activityStore'
import { pregnancyCalendar } from '@/lib/data'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function CalendarioPage() {
  const guardReady = useAuthGuard()
  const store = useActivityStore()
  const header = useUserHeader()
  const accountCreatedAt = useAccountCreatedAt()
  const completedActivities = store.activities
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get account creation date and current date for month range
  const accountCreatedDate = useMemo(
    () => accountCreatedAt ? new Date(accountCreatedAt) : null,
    [accountCreatedAt]
  )
  const today = new Date()

  const accountCreationYear = accountCreatedDate?.getFullYear() ?? today.getFullYear()
  const accountCreationMonth = accountCreatedDate?.getMonth() ?? today.getMonth()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Reset currentDate if it's before account creation month
  useEffect(() => {
    if (!accountCreatedDate) return
    setCurrentDate((prev) => {
      if (prev.getFullYear() < accountCreationYear ||
          (prev.getFullYear() === accountCreationYear && prev.getMonth() < accountCreationMonth)) {
        return new Date(accountCreationYear, accountCreationMonth, 1)
      }
      if (prev.getFullYear() > currentYear ||
          (prev.getFullYear() === currentYear && prev.getMonth() > currentMonth)) {
        return new Date(currentYear, currentMonth, 1)
      }
      return prev
    })
  }, [accountCreatedDate, accountCreationYear, accountCreationMonth, currentYear, currentMonth])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Check if we can navigate to previous/next month
  const canNavigatePrevious = !(year === accountCreationYear && month === accountCreationMonth)
  const canNavigateNext = !(year === currentYear && month === currentMonth)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = []

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    })
  }

  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
    })
  }

  const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`

  const getActivitiesForDay = (date: Date) => {
    const dateKey = formatDateKey(date)

    // Check if this date is before account creation
    const accountCreatedDateStr = accountCreatedAt ? new Date(accountCreatedAt).toISOString().split('T')[0] : null
    if (accountCreatedDateStr && dateKey < accountCreatedDateStr) {
      return { suggested: [], completed: [] }
    }

    // Simplified: assume 3 activities per day (from trimester)
    const suggested = [1, 2, 3]
    const completed = completedActivities.filter((ca) => ca.activity_date === dateKey)
    return { suggested, completed }
  }

  const getActivityStatus = (suggested: any[], completed: any[]) => {
    if (suggested.length === 0) return 'no-activity'
    // If 3 or more completed, mark as complete (even if more than suggested)
    if (completed.length >= 3) return 'complete'
    if (completed.length > 0) return 'partial'
    return 'empty'
  }

  // Get pregnancy info for current week
  const weekKey = `week${header.week}` as keyof typeof pregnancyCalendar
  const pregnancyInfo = pregnancyCalendar[weekKey] || {
    baby: 'Seu bebê está se desenvolvendo normalmente.',
    body: 'Seu corpo está se adaptando às mudanças da gravidez.',
    tips: []
  }

  const monthName = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  // Calculate week progress (1 to 40)
  const progressPercentage = (header.week / 40) * 100

  if (!guardReady) return null

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header with Week Progress */}
      <header className="gradient-primary text-white px-5 pt-8 pb-8 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm opacity-90 mb-2">CALENDÁRIO GESTACIONAL</p>
          <h1 className="text-4xl font-bold mb-3">{header.week}ª semana</h1>
          <p className="text-sm opacity-90 mb-6">
            {header.trimester} trimestre · {header.daysLeft} dias até o parto
          </p>

          {/* Week Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-white/30 rounded-full h-2.5 mb-2 overflow-hidden">
              <div
                className="bg-white h-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs opacity-75">
              <span>1ª semana</span>
              <span>40ª semana</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 space-y-5">
        {/* Seu bebê & Seu corpo Cards */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-warm-100">
            <div className="flex gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Baby size={24} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary mb-2">Seu bebê</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {pregnancyInfo.baby}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-warm-100">
            <div className="flex gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Heart size={24} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary mb-2">Seu corpo</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {pregnancyInfo.body}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary capitalize mb-4">
              Calendário {monthName.split(' ')[0]}
            </h2>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => canNavigatePrevious && setCurrentDate(new Date(year, month - 1, 1))}
                disabled={!canNavigatePrevious}
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} className={canNavigatePrevious ? "text-primary-600" : "text-gray-300"} />
              </button>

              <div className="text-center flex-1">
                <h3 className="text-sm font-bold text-text-primary capitalize">
                  {monthName}
                </h3>
              </div>

              <button
                onClick={() => canNavigateNext && setCurrentDate(new Date(year, month + 1, 1))}
                disabled={!canNavigateNext}
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} className={canNavigateNext ? "text-primary-600" : "text-gray-300"} />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="w-full mb-4 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Hoje
            </button>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-text-secondary p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayObj, idx) => {
                const { suggested, completed } = getActivitiesForDay(dayObj.date)
                const isToday = dayObj.date.toDateString() === new Date().toDateString()
                const dateKey = formatDateKey(dayObj.date)
                const status = getActivityStatus(suggested, completed)

                const statusStyles = {
                  'complete': 'bg-emerald-500 text-white',
                  'partial': 'bg-yellow-400 text-text-primary',
                  'empty': 'bg-white text-text-primary',
                  'no-activity': 'bg-warm-50 text-text-secondary',
                }

                return (
                  <Link
                    key={idx}
                    href={`/calendario/${dateKey}`}
                    className={`
                      aspect-square rounded-lg p-1.5 flex flex-col items-center justify-center
                      transition-all cursor-pointer border
                      ${
                        dayObj.isCurrentMonth
                          ? statusStyles[status as keyof typeof statusStyles]
                          : 'bg-warm-50 text-text-secondary border-transparent'
                      }
                      ${!dayObj.isCurrentMonth ? 'border-transparent' : 'border-warm-100'}
                      ${isToday ? 'border-2 border-text-primary ring-2 ring-offset-1 ring-text-primary' : ''}
                    `}
                  >
                    <span className="text-sm font-bold">
                      {dayObj.day}
                    </span>

                    {dayObj.isCurrentMonth && suggested.length > 0 && (
                      <span className="text-[10px] mt-0.5 opacity-75">
                        {completed.length}/{suggested.length}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-warm-100 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-text-secondary">3/3 completo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-yellow-400 rounded" />
                <span className="text-text-secondary">1-2/3 parcial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-white border border-warm-100 rounded" />
                <span className="text-text-secondary">0/3 vazio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas para esta semana */}
        {pregnancyInfo.tips && pregnancyInfo.tips.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 border border-warm-100">
            <div className="flex gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={24} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-text-primary pt-2">Dicas para esta semana</h3>
            </div>
            <ul className="space-y-2 ml-4">
              {pregnancyInfo.tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-text-secondary leading-relaxed list-disc">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
