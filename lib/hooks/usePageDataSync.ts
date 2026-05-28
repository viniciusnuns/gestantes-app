import { useEffect, useRef } from 'react'
import { usePageData } from './usePageData'
import { useActivityStore } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'

/**
 * Hook that syncs usePageData (RPC bootstrap) to Zustand store
 * Replaces useActivityInit for automatic store population via RPC
 *
 * Usage:
 * usePageDataSync() // Automatically populates store from RPC instead of 4 separate queries
 */
export function usePageDataSync() {
  const { data, isLoading, error } = usePageData()
  const realtimeSetupDone = useRef(false)

  // Sync bootstrap data to store when it arrives
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      console.log('[usePageDataSync] No user session')
      return
    }

    // Only sync once data is loaded
    if (data && !isLoading) {
      console.log('[usePageDataSync] Syncing bootstrap data to store')
      useActivityStore.setState({
        userProfile: data.profile,
        activities: data.activities || [],
        stats: data.stats,
        ranking: data.ranking || [],
        isLoading: false,
        error: null,
      })
    }
  }, [data?.profile?.id, isLoading]) // Only depend on user ID, not whole object

  // Set up realtime subscriptions (only once)
  useEffect(() => {
    if (realtimeSetupDone.current) return

    const user = getCurrentUser()
    if (!user) {
      console.log('[usePageDataSync] No user session for realtime')
      return
    }

    console.log('[usePageDataSync] Setting up realtime subscriptions')
    const unsubscribe = useActivityStore.getState().subscribeToRealtimeUpdates()
    realtimeSetupDone.current = true

    return () => {
      unsubscribe()
      realtimeSetupDone.current = false
    }
  }, []) // Empty deps - run only once on mount

  return { isLoading, error }
}
