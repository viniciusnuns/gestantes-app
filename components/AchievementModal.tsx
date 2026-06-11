'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Achievement } from '@/lib/data'

interface Props {
  achievement: Achievement
  onClose: () => void
}

const MOTIVATIONAL: Record<string, string> = {
  'ach-1': 'Sua consistência é inspiradora 💗',
  'ach-2': 'Você é uma força da natureza 🌟',
  'ach-3': 'Seu bebê sente cada movimento 💜',
}

const CONFETTI = [
  { color: '#f9a8d4', left: '8%',  delay: '0s',    size: 8,  round: true  },
  { color: '#c084fc', left: '18%', delay: '0.1s',  size: 10, round: false },
  { color: '#818cf8', left: '30%', delay: '0.05s', size: 7,  round: true  },
  { color: '#34d399', left: '42%', delay: '0.15s', size: 9,  round: false },
  { color: '#fbbf24', left: '55%', delay: '0s',    size: 8,  round: true  },
  { color: '#fb7185', left: '65%', delay: '0.2s',  size: 11, round: false },
  { color: '#a78bfa', left: '76%', delay: '0.08s', size: 7,  round: true  },
  { color: '#6ee7b7', left: '88%', delay: '0.12s', size: 9,  round: false },
]

export default function AchievementModal({ achievement, onClose }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const DURATION = 4000

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        handleClose()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Conquista desbloqueada: ${achievement.name}`}
    >
      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <div
          key={i}
          className="absolute top-8 pointer-events-none animate-bounce"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.round ? '50%' : '2px',
            animationDelay: c.delay,
            animationDuration: '0.9s',
          }}
        />
      ))}

      {/* Card */}
      <div
        className={`bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100' : 'scale-75'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradiente */}
        <div className="gradient-primary p-8 text-center">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">
            ✨ Conquista Desbloqueada
          </p>
          <div className="text-6xl mb-4 inline-block animate-pulse">
            {achievement.icon}
          </div>
          <h2 className="text-white text-xl font-bold leading-tight">
            {achievement.name}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-text-secondary text-sm leading-relaxed">
            {achievement.description}
          </p>
          <p className="text-primary-600 font-semibold text-sm mt-3">
            {MOTIVATIONAL[achievement.id] ?? 'Você está arrasando! 💜'}
          </p>

          {/* CTA */}
          <button
            onClick={() => { handleClose(); router.push('/progresso') }}
            className="mt-5 w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Ver minhas conquistas
          </button>

          {/* Timer bar */}
          <div className="mt-4 h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2 opacity-60">
            Toque em qualquer lugar para fechar
          </p>
        </div>
      </div>
    </div>
  )
}
