import { supabase } from './supabase'

export interface TherapistProfile {
  id: string
  email: string
  name: string
  specialty?: string
  createdAt: string
}

export interface PatientData {
  id: string
  email: string
  name: string
  week: number
  phone?: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
  objectives: string[]
  discomforts: string[]
  createdAt: string
}

export interface PatientActivity {
  id: string
  userId: string
  exerciseId: string
  exerciseName: string
  completedAt: string
  durationMinutes?: number
}

export interface PatientProgress {
  userId: string
  points: number
  activeDays: number
  currentStreak: number
  totalExercises: number
}

// Get therapist's profile
export const getTherapistProfile = async (therapistId: string): Promise<TherapistProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', therapistId)
      .single()

    if (error) {
      console.error('Erro ao buscar perfil do terapeuta:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      specialty: data.specialty,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Erro ao buscar terapeuta:', error)
    return null
  }
}

// Get all patients assigned to therapist
export const getTherapistPatients = async (therapistId: string): Promise<PatientData[]> => {
  try {
    const { data, error } = await supabase
      .from('therapist_patients')
      .select('user_id')
      .eq('therapist_id', therapistId)

    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      return []
    }

    const patientIds = data.map(d => d.user_id)

    if (patientIds.length === 0) return []

    const { data: patientsData, error: patientsError } = await supabase
      .from('users')
      .select('*')
      .in('id', patientIds)

    if (patientsError) {
      console.error('Erro ao buscar dados dos pacientes:', patientsError)
      return []
    }

    return patientsData.map(p => ({
      id: p.id,
      email: p.email,
      name: p.name,
      week: p.week,
      phone: p.phone,
      healthyPregnancy: p.healthy_pregnancy,
      hadIntercurrence: p.had_intercurrence,
      doctorApproved: p.doctor_approved,
      objectives: p.objectives || [],
      discomforts: p.discomforts || [],
      createdAt: p.created_at
    }))
  } catch (error) {
    console.error('Erro ao buscar pacientes do terapeuta:', error)
    return []
  }
}

// Get patient details with activities and progress
export const getPatientDetails = async (patientId: string) => {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', patientId)
      .single()

    if (userError) {
      console.error('Erro ao buscar dados do paciente:', userError)
      return null
    }

    // Get activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('completed_activities')
      .select('*')
      .eq('user_id', patientId)
      .order('completed_at', { ascending: false })

    if (activitiesError) {
      console.error('Erro ao buscar atividades:', activitiesError)
    }

    // Get progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', patientId)
      .single()

    if (progressError) {
      console.error('Erro ao buscar progresso:', progressError)
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        week: userData.week,
        phone: userData.phone,
        healthyPregnancy: userData.healthy_pregnancy,
        hadIntercurrence: userData.had_intercurrence,
        doctorApproved: userData.doctor_approved,
        objectives: userData.objectives || [],
        discomforts: userData.discomforts || [],
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      },
      activities: (activitiesData || []).map(a => ({
        id: a.id,
        userId: a.user_id,
        exerciseId: a.exercise_id,
        exerciseName: a.exercise_name,
        completedAt: a.completed_at,
        durationMinutes: a.duration_minutes
      })),
      progress: progressData ? {
        userId: progressData.user_id,
        points: progressData.points || 0,
        activeDays: progressData.active_days || 0,
        currentStreak: progressData.current_streak || 0,
        totalExercises: progressData.total_exercises || 0
      } : {
        userId: patientId,
        points: 0,
        activeDays: 0,
        currentStreak: 0,
        totalExercises: 0
      }
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do paciente:', error)
    return null
  }
}

// Assign patient to therapist
export const assignPatientToTherapist = async (therapistId: string, patientEmail: string) => {
  try {
    // Get patient ID by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', patientEmail)
      .single()

    if (userError) {
      console.error('Paciente não encontrado:', userError)
      return { success: false, error: 'Paciente não encontrado' }
    }

    // Create relationship
    const { error } = await supabase
      .from('therapist_patients')
      .insert({
        therapist_id: therapistId,
        user_id: userData.id
      })

    if (error) {
      console.error('Erro ao atribuir paciente:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao atribuir paciente:', error)
    return { success: false, error: error.message }
  }
}
