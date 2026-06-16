'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'

let initialized = false

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId || initialized || typeof window === 'undefined') return
    initialized = true

    import('react-onesignal').then(({ default: OneSignal }) => {
      OneSignal.init({
        appId,
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: false,
                text: {
                  actionMessage: 'Receba lembretes dos seus exercícios e conquistas 🌸',
                  acceptButton: 'Sim, quero!',
                  cancelButton: 'Agora não',
                },
              },
            ],
          },
        },
      }).then(async () => {
        const user = getCurrentUser()
        if (user?.id) {
          await OneSignal.login(user.id)
          // Mostra o prompt após 8s — tempo suficiente para a usuária estar engajada
          setTimeout(() => {
            OneSignal.Slidedown.promptPush()
          }, 8000)
        }
      })
    })
  }, [])

  return <>{children}</>
}
