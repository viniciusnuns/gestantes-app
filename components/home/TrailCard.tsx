'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { exercises } from '@/lib/data'
import type { TrailStatus } from '@/lib/trail'

interface TrailCardProps {
  status: TrailStatus
}

export default function TrailCard({ status }: TrailCardProps) {
  const router = useRouter()

  if (!status) return null

  const video = exercises.find((ex) => ex.id === status.nextVideoId)
  if (!video) return null

  const isTransition = status.type === 'transition'

  const dots = isTransition ? null : (
    <div className="flex gap-1.5 mb-3">
      {Array.from({ length: status.total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < status.done
              ? 'w-4 bg-primary-400'
              : i === status.done
              ? 'w-4 bg-primary-600'
              : 'w-2 bg-warm-200'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-md ${
        isTransition
          ? 'bg-gradient-to-br from-secondary-400 to-primary-500 text-white'
          : 'bg-white border border-warm-100'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{isTransition ? '✨' : '🎯'}</span>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isTransition ? 'text-white/80' : 'text-primary-500'}`}>
              {isTransition
                ? `Novidade para o ${status.trimester} trimestre`
                : 'Comece por aqui'}
            </p>
            {!isTransition && (
              <p className={`text-xs ${isTransition ? 'text-white/70' : 'text-text-secondary'}`}>
                Passo {status.done + 1} de {status.total}
              </p>
            )}
          </div>
        </div>

        {/* Progress dots */}
        {dots}

        {/* Video row */}
        <div className="flex items-center gap-3">
          <Image
            src={video.image}
            alt={video.name}
            width={64}
            height={64}
            className="rounded-xl object-cover flex-shrink-0"
            onError={(e) => {
              const t = e.currentTarget
              if (t.src.includes('hqdefault')) t.src = t.src.replace('hqdefault', 'mqdefault')
            }}
          />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-tight line-clamp-2 ${isTransition ? 'text-white' : 'text-text-primary'}`}>
              {video.name}
            </p>
            <p className={`text-xs mt-1 ${isTransition ? 'text-white/70' : 'text-text-secondary'}`}>
              {video.duration} min
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/biblioteca/${video.id}`)}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isTransition
              ? 'bg-white text-primary-600 hover:bg-white/90'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          Assistir agora →
        </button>
      </div>
    </div>
  )
}
