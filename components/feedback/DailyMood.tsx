'use client'

import { useState, useEffect } from 'react'

type Mood = 'great' | 'ok' | 'hard'

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😊', label: 'Ótimo' },
  { value: 'ok',    emoji: '😐', label: 'Regular' },
  { value: 'hard',  emoji: '😔', label: 'Difícil' },
]

interface Props {
  date: string
  userId?: string
}

export default function DailyMood({ date, userId }: Props) {
  const [selected, setSelected] = useState<Mood | null>(null)
  const [saved, setSaved] = useState(false)

  const storageKey = `daily_mood_${userId}_${date}`

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setSelected(stored as Mood)
      setSaved(true)
    }
  }, [storageKey])

  const handleSelect = (mood: Mood) => {
    setSelected(mood)
    setSaved(true)
    localStorage.setItem(storageKey, mood)
  }

  if (saved && selected) {
    const found = MOODS.find((m) => m.value === selected)
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-warm-100 text-center">
        <p className="text-2xl mb-1">{found?.emoji}</p>
        <p className="text-xs text-text-secondary">
          Você registrou: <span className="font-semibold text-text-primary">{found?.label}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-warm-100">
      <p className="text-sm font-bold text-text-primary mb-1">Como foi seu dia de prática?</p>
      <p className="text-xs text-text-secondary mb-4">Um toque é suficiente</p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map(({ value, emoji, label }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-warm-50 hover:bg-primary-50 active:scale-95 transition-all"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-medium text-text-secondary">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
