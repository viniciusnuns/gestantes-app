import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { calculateCurrentWeek } from '@/lib/utils'
import { exercises } from '@/lib/data'
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

interface DailyActivity {
  id: string
  user_id: string
  activity_date: string
  exercise_id: string
  slot_order: number
  trimester: number
  week_number: number
  generated_at: string
}

interface UserProfile {
  id: string
  name: string
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
  dailyActivities: DailyActivity[]
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
  // Initial state
  activities: [],
  dailyActivities: [],
  stats: null,
  ranking: [],
  userProfile: null,
  isLoading: false,
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
        .select('id, name, week_at_registration, registration_date, account_created_at, created_at')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch user activities up to today (only what's possible to do)
      const today = new Date().toISOString().split('T')[0]
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
        dailyActivities: [],
        stats: statsData || null,
        ranking: rankingData || [],
        userProfile: profileData,
        isLoading: false,
      })

      console.log('[ActivityStore] User data loaded successfully', {
        activitiesCount: activitiesData?.length || 0,
        stats: statsData,
        rankingCount: rankingData?.length || 0,
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
      const targetDate = input.activity_date || now.split('T')[0]

      // Optimistic update
      const newActivity: UserActivity = {
        id: crypto.randomUUID(),
        user_id: input.user_id,
        exercise_id: input.exercise_id,
        exercise_name: input.exercise_name,
        activity_date: targetDate,
        completed_at: now,
        points_earned: input.points_earned || 20,
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
          points_earned: input.points_earned || 20,
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

      console.log('[ActivityStore] Activity added:', input.exercise_id)

      // Check and unlock achievements based on new activity
      await autoUnlockAchievements(input.user_id)
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
    if (!user) {
      console.warn('[ActivityStore] No user session for realtime subscription')
      return () => {}
    }

    console.log('[ActivityStore] Subscribing to realtime updates for user:', user.id)

    // Remove any existing channel to prevent duplicates
    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:user-updates:${user.id}`)
    if (existingChannel) {
      console.log('[ActivityStore] Removing existing channel')
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
          console.log('[ActivityStore] Activity update received:', payload.eventType)

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
      .subscribe((status) => {
        console.log('[ActivityStore] Realtime subscription status:', status)
      })

    // Return unsubscribe function
    return () => {
      console.log('[ActivityStore] Unsubscribing from realtime updates')
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

export const useTodayActivities = () => {
  const store = useActivityStore()
  const today = new Date().toISOString().split('T')[0]

  // Get suggested activities for today
  const suggestedForToday = store.dailyActivities.filter((da) => da.activity_date === today)
  const completedForToday = store.activities.filter((a) => a.activity_date === today)

  // Map suggested activities with completion status
  return suggestedForToday.map((suggestion) => {
    const exercise = exercises.find((ex) => ex.id === suggestion.exercise_id)
    const completed = completedForToday.some((a) => a.exercise_id === suggestion.exercise_id)

    return {
      exercise,
      suggestion,
      completed,
      completedActivity: completedForToday.find((a) => a.exercise_id === suggestion.exercise_id),
    }
  })
}

export const useActivityHistory = () => {
  const store = useActivityStore()
  return store.activities
}

export const useDayActivities = (date: string) => {
  const store = useActivityStore()
  const dailySuggestions = store.dailyActivities
    .filter((da) => da.activity_date === date)
    .sort((a, b) => a.slot_order - b.slot_order)

  const completedActivities = store.activities.filter(
    (a) => a.activity_date === date
  )

  return {
    suggestions: dailySuggestions,
    completed: completedActivities,
    exercises: dailySuggestions.map((suggestion) => {
      const exercise = exercises.find((ex) => ex.id === suggestion.exercise_id)
      const isCompleted = completedActivities.some(
        (ca) => ca.exercise_id === suggestion.exercise_id
      )
      return {
        ...exercise,
        suggestion,
        isCompleted,
        points: isCompleted
          ? completedActivities.find((ca) => ca.exercise_id === suggestion.exercise_id)
              ?.points_earned || 0
          : 0,
      }
    }),
  }
}

export const useMonthActivities = () => {
  const store = useActivityStore()
  return {
    dailyActivities: store.dailyActivities,
    completedActivities: store.activities,
  }
}
