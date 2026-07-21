'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  Lock,
} from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import HomeExerciseCard from '@/components/home/ExerciseCard'
import { exercises, pregnancyCalendar } from '@/lib/data'
import { getTrimester, getLocalDateBR, getDefaultAvatar } from '@/lib/utils'
import { getDailyExercises } from '@/lib/daily-exercises'
import { customSignOut, getCurrentUser } from '@/lib/customAuth'
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
import { useUserAccess } from '@/lib/hooks/useUserAccess'

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

  const src = preview || currentAvatar || getDefaultAvatar(user?.id ?? 'default')

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
            <Link
              href="/meus-ebooks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-warm-50 transition-colors"
            >
              <BookOpen size={15} className="text-primary-400" />
              Meus Ebooks
            </Link>
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
  const [guardReady, setGuardReady] = useState(false)

  // Guard: redireciona para login ou onboarding se necessário
  useEffect(() => {
    const guard = async () => {
      const user = getCurrentUser()
      if (!user) {
        router.replace('/login')
        return
      }
      // Flag local evita redirect de volta ao onboarding por lag do Supabase
      const localCompleted = localStorage.getItem('onboarding_completed') === 'true'
      if (!localCompleted) {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        if (data && !data.onboarding_completed) {
          router.replace('/onboarding')
          return
        }
      }
      setGuardReady(true)
    }
    guard()
  }, [router])

  // Get store state
  const store = useActivityStore()
  const header = useUserHeader()
  const stats = useUserStats()
  const ranking = useRanking()
  const isLoading = store.isLoading
  const { isPartoOnly } = useUserAccess()

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

  const today = getLocalDateBR()
  const currentUser = getCurrentUser()

  // Memoizado: evita recomputar a cada re-render (melhora INP)
  const completedIds = useMemo(
    () => store.activities.map((a) => a.exercise_id),
    [store.activities]
  )

  const trailStatus = useMemo(
    () => getTrailStatus(completedIds, header.trimester),
    [completedIds, header.trimester]
  )
  const educationTrailStatus = useMemo(
    () => !trailStatus ? getEducationTrailStatus(completedIds) : null,
    [trailStatus, completedIds]
  )
  const partoTrailStatus = useMemo(
    () => !trailStatus && !educationTrailStatus
      ? getPartoTrailStatus(completedIds, header.week)
      : null,
    [trailStatus, educationTrailStatus, completedIds, header.week]
  )

  const todayExercises = useMemo(
    () => currentUser
      ? getDailyExercises(currentUser.id, today, header.trimester, exercises)
      : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?.id, today, header.trimester]
  )

  const weekStartStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    return getLocalDateBR(d)
  }, [today])

  const videoExerciseIds = useMemo(() => {
    const VIDEO_CATEGORIES = new Set(['introducao', 'educacao', 'parto', 'apoio', 'meditacao'])
    return new Set(exercises.filter((e) => VIDEO_CATEGORIES.has(e.category)).map((e) => e.id))
  }, [])

  const weeklyDoneCount = useMemo(() => {
    const activitiesThisWeek = store.activities.filter(
      (a) =>
        a.activity_date >= weekStartStr &&
        a.activity_date <= today &&
        !videoExerciseIds.has(a.exercise_id)
    )
    const uniqueDays = new Set(activitiesThisWeek.map((a) => a.activity_date))
    return Math.min(uniqueDays.size, WEEKLY_GOAL)
  }, [store.activities, weekStartStr, today, videoExerciseIds])

  const currentUserId = store.userProfile?.id
  const userRanking = useMemo(
    () => ranking.find((r) => r.user_id === currentUserId),
    [ranking, currentUserId]
  )
  const userRankingPosition = useMemo(
    () => userRanking
      ? ranking.filter(r => r.total_points > userRanking.total_points).length + 1
      : 0,
    [ranking, userRanking]
  )

  const isNewUser = useMemo(() => {
    const created = store.userProfile?.account_created_at
    if (!created) return false
    const days = (Date.now() - new Date(created).getTime()) / 86_400_000
    return days < 14
  }, [store.userProfile?.account_created_at])

  if (!guardReady || (isLoading && !store.userProfile)) {
    return (
      <div className="min-h-screen bg-white" />
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
            {!isPartoOnly && (
              <Link
                href="/biblioteca"
                className="text-xs font-semibold text-primary-400 hover:text-primary-500"
              >
                Ver todos
              </Link>
            )}
          </div>

          {isPartoOnly ? (
            <div className="relative rounded-2xl overflow-hidden">
              {/* Cards desfocados ao fundo */}
              <div className="space-y-2.5 blur-sm pointer-events-none select-none">
                {todayExercises.slice(0, 3).map((ex) => (
                  <HomeExerciseCard
                    key={ex.id}
                    exercise={ex}
                    done={false}
                  />
                ))}
              </div>
              {/* Overlay com cadeado */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl gap-3 px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}>
                  <Lock size={22} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-800">Disponível no app completo</p>
                  <p className="text-xs text-gray-500 mt-1">Exercícios diários personalizados por trimestre</p>
                </div>
                <Link
                  href="/upgrade"
                  className="text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
                >
                  Fazer upgrade
                </Link>
              </div>
            </div>
          ) : (
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
          )}
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
