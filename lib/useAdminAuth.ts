'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
}

export function useAdminAuth() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAdminAuth = useCallback(async () => {
    try {
      setLoading(true)

      // Get current session from Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setAdmin(null)
        setError(null)
        return
      }

      // Use maybeSingle() instead of single() — single() returns HTTP 406
      // (PGRST116) when 0 rows match, which pollutes the console and looks
      // like an auth/RLS failure even when it's just "not an admin".
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (adminError) {
        console.error('[useAdminAuth] Query error:', adminError)
        setError('Erro ao verificar permissões')
        setAdmin(null)
        return
      }

      if (!adminRecord) {
        setError('Você não tem permissão para acessar o dashboard admin')
        setAdmin(null)
        return
      }

      setAdmin({
        id: adminRecord.id,
        email: adminRecord.email,
        role: adminRecord.role,
      })
      setError(null)
    } catch (err) {
      console.error('[useAdminAuth] Error:', err)
      setError('Erro ao verificar permissões')
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAdminAuth()

    // Re-check whenever Supabase auth state changes (sign in / sign out / token refresh).
    // Without this, a successful login on /admin/login does not propagate to
    // the protected layout until a full page reload.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAuth()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAdminAuth])

  async function logout() {
    try {
      await supabase.auth.signOut()
      setAdmin(null)
      router.push('/admin/login')
    } catch (err) {
      console.error('[logout] Error:', err)
    }
  }

  return {
    admin,
    loading,
    error,
    isAdmin: !!admin,
    logout,
    refetch: checkAdminAuth,
  }
}
