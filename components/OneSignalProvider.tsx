'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return

    const tryPrompt = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) return

      try {
        await OneSignal.login(user.id)
        await OneSignal.Notifications.requestPermission()
      } catch {
        // Permissão já concedida, negada ou não suportada
      }
    }

    setTimeout(tryPrompt, 8000)
  }, [])

  return <>{children}</>
}
