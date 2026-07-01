'use client'

import { useEffect, useRef, useState } from 'react'
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
  MessageCircle,
  Camera,
  ChevronDown,
  PlayCircle,
} from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import HomeExerciseCard from '@/components/home/ExerciseCard'
import { exercises, pregnancyCalendar } from '@/lib/data'
import { getTrimester, getLocalDateBR } from '@/lib/utils'
import { getDailyExercises } from '@/lib/daily-exercises'
import { customSignOut, getCurrentUser } from '@/lib/customAuth'
import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'
import { supabase } from '@/lib/supabase'
import {
  useActivityStore,
  useUserHeader,
  useUserStats,
  useRanking,
} from '@/lib/stores/activityStore'
import TrailCard from '@/components/home/TrailCard'
import EducationTrailCard from '@/components/home/EducationTrailCard'
import PartoTrailCard from '@/components/home/PartoTrailCard'
import { getTrailStatus, getEducationTrailStatus, getPartoTrailStatus } from '@/lib/trail'

const WEEKLY_GOAL = 5
const WHATSAPP_NUMBER = '5548988027824'

function whatsappUrl(name: string) {
  const text = encodeURIComponent(`Olá! Sou ${name}, usuária do Gestar em Movimento. Preciso de ajuda com...`)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}

function AvatarMenu({
  currentAvatar,
  onAvatarUpdated,
  name,
  onSignOut,
}: {
  currentAvatar: string | null
  onAvatarUpdated: (url: string) => void
  name: string
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const user = getCurrentUser()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (error) return
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
    localStorage.setItem(`avatar_${user.id}`, publicUrl)
    onAvatarUpdated(publicUrl)
  }

  const src = preview || currentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id ?? 'default'}`

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ChevronDown size={11} className="text-primary-400" />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-[4.5rem] left-0 bg-white rounded-xl shadow-xl border border-warm-100 py-1.5 z-20 w-44">
            <button
              onClick={() => { fileRef.current?.click(); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-warm-50 transition-colors"
            >
              <Camera size={15} className="text-primary-400" />
              Trocar foto
            </button>
            <a
              href={whatsappUrl(name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-warm-50 transition-colors"
            >
              <MessageCircle size={15} className="text-green-500" />
              Falar com suporte
            </a>
            <button
              onClick={() => {
                setOpen(false)
                const user = getCurrentUser()
                if (user?.id) {
                  localStorage.removeItem(`app-tour-done-${user.id}`)
                  localStorage.removeItem(`app-tour-step-${user.id}`)
                }
                window.dispatchEvent(new Event('gem:user-login'))
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-warm-50 transition-colors"
            >
              <PlayCircle size={15} className="text-primary-400" />
              Ver tutorial
            </button>
            <div className="h-px bg-warm-100 mx-3 my-1" />
            <button
              onClick={() => { setOpen(false); onSignOut() }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Sair da conta
            </button>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  // Guard: redireciona para login ou onboarding se necessário
  useEffect(() => {
    const guard = async () => {
      const user = getCurrentUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
      if (data && !data.onboarding_completed) {
        router.replace('/onboarding')
      }
    }
    guard()
  }, [router])

  // Sync optimized page data (4 parallel RPCs)
  useOptimizedSync()

  // Get store state
  const store = useActivityStore()
  const header = useUserHeader()
  const stats = useUserStats()
  const ranking = useRanking()
  const isLoading = store.isLoading

  // Load user avatar from store profile or localStorage
  useEffect(() => {
    if (store.userProfile?.avatar_url) {
      // Prefer avatar from database
      setUserAvatar(store.userProfile.avatar_url)
      // Update localStorage cache
      localStorage.setItem(`avatar_${store.userProfile.id}`, store.userProfile.avatar_url)
    } else {
      // Fall back to localStorage
      const user = getCurrentUser()
      if (user) {
        const cachedAvatar = localStorage.getItem(`avatar_${user.id}`)
        if (cachedAvatar) {
          setUserAvatar(cachedAvatar)
        }
      }
    }
  }, [store.userProfile])

  // Trail status — sequência: Introdução → Educação → Parto (semana 30+)
  const completedIds = store.activities.map((a) => a.exercise_id)
  const trailStatus = getTrailStatus(completedIds, header.trimester)
  const educationTrailStatus = !trailStatus ? getEducationTrailStatus(completedIds) : null
  const partoTrailStatus = !trailStatus && !educationTrailStatus
    ? getPartoTrailStatus(completedIds, header.week)
    : null

  const today = getLocalDateBR()
  const currentUser = getCurrentUser()
  const todayExercises = currentUser
    ? getDailyExercises(currentUser.id, today, header.trimester, exercises)
    : []

  // Calculate weekly done count from activities (count unique DAYS, not activities)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = getLocalDateBR(weekStart)

  const VIDEO_CATEGORIES = new Set(['introducao', 'educacao', 'parto', 'apoio', 'meditacao'])
  const videoExerciseIds = new Set(
    exercises.filter((e) => VIDEO_CATEGORIES.has(e.category)).map((e) => e.id)
  )

  const activitiesThisWeek = store.activities.filter(
    (a) =>
      a.activity_date >= weekStartStr &&
      a.activity_date <= today &&
      !videoExerciseIds.has(a.exercise_id)
  )

  // Count unique days with activities, not total activities
  const uniqueDaysWithActivity = new Set(activitiesThisWeek.map((a) => a.activity_date))
  const weeklyDoneCount = Math.min(uniqueDaysWithActivity.size, WEEKLY_GOAL)

  // Find user in ranking by user_id (more reliable than name)
  const currentUserId = store.userProfile?.id
  const userRanking = ranking.find((r) => r.user_id === currentUserId)
  // Tiebreaker: user sees themselves above others with same points
  const userRankingPosition = userRanking
    ? ranking.filter(r => r.total_points > userRanking.total_points).length + 1
    : 0

  // Nova usuária = menos de 14 dias desde o cadastro
  const isNewUser = (() => {
    const created = store.userProfile?.account_created_at
    if (!created) return false
    const days = (Date.now() - new Date(created).getTime()) / 86_400_000
    return days < 14
  })()

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
    { href: '/meus-ebooks', label: 'Ebooks', icon: Lightbulb, tone: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Greeting Header */}
      <header className="gradient-primary text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <AvatarMenu
                currentAvatar={userAvatar}
                onAvatarUpdated={(url) => setUserAvatar(url)}
                name={header.name}
                onSignOut={() => { customSignOut(); router.push('/') }}
              />
              <div className="flex-1">
                <p className="text-sm opacity-90">Olá, {header.name} 💗</p>
                <h1 className="text-xl font-bold mt-1 whitespace-nowrap">
                  Você está na semana {header.week}
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  {header.trimester} trimestre · faltam {header.daysLeft} dias para o grande dia
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 -mt-6 space-y-5">
        {/* Trail — Comece por aqui → Vamos Aprender → Preparação para o Parto */}
        {trailStatus ? (
          <TrailCard status={trailStatus} />
        ) : educationTrailStatus ? (
          <EducationTrailCard status={educationTrailStatus} />
        ) : partoTrailStatus ? (
          <PartoTrailCard status={partoTrailStatus} />
        ) : null}

        {/* Weekly Meta */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-text-primary">Meta semanal</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Pratique no mínimo {WEEKLY_GOAL} dias esta semana
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <ProgressBar
            value={weeklyDoneCount}
            max={WEEKLY_GOAL}
            variant="gradient"
            showLabel
            label="Dias com práticas concluídas"
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
                #{userRankingPosition}
              </p>
              <p className="text-[11px] text-text-secondary mt-1 leading-tight">
                ranking
              </p>
            </Card>
          </div>
        </section>

        {/* Weekly Challenge */}
        {/* Desafio: Vídeos de Introdução */}
        {(() => {
          const trailDone = !trailStatus ? 5 : trailStatus.type === 'initial' ? trailStatus.done : 4
          const trailTotal = 5
          const trailComplete = !trailStatus
          return (
            <Card className="!p-0 overflow-hidden">
              <div className="gradient-secondary text-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider opacity-90">
                      Primeiro desafio
                    </p>
                    <h3 className="text-lg font-bold mt-1">
                      Vídeos de Introdução
                    </h3>
                    <p className="text-sm opacity-90 mt-1">
                      {trailComplete
                        ? 'Parabéns! Você completou a introdução 🎉'
                        : `Assista os ${trailTotal} vídeos para liberar todos os exercícios`}
                    </p>
                  </div>
                  <span className="text-3xl ml-2">{trailComplete ? '✅' : '🎯'}</span>
                </div>
                <div className="mt-4">
                  <ProgressBar
                    value={trailDone}
                    max={trailTotal}
                    variant="accent"
                    trackClassName="bg-white/30"
                    fillClassName="bg-white"
                  />
                  <p className="text-xs mt-2 opacity-90">
                    {trailDone}/{trailTotal} vídeos assistidos
                  </p>
                </div>
              </div>
            </Card>
          )
        })()}

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
        {/* Suporte fixo — sempre visível */}
        <a
          href={whatsappUrl(header.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 text-sm text-green-700 font-medium hover:text-green-800 transition-colors"
        >
          <MessageCircle size={16} />
          Precisa de ajuda? Fale pelo WhatsApp
        </a>
      </main>

      <BottomNav />
    </div>
  )
}
