'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id || typeof window === 'undefined') return

    const tryLoginAndSync = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) return

      try {
        await OneSignal.login(user.id)
      } catch {
        // Silencioso
      }

      // Sincroniza estado de push do OneSignal com o banco
      try {
        const optedIn = OneSignal?.User?.PushSubscription?.optedIn
        if (optedIn) {
          await supabase
            .from('users')
            .update({ push_subscribed: true, push_subscribed_at: new Date().toISOString() })
            .eq('id', user.id)
            .eq('push_subscribed', false) // só atualiza se ainda não estava marcado
        }
      } catch {
        // Silencioso
      }
    }

    setTimeout(tryLoginAndSync, 3000)
  }, [])

  return <>{children}</>
}
