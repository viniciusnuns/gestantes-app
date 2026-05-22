'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'

interface AuthFormProps {
  onSuccess: () => void
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password)
        if (signUpError) {
          setError(signUpError.message)
        } else {
          onSuccess()
        }
      } else {
        const { error: signInError } = await signIn(email, password)
        if (signInError) {
          setError(signInError.message)
        } else {
          onSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-warm-50 to-secondary-50/30 pointer-events-none"></div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">Gestar em Movimento</h1>
          <p className="text-text-secondary">Bem-vinda ao seu espaço de bem-estar</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                E-mail 📧
              </label>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Senha 🔐
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-300 to-secondary-300 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-warm-100">
            <p className="text-text-secondary mb-2">
              {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-primary-300 font-semibold hover:text-primary-400 transition-colors"
            >
              {isSignUp ? 'Entrar aqui' : 'Criar conta'}
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-text-secondary/60">
          Seus dados são protegidos e criptografados 🔒
        </p>
      </div>
    </div>
  )
}
