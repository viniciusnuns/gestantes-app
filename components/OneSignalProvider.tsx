'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'

declare global {
  interface Window {
    OneSignalDeferred?: ((onesignal: any) => void)[]
  }
}

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.OneSignalDeferred) return

    // Vincula o usuário autenticado ao OneSignal após hidratação do React
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      const user = getCurrentUser()
      if (user?.id) {
        await OneSignal.login(user.id)
        setTimeout(() => {
          OneSignal.Slidedown?.promptPush()
        }, 8000)
      }
    })
  }, [])

  return <>{children}</>
}
