import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { achievements } from '@/lib/data'
import { autoUnlockAchievements } from '@/lib/achievements'
import { getCurrentUser } from '@/lib/customAuth'
import type { Achievement } from '@/lib/data'

const STORAGE_KEY = 'gem-achievements-shown'

function getShown(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markShown(id: string) {
  try {
    const shown = getShown()
    shown.add(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(shown)))
  } catch { /* ignore */ }
}

export function useAchievementUnlock() {
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const checkingRef = useRef(false)

  const checkForNew = async () => {
    if (checkingRef.current || newAchievement) return
    checkingRef.current = true

    try {
      const user = getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id)

      if (error || !data) return

      const shown = getShown()
      const earnedIds = data.map((row: { achievement_id: string }) => row.achievement_id)
      const justUnlocked = earnedIds.find((id: string) => !shown.has(id))

      if (justUnlocked) {
        const achievement = achievements.find((a) => a.id === justUnlocked)
        if (achievement) setNewAchievement(achievement)
      }
    } finally {
      checkingRef.current = false
    }
  }

  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser()
      if (user) await autoUnlockAchievements(user.id)
      checkForNew()
    }
    init()
    const handleFocus = () => checkForNew()
    const handleCheck = () => checkForNew()
    window.addEventListener('focus', handleFocus)
    window.addEventListener('gem:achievement-check', handleCheck)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('gem:achievement-check', handleCheck)
    }
  }, [])

  const clearAchievement = () => {
    if (newAchievement) {
      markShown(newAchievement.id)
      setNewAchievement(null)
      // Re-check after a short delay (may have more than one queued)
      setTimeout(checkForNew, 500)
    }
  }

  return { newAchievement, clearAchievement }
}
