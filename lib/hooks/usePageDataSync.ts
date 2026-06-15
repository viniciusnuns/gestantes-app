import { useEffect, useRef } from 'react'
import { usePageData } from './usePageData'
import { useActivityStore } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'

export function usePageDataSync() {
  const { data, isLoading, error } = usePageData()
  const realtimeSetupDone = useRef(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    if (data && !isLoading) {
      useActivityStore.setState({
        userProfile: data.profile,
        activities: data.activities || [],
        stats: data.stats,
        ranking: data.ranking || [],
        isLoading: false,
        error: null,
      })
    }
  }, [data?.profile?.id, isLoading])

  useEffect(() => {
    if (realtimeSetupDone.current) return

    const user = getCurrentUser()
    if (!user) return

    const unsubscribe = useActivityStore.getState().subscribeToRealtimeUpdates()
    realtimeSetupDone.current = true

    return () => {
      unsubscribe()
      realtimeSetupDone.current = false
    }
  }, [])

  return { isLoading, error }
}
