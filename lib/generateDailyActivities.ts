import { supabase } from './supabase'
import { exercises } from './data'

/**
 * Configuração de categorias padrão por trimestre
 * Exemplo: 2º trimestre = 1 respiração, 1 pelve, 1 assoalho pélvico
 */
const CATEGORY_CONFIG = {
  '1º': ['respiracao', 'core', 'pelve'], // 1º trimestre
  '2º': ['respiracao', 'pelve', 'assoalho-pelvico'], // 2º trimestre
  '3º': ['respiracao', 'parto', 'ansiedade'], // 3º trimestre
}

/**
 * Gera daily_activities para um usuário a partir de uma data inicial até 30 dias
 * Se já existem atividades, preenche apenas os dias faltantes até hoje
 */
/**
 * Lazy-load activities for a specific date
 * Call this when user navigates to a day that might not have activities yet
 */
export const ensureDailyActivitiesForDate = async (
  userId: string,
  targetDate: string,
  weekAtRegistration: number
) => {
  try {
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    // Check if activities exist for target date
    const { data: existing } = await supabase
      .from('daily_activities')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_date', targetDate)
      .limit(1)

    // If already exists, no need to generate
    if (existing && existing.length > 0) {
      console.log('[ensureDailyActivitiesForDate] Activities already exist for:', targetDate)
      return { success: true, generated: 0 }
    }

    // Get the last date with activities
    const { data: lastActivity } = await supabase
      .from('daily_activities')
      .select('activity_date')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(1)
      .single()

    const lastDate = lastActivity ? new Date(lastActivity.activity_date) : new Date(weekAtRegistration)
    lastDate.setHours(0, 0, 0, 0)

    // Generate from (lastDate + 1) to target date
    let startDate = new Date(lastDate)
    startDate.setDate(startDate.getDate() + 1)

    // Batch generate activities
    await generateDailyActivities(userId, weekAtRegistration, startDate, target)

    return { success: true, generated: 0 } // Count handled by generateDailyActivities
  } catch (error: any) {
    console.error('[ensureDailyActivitiesForDate] Error:', error)
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
    console.log('[generateDailyActivities] Starting for user:', userId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let startDate = customStartDate || new Date(today)
    let endDate = customEndDate || new Date(today)
    endDate.setDate(endDate.getDate() + 29) // 30 dias a partir do startDate

    // Se customStartDate não foi fornecido, buscar a última data com atividades
    if (!customStartDate) {
      const { data: lastActivity, error: lastError } = await supabase
        .from('daily_activities')
        .select('activity_date')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(1)
        .single()

      // Se já houver atividades, começar do dia seguinte
      if (!lastError && lastActivity) {
        const lastDate = new Date(lastActivity.activity_date)
        startDate = new Date(lastDate)
        startDate.setDate(startDate.getDate() + 1)

        // Se já tem atividades até hoje ou além, não precisa gerar mais
        if (lastDate >= today) {
          console.log('[generateDailyActivities] Activities already generated until:', lastDate.toISOString().split('T')[0])
          return { success: true, generated: 0 }
        }

        console.log('[generateDailyActivities] Generating from:', startDate.toISOString().split('T')[0])
      } else {
        console.log('[generateDailyActivities] No activities found, generating from today')
      }
    } else {
      console.log('[generateDailyActivities] Custom range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0])
    }

    // 2. Calcular trimestre inicial baseado na semana de registro
    const getTrimesterForWeek = (week: number) => {
      if (week <= 13) return '1º'
      if (week <= 27) return '2º'
      return '3º'
    }

    // 3. Gerar atividades para cada dia
    const activitiesToInsert = []
    let currentDate = new Date(startDate)
    let currentWeek = weekAtRegistration

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      const trimester = getTrimesterForWeek(currentWeek)
      const categoryConfig = CATEGORY_CONFIG[trimester as keyof typeof CATEGORY_CONFIG]

      // Pega 1 exercício de cada categoria sugerida
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

      // Avançar 1 dia
      currentDate.setDate(currentDate.getDate() + 1)

      // A cada 7 dias, incrementar a semana
      if ((currentDate.getTime() - startDate.getTime()) % (7 * 24 * 60 * 60 * 1000) === 0) {
        currentWeek = Math.min(currentWeek + 1, 40)
      }
    }

    // 4. Inserir no banco (em chunks para evitar timeout)
    if (activitiesToInsert.length > 0) {
      const CHUNK_SIZE = 30
      let inserted = 0

      for (let i = 0; i < activitiesToInsert.length; i += CHUNK_SIZE) {
        const chunk = activitiesToInsert.slice(i, i + CHUNK_SIZE)

        const { error: insertError } = await supabase
          .from('daily_activities')
          .insert(chunk)

        if (insertError) {
          // Ignore duplicate key errors (already exists)
          if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
            console.warn('[generateDailyActivities] Some activities already exist, skipping duplicates')
            continue
          }

          console.error('[generateDailyActivities] Insert error:', insertError.message)
          return { success: false, error: insertError.message }
        }

        inserted += chunk.length
      }

      console.log('[generateDailyActivities] ✅ Generated', inserted, 'activities')
      return { success: true, generated: inserted }
    }

    return { success: true, generated: 0 }
  } catch (error: any) {
    console.error('[generateDailyActivities] Error:', error)
    return { success: false, error: error.message }
  }
}
