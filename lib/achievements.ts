import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/data'
import { EDUCATION_VIDEOS, PARTO_VIDEOS } from '@/lib/trail'

export interface AchievementCondition {
  id: string
  name: string
  check: (userId: string) => Promise<boolean>
}

// Check if user has 7 distinct active days
export async function checkPrimeiraSemanaBadge(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_activity_history')
    .select('activity_date')
    .eq('user_id', userId)

  if (error) {
    console.error('[Achievement] Error checking Primeira Semana:', error)
    return false
  }

  if (!data || data.length === 0) return false

  // Count unique dates
  const uniqueDates = new Set(data.map((a: any) => a.activity_date))
  return uniqueDates.size >= 7
}

// Check if user spans 30 calendar days (from first activity to last activity)
export async function check30DiasBadge(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_activity_history')
    .select('activity_date')
    .eq('user_id', userId)
    .order('activity_date', { ascending: true })

  if (error) {
    console.error('[Achievement] Error checking 30 Dias:', error)
    return false
  }

  if (!data || data.length === 0) return false

  const dates = data.map((a: any) => new Date(a.activity_date))
  const minDate = new Date(dates[0])
  const maxDate = new Date(dates[dates.length - 1])

  const daysDiff = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff >= 29 // 30 calendar days = 29 days difference
}

// Check if user has participated in community (has at least one post) - already handled by newPostModal
export async function checkComunidadeBadge(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (error) {
    console.error('[Achievement] Error checking Comunidade:', error)
    return false
  }

  return (count ?? 0) > 0
}

// Check if user has completed many exercises (not all in category)
export async function checkManyCategoriesCompletedBadge(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_activity_history')
    .select('exercise_id')
    .eq('user_id', userId)

  if (error) {
    console.error('[Achievement] Error checking categories completion:', error)
    return false
  }

  const uniqueExercises = new Set(data?.map((a: any) => a.exercise_id) ?? [])
  return uniqueExercises.size >= 5 // Unlocks after 5 different exercises
}

// Check if user has a weekly streak (active in at least 5 out of 7 days in current week)
export async function checkWeeklyStreakBadge(userId: string): Promise<boolean> {
  // Get current week's activities
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('user_activity_history')
    .select('activity_date')
    .eq('user_id', userId)
    .gte('activity_date', weekStartStr)
    .lte('activity_date', weekEndStr)

  if (error) {
    console.error('[Achievement] Error checking Weekly Streak:', error)
    return false
  }

  const uniqueDates = new Set(data?.map((a: any) => a.activity_date) ?? [])
  return uniqueDates.size >= 5
}

// Check if user has been active for 10 unique days (consistency)
export async function checkConsistencyBadge(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_activity_history')
    .select('activity_date')
    .eq('user_id', userId)

  if (error) {
    console.error('[Achievement] Error checking Consistency:', error)
    return false
  }

  if (!data || data.length === 0) return false

  // Count unique dates
  const uniqueDates = new Set(data.map((a: any) => a.activity_date))
  return uniqueDates.size >= 10
}

// Check if user has commented on community posts (engagement)
export async function checkCommunityEngagementBadge(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('community_comments')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (error) {
    console.error('[Achievement] Error checking Community Engagement:', error)
    return false
  }

  return (count ?? 0) >= 3
}

// Check if user completed the intro trail (4 intro + trimester welcome)
export async function checkJornadaIniciadaBadge(userId: string): Promise<boolean> {
  const INTRO_IDS = ['ex-0', 'ex-10', 'ex-11', 'ex-12']
  const WELCOME_IDS = ['ex-13', 'ex-14', 'ex-15']

  const { data, error } = await supabase
    .from('user_activity_history')
    .select('exercise_id')
    .eq('user_id', userId)
    .in('exercise_id', [...INTRO_IDS, ...WELCOME_IDS])

  if (error) {
    console.error('[Achievement] Error checking Jornada Iniciada:', error)
    return false
  }

  const watched = new Set(data?.map((a: any) => a.exercise_id) ?? [])
  const allIntro = INTRO_IDS.every((id) => watched.has(id))
  const anyWelcome = WELCOME_IDS.some((id) => watched.has(id))
  return allIntro && anyWelcome
}

// Check if user watched all education videos
export async function checkMamaeBemInformadaBadge(userId: string): Promise<boolean> {
  const EDUCATION_IDS = [...EDUCATION_VIDEOS]

  const { data, error } = await supabase
    .from('user_activity_history')
    .select('exercise_id')
    .eq('user_id', userId)
    .in('exercise_id', EDUCATION_IDS)

  if (error) {
    console.error('[Achievement] Error checking Mamãe Bem Informada:', error)
    return false
  }

  const watched = new Set(data?.map((a: any) => a.exercise_id) ?? [])
  return EDUCATION_IDS.every((id) => watched.has(id))
}

// Check if user watched all parto videos
export async function checkProntaParaOPartoBadge(userId: string): Promise<boolean> {
  const PARTO_IDS = [...PARTO_VIDEOS]

  const { data, error } = await supabase
    .from('user_activity_history')
    .select('exercise_id')
    .eq('user_id', userId)
    .in('exercise_id', PARTO_IDS)

  if (error) {
    console.error('[Achievement] Error checking Pronta para o Parto:', error)
    return false
  }

  const watched = new Set(data?.map((a: any) => a.exercise_id) ?? [])
  return PARTO_IDS.every((id) => watched.has(id))
}

// Auto-unlock achievements for user
export async function autoUnlockAchievements(userId: string): Promise<void> {
  if (!userId) return

  const achievements: AchievementCondition[] = [
    { id: 'ach-1', name: 'Primeira Semana', check: checkPrimeiraSemanaBadge },
    { id: 'ach-2', name: '30 Dias', check: check30DiasBadge },
    { id: 'ach-3', name: 'Consistência', check: checkConsistencyBadge },
    { id: 'ach-4', name: 'Exploradora', check: checkCommunityEngagementBadge },
    { id: 'ach-5', name: 'Comunidade', check: checkComunidadeBadge },
    { id: 'ach-6', name: 'Jornada Iniciada', check: checkJornadaIniciadaBadge },
    { id: 'ach-7', name: 'Mamãe Bem Informada', check: checkMamaeBemInformadaBadge },
    { id: 'ach-8', name: 'Pronta para o Parto', check: checkProntaParaOPartoBadge },
  ]

  for (const achievement of achievements) {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single()

      // If already unlocked, skip
      if (existing) {
        console.log(`[Achievement] ${achievement.name} already unlocked`)
        continue
      }

      // Check if condition is met
      const shouldUnlock = await achievement.check(userId)

      if (shouldUnlock) {
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert([
            {
              user_id: userId,
              achievement_id: achievement.id,
            },
          ])

        if (insertError) {
          console.error(`[Achievement] Error unlocking ${achievement.name}:`, insertError)
        } else {
          console.log(`[Achievement] ✅ ${achievement.name} unlocked!`)
        }
      }
    } catch (err) {
      console.error(`[Achievement] Unexpected error checking ${achievement.name}:`, err)
    }
  }
}

// Check specific achievement unlock conditions
export async function checkAchievementUnlock(userId: string, achievementId: string): Promise<boolean> {
  switch (achievementId) {
    case 'ach-1':
      return checkPrimeiraSemanaBadge(userId)
    case 'ach-2':
      return check30DiasBadge(userId)
    case 'ach-3':
      return checkConsistencyBadge(userId)
    case 'ach-4':
      return checkCommunityEngagementBadge(userId)
    case 'ach-5':
      return checkComunidadeBadge(userId)
    case 'ach-6':
      return checkJornadaIniciadaBadge(userId)
    case 'ach-7':
      return checkMamaeBemInformadaBadge(userId)
    case 'ach-8':
      return checkProntaParaOPartoBadge(userId)
    default:
      return false
  }
}

// Retroactively unlock all achievements that user has already earned
export async function unlockAllEarnedAchievements(userId: string): Promise<void> {
  if (!userId) return

  const achievements: AchievementCondition[] = [
    { id: 'ach-1', name: 'Primeira Semana', check: checkPrimeiraSemanaBadge },
    { id: 'ach-2', name: '30 Dias', check: check30DiasBadge },
    { id: 'ach-3', name: 'Consistência', check: checkConsistencyBadge },
    { id: 'ach-4', name: 'Exploradora', check: checkCommunityEngagementBadge },
    { id: 'ach-5', name: 'Comunidade', check: checkComunidadeBadge },
    { id: 'ach-6', name: 'Jornada Iniciada', check: checkJornadaIniciadaBadge },
    { id: 'ach-7', name: 'Mamãe Bem Informada', check: checkMamaeBemInformadaBadge },
  ]

  console.log(`[Achievement] 🔄 Retroactive unlock scan for user ${userId}`)

  const unlockedAchievements: string[] = []
  const skippedAchievements: string[] = []

  for (const achievement of achievements) {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single()

      // If already unlocked, skip
      if (existing) {
        console.log(`[Achievement] ⏭️  ${achievement.name} already unlocked`)
        skippedAchievements.push(achievement.id)
        continue
      }

      // Check if condition is met
      const shouldUnlock = await achievement.check(userId)

      if (shouldUnlock) {
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert([
            {
              user_id: userId,
              achievement_id: achievement.id,
            },
          ])

        if (insertError) {
          console.error(`[Achievement] ❌ Error unlocking ${achievement.name}:`, insertError)
        } else {
          console.log(`[Achievement] ✅ ${achievement.name} retroactively unlocked!`)
          unlockedAchievements.push(achievement.id)
        }
      } else {
        console.log(`[Achievement] 🔒 ${achievement.name} condition not met yet`)
      }
    } catch (err) {
      console.error(`[Achievement] ❌ Unexpected error checking ${achievement.name}:`, err)
    }
  }

  console.log(`[Achievement] 📊 Retroactive unlock complete - Unlocked: ${unlockedAchievements.length}, Skipped: ${skippedAchievements.length}`)
}
