'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '@/lib/data'

interface Props {
  achievement: Achievement
  onClose: () => void
}

export default function AchievementToast({ achievement, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const DURATION = 3500

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
    setTimeout(onClose, 300)
  }

  return (
    <div
      onClick={handleClose}
      aria-live="polite"
      className={`fixed top-4 left-4 right-4 z-50 transition-transform duration-300 cursor-pointer ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-100">
        <div className="flex items-center gap-3 p-4">
          <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-primary-500 to-secondary-500 flex-shrink-0" />
          <span className="text-2xl leading-none">{achievement.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
              Conquista desbloqueada!
            </p>
            <p className="text-sm font-bold text-text-primary truncate">
              {achievement.name}
            </p>
          </div>
          <span className="text-xs font-bold text-secondary-500 flex-shrink-0">
            +50 pts ✨
          </span>
        </div>
        <div className="h-0.5 bg-warm-100">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
