'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { customSignUp } from '@/lib/customAuth'
import Link from 'next/link'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Email inválido')
      setLoading(false)
      return
    }

    try {
      console.log('[SignupForm] Creating user with email:', email)
      const result = await customSignUp(email, password)

      if (!result.success) {
        console.log('[SignupForm] Signup failed:', result.error)
        setError(result.error || 'Erro ao criar conta')
        setLoading(false)
        return
      }

      console.log('[SignupForm] User created successfully!')
      setSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Redirect to onboarding immediately
      console.log('[SignupForm] Redirecting to /onboarding')
      setTimeout(() => {
        router.push('/onboarding')
      }, 500)
    } catch (err: any) {
      console.error('[SignupForm] Error:', err)
      setError(err.message || 'Erro ao criar conta')
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
        <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Senha
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          Conta criada com sucesso! Redirecionando...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-md"
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary-700 font-semibold hover:underline">
          Fazer login
        </Link>
      </p>
    </form>
  )
}
