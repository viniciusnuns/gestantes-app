import { supabase } from './supabase'

export interface OnboardingData {
  name: string
  week: number
  dueDate: string
  firstPregnancy: boolean
  riskPregnancy: boolean
  desiredBirth: string
  email: string
  phone: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
  objectives: string[]
  discomforts: string[]
}

export const saveOnboardingData = async (userId: string, data: OnboardingData) => {
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: data.email,
        name: data.name,
        week: data.week,
        phone: data.phone,
        healthy_pregnancy: data.healthyPregnancy,
        had_intercurrence: data.hadIntercurrence,
        doctor_approved: data.doctorApproved,
        objectives: data.objectives,
        discomforts: data.discomforts,
        updated_at: new Date()
      })

    if (error) {
      console.error('Erro ao salvar dados:', error)
      return { success: false, error }
    }

    // Also save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_data', JSON.stringify(data))
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao salvar onboarding:', error)
    return { success: false, error }
  }
}

export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar dados:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
}
