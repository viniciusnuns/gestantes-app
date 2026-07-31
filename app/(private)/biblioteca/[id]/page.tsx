'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Check,
  Sparkles,
  Play,
} from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Badge from '@/components/shared/Badge'
import Button from '@/components/shared/Button'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { useExercise } from '@/lib/hooks/useExercise'
import { useActivityStore, useActivityMutations, useUserHeader } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useUserAccess, PARTO_INTRO_IDS } from '@/lib/hooks/useUserAccess'
import { cn, getLocalDateBR } from '@/lib/utils'
import { isTrailVideo, getNextTrailVideoId, isEducationVideo, getNextEducationVideoId, isPartoVideo, getNextPartoVideoId } from '@/lib/trail'

interface PageProps {
  params: { id: string }
}

export default function ExerciseDetailPage({ params }: PageProps) {
  const guardReady = useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const store = useActivityStore()
  const { addActivity } = useActivityMutations()
  const header = useUserHeader()
  const [justCompleted, setJustCompleted] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  const { exercise, isLoading: isExerciseLoading, error: exerciseError } =
    useExercise(params.id)
  const today = getLocalDateBR()
  const targetDate = dateParam || today
  const { canAccessExercise, isPartoOnly, isDoresOnly } = useUserAccess()

  // Restaura threshold do localStorage quando o exercício carrega
  useEffect(() => {
    if (!exercise?.id) return
    if (localStorage.getItem(`video_threshold_${exercise.id}`) === '1') {
      setVideoProgress(0.8)
    }
  }, [exercise?.id])

  if (!guardReady) return <div className="min-h-screen bg-warm-50"><BottomNav /></div>

  if (isExerciseLoading) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 pb-24">
        <p className="text-sm text-text-secondary">Carregando exercício...</p>
        <BottomNav />
      </div>
    )
  }

  // Bloqueia acesso direto via URL a conteúdo fora do plano (inclui intro restrita para parto)
  if (exercise && !canAccessExercise(exercise.id, exercise.category)) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 pb-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-lg font-black text-gray-800 mb-2">Conteúdo não incluso no seu plano</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Este exercício faz parte do app completo. Faça upgrade para ter acesso a todo o conteúdo.
        </p>
        <a
          href="/upgrade"
          className="font-bold text-white px-6 py-3 rounded-2xl text-sm mb-3 block"
          style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}
        >
          Ver opções de upgrade
        </a>
        <button onClick={() => router.back()} className="text-sm text-gray-400">
          Voltar
        </button>
        <BottomNav />
      </div>
    )
  }

  if (exerciseError || !exercise) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 pb-24">
        <p className="text-6xl mb-4">🤷‍♀️</p>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Exercício não encontrado
        </h1>
        <p className="text-sm text-text-secondary mb-6 text-center">
          {exerciseError || 'O exercício que você procura pode ter sido removido.'}
        </p>
        <Button onClick={() => router.push('/biblioteca')}>
          Voltar para a biblioteca
        </Button>
        <BottomNav />
      </div>
    )
  }

  const completedIds = store.activities.map((a) => a.exercise_id)

  // Bloquear categorias meditação e parto nos primeiros 7 dias
  const TIMED_LOCKED_CATEGORIES = new Set(['meditacao', 'parto'])
  const accountCreatedAt = store.userProfile?.account_created_at
  const bypassTimeLock = store.userProfile?.bypass_time_lock ?? false
  const daysElapsed = accountCreatedAt
    ? Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / 86_400_000)
    : 999
  const daysLeft = Math.max(0, 7 - daysElapsed)
  // Parto users e usuárias que fizeram upgrade não têm bloqueio por tempo
  const isTimedLocked = !isPartoOnly && !bypassTimeLock && TIMED_LOCKED_CATEGORIES.has(exercise.category) && daysElapsed < 7
  // ex-69 (Exercícios para o Trabalho de Parto) tem trava de 7 dias para usuárias parto
  const isPartoExerciseLocked = isPartoOnly && exercise.id === 'ex-69' && daysElapsed < 7

  if (isTimedLocked || isPartoExerciseLocked) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-6 pb-24">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2 text-center">
          Conteúdo ainda bloqueado
        </h1>
        <p className="text-sm text-text-secondary text-center mb-1">
          {isPartoExerciseLocked
            ? 'Este vídeo será liberado em'
            : `${exercise.category === 'meditacao' ? 'Meditação' : 'Parto'} será liberado em`}
        </p>
        <p className="text-2xl font-bold text-primary-400 mb-4">
          {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
        </p>
        <p className="text-xs text-text-secondary text-center mb-6 max-w-xs">
          {isPartoExerciseLocked
            ? 'Esse conteúdo é liberado 7 dias após a compra para que você aproveite as demais aulas primeiro.'
            : 'Este conteúdo é liberado automaticamente 7 dias após sua inscrição. Aproveite para explorar os exercícios e vídeos disponíveis!'}
        </p>
        <Button onClick={() => router.push('/biblioteca')}>
          Voltar para a biblioteca
        </Button>
        <BottomNav />
      </div>
    )
  }

  // Vídeos de introdução, educação e parto: verificar histórico completo (assistiu alguma vez)
  // Exercícios regulares: verificar apenas hoje
  const VIDEO_CATEGORIES = ['introducao', 'educacao', 'parto', 'apoio', 'meditacao']
  const isVideoCategory = VIDEO_CATEGORIES.includes(exercise.category)
  const completedToday = store.activities.some((a) =>
    a.exercise_id === exercise.id &&
    (isVideoCategory || a.activity_date === today)
  )

  const handleComplete = async () => {
    if (completedToday || isLoading) return

    try {
      setIsLoading(true)
      const user = getCurrentUser()
      if (!user) {
        router.replace('/login')
        return
      }

      await addActivity({
        user_id: user.id,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        points_earned: isVideoCategory ? 2 : 20,
        source: dateParam ? 'calendario' : 'biblioteca',
        daily_activity_id: null,
        activity_date: today,
      })

      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 2500)
      window.dispatchEvent(new Event('gem:achievement-check'))
    } catch (error) {
      console.error('Erro ao completar exercício:', error)
      setSaveError(true)
      setTimeout(() => setSaveError(false), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-28">
      {/* Hero */}
      <div className="relative w-full bg-warm-100">
        {exercise.youtube_video_id ? (
          <YouTubePlayer
            videoId={exercise.youtube_video_id}
            title={exercise.name}
            trackingId={exercise.id}
            onProgress={(p) => setVideoProgress((prev) => {
              const next = Math.max(prev, p)
              if (next >= 0.8 && prev < 0.8 && exercise?.id) {
                localStorage.setItem(`video_threshold_${exercise.id}`, '1')
              }
              return next
            })}
          />
        ) : exercise.image ? (
          <div className="relative aspect-[16/10] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.image}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="aspect-video w-full bg-warm-100 flex items-center justify-center text-sm text-text-secondary">
            Vídeo em breve
          </div>
        )}

        {/* Back button — always visible, on top of media */}
        <button
          type="button"
          onClick={() =>
            dateParam
              ? router.push(`/calendario/${dateParam}`)
              : router.push('/biblioteca')
          }
          aria-label="Voltar"
          style={{ zIndex: 999999999999999 }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur text-text-primary flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <main className="max-w-2xl mx-auto px-5 pt-5 space-y-5">
        {/* Title */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Badge tone="secondary">
              {exercise.category === 'meditacao' ? 'Meditação'
                : exercise.category === 'apoio' ? 'Apoio'
                : exercise.category === 'educacao' ? 'Educação'
                : exercise.category === 'introducao' ? 'Introdução'
                : `${exercise.trimester} trimestre`}
            </Badge>
            <Badge tone="neutral" className="capitalize">
              {exercise.category === 'introducao' || exercise.category === 'educacao' || exercise.category === 'apoio' || exercise.category === 'meditacao'
                ? 'Para todos'
                : exercise.category.replace('-', ' ')}
            </Badge>
            <span className="ml-auto flex items-center gap-1 text-xs text-text-secondary font-medium">
              <Clock size={14} />
              {exercise.duration} min
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            {exercise.name}
          </h1>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            {exercise.description}
          </p>
        </section>

        {/* Contraindications */}
        {exercise.contraindications && (
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex gap-3">
            <AlertCircle
              size={20}
              className="text-accent-700 flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="font-semibold text-sm text-accent-700 mb-1">
                Atenção
              </h3>
              <p className="text-sm text-accent-900">
                {exercise.contraindications}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <section>
            <h2 className="font-semibold text-text-primary mb-3">
              Como praticar
            </h2>
            <ol className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 bg-white rounded-xl p-3 border border-warm-100 shadow-sm"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-text-primary pt-0.5 leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Complete button */}
        {/* Button is locked until the video has been started (or if already completed, or no video) */}
        <div className="sticky bottom-20 pt-2">
          {(() => {
            const hasVideo = !!exercise.youtube_video_id
            const THRESHOLD = 0.8
            const watched80 = videoProgress >= THRESHOLD
            const videoLocked = hasVideo && !watched80 && !completedToday
            const progressPct = Math.min(100, Math.round(videoProgress * 100))

            return (
              <>

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completedToday || isLoading || videoLocked}
                  className={cn(
                    'w-full py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all',
                    completedToday
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : videoLocked
                      ? 'bg-warm-200 text-text-secondary cursor-not-allowed'
                      : 'gradient-primary text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-50'
                  )}
                >
                  {completedToday ? (
                    <>
                      <Check size={18} strokeWidth={3} />
                      {isVideoCategory ? 'Vídeo assistido · +2 pontos' : 'Prática concluída · +20 pontos'}
                    </>
                  ) : videoLocked ? (
                    <>
                      <Play size={18} />
                      {videoProgress === 0
                        ? 'Assista o vídeo para pontuar'
                        : videoProgress < 0.5
                        ? 'Continue assistindo! Você consegue 💪'
                        : 'Quase lá! Não para agora 🌸'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {isLoading ? 'Salvando...' : isVideoCategory ? 'Marcar como assistido' : 'Completei a prática'}
                    </>
                  )}
                </button>

                {justCompleted && (
                  <p className="text-center text-xs text-emerald-700 mt-2 font-medium animate-pulse">
                    {isVideoCategory ? '🌸 Parabéns! +2 pontos adicionados' : '✨ Boa! +20 pontos adicionados'}
                  </p>
                )}

                {saveError && (
                  <p className="text-center text-xs text-red-600 mt-2 font-medium">
                    Erro ao salvar. Verifique sua conexão e tente novamente.
                  </p>
                )}
              </>
            )
          })()}

          {/* Next video button — trail, education or parto */}
          {exercise && (() => {
            if (isTrailVideo(exercise.id)) {
              // Parto users: after ex-10 (last intro), go to first parto video
              if (isPartoOnly && exercise.id === 'ex-10') {
                return (
                  <button
                    type="button"
                    onClick={() => router.push('/biblioteca/ex-61')}
                    className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-all flex items-center justify-center gap-2"
                  >
                    ▶ Ir para o Próximo Vídeo
                  </button>
                )
              }
              // Dores users: after ex-10 (last intro), go to apoio library
              if (isDoresOnly && exercise.id === 'ex-10') {
                return (
                  <button
                    type="button"
                    onClick={() => router.push('/biblioteca?cat=apoio')}
                    className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
                  >
                    💜 Ver minhas sequências para dores
                  </button>
                )
              }
              const nextId = getNextTrailVideoId(exercise.id, header.trimester)
              if (nextId === undefined) return null
              // Parto e Dores: esconde botão se próximo vídeo não está no plano
              if (isPartoOnly && nextId && !PARTO_INTRO_IDS.has(nextId)) return null
              if (isDoresOnly && nextId && !PARTO_INTRO_IDS.has(nextId)) return null
              return (
                <button
                  type="button"
                  onClick={() => router.push(nextId ? `/biblioteca/${nextId}` : '/calendario')}
                  className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200 transition-all flex items-center justify-center gap-2"
                >
                  {nextId ? '▶ Ir para o Próximo Vídeo' : '🎉 Ir para os Exercícios'}
                </button>
              )
            }
            if (isEducationVideo(exercise.id)) {
              const nextId = getNextEducationVideoId(exercise.id)
              if (nextId === undefined) return null
              return (
                <button
                  type="button"
                  onClick={() => router.push(nextId ? `/biblioteca/${nextId}` : '/home')}
                  className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200 transition-all flex items-center justify-center gap-2"
                >
                  {nextId ? '▶ Ir para o Próximo Vídeo' : '🏠 Voltar para a Home'}
                </button>
              )
            }
            if (isPartoVideo(exercise.id)) {
              const nextId = getNextPartoVideoId(exercise.id)
              if (nextId === undefined) return null
              // Parto users: hide "Próximo Vídeo" if next is ex-69 and still time-locked
              if (isPartoOnly && nextId === 'ex-69' && daysLeft > 0) return null
              return (
                <button
                  type="button"
                  onClick={() => router.push(nextId ? `/biblioteca/${nextId}` : '/home')}
                  className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  {nextId ? '▶ Ir para o Próximo Vídeo' : '🤱 Você está preparada!'}
                </button>
              )
            }
            return null
          })()}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
