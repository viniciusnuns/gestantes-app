import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { calculateCurrentWeek, getLocalDateBR } from '@/lib/utils'
import { autoUnlockAchievements } from '@/lib/achievements'

// Types
interface UserActivity {
  id: string
  user_id: string
  exercise_id: string
  exercise_name: string
  activity_date: string
  completed_at: string
  points_earned: number
  source: string
  daily_activity_id: string | null
}

interface UserStats {
  user_id: string
  total_points: number
  active_days: number
  total_completions: number
  first_activity_date: string | null
  last_activity_date: string | null
}

interface RankingEntry {
  position: number
  user_id: string
  name: string
  total_points: number
  active_days: number
  total_completions: number
}

interface UserProfile {
  id: string
  name: string
  avatar_url: string | null
  week_at_registration: number
  registration_date: string
  account_created_at: string
  created_at: string
}

interface AddActivityInput {
  user_id: string
  exercise_id: string
  exercise_name: string
  points_earned?: number
  source?: string
  daily_activity_id?: string | null
  activity_date?: string
}

interface ActivityStore {
  // State
  activities: UserActivity[]
  stats: UserStats | null
  ranking: RankingEntry[]
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null

  // Actions
  loadUserData: () => Promise<void>
  addActivity: (activity: AddActivityInput) => Promise<void>
  subscribeToRealtimeUpdates: () => () => void
  clearError: () => void
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial state — isLoading: true evita flash de "semana 20" antes do RPC responder
  activities: [],
  stats: null,
  ranking: [],
  userProfile: null,
  isLoading: true,
  error: null,

  // Load all user data from Supabase
  loadUserData: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = getCurrentUser()
      if (!user) {
        set({ isLoading: false, error: 'No user session' })
        return
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id, name, avatar_url, week_at_registration, registration_date, account_created_at, created_at')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch user activities up to today (only what's possible to do)
      const today = getLocalDateBR()
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity_history')
        .select('*')
        .eq('user_id', user.id)
        .lte('activity_date', today)
        .order('completed_at', { ascending: false })

      if (activitiesError) throw activitiesError


      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('v_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') throw statsError // 416 = no rows

      // Fetch ranking
      const { data: rankingData, error: rankingError } = await supabase
        .from('v_ranking')
        .select('*')
        .order('position', { ascending: true })
        .limit(100)

      if (rankingError) throw rankingError

      set({
        activities: activitiesData || [],
        stats: statsData || null,
        ranking: rankingData || [],
        userProfile: profileData,
        isLoading: false,
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load user data'
      set({ error: message, isLoading: false })
      console.error('[ActivityStore] Error loading user data:', error)
    }
  },

  // Add a new activity
  addActivity: async (input: AddActivityInput) => {
    set({ error: null })
    try {
      const user = getCurrentUser()
      if (!user) throw new Error('No user session')

      const now = new Date().toISOString()
      const targetDate = input.activity_date || getLocalDateBR()

      // Optimistic update
      const newActivity: UserActivity = {
        id: crypto.randomUUID(),
        user_id: input.user_id,
        exercise_id: input.exercise_id,
        exercise_name: input.exercise_name,
        activity_date: targetDate,
        completed_at: now,
        points_earned: input.points_earned ?? 20,
        source: input.source || 'biblioteca',
        daily_activity_id: input.daily_activity_id || null,
      }

      set((state) => ({
        activities: [newActivity, ...state.activities],
      }))

      // Insert into Supabase
      const { error } = await supabase
        .from('user_activity_history')
        .insert({
          user_id: input.user_id,
          exercise_id: input.exercise_id,
          exercise_name: input.exercise_name,
          activity_date: targetDate,
          completed_at: now,
          points_earned: input.points_earned ?? 20,
          source: input.source || 'biblioteca',
          daily_activity_id: input.daily_activity_id || null,
        })

      if (error) {
        // Rollback on error
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== newActivity.id),
          error: error.message,
        }))
        throw error
      }

      // Check and unlock achievements based on new activity
      await autoUnlockAchievements(input.user_id)
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('gem:achievement-check'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add activity'
      set({ error: message })
      console.error('[ActivityStore] Error adding activity:', error)
      throw error
    }
  },

  // Subscribe to realtime updates
  subscribeToRealtimeUpdates: () => {
    const user = getCurrentUser()
    if (!user) return () => {}

    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:user-updates:${user.id}`)
    if (existingChannel) {
      supabase.removeChannel(existingChannel)
    }

    // Single channel for all updates
    const channel = supabase
      .channel(`user-updates:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as UserActivity
            set((state) => ({
              activities: [newActivity, ...state.activities],
            }))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as UserActivity).id
            set((state) => ({
              activities: state.activities.filter((a) => a.id !== deletedId),
            }))
          }
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  },

  clearError: () => set({ error: null }),
}))

// Derived hooks for easier usage
export const useUserHeader = () => {
  const store = useActivityStore()
  const profile = store.userProfile

  if (!profile) {
    return {
      name: 'Você',
      week: 20,
      trimester: '2º',
      daysLeft: 140,
    }
  }

  const currentWeek = calculateCurrentWeek(profile.registration_date, profile.week_at_registration)
  const trimester = currentWeek <= 13 ? '1º' : currentWeek <= 27 ? '2º' : '3º'
  const daysLeft = (40 - currentWeek) * 7

  return {
    name: profile.name || 'Você',
    week: currentWeek,
    trimester,
    daysLeft,
  }
}

export const useUserStats = () => {
  const store = useActivityStore()
  return store.stats || { total_points: 0, active_days: 0, total_completions: 0 }
}

export const useRanking = () => {
  const store = useActivityStore()
  return store.ranking
}

export const useActivityMutations = () => {
  const store = useActivityStore()
  return {
    addActivity: store.addActivity,
    error: store.error,
    clearError: store.clearError,
  }
}

export const useAccountCreatedAt = () => {
  const store = useActivityStore()
  return store.userProfile?.account_created_at || null
}

export const useActivityHistory = () => {
  const store = useActivityStore()
  return store.activities
}

