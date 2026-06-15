import { supabase } from './supabase'
import { exercises } from './data'

const CATEGORY_CONFIG = {
  '1º': ['respiracao', 'core', 'pelve'],
  '2º': ['respiracao', 'pelve', 'assoalho-pelvico'],
  '3º': ['respiracao', 'parto', 'ansiedade'],
}

export const ensureDailyActivitiesForDate = async (
  userId: string,
  targetDate: string,
  weekAtRegistration: number
) => {
  try {
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    const { data: existing } = await supabase
      .from('daily_activities')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_date', targetDate)
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: true, generated: 0 }
    }

    const { data: lastActivity } = await supabase
      .from('daily_activities')
      .select('activity_date')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(1)
      .single()

    const lastDate = lastActivity ? new Date(lastActivity.activity_date) : new Date(weekAtRegistration)
    lastDate.setHours(0, 0, 0, 0)

    let startDate = new Date(lastDate)
    startDate.setDate(startDate.getDate() + 1)

    await generateDailyActivities(userId, weekAtRegistration, startDate, target)

    return { success: true, generated: 0 }
  } catch (error: any) {
    console.error('[generateDailyActivities] ensureForDate error:', error)
    return { success: false, error: error.message }
  }
}

export const generateDailyActivities = async (
  userId: string,
  weekAtRegistration: number,
  customStartDate?: Date,
  customEndDate?: Date
) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let startDate = customStartDate || new Date(today)
    let endDate = customEndDate || new Date(today)
    endDate.setDate(endDate.getDate() + 29)

    if (!customStartDate) {
      const { data: lastActivity, error: lastError } = await supabase
        .from('daily_activities')
        .select('activity_date')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(1)
        .single()

      if (!lastError && lastActivity) {
        const lastDate = new Date(lastActivity.activity_date)
        startDate = new Date(lastDate)
        startDate.setDate(startDate.getDate() + 1)

        if (lastDate >= today) {
          return { success: true, generated: 0 }
        }
      }
    }

    const getTrimesterForWeek = (week: number) => {
      if (week <= 13) return '1º'
      if (week <= 27) return '2º'
      return '3º'
    }

    const activitiesToInsert = []
    let currentDate = new Date(startDate)
    let currentWeek = weekAtRegistration

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const trimester = getTrimesterForWeek(currentWeek)
      const categoryConfig = CATEGORY_CONFIG[trimester as keyof typeof CATEGORY_CONFIG]

      categoryConfig.forEach((category, slotOrder) => {
        const exerciseForCategory = exercises.find(
          (ex) => ex.category === category && ex.trimester === trimester
        )

        if (exerciseForCategory) {
          activitiesToInsert.push({
            user_id: userId,
            activity_date: dateString,
            exercise_id: exerciseForCategory.id,
            slot_order: slotOrder + 1,
            trimester: trimester === '1º' ? 1 : trimester === '2º' ? 2 : 3,
            week_number: currentWeek,
            generated_at: new Date().toISOString(),
          })
        }
      })

      currentDate.setDate(currentDate.getDate() + 1)

      if ((currentDate.getTime() - startDate.getTime()) % (7 * 24 * 60 * 60 * 1000) === 0) {
        currentWeek = Math.min(currentWeek + 1, 40)
      }
    }

    if (activitiesToInsert.length > 0) {
      const CHUNK_SIZE = 30
      let inserted = 0

      for (let i = 0; i < activitiesToInsert.length; i += CHUNK_SIZE) {
        const chunk = activitiesToInsert.slice(i, i + CHUNK_SIZE)

        const { error: insertError } = await supabase
          .from('daily_activities')
          .insert(chunk)

        if (insertError) {
          if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
            continue
          }

          console.error('[generateDailyActivities] Insert error:', insertError.message)
          return { success: false, error: insertError.message }
        }

        inserted += chunk.length
      }

      return { success: true, generated: inserted }
    }

    return { success: true, generated: 0 }
  } catch (error: any) {
    console.error('[generateDailyActivities] Error:', error)
    return { success: false, error: error.message }
  }
}
