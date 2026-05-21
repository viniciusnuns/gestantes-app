'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import type { Exercise } from '@/lib/data'

interface LibraryExerciseCardProps {
  exercise: Exercise
}

export default function LibraryExerciseCard({ exercise }: LibraryExerciseCardProps) {
  return (
    <Link
      href={`/biblioteca/${exercise.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-warm-100 shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exercise.image}
          alt={exercise.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge tone="secondary">{exercise.trimester} trim.</Badge>
        </div>
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
