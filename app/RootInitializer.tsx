'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'
import AchievementProvider from '@/components/AchievementProvider'
import OneSignalProvider from '@/components/OneSignalProvider'
import OneSignalLoader from '@/components/OneSignalLoader'
import AppTour from '@/components/AppTour'
import { getCurrentUser, customSignOut } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

export default function RootInitializer({ children }: { children: React.ReactNode }) {
  useOptimizedSync()
  const router = useRouter()

  useEffect(() => {
    navigator.clearAppBadge?.()
  }, [])

  // Identifica usuária logada no Clarity para ver email nas gravações
  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return
    window.clarity?.('identify', user.id, undefined, undefined, user.email)
  }, [])

  // Valida sessão: usuário deletado ou cancelado é deslogado
  useEffect(() => {
    const checkAccess = async () => {
      const user = getCurrentUser()
      if (!user?.id) return

      const { data } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (!data) {
        // Usuário não existe no banco (deletado ou sessão inválida)
        customSignOut()
        router.push('/login')
        return
      }

      if (data.user_type === 'cancelled') {
        customSignOut()
        router.push('/login?motivo=acesso-cancelado')
      }
    }

    checkAccess()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AchievementProvider>
      <OneSignalLoader />
      <OneSignalProvider>
        {children}
        <AppTour />
      </OneSignalProvider>
    </AchievementProvider>
  )
}
