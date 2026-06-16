'use client'

import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'
import AchievementProvider from '@/components/AchievementProvider'
import OneSignalProvider from '@/components/OneSignalProvider'

export default function RootInitializer({ children }: { children: React.ReactNode }) {
  useOptimizedSync()

  return (
    <AchievementProvider>
      <OneSignalProvider>
        {children}
      </OneSignalProvider>
    </AchievementProvider>
  )
}
