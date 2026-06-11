'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Achievement } from '@/lib/data'

interface Props {
  achievement: Achievement
  onClose: () => void
}

const HEARTS = [
  { top: '18%', left: '3%',  right: 'auto', delay: '0.0s', size: 11 },
  { top: '30%', left: 'auto', right: '5%',  delay: '0.5s', size: 15 },
  { top: '58%', left: '2%',  right: 'auto', delay: '0.2s', size: 9  },
  { top: '68%', left: 'auto', right: '3%',  delay: '0.7s', size: 13 },
  { top: '44%', left: '5%',  right: 'auto', delay: '1.0s', size: 8  },
]

const MESSAGES: Record<string, string> = {
  'ach-6': 'Você deu o primeiro passo 💗',
  'ach-7': 'Seu bebê vai agradecer 💜',
  'ach-4': 'Que energia boa você traz! 🌸',
  'ach-5': 'Bem-vinda à comunidade 💬',
}

export default function AchievementToast({ achievement, onClose }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const DURATION = 4500

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
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
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(interval)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 350)
  }

  const handleClick = () => {
    handleClose()
    router.push('/progresso')
  }

  return (
    <div
      onClick={handleClick}
      aria-live="polite"
      className={`fixed top-4 left-4 right-4 z-50 cursor-pointer transition-all duration-350 ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
      }`}
    >
      <div className="gradient-primary rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Corações flutuantes */}
        {HEARTS.map((h, i) => (
          <span
            key={i}
            className="absolute pointer-events-none select-none animate-bounce"
            style={{
              top: h.top,
              left: h.left,
              right: h.right,
              fontSize: h.size,
              animationDelay: h.delay,
              animationDuration: '1.6s',
              opacity: 0.45,
            }}
          >
            💗
          </span>
        ))}

        {/* Conteúdo */}
        <div className="flex items-center gap-4 px-5 py-4 relative">
          {/* Ícone grande */}
          <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl leading-none">{achievement.icon}</span>
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-white/75 text-[10px] font-bold uppercase tracking-widest mb-0.5">
              ✨ Conquista desbloqueada!
            </p>
            <p className="text-white text-base font-bold leading-tight truncate">
              {achievement.name}
            </p>
            <p className="text-white/70 text-xs mt-1 leading-snug">
              {MESSAGES[achievement.id] ?? 'Você está arrasando! 💜'}
            </p>
          </div>

          {/* Pontos */}
          <div className="flex-shrink-0 text-center">
            <p className="text-white font-extrabold text-sm leading-none">+50</p>
            <p className="text-white/70 text-[10px]">pts</p>
          </div>
        </div>

        {/* Barra de tempo */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/50 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
