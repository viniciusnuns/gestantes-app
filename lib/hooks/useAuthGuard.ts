'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/customAuth'

export function useAuthGuard() {
  const router = useRouter()
  const [guardReady, setGuardReady] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.replace('/login')
    } else {
      setGuardReady(true)
    }
  }, [router])

  return guardReady
}
