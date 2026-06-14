'use client'

import Link from 'next/link'
import { Clock, Check, Lock } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import { useProgress } from '@/lib/useProgress'
import type { Exercise } from '@/lib/data'

interface LibraryExerciseCardProps {
  exercise: Exercise
  locked?: boolean
  allTimeCompletedIds?: string[]
}

export default function LibraryExerciseCard({ exercise, locked = false, allTimeCompletedIds = [] }: LibraryExerciseCardProps) {
  const { state, hydrated } = useProgress()

  const VIDEO_CATEGORIES = ['introducao', 'educacao', 'parto']
  const isVideoCategory = VIDEO_CATEGORIES.includes(exercise.category)
  const isCompleted = isVideoCategory
    ? allTimeCompletedIds.includes(exercise.id)
    : hydrated && state.completedExerciseIds.includes(exercise.id)

  const categoryLabel =
    exercise.category === 'educacao' ? 'Educação' :
    exercise.category === 'introducao' ? 'Introdução' :
    exercise.category.replace('-', ' ')

  const content = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.image}
          alt={exercise.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${!locked ? 'group-hover:scale-105' : ''}`}
        />
        <div className="absolute top-2 left-2">
          <Badge tone="secondary">
            {exercise.category === 'introducao' || exercise.category === 'educacao'
              ? categoryLabel
              : `${exercise.trimester} trim.`}
          </Badge>
        </div>
        {locked && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Lock size={18} className="text-text-secondary" />
            </div>
          </div>
        )}
        {!locked && isCompleted && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Check size={18} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className={`font-semibold text-sm line-clamp-2 mb-1 ${locked ? 'text-text-secondary' : 'text-text-primary'}`}>
          {exercise.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {exercise.duration} min
          </span>
          <span className="capitalize text-text-light">{categoryLabel}</span>
        </div>
      </div>
    </>
  )

  if (locked) {
    return (
      <div className="group bg-white rounded-xl overflow-hidden border border-warm-100 shadow-sm flex flex-col opacity-50 cursor-not-allowed select-none">
        {content}
      </div>
    )
  }

  return (
    <Link
      href={`/biblioteca/${exercise.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-warm-100 shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      {content}
    </Link>
  )
}
