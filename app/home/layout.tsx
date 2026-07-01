'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const check = async () => {
      const user = getCurrentUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
      if (data && !data.onboarding_completed) {
        router.replace('/onboarding')
        return
      }
      setReady(true)
    }
    check()
  }, [router])

  if (!ready) return <div className="min-h-screen bg-warm-50" />
  return <>{children}</>
}
