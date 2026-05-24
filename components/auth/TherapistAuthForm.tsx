'use client'

import { useState } from 'react'
import { customSignUp, customSignIn } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

interface TherapistAuthFormProps {
  onSuccess: () => void
}

export default function TherapistAuthForm({ onSuccess }: TherapistAuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Create user account using custom auth
        const signUpResult = await customSignUp(email, password)

        if (!signUpResult.success) {
          setError(signUpResult.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }

        if (!signUpResult.user?.id) {
          setError('Erro ao criar conta. Tente novamente.')
          setLoading(false)
          return
        }

        // Create therapist profile
        const { error: profileError } = await supabase
          .from('therapists')
          .insert({
            id: signUpResult.user.id,
            email: email,
            name: name,
            specialty: specialty,
            user_id: signUpResult.user.id
          })

        if (profileError) {
          setError('Erro ao criar perfil de terapeuta: ' + profileError.message)
          console.error('Profile error:', profileError)
          setLoading(false)
          return
        }

        console.log('✅ Conta de terapeuta criada com sucesso!')
        onSuccess()
      } else {
        // Sign in using custom auth
        const signInResult = await customSignIn(email, password)

        if (!signInResult.success) {
          setError(signInResult.error || 'Email ou senha incorretos')
          setLoading(false)
          return
        }

        console.log('✅ Login bem-sucedido!')
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-warm-50 to-secondary-50/30 pointer-events-none"></div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">Gestar em Movimento</h1>
          <p className="text-text-secondary">Painel de Profissional de Saúde</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {isSignUp ? 'Criar Conta Profissional' : 'Acessar Painel'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Fisioterapia, Obstetrícia"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
                </div>
              </>
            )}

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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-300 to-secondary-300 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-warm-100">
            <p className="text-text-secondary mb-2">
              {isSignUp ? 'Já é cadastrado?' : 'Não é cadastrado?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-primary-300 font-semibold hover:text-primary-400 transition-colors"
            >
              {isSignUp ? 'Entrar aqui' : 'Criar conta profissional'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary/60">
          Acesso exclusivo para profissionais de saúde 🔒
        </p>
      </div>
    </div>
  )
}
