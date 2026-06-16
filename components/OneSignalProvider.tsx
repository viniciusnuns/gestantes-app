'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id || typeof window === 'undefined') return

    const tryLogin = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) return
      try {
        await OneSignal.login(user.id)
      } catch {
        // Silencioso
      }
    }

    // Aguarda SDK carregar
    setTimeout(tryLogin, 3000)
  }, [])

  return <>{children}</>
}
