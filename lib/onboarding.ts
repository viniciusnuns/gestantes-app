import { supabase } from './supabase'

export interface OnboardingData {
  name: string
  weekAtRegistration: number
  estimatedDueDate: string
  firstPregnancy: boolean
  email: string
  phone: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
  objectives: string[]
  discomforts: string[]
  userType?: string
  productType?: string
  termsAccepted?: boolean
}

export const saveOnboardingData = async (userId: string, data: OnboardingData) => {
  try {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data }),
    })

    const json = await res.json()

    if (!json.success) {
      console.error('[onboarding] API error:', json.error)
      return { success: false, error: new Error(json.error) }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_data', JSON.stringify(data))
      localStorage.setItem('onboarding_completed', 'true')
      window.dispatchEvent(new Event('gem:onboarding-completed'))
    }

    return { success: true }
  } catch (error: any) {
    console.error('[onboarding] Unexpected error:', error)
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
      console.error('[onboarding] getUserData error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[onboarding] getUserData unexpected error:', error)
    return null
  }
}

export const createInitialProfile = async (userId: string, email: string) => {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return { success: true, existed: true }
    }

    const now = new Date().toISOString()

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name: null,
        week_at_registration: 20,
        registration_date: now,
        estimated_due_date: null,
        phone: null,
        healthy_pregnancy: true,
        had_intercurrence: false,
        doctor_approved: true,
        objectives: [],
        discomforts: [],
        onboarding_completed: false,
        onboarding_completed_at: null,
        user_type: 'patient',
        account_created_at: now,
        created_at: now,
        updated_at: now
      })

    if (insertError) {
      console.error('[onboarding] createInitialProfile error:', insertError.message)
      return { success: false, error: insertError }
    }

    return { success: true, existed: false }
  } catch (error: any) {
    console.error('[onboarding] createInitialProfile unexpected error:', error)
    return { success: false, error }
  }
}
