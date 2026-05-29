import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'

interface PageData {
  profile: {
    id: string
    name: string
    avatar_url: string | null
    week_at_registration: number
    registration_date: string
    account_created_at: string
    created_at: string
  } | null
  activities: Array<{
    id: string
    user_id: string
    exercise_id: string
    exercise_name: string
    activity_date: string
    completed_at: string
    points_earned: number
    source: string
    daily_activity_id: string | null
  }> | null
  stats: {
    user_id: string
    total_points: number
    active_days: number
    total_completions: number
    first_activity_date: string | null
    last_activity_date: string | null
  } | null
  ranking: Array<{
    position: number
    user_id: string
    name: string
    total_points: number
    active_days: number
    total_completions: number
  }> | null
}

// Global cache key for deduping - prevents multiple parallel requests
const CACHE_KEY = 'page-data-bootstrap'
const REQUEST_CACHE: Map<string, Promise<PageData>> = new Map()

// Fetcher function: calls RPC bootstrap
async function fetchPageData(userId: string): Promise<PageData> {
  // Check if request is already in flight (dedup)
  if (REQUEST_CACHE.has(userId)) {
    return REQUEST_CACHE.get(userId)!
  }

  const fetchPromise = (async () => {
    const { data, error } = await supabase.rpc('get_page_data_bootstrap', {
      user_id: userId,
    })

    if (error) {
      console.error('[usePageData] RPC error:', error)
      throw new Error(`Failed to fetch page data: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.error('[usePageData] No data returned from RPC')
      return {
        profile: null,
        activities: null,
        stats: null,
        ranking: null,
      }
    }

    const result = data[0]
    return {
      profile: result.profile,
      activities: result.activities || [],
      stats: result.stats,
      ranking: result.ranking || [],
    }
  })()

  REQUEST_CACHE.set(userId, fetchPromise)

  // Clean up cache after request completes
  fetchPromise.finally(() => {
    REQUEST_CACHE.delete(userId)
  })

  return fetchPromise
}

/**
 * Hook to fetch bootstrap page data with SWR caching
 * - Single RPC call instead of 4 separate queries
 * - Automatic deduping of parallel requests
 * - 5-minute default revalidation (can be overridden)
 *
 * Usage:
 * const { data, isLoading, error } = usePageData()
 */
export function usePageData(options?: { revalidateOnFocus?: boolean; dedupingInterval?: number }) {
  const user = getCurrentUser()
  const userId = user?.id

  const { data, error, isLoading, mutate } = useSWR(
    userId ? [CACHE_KEY, userId] : null,
    userId ? () => fetchPageData(userId) : null,
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      dedupingInterval: options?.dedupingInterval ?? 60000, // 1 minute default dedup
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      onError: (err) => {
        console.error('[usePageData] SWR error:', err)
      },
    }
  )

  return {
    data: data || {
      profile: null,
      activities: [],
      stats: null,
      ranking: [],
    },
    isLoading: isLoading && !data, // Only consider loading if no data at all
    error,
    mutate, // For manual revalidation if needed
  }
}
