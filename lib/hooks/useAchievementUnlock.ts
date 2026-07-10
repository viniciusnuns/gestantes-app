import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { achievements } from '@/lib/data'
import { autoUnlockAchievements } from '@/lib/achievements'
import { getCurrentUser } from '@/lib/customAuth'
import type { Achievement } from '@/lib/data'

const storageKey = (userId: string) => `gem-achievements-shown:${userId}`

function getShown(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function markShown(userId: string, id: string) {
  try {
    const shown = getShown(userId)
    shown.add(id)
    localStorage.setItem(storageKey(userId), JSON.stringify(Array.from(shown)))
  } catch { /* ignore */ }
}

export function useAchievementUnlock() {
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const checkingRef = useRef(false)
  const newAchievementRef = useRef(newAchievement)
  newAchievementRef.current = newAchievement

  const checkForNew = async () => {
    if (checkingRef.current || newAchievementRef.current) return
    checkingRef.current = true

    try {
      const user = getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id)

      if (error || !data) return

      const shown = getShown(user.id)
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

  const checkForNewRef = useRef(checkForNew)
  checkForNewRef.current = checkForNew

  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser()
      if (user) await autoUnlockAchievements(user.id)
      checkForNewRef.current()
    }
    init()
    const handleFocus = () => checkForNewRef.current()
    const handleCheck = () => checkForNewRef.current()
    window.addEventListener('focus', handleFocus)
    window.addEventListener('gem:achievement-check', handleCheck)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('gem:achievement-check', handleCheck)
    }
  }, [])

  const clearAchievement = () => {
    if (newAchievement) {
      const user = getCurrentUser()
      if (user) markShown(user.id, newAchievement.id)
      setNewAchievement(null)
      // Re-check after a short delay (may have more than one queued)
      setTimeout(checkForNew, 500)
    }
  }

  return { newAchievement, clearAchievement }
}
