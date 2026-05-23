'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { customSignIn, getUserProfile } from '@/lib/customAuth'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[LoginForm] Starting login flow...')

    try {
      console.log('[LoginForm] Authenticating with email:', email)
      const result = await customSignIn(email, password)

      if (!result.success) {
        console.log('[LoginForm] Authentication failed:', result.error)
        setError(result.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      if (!result.user) {
        console.log('[LoginForm] No user in response')
        setError('Erro ao fazer login')
        setLoading(false)
        return
      }

      const userId = result.user.id
      console.log('[LoginForm] User authenticated:', userId)

      // Fetch user profile to check onboarding status
      let nextRoute: '/home' | '/onboarding' = '/onboarding'

      try {
        const profile = await getUserProfile(userId)
        if (profile) {
          console.log('[LoginForm] Profile found, onboarding_completed:', profile.onboarding_completed)
          nextRoute = profile.onboarding_completed ? '/home' : '/onboarding'
        }
      } catch (profileErr) {
        console.warn('[LoginForm] Error fetching profile, defaulting to /onboarding:', profileErr)
      }

      console.log('[LoginForm] Redirecting to:', nextRoute)
      router.replace(nextRoute)
    } catch (err: any) {
      console.error('[LoginForm] Error:', err)
      setError(err.message || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-md"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Não tem conta?{' '}
        <Link href="/signup" className="text-primary-700 font-semibold hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
