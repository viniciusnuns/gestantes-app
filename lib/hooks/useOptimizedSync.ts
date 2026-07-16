import { useEffect } from 'react'
import { useOptimizedPageData } from './useOptimizedPageData'
import { useActivityStore } from '@/lib/stores/activityStore'
import { getCurrentUser } from '@/lib/customAuth'

export function useOptimizedSync() {
  const { header, activities, stats, ranking, isLoading, error } = useOptimizedPageData()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    if (!isLoading && header) {
      useActivityStore.setState({
        userProfile: {
          id: header.user_id,
          name: header.name,
          avatar_url: header.avatar_url,
          week_at_registration: header.week_at_registration,
          registration_date: header.registration_date,
          account_created_at: header.account_created_at,
          created_at: header.account_created_at,
        },
        activities: (activities || []).map((a) => ({
          id: a.id,
          user_id: header.user_id,
          exercise_id: a.exercise_id,
          exercise_name: a.exercise_name,
          activity_date: a.activity_date,
          completed_at: a.completed_at,
          points_earned: a.points_earned,
          source: 'sistema',
          daily_activity_id: null,
        })),
        stats: stats ? {
          user_id: stats.user_rank.toString(),
          total_points: stats.total_points,
          active_days: stats.active_days,
          total_completions: stats.total_completions,
          first_activity_date: null,
          last_activity_date: null,
        } : null,
        ranking: (ranking || []).map((r) => ({
          position: r.position,
          user_id: r.user_id,
          name: r.name,
          total_points: r.total_points,
          active_days: r.active_days,
          total_completions: 0,
        })),
        isLoading: false,
        error: null,
      })
    } else if (!isLoading && !header) {
      // RPC retornou sem dados (usuária sem perfil) — libera o guard para não travar a tela
      useActivityStore.setState({ isLoading: false })
    }
  }, [header, activities, stats, ranking, isLoading])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    const unsubscribe = useActivityStore.getState().subscribeToRealtimeUpdates()

    return () => {
      unsubscribe()
    }
  }, [])

  return { isLoading, error }
}
