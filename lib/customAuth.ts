import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface AuthResult {
  success: boolean
  user?: { id: string; email: string }
  error?: string
}

const DATA_ISOLATION_VERSION = '1.0'
const DATA_ISOLATION_KEY = 'data-isolation-version'

function ensureDataIsolation(): void {
  if (typeof window === 'undefined') return

  try {
    const currentVersion = localStorage.getItem(DATA_ISOLATION_KEY)

    if (currentVersion !== DATA_ISOLATION_VERSION) {
      const keysToClean = [
        'customAuthSession',
        'gem-progress-v1',
        'onboarding_data',
        'user-progress',
        'user-session',
        'progress',
      ]

      keysToClean.forEach(key => localStorage.removeItem(key))
      localStorage.setItem(DATA_ISOLATION_KEY, DATA_ISOLATION_VERSION)
    }
  } catch (err) {
    console.error('[customAuth] Data isolation error:', err)
  }
}

export const customSignUp = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    ensureDataIsolation()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('customAuthSession')
      localStorage.removeItem('gem-progress-v1')
      localStorage.removeItem('onboarding_data')
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' }
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return { success: false, error: 'Este email já está cadastrado' }
    }

    let userId: string

    try {
      userId = crypto.randomUUID()

      if (!userId || typeof userId !== 'string' || userId.length === 0) {
        throw new Error(`Invalid UUID: ${userId}`)
      }

      if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error(`Invalid UUID format: ${userId}`)
      }
    } catch (uuidErr: any) {
      console.error('[customAuth] UUID generation failed:', uuidErr)
      return { success: false, error: 'Erro ao gerar ID: ' + uuidErr.message }
    }

    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(password, 6)
    } catch (hashErr: any) {
      console.error('[customAuth] Password hashing failed:', hashErr)
      return { success: false, error: 'Erro ao processar senha' }
    }

    const now = new Date().toISOString()
    const insertPayload = {
      id: userId,
      email,
      password_hash: hashedPassword,
      name: null,
      week_at_registration: 0,
      phone: null,
      healthy_pregnancy: true,
      had_intercurrence: false,
      doctor_approved: true,
      objectives: [],
      discomforts: [],
      onboarding_completed: false,
      onboarding_completed_at: null,
      user_type: 'beta',
      account_created_at: now,
      created_at: now,
      updated_at: now
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert([insertPayload])
      .select()

    if (insertError) {
      console.error('[customAuth] Insert failed:', insertError.message)
      return { success: false, error: insertError.message || 'Erro ao criar conta' }
    }

    if (typeof window !== 'undefined') {
      const sessionData = {
        userId,
        email,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('customAuthSession', JSON.stringify(sessionData))
      window.dispatchEvent(new Event('gem:user-login'))
    }

    return { success: true, user: { id: userId, email } }
  } catch (err: any) {
    console.error('[customAuth] Signup error:', err)
    return { success: false, error: err.message || 'Erro ao criar conta' }
  }
}

export const customSignIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    ensureDataIsolation()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('customAuthSession')
      localStorage.removeItem('gem-progress-v1')
      localStorage.removeItem('onboarding_data')
    }

    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' }
    }

    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single()

    if (queryError || !user || !user.password_hash) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (typeof window !== 'undefined') {
      const sessionData = {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('customAuthSession', JSON.stringify(sessionData))
      window.dispatchEvent(new Event('gem:user-login'))
    }

    return { success: true, user: { id: user.id, email: user.email } }
  } catch (err: any) {
    console.error('[customAuth] Login error:', err)
    return { success: false, error: err.message || 'Erro ao fazer login' }
  }
}

export const getCurrentUser = (): { id: string; email: string } | null => {
  if (typeof window === 'undefined') return null

  try {
    const sessionStr = localStorage.getItem('customAuthSession')
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)
    const id = session.id || session.userId

    if (id && session.email) {
      return { id, email: session.email }
    }
  } catch (err) {
    console.error('[customAuth] Error parsing session:', err)
  }

  return null
}

export const customSignOut = () => {
  if (typeof window !== 'undefined') {
    try {
      ['customAuthSession', 'gem-progress-v1', 'onboarding_data', 'onboarding_form_draft'].forEach(key =>
        localStorage.removeItem(key)
      )
    } catch (err) {
      console.error('[customAuth] Error clearing session:', err)
    }
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[customAuth] getUserProfile error:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.error('[customAuth] getUserProfile unexpected error:', err)
    return null
  }
}
