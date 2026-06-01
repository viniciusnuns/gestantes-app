'use client'

import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { exercises } from '@/lib/data'
import { EDUCATION_VIDEOS } from '@/lib/trail'

interface EducationTrailCardProps {
  completedIds: string[]
}

export default function EducationTrailCard({ completedIds }: EducationTrailCardProps) {
  const router = useRouter()

  const videos = EDUCATION_VIDEOS.map((id) => ({
    exercise: exercises.find((ex) => ex.id === id)!,
    done: completedIds.includes(id),
  })).filter((v) => v.exercise)

  const doneCount = videos.filter((v) => v.done).length
  const total = videos.length

  return (
    <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-400 to-primary-400 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <div>
            <p className="text-white font-bold text-sm">Vamos Aprender!</p>
            <p className="text-white/80 text-xs">{doneCount}/{total} assistidos</p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1">
          {videos.map((v, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${v.done ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Video list */}
      <div className="divide-y divide-warm-50">
        {videos.map(({ exercise, done }) => (
          <button
            key={exercise.id}
            onClick={() => router.push(`/biblioteca/${exercise.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors text-left"
          >
            <div className="relative flex-shrink-0">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              {done && (
                <div className="absolute inset-0 rounded-lg bg-emerald-500/80 flex items-center justify-center">
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight line-clamp-1 ${done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                {exercise.name}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{exercise.duration} min</p>
            </div>
            <span className="text-text-light text-sm flex-shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
