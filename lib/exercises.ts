import { supabase } from './supabase'
import { getLocalDateBR } from './utils'

export const saveExerciseCompletion = async (
  userId: string,
  exerciseId: string,
  date: string = getLocalDateBR()
) => {
  try {
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

    return { success: true }
  } catch (err) {
    console.error('[exercises] Unexpected error saving:', err)
    return { success: false, error: err }
  }
}

export const removeExerciseCompletion = async (
  userId: string,
  exerciseId: string,
  date: string = getLocalDateBR()
) => {
  try {
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

    return { success: true }
  } catch (err) {
    console.error('[exercises] Unexpected error removing:', err)
    return { success: false, error: err }
  }
}

export const getExerciseCompletions = async (
  userId: string,
  date: string = getLocalDateBR()
) => {
  try {
    const { data, error } = await supabase
      .from('user_exercises')
      .select('exercise_id')
      .eq('user_id', userId)
      .eq('date', date)

    if (error) {
      console.error('[exercises] Error fetching:', error)
      return []
    }

    return data?.map(row => row.exercise_id) || []
  } catch (err) {
    console.error('[exercises] Unexpected error fetching:', err)
    return []
  }
}

export const getWeekCompletions = async (
  userId: string,
  weekStartDate: string
) => {
  try {
    const weekEndDate = getLocalDateBR(new Date(new Date(weekStartDate).getTime() + 7 * 24 * 60 * 60 * 1000))

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

    const byDay: { [key: string]: string[] } = {}
    data?.forEach(row => {
      if (!byDay[row.date]) byDay[row.date] = []
      byDay[row.date].push(row.exercise_id)
    })

    return { byDay, total: data?.length || 0 }
  } catch (err) {
    console.error('[exercises] Unexpected error fetching week:', err)
    return { byDay: {}, total: 0 }
  }
}
