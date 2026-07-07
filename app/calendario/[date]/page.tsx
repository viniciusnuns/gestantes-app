'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check, Sparkles, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/nav/BottomNav'
import Button from '@/components/shared/Button'
import { exercises } from '@/lib/data'
import { getDailyExercises } from '@/lib/daily-exercises'
import { useActivityMutations, useActivityStore, useUserHeader } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'
import { cn, getLocalDateBR } from '@/lib/utils'
import DailyMood from '@/components/feedback/DailyMood'

interface PageProps {
  params: { date: string }
}

export default function CalendarDayPage({ params }: PageProps) {
  const router = useRouter()

  const store = useActivityStore()
  const header = useUserHeader()
  const { addActivity } = useActivityMutations()
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Get today's date for validation
  const today = getLocalDateBR()
  const isToday = params.date === today

  // Get completed activities for this date
  const completedActivities = store.activities.filter((a) => a.activity_date === params.date)

  // Trail gate
  const completedIds = store.activities.map((a) => a.exercise_id)

  const user = getCurrentUser()
  const trimesterExercises = user
    ? getDailyExercises(user.id, params.date, header.trimester, exercises)
    : []

  // Map exercises with completion status
  const dayExercisesWithStatus = trimesterExercises.map((exercise) => {
    const isCompleted = completedActivities.some((a) => a.exercise_id === exercise.id)
    return {
      ...exercise,
      isCompleted,
    }
  })

  // Data already loaded via useOptimizedSync() — no need to reload per date change

  const handleCompleteExercise = async (exerciseId: string, exerciseName: string) => {
    try {
      setCompletingId(exerciseId)
      const user = getCurrentUser()
      if (!user) {
        alert('Usuária não autenticada')
        return
      }

      await addActivity({
        user_id: user.id,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        points_earned: 20,
        source: 'calendario',
        daily_activity_id: undefined,
        activity_date: params.date,
      })
      window.dispatchEvent(new Event('gem:achievement-check'))
    } catch (error) {
      console.error('Erro ao completar exercício:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setCompletingId(null)
    }
  }

  // Format date for display
  const dateObj = new Date(params.date + 'T00:00:00')
  const dateStr = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="gradient-primary text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/calendario')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <h1 className="text-2xl font-bold capitalize">{dateStr}</h1>
          <p className="text-sm opacity-90 mt-2">
            {completedActivities.length}/{trimesterExercises.length} atividade{trimesterExercises.length !== 1 ? 's' : ''} completa
            {trimesterExercises.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
        {trimesterExercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">✨</p>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              Nenhuma atividade para este dia
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Você pode escolher uma na Biblioteca
            </p>
            <Button onClick={() => router.push('/biblioteca')}>
              Ir para Biblioteca
            </Button>
          </div>
        ) : (
          dayExercisesWithStatus.map((ex) => {
            if (!ex) return null
            const points = completedActivities.find((ca) => ca.exercise_id === ex.id)?.points_earned || 20

            return (
              <button
                key={ex.id}
                onClick={() => isToday && router.push(`/biblioteca/${ex.id}?date=${params.date}`)}
                disabled={!isToday && !ex.isCompleted}
                className={cn(
                  'w-full bg-white rounded-xl shadow-sm p-4 border border-warm-100 text-left transition-all',
                  ex.isCompleted && 'border-emerald-200 bg-emerald-50',
                  !isToday && !ex.isCompleted && 'opacity-50 cursor-not-allowed',
                  isToday && !ex.isCompleted && 'hover:shadow-md'
                )}
              >
                {/* Exercise card header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-warm-100">
                    <Image
                      src={ex.image}
                      alt={ex.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary">{ex.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {ex.category.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-text-secondary">{ex.duration} min</span>
                    </div>
                  </div>

                  {ex.isCompleted && (
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-text-primary leading-relaxed mb-4">
                  {ex.description}
                </p>

                {/* Status display */}
                {ex.isCompleted && (
                  <div className="bg-emerald-100 text-emerald-700 rounded-lg p-3 flex items-center justify-center gap-2">
                    <Check size={18} strokeWidth={3} />
                    <span className="font-medium text-sm">Concluído · +{points} pontos</span>
                  </div>
                )}

                {!ex.isCompleted && (
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <Play size={18} fill="currentColor" />
                    <span className="font-bold text-sm">Assistir aula</span>
                  </div>
                )}
              </button>
            )
          })
        )}
      </main>

      {/* Feedback diário — aparece quando há atividades concluídas */}
      {completedActivities.length > 0 && (
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <DailyMood date={params.date} userId={user?.id} />
        </div>
      )}

      <BottomNav />
    </div>
  )
}
