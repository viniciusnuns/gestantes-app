'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id || typeof window === 'undefined') return

    const loginAndSync = async (OneSignal: any) => {
      if (!OneSignal?.login) return

      // Vincula o ID do usuário (necessário para envio por external_id no cron)
      try {
        await OneSignal.login(user.id)
      } catch { /* já logado ou SDK não pronto */ }

      // Sincroniza estado de assinatura com o banco
      try {
        const optedIn = OneSignal?.User?.PushSubscription?.optedIn
        if (optedIn) {
          await supabase
            .from('users')
            .update({ push_subscribed: true, push_subscribed_at: new Date().toISOString() })
            .eq('id', user.id)
            .eq('push_subscribed', false)
        }
      } catch { /* silencioso */ }
    }

    // Tenta via fila deferred (garante execução após init())
    ;(window as any).OneSignalDeferred = (window as any).OneSignalDeferred || []
    ;(window as any).OneSignalDeferred.push(loginAndSync)

    // Também tenta diretamente caso o SDK já esteja inicializado
    setTimeout(() => loginAndSync((window as any).OneSignal), 2000)
  }, [])

  return <>{children}</>
}
