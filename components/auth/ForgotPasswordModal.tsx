'use client'

import { useState } from 'react'
import Modal from '@/components/shared/Modal'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Digite seu email')
      return
    }

    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Erro ao redefinir senha')
        return
      }

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError('Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSuccess(false)
    setError(null)
    setEmail('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Senha" size="sm">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl">🔓</div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Senha redefinida!
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Sua senha temporária é{' '}
              <span className="font-bold text-primary-600 text-base">123456</span>
            </p>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Use essa senha para entrar no app normalmente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full gradient-primary text-white py-3 rounded-full font-bold"
          >
            Entrar agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Digite seu email e redefiniremos sua senha para uma senha temporária.
          </p>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Seu Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="seu@email.com"
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email}
            className="w-full gradient-primary text-white py-3 rounded-full font-bold transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Aguarde...' : 'Redefinir senha'}
          </button>
        </div>
      )}
    </Modal>
  )
}
