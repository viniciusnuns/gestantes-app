'use client'

import { useAchievementUnlock } from '@/lib/hooks/useAchievementUnlock'
import AchievementToast from '@/components/AchievementToast'
import AchievementModal from '@/components/AchievementModal'

const MODAL_ACHIEVEMENTS = ['ach-1', 'ach-2', 'ach-3']

export default function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { newAchievement, clearAchievement } = useAchievementUnlock()

  return (
    <>
      {newAchievement && (
        MODAL_ACHIEVEMENTS.includes(newAchievement.id)
          ? <AchievementModal achievement={newAchievement} onClose={clearAchievement} />
          : <AchievementToast achievement={newAchievement} onClose={clearAchievement} />
      )}
      {children}
    </>
  )
}
