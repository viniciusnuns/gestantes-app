import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface AuthResult {
  success: boolean
  user?: { id: string; email: string }
  error?: string
}

const DATA_ISOLATION_VERSION = '1.0'
const DATA_ISOLATION_KEY = 'data-isolation-version'

/**
 * CRITICAL: Migração de isolamento de dados
 * Limpa dados corrompidos de versões antigas para TODOS os usuários
 * Executa uma única vez quando usuário faz login
 */
function ensureDataIsolation(): void {
  if (typeof window === 'undefined') return

  try {
    const currentVersion = localStorage.getItem(DATA_ISOLATION_KEY)

    // Se é primeira vez com nova versão, limpa tudo
    if (currentVersion !== DATA_ISOLATION_VERSION) {
      console.warn('[MIGRATION] Detected old/missing data isolation. Running cleanup...')

      // Limpar TODOS os dados de localStorage para garantir limpeza completa
      const keysToClean = [
        'customAuthSession',
        'gem-progress-v1',
        'onboarding_data',
        'user-progress', // possível key antiga
        'user-session', // possível key antiga
        'progress', // possível key antiga
      ]

      keysToClean.forEach(key => {
        if (localStorage.getItem(key)) {
          console.warn(`[MIGRATION] Removing old key: ${key}`)
          localStorage.removeItem(key)
        }
      })

      // Marcar que já fez migração
      localStorage.setItem(DATA_ISOLATION_KEY, DATA_ISOLATION_VERSION)
      console.log('[MIGRATION] ✓ Data isolation migration complete')
    }
  } catch (err) {
    console.error('[MIGRATION] Error during data isolation:', err)
  }
}

/**
 * Custom signup - creates user directly in public.users with random UUID
 * Solution: Validated UUID generation + strict type checking
 */
export const customSignUp = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    console.log('[customSignUp] ========== START SIGNUP ==========')

    // STEP 0a: Migração de isolamento (valida para TODOS os usuários)
    ensureDataIsolation()

    console.log('[customSignUp] Clearing previous user data from localStorage...')

    // STEP 0b: Clear old user data (CRITICAL for isolation)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customAuthSession')
      localStorage.removeItem('gem-progress-v1')
      localStorage.removeItem('onboarding_data')
      console.log('[customSignUp] ✓ Previous user data cleared')
    }

    console.log('[customSignUp] Input validation...')

    // STEP 1: Validate input
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' }
    }

    console.log('[customSignUp] ✓ Input valid - email:', email)

    // STEP 2: Check if user already exists
    console.log('[customSignUp] Checking if email already exists...')
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      console.log('[customSignUp] Email already exists:', email)
      return { success: false, error: 'Este email já está cadastrado' }
    }

    // STEP 3: Generate UUID with STRICT validation
    console.log('[customSignUp] Generating UUID...')
    let userId: string

    try {
      userId = crypto.randomUUID()
      console.log('[customSignUp] UUID generated:', userId)

      // CRITICAL: Validate UUID format and type
      if (!userId || typeof userId !== 'string' || userId.length === 0) {
        throw new Error(`Invalid UUID: ${userId}`)
      }

      // Validate UUID format (should be 36 chars: 8-4-4-4-12)
      if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error(`Invalid UUID format: ${userId}`)
      }

      console.log('[customSignUp] ✓ UUID valid and formatted correctly')
    } catch (uuidErr: any) {
      console.error('[customSignUp] UUID generation failed:', uuidErr)
      return { success: false, error: 'Erro ao gerar ID: ' + uuidErr.message }
    }

    // STEP 4: Hash password
    console.log('[customSignUp] Hashing password...')
    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(password, 10)
      console.log('[customSignUp] ✓ Password hashed')
    } catch (hashErr: any) {
      console.error('[customSignUp] Password hashing failed:', hashErr)
      return { success: false, error: 'Erro ao processar senha' }
    }

    // STEP 5: Prepare insert data with type checking
    console.log('[customSignUp] Preparing insert payload...')
    const insertPayload = {
      id: userId,
      email,
      password_hash: hashedPassword,
      name: 'Usuária',
      week: 20,
      phone: null,
      healthy_pregnancy: true,
      had_intercurrence: false,
      doctor_approved: true,
      objectives: [],
      discomforts: [],
      onboarding_completed: false,
      onboarding_completed_at: null,
      user_type: 'patient',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('[customSignUp] Insert payload:', {
      id: insertPayload.id,
      id_type: typeof insertPayload.id,
      email: insertPayload.email,
      password_hash_length: insertPayload.password_hash.length
    })

    // STEP 6: Insert into database
    console.log('[customSignUp] Inserting into database...')
    const { error: insertError, data: insertData } = await supabase
      .from('users')
      .insert([insertPayload])
      .select()

    if (insertError) {
      console.error('[customSignUp] ✗ Insert failed')
      console.error('[customSignUp] Error code:', insertError.code)
      console.error('[customSignUp] Error message:', insertError.message)
      console.error('[customSignUp] Error details:', insertError.details)
      console.error('[customSignUp] Error hint:', insertError.hint)
      return { success: false, error: insertError.message || 'Erro ao criar conta' }
    }

    console.log('[customSignUp] ✓ Insert successful')
    console.log('[customSignUp] Insert data:', insertData)

    // STEP 7: Store session in localStorage
    console.log('[customSignUp] Storing session in localStorage...')
    if (typeof window !== 'undefined') {
      const sessionData = {
        userId: userId,
        email: email,
        timestamp: new Date().toISOString()
      }
      const sessionJson = JSON.stringify(sessionData)
      console.log('[customSignUp] Session data:', sessionJson)
      localStorage.setItem('customAuthSession', sessionJson)

      // Verify it was stored
      const retrieved = localStorage.getItem('customAuthSession')
      console.log('[customSignUp] ✓ Session stored and verified')
      console.log('[customSignUp] Retrieved from localStorage:', retrieved)
    }

    console.log('[customSignUp] ========== SIGNUP COMPLETE ==========')
    return {
      success: true,
      user: { id: userId, email }
    }
  } catch (err: any) {
    console.error('[customSignUp] ✗ FATAL ERROR:', err)
    console.error('[customSignUp] Stack:', err.stack)
    return { success: false, error: err.message || 'Erro ao criar conta' }
  }
}

/**
 * Custom login - validates against database
 * Returns a JWT-like token for the session
 */
export const customSignIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    console.log('[customSignIn] ========== START LOGIN ==========')
    console.log('[customSignIn] Email:', email)

    // STEP 0a: Migração de isolamento (valida para TODOS os usuários, novos ou antigos)
    ensureDataIsolation()

    // STEP 0b: Clear old user data (CRITICAL for isolation)
    console.log('[customSignIn] Clearing previous user data from localStorage...')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customAuthSession')
      localStorage.removeItem('gem-progress-v1')
      localStorage.removeItem('onboarding_data')
      console.log('[customSignIn] ✓ Previous user data cleared')
    }

    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' }
    }

    // Get user from database
    console.log('[customSignIn] Querying user from database...')
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single()

    console.log('[customSignIn] Query error:', queryError)
    console.log('[customSignIn] Query result user:', user ? { id: user.id, email: user.email, has_password_hash: !!user.password_hash } : null)

    if (queryError) {
      console.error('[customSignIn] Query failed:', queryError.message, queryError.code)
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (!user) {
      console.error('[customSignIn] User not found:', email)
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (!user.password_hash) {
      console.error('[customSignIn] Password hash is empty for user:', email)
      return { success: false, error: 'Email ou senha incorretos' }
    }

    // Validate password
    console.log('[customSignIn] Comparing passwords...')
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    console.log('[customSignIn] Password valid:', passwordValid)

    if (!passwordValid) {
      console.error('[customSignIn] Invalid password for:', email)
      return { success: false, error: 'Email ou senha incorretos' }
    }

    console.log('[customSignIn] User authenticated:', user.id)

    // Store authentication in localStorage
    if (typeof window !== 'undefined') {
      const sessionData = {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('customAuthSession', JSON.stringify(sessionData))
      console.log('[customSignIn] ✓ Session stored')
    }

    console.log('[customSignIn] ========== LOGIN COMPLETE ==========')
    return {
      success: true,
      user: { id: user.id, email: user.email }
    }
  } catch (err: any) {
    console.error('[customSignIn] ✗ FATAL ERROR:', err)
    console.error('[customSignIn] Stack:', err.stack)
    return { success: false, error: err.message || 'Erro ao fazer login' }
  }
}

/**
 * Get current authenticated user from localStorage session
 */
export const getCurrentUser = (): { id: string; email: string } | null => {
  if (typeof window === 'undefined') return null

  try {
    const sessionStr = localStorage.getItem('customAuthSession')
    console.log('[getCurrentUser] sessionStr from localStorage:', sessionStr)

    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      console.log('[getCurrentUser] parsed session:', session)

      // Handle both 'id' and 'userId' fields for compatibility
      const id = session.id || session.userId
      console.log('[getCurrentUser] id found:', id)
      console.log('[getCurrentUser] email found:', session.email)

      if (id && session.email) {
        console.log('[getCurrentUser] Returning user:', { id, email: session.email })
        return { id, email: session.email }
      } else {
        console.log('[getCurrentUser] Missing id or email')
      }
    } else {
      console.log('[getCurrentUser] No session string in localStorage')
    }
  } catch (err) {
    console.error('[getCurrentUser] Error parsing session:', err)
  }

  console.log('[getCurrentUser] Returning null')
  return null
}

/**
 * Logout - clears all session and user data ATOMICALLY
 * CRITICAL: Must clear ALL user data to prevent cross-contamination
 */
export const customSignOut = () => {
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove = [
        'customAuthSession',
        'gem-progress-v1',
        'onboarding_data'
      ]

      keysToRemove.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          console.warn(`[customSignOut] Clearing: ${key}`)
        }
        localStorage.removeItem(key)
      })

      console.log('[customSignOut] ✓ All user data cleared atomically')
      console.log('[customSignOut] localStorage keys remaining:', Object.keys(localStorage))
    } catch (err) {
      console.error('[customSignOut] Error clearing data:', err)
    }
  }
}

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    console.log('[getUserProfile] Fetching profile for userId:', userId)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('[getUserProfile] Query result - Error:', error)
    console.log('[getUserProfile] Query result - Data:', data)

    if (error) {
      console.error('[getUserProfile] Query error code:', error.code)
      console.error('[getUserProfile] Query error message:', error.message)
      return null
    }

    if (!data) {
      console.log('[getUserProfile] No data returned (null)')
      return null
    }

    console.log('[getUserProfile] Returning profile:', data)
    return data
  } catch (err) {
    console.error('[getUserProfile] Unexpected error:', err)
    return null
  }
}
