'use client'

import { Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/lib/data'

interface HomeExerciseCardProps {
  exercise: Exercise
  done?: boolean
  onToggle?: () => void
  onClick?: () => void
}

export default function HomeExerciseCard({
  exercise,
  done = false,
  onToggle,
  onClick,
}: HomeExerciseCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-white rounded-xl p-3 border border-warm-100 shadow-sm transition-all',
        done && 'opacity-70'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.image}
          alt={exercise.name}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-semibold text-sm text-text-primary truncate',
              done && 'line-through'
            )}
          >
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
            <Clock size={12} />
            <span>{exercise.duration} min</span>
            <span className="text-text-light">·</span>
            <span className="capitalize">{exercise.category.replace('-', ' ')}</span>
          </div>
        </div>
      </button>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={done ? 'Marcar como pendente' : 'Marcar como concluída'}
          className={cn(
            'w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
            done
              ? 'bg-primary-300 border-primary-300 text-white'
              : 'border-warm-300 text-warm-300 hover:border-primary-300 hover:text-primary-300'
          )}
        >
          <Check size={18} strokeWidth={3} />
        </button>
      )}
      {!onToggle && done && (
        <div className="w-9 h-9 rounded-full bg-primary-300 border-2 border-primary-300 flex items-center justify-center flex-shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
      )}
    </div>
  )
}
