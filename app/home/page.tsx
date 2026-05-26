'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Calendar,
  Users,
  Trophy,
  Baby,
  Flame,
  Star,
  Award,
  LogOut,
  Lightbulb,
} from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import HomeExerciseCard from '@/components/home/ExerciseCard'
import { exercises, pregnancyCalendar } from '@/lib/data'
import { getTrimester } from '@/lib/utils'
import { customSignOut } from '@/lib/customAuth'
import { useActivityInit } from '@/lib/hooks/useActivityInit'
import {
  useActivityStore,
  useUserHeader,
  useUserStats,
  useRanking,
} from '@/lib/stores/activityStore'

const WEEKLY_GOAL = 5

export default function HomePage() {
  const router = useRouter()

  // Initialize activity store on component mount
  useActivityInit()

  // Get store state
  const store = useActivityStore()
  const header = useUserHeader()
  const stats = useUserStats()
  const ranking = useRanking()
  const isLoading = store.isLoading

  // Get suggested exercises for today (from trimester, no daily_activities needed)
  const today = new Date().toISOString().split('T')[0]
  const todayExercises = exercises.filter((ex) => ex.trimester === header.trimester).slice(0, 3)

  // Calculate weekly done count from activities
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const activitiesThisWeek = store.activities.filter(
    (a) => a.activity_date >= weekStartStr && a.activity_date <= today
  )
  const weeklyDoneCount = Math.min(activitiesThisWeek.length, WEEKLY_GOAL)

  // Calculate which days of the week have activities
  const weekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const weekDaysActive = new Array(7).fill(false)
  activitiesThisWeek.forEach((activity) => {
    const actDate = new Date(activity.activity_date + 'T00:00:00')
    const dayIndex = actDate.getDay()
    weekDaysActive[dayIndex] = true
  })

  // Find user in ranking
  const userRanking = ranking.find((r) => r.name === header.name)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  const quickLinks = [
    { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen, tone: 'bg-primary-100 text-primary-600' },
    { href: '/calendario', label: 'Calendário', icon: Calendar, tone: 'bg-secondary-100 text-secondary-600' },
    { href: '/comunidade', label: 'Comunidade', icon: Users, tone: 'bg-accent-100 text-accent-700' },
    { href: '/progresso', label: 'Ranking', icon: Trophy, tone: 'bg-emerald-100 text-emerald-700' },
    { href: '/biblioteca?cat=parto', label: 'Parto', icon: Baby, tone: 'bg-rose-100 text-rose-600' },
  ]

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Greeting Header */}
      <header className="gradient-primary text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm opacity-90">Olá, {header.name} 💗</p>
              <h1 className="text-2xl font-bold mt-1">
                Você está na semana {header.week}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {header.trimester} trimestre · faltam {header.daysLeft} dias para o grande dia
              </p>
            </div>
            <button
              onClick={() => {
                customSignOut()
                router.push('/')
              }}
              className="ml-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 text-sm font-medium"
              title="Sair da conta"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 -mt-6 space-y-5">
        {/* Weekly Meta */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-text-primary">Meta semanal</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Pratique {WEEKLY_GOAL} dias esta semana
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <ProgressBar
            value={weeklyDoneCount}
            max={WEEKLY_GOAL}
            variant="gradient"
            showLabel
            label="Práticas concluídas"
          />

          {/* Weekly Evolution Bar */}
          <div className="mt-5 pt-5 border-t border-warm-100">
            <p className="text-xs font-semibold text-text-secondary mb-3">Evolução semanal</p>
            <div className="grid grid-cols-7 gap-2">
              {weekDayLabels.map((label, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      weekDaysActive[idx]
                        ? 'bg-primary-300 text-white'
                        : 'bg-warm-100 text-text-light'
                    }`}
                  >
                    {weekDaysActive[idx] ? '✓' : label}
                  </div>
                  <span className="text-[10px] font-medium text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's Exercises */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-semibold text-text-primary">
              Exercícios de hoje
            </h2>
            <Link
              href="/biblioteca"
              className="text-xs font-semibold text-primary-400 hover:text-primary-500"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-2.5">
            {todayExercises.length > 0 ? (
              todayExercises.map((ex) => {
                const doneToday = store.activities.some(
                  (a) => a.exercise_id === ex.id && a.activity_date === today
                )
                return (
                  <HomeExerciseCard
                    key={ex.id}
                    exercise={ex}
                    done={doneToday}
                    onClick={() => router.push(`/biblioteca/${ex.id}`)}
                  />
                )
              })
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                Nenhuma atividade sugerida para hoje. Confira a Biblioteca!
              </p>
            )}
          </div>
        </section>

        {/* Progress Cards */}
        <section>
          <h2 className="font-semibold text-text-primary mb-3 px-1">
            Seu progresso
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="!p-3 text-center">
              <Flame size={20} className="mx-auto text-accent-500 mb-1" />
              <p className="text-2xl font-bold text-text-primary leading-none">
                {stats.active_days || 0}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                dias ativos
              </p>
            </Card>
            <Card className="!p-3 text-center">
              <Star size={20} className="mx-auto text-accent-500 mb-1" />
              <p className="text-2xl font-bold text-text-primary leading-none">
                {stats.total_points || 0}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                pontos
              </p>
            </Card>
            <Card className="!p-3 text-center">
              <Award size={20} className="mx-auto text-secondary-500 mb-1" />
              <p className="text-2xl font-bold text-text-primary leading-none">
                #{userRanking?.position ?? 0}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                ranking
              </p>
            </Card>
          </div>
        </section>

        {/* Weekly Challenge */}
        <Card className="!p-0 overflow-hidden">
          <div className="gradient-secondary text-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider opacity-90">
                  Desafio da semana
                </p>
                <h3 className="text-lg font-bold mt-1">
                  7 dias de respiração consciente
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  Pratique 5 minutos por dia para reduzir a ansiedade
                </p>
              </div>
              <span className="text-3xl ml-2">🌸</span>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={Math.min(stats.active_days || 0, 7)}
                max={7}
                variant="accent"
                trackClassName="bg-white/30"
                fillClassName="bg-white"
              />
              <p className="text-xs mt-2 opacity-90">
                {Math.min(stats.active_days || 0, 7)}/7 dias completos
              </p>
            </div>
          </div>
        </Card>

        {/* Dicas para esta semana */}
        {(() => {
          const getPregnancyInfo = (week: number) => {
            // Tentar semana exata
            let weekKey = `week${week}` as keyof typeof pregnancyCalendar
            let info = pregnancyCalendar[weekKey]

            // Se não encontrar, procurar semana anterior/posterior mais próxima
            if (!info) {
              const availableWeeks = Object.keys(pregnancyCalendar)
                .map(k => parseInt(k.replace('week', '')))
                .sort((a, b) => a - b)

              let closestWeek = availableWeeks[0]
              let minDistance = Math.abs(availableWeeks[0] - week)

              for (const w of availableWeeks) {
                const distance = Math.abs(w - week)
                if (distance < minDistance) {
                  minDistance = distance
                  closestWeek = w
                }
              }

              weekKey = `week${closestWeek}` as keyof typeof pregnancyCalendar
              info = pregnancyCalendar[weekKey]
            }

            return info
          }

          const pregnancyInfo = getPregnancyInfo(header.week)

          if (pregnancyInfo?.tips && pregnancyInfo.tips.length > 0) {
            return (
              <Card className="!p-0 overflow-hidden">
                <div className="p-5">
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
              </Card>
            )
          }
          return null
        })()}

        {/* Quick Access */}
        <section>
          <h2 className="font-semibold text-text-primary mb-3 px-1">
            Acesso rápido
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {quickLinks.map(({ href, label, icon: Icon, tone }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium text-text-secondary text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
