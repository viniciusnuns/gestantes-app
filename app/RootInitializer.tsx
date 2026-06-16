'use client'

import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'
import AchievementProvider from '@/components/AchievementProvider'
import OneSignalProvider from '@/components/OneSignalProvider'
import PushPromptBanner from '@/components/PushPromptBanner'

export default function RootInitializer({ children }: { children: React.ReactNode }) {
  useOptimizedSync()

  return (
    <AchievementProvider>
      <OneSignalProvider>
        {children}
        <PushPromptBanner />
      </OneSignalProvider>
    </AchievementProvider>
  )
}
