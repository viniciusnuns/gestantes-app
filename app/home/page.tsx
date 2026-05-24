'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import HomeExerciseCard from '@/components/home/ExerciseCard'
import { currentUser, exercises, ranking } from '@/lib/data'
import { useProgress } from '@/lib/useProgress'
import { getTrimester } from '@/lib/utils'
import { getCurrentUser, getUserProfile, customSignOut } from '@/lib/customAuth'
import { calculateCurrentWeek } from '@/lib/utils'
import { LogOut } from 'lucide-react'

const WEEKLY_GOAL = 5

interface UserProfile {
  name: string
  week: number
  onboarding_completed: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { state, toggleExercise, isCompleted, hydrated } = useProgress()
  const [userName, setUserName] = useState('Você')
  const [userWeek, setUserWeek] = useState(currentUser.week)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchUserProfile = async () => {
      try {
        const user = getCurrentUser()
        console.log('[HomePage] getCurrentUser returned:', user)
        if (!user) {
          console.log('[HomePage] No user session found')
          if (!cancelled) setLoading(false)
          return
        }

        console.log('[HomePage] Fetching profile for user:', user.id)
        const profile = await getUserProfile(user.id)
        console.log('[HomePage] Profile loaded:', profile)

        if (profile && !cancelled) {
          console.log('[HomePage] Setting user name:', profile.name)

          // Calculate current week based on registration_date and week_at_registration
          let calculatedWeek = currentUser.week // fallback to default
          if (profile.registration_date && profile.week_at_registration) {
            calculatedWeek = calculateCurrentWeek(profile.registration_date, profile.week_at_registration)
            console.log('[HomePage] Calculated week:', calculatedWeek, 'from registration_date:', profile.registration_date, 'week_at_registration:', profile.week_at_registration)
          } else if (profile.week) {
            // Fallback: use old 'week' field if available
            calculatedWeek = profile.week
            console.log('[HomePage] Using legacy week field:', calculatedWeek)
          }

          setUserName(profile.name || 'Você')
          setUserWeek(calculatedWeek)
        } else {
          console.log('[HomePage] Profile is null, using defaults')
        }
      } catch (error) {
        console.error('[HomePage] Erro ao buscar perfil:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUserProfile()

    return () => {
      cancelled = true
    }
  }, [])

  const trimester = getTrimester(userWeek)
  const todayExercises = exercises
    .filter((ex) => ex.trimester === trimester)
    .slice(0, 3)
  const userRanking = ranking.find((r) => r.name === userName || r.name === 'Você')
  const weeklyDoneCount = Math.min(state.weeklyDone.length, WEEKLY_GOAL)

  if (loading) {
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
              <p className="text-sm opacity-90">Olá, {userName} 💗</p>
              <h1 className="text-2xl font-bold mt-1">
                Você está na semana {userWeek}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {trimester} trimestre · faltam {(40 - userWeek) * 7} dias para o grande dia
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-text-primary">Meta semanal</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Pratique {WEEKLY_GOAL} vezes esta semana
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
            {todayExercises.map((ex) => (
              <HomeExerciseCard
                key={ex.id}
                exercise={ex}
                done={hydrated && isCompleted(ex.id)}
                onClick={() => router.push(`/biblioteca/${ex.id}`)}
              />
            ))}
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
                {state.activeDays.length || 7}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                dias ativos
              </p>
            </Card>
            <Card className="!p-3 text-center">
              <Star size={20} className="mx-auto text-accent-500 mb-1" />
              <p className="text-2xl font-bold text-text-primary leading-none">
                {state.points}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                pontos
              </p>
            </Card>
            <Card className="!p-3 text-center">
              <Award size={20} className="mx-auto text-secondary-500 mb-1" />
              <p className="text-2xl font-bold text-text-primary leading-none">
                #{userRanking?.position ?? 4}
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
                value={Math.min(state.activeDays.length, 7)}
                max={7}
                variant="accent"
                trackClassName="bg-white/30"
                fillClassName="bg-white"
              />
              <p className="text-xs mt-2 opacity-90">
                {Math.min(state.activeDays.length, 7)}/7 dias completos
              </p>
            </div>
          </div>
        </Card>

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
