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
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId || typeof window === 'undefined') return

    window.OneSignalDeferred = window.OneSignalDeferred || []

    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: false,
                delay: { pageViews: 1, timeDelay: 8 },
                text: {
                  actionMessage: 'Receba lembretes dos seus exercícios e conquistas 🌸',
                  acceptButton: 'Sim, quero!',
                  cancelButton: 'Agora não',
                },
              },
            ],
          },
        },
      })

      const user = getCurrentUser()
      if (user?.id) {
        await OneSignal.login(user.id)
        setTimeout(() => {
          OneSignal.Slidedown.promptPush()
        }, 8000)
      }
    })
  }, [])

  return <>{children}</>
}
