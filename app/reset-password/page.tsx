'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 text-center space-y-4">
            <p className="text-accent-700 font-semibold">❌ Token inválido</p>
            <p className="text-sm text-text-secondary">
              O link de recuperação não foi fornecido ou é inválido.
            </p>
            <Link
              href="/login"
              className="inline-block text-primary-300 hover:underline font-semibold"
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações locais
    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos')
      return
    }

    if (newPassword.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao resetar senha')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Erro ao processar recuperação de senha')
      console.error('[ResetPassword] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 text-center space-y-6">
            <div className="text-6xl">✅</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Sucesso!</h1>
              <p className="text-text-secondary">Sua senha foi atualizada com sucesso.</p>
            </div>
            <p className="text-sm text-text-secondary">
              Redirecionando para login em 2 segundos...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      {/* Header */}
      <header className="gradient-primary text-white px-5 pt-6 pb-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/login" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
          <div className="space-y-2 mb-8">
            <p className="text-text-secondary">
              Crie uma nova senha para sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Nova Senha 🔐
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent pr-12 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Confirmar Senha 🔐
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent pr-12 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl text-sm text-accent-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-300 py-4 rounded-full font-bold text-lg border-2 border-primary-200 hover:shadow-lg hover:from-primary-200 hover:to-secondary-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Atualizando...' : '✨ Atualizar Senha'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary-700">
            <p>
              <strong>💡 Dica:</strong> Use uma senha forte com letras, números e símbolos para maior segurança.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
