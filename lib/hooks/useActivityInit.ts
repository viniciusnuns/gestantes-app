import { useEffect } from 'react'
import { useActivityStore } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'

/**
 * Initialize activity store on app load
 * - Loads user data from Supabase
 * - Sets up realtime subscriptions
 * - Runs once per user session
 */
export function useActivityInit() {
  // Get store actions without adding store to dependencies
  const loadUserData = useActivityStore((state) => state.loadUserData)
  const subscribeToRealtimeUpdates = useActivityStore((state) => state.subscribeToRealtimeUpdates)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      console.log('[useActivityInit] No user session')
      return
    }

    console.log('[useActivityInit] Initializing for user:', user.id)

    // Load user data
    loadUserData()

    // Subscribe to realtime updates
    const unsubscribe = subscribeToRealtimeUpdates()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [loadUserData, subscribeToRealtimeUpdates])
}
