import { supabase } from './supabase'

export interface OnboardingData {
  name: string
  weekAtRegistration: number
  estimatedDueDate: string
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
  userType?: string
}

export const saveOnboardingData = async (userId: string, data: OnboardingData) => {
  try {
    console.log('🔄 INICIANDO SALVAMENTO...')
    console.log('1️⃣ User ID:', userId)
    console.log('2️⃣ Email:', data.email)
    console.log('3️⃣ Name:', data.name)
    console.log('4️⃣ Week at Registration:', data.weekAtRegistration)
    console.log('5️⃣ Phone:', data.phone)
    console.log('6️⃣ Objectives:', data.objectives)
    console.log('7️⃣ Discomforts:', data.discomforts)

    const now = new Date().toISOString()

    // First, check if user exists
    console.log('📋 Verificando se usuário existe na tabela users...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError) {
      console.log('⚠️ Usuário não existe ainda. Criando novo...')

      // User doesn't exist, so INSERT instead
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
          created_at: now,
          updated_at: now
        })

      if (insertError) {
        console.error('❌ ERRO AO INSERIR:', insertError.message)
        return { success: false, error: insertError }
      }

      console.log('✅ Usuário criado e dados salvos!')
    } else {
      console.log('✅ Usuário existe. Atualizando dados...')

      // Get existing user to preserve password_hash and registration_date
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('password_hash, registration_date')
        .eq('id', userId)
        .single()

      if (fetchError || !existingUser) {
        console.error('❌ ERRO AO BUSCAR USUÁRIO EXISTENTE:', fetchError?.message)
        return { success: false, error: fetchError }
      }

      // User exists, so UPDATE (preserving password_hash and registration_date)
      const { error: updateError } = await supabase
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
          password_hash: existingUser.password_hash,
          registration_date: existingUser.registration_date || now,
          updated_at: now
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ ERRO AO ATUALIZAR:', updateError.message)
        return { success: false, error: updateError }
      }

      console.log('✅ Dados atualizados com sucesso!')
    }

    // Also save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_data', JSON.stringify(data))
      console.log('💾 Dados salvos também no localStorage (backup)')

      // Generate daily activities for next 30 days
      console.log('🔄 Gerando atividades diárias...')
      try {
        const generateResponse = await fetch('/api/activities/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            weekAtRegistration: data.weekAtRegistration,
          }),
        })

        if (generateResponse.ok) {
          const generateResult = await generateResponse.json()
          console.log('✅ Atividades geradas:', generateResult.generated)
        } else {
          console.warn('⚠️ Erro ao gerar atividades:', generateResponse.statusText)
        }
      } catch (genErr: any) {
        console.warn('⚠️ Erro na geração de atividades:', genErr.message)
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('❌ ERRO GERAL:', error)
    return { success: false, error: error }
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

export const createInitialProfile = async (userId: string, email: string) => {
  try {
    console.log('[createInitialProfile] Creating initial profile for user:', userId)

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!checkError && existingUser) {
      console.log('[createInitialProfile] User already exists, skipping creation')
      return { success: true, existed: true }
    }

    const now = new Date().toISOString()

    // Create initial profile with minimal data
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
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
      console.error('[createInitialProfile] Error creating profile:', insertError.message)
      return { success: false, error: insertError }
    }

    console.log('[createInitialProfile] Initial profile created successfully')
    return { success: true, existed: false }
  } catch (error: any) {
    console.error('[createInitialProfile] Unexpected error:', error)
    return { success: false, error }
  }
}
