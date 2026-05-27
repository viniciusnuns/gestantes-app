'use client'

import Link from 'next/link'
import { Clock, Check } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import { useProgress } from '@/lib/useProgress'
import type { Exercise } from '@/lib/data'

interface LibraryExerciseCardProps {
  exercise: Exercise
}

export default function LibraryExerciseCard({ exercise }: LibraryExerciseCardProps) {
  const { state, hydrated } = useProgress()
  const isCompleted = hydrated && state.completedExerciseIds.includes(exercise.id)

  return (
    <Link
      href={`/biblioteca/${exercise.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-warm-100 shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.youtube_video_id
            ? `https://img.youtube.com/vi/${exercise.youtube_video_id}/hqdefault.jpg`
            : exercise.image
          }
          alt={exercise.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge tone="secondary">
            {exercise.category === 'introducao' ? 'Introdução' : `${exercise.trimester} trim.`}
          </Badge>
        </div>
        {isCompleted && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <Check size={18} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-text-primary line-clamp-2 mb-1">
          {exercise.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {exercise.duration} min
          </span>
          <span className="capitalize text-text-light">
            {exercise.category.replace('-', ' ')}
          </span>
        </div>
      </div>
    </Link>
  )
}
