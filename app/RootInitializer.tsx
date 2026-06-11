'use client'

import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'
import AchievementProvider from '@/components/AchievementProvider'

export default function RootInitializer({ children }: { children: React.ReactNode }) {
  useOptimizedSync()

  return <AchievementProvider>{children}</AchievementProvider>
}
