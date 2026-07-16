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
  termsAccepted?: boolean
}

export const saveOnboardingData = async (userId: string, data: OnboardingData) => {
  try {
    const now = new Date().toISOString()

    // Single query — check existence and fetch needed fields in one round-trip
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, password_hash, registration_date')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          name: data.name,
          week_at_registration: data.weekAtRegistration,
          registration_date: now,
          estimated_due_date: data.estimatedDueDate || null,
          phone: data.phone,
          healthy_pregnancy: data.healthyPregnancy,
          had_intercurrence: data.hadIntercurrence,
          doctor_approved: data.doctorApproved,
          objectives: data.objectives,
          discomforts: data.discomforts,
          onboarding_completed: true,
          onboarding_completed_at: now,
          user_type: data.userType ?? 'patient',
          first_pregnancy: data.firstPregnancy,
          terms_accepted_at: data.termsAccepted ? now : null,
          created_at: now,
          updated_at: now
        })

      if (insertError) {
        console.error('[onboarding] Insert error:', insertError.message)
        return { success: false, error: insertError }
      }
    } else {
      const { data: updatedRows, error: updateError } = await supabase
        .from('users')
        .update({
          email: data.email,
          name: data.name,
          week_at_registration: data.weekAtRegistration,
          estimated_due_date: data.estimatedDueDate || null,
          phone: data.phone,
          healthy_pregnancy: data.healthyPregnancy,
          had_intercurrence: data.hadIntercurrence,
          doctor_approved: data.doctorApproved,
          objectives: data.objectives,
          discomforts: data.discomforts,
          onboarding_completed: true,
          onboarding_completed_at: now,
          user_type: data.userType ?? 'patient',
          first_pregnancy: data.firstPregnancy,
          terms_accepted_at: data.termsAccepted ? now : null,
          password_hash: existingUser.password_hash,
          registration_date: existingUser.registration_date || now,
          updated_at: now
        })
        .eq('id', userId)
        .select('id')

      if (updateError) {
        console.error('[onboarding] Update error:', updateError.message)
        return { success: false, error: updateError }
      }

      if (!updatedRows || updatedRows.length === 0) {
        console.error('[onboarding] Update matched 0 rows — userId:', userId)
        return { success: false, error: new Error('Nenhuma linha atualizada. Tente novamente.') }
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_data', JSON.stringify(data))
      localStorage.setItem('onboarding_completed', 'true')
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
