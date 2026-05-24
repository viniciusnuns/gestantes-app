import { supabase } from './supabase'
import { getLocalDateBR } from './utils'

export const saveExerciseCompletion = async (
  userId: string,
  exerciseId: string,
  date: string = getLocalDateBR()
) => {
  try {
    console.log('[exercises] Saving completion:', { userId, exerciseId, date })

    const { error } = await supabase
      .from('user_exercises')
      .upsert({
        user_id: userId,
        exercise_id: exerciseId,
        date,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,exercise_id,date'
      })

    if (error) {
      console.error('[exercises] Error saving:', error)
      return { success: false, error }
    }

    console.log('[exercises] ✓ Completion saved')
    return { success: true }
  } catch (err) {
    console.error('[exercises] Unexpected error:', err)
    return { success: false, error: err }
  }
}

export const removeExerciseCompletion = async (
  userId: string,
  exerciseId: string,
  date: string = getLocalDateBR()
) => {
  try {
    console.log('[exercises] Removing completion:', { userId, exerciseId, date })

    const { error } = await supabase
      .from('user_exercises')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('date', date)

    if (error) {
      console.error('[exercises] Error removing:', error)
      return { success: false, error }
    }

    console.log('[exercises] ✓ Completion removed')
    return { success: true }
  } catch (err) {
    console.error('[exercises] Unexpected error:', err)
    return { success: false, error: err }
  }
}

export const getExerciseCompletions = async (
  userId: string,
  date: string = getLocalDateBR()
) => {
  try {
    console.log('[exercises] Fetching completions:', { userId, date })

    const { data, error } = await supabase
      .from('user_exercises')
      .select('exercise_id')
      .eq('user_id', userId)
      .eq('date', date)

    if (error) {
      console.error('[exercises] Error fetching:', error)
      return []
    }

    const exerciseIds = data?.map(row => row.exercise_id) || []
    console.log('[exercises] ✓ Fetched completions:', exerciseIds)
    return exerciseIds
  } catch (err) {
    console.error('[exercises] Unexpected error:', err)
    return []
  }
}

export const getWeekCompletions = async (
  userId: string,
  weekStartDate: string
) => {
  try {
    const weekEndDate = getLocalDateBR(new Date(new Date(weekStartDate).getTime() + 7 * 24 * 60 * 60 * 1000))

    console.log('[exercises] Fetching week completions:', { userId, weekStartDate, weekEndDate })

    const { data, error } = await supabase
      .from('user_exercises')
      .select('date, exercise_id')
      .eq('user_id', userId)
      .gte('date', weekStartDate)
      .lte('date', weekEndDate)

    if (error) {
      console.error('[exercises] Error fetching week:', error)
      return { byDay: {}, total: 0 }
    }

    // Group by day
    const byDay: { [key: string]: string[] } = {}
    data?.forEach(row => {
      if (!byDay[row.date]) byDay[row.date] = []
      byDay[row.date].push(row.exercise_id)
    })

    const total = data?.length || 0
    console.log('[exercises] ✓ Week completions:', { byDay, total })
    return { byDay, total }
  } catch (err) {
    console.error('[exercises] Unexpected error:', err)
    return { byDay: {}, total: 0 }
  }
}
