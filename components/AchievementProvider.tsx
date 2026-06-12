'use client'

import { useAchievementUnlock } from '@/lib/hooks/useAchievementUnlock'
import AchievementModal from '@/components/AchievementModal'

export default function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { newAchievement, clearAchievement } = useAchievementUnlock()

  return (
    <>
      {newAchievement && (
        <AchievementModal achievement={newAchievement} onClose={clearAchievement} />
      )}
      {children}
    </>
  )
}
