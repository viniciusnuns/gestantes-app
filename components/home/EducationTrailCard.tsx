'use client'

import { useRouter } from 'next/navigation'
import { exercises } from '@/lib/data'
import type { EducationTrailStatus } from '@/lib/trail'

interface EducationTrailCardProps {
  status: EducationTrailStatus
}

export default function EducationTrailCard({ status }: EducationTrailCardProps) {
  const router = useRouter()

  if (!status) return null

  const video = exercises.find((ex) => ex.id === status.nextVideoId)
  if (!video) return null

  return (
    <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📖</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
              Vamos Aprender!
            </p>
            <p className="text-xs text-text-secondary">
              Vídeo {status.done + 1} de {status.total}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: status.total }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i < status.done
                  ? 'w-4 bg-secondary-400'
                  : i === status.done
                  ? 'w-4 bg-secondary-600'
                  : 'w-2 bg-warm-200'
              }`}
            />
          ))}
        </div>

        {/* Video row */}
        <div className="flex items-center gap-3">
          <img
            src={video.image}
            alt={video.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-2 text-text-primary">
              {video.name}
            </p>
            <p className="text-xs mt-1 text-text-secondary">{video.duration} min</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/biblioteca/${video.id}`)}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-secondary-500 text-white hover:bg-secondary-600 transition-all"
        >
          Assistir agora →
        </button>
      </div>
    </div>
  )
}
