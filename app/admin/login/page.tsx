'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If user already has a valid admin session, send them to /admin directly.
  useEffect(() => {
    let cancelled = false

    async function maybeRedirect() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || cancelled) return

      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (adminRecord && !cancelled) {
        router.replace('/admin')
      }
    }

    maybeRedirect()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('[AdminLogin] Attempting sign in for:', email)

      // Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[AdminLogin] Auth error:', authError.message)
        setError(`Email ou senha inválidos: ${authError.message}`)
        return
      }

      if (!data.session || !data.user) {
        console.error('[AdminLogin] No session returned after sign in')
        setError('Erro ao fazer login (sem sessão)')
        return
      }

      console.log('[AdminLogin] Sign in OK, user_id:', data.user.id)

      // Check if user is an admin.
      // Use maybeSingle() instead of single() so a missing row returns null
      // cleanly (single() responds 406 PGRST116 when 0 rows).
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (adminError) {
        console.error('[AdminLogin] admin_users query error:', adminError)
        await supabase.auth.signOut()
        setError(`Erro ao verificar permissões: ${adminError.message}`)
        return
      }

      if (!adminRecord) {
        console.warn('[AdminLogin] User signed in but no admin_users row found')
        await supabase.auth.signOut()
        setError('Você não tem permissão para acessar o dashboard admin')
        return
      }

      console.log('[AdminLogin] Admin verified, redirecting:', adminRecord)

      // Use replace so back button does not return to login screen.
      router.replace('/admin')
    } catch (err) {
      console.error('[AdminLogin] Unexpected error:', err)
      setError(err instanceof Error ? `Erro: ${err.message}` : 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Gestar em Movimento
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gestantes.com"
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? 'Fazendo login...' : 'Entrar'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-600">
            Apenas administradores tem acesso ao dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
