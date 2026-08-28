import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odirmtmompghjgmhotml.supabase.co'

let _adminClient: SupabaseClient<any, any, any> | null = null

export function getSupabaseAdmin(): SupabaseClient<any, any, any> {
  if (!_adminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }
    _adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _adminClient
}
