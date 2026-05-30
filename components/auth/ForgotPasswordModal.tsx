'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
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
      console.log('[ForgotPassword] Sending request to /api/auth/forgot-password')
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      console.log('[ForgotPassword] Response status:', response.status)
      const data = await response.json()
      console.log('[ForgotPassword] Response data:', data)

      if (!response.ok) {
        console.log('[ForgotPassword] Response not ok, setting error')
        setError(data.error || 'Erro ao processar solicitação')
        setLoading(false)
        return
      }

      console.log('[ForgotPassword] Success, showing success message')
      setSuccess(true)
      setEmail('')
      setTimeout(() => {
        console.log('[ForgotPassword] Closing modal after 3 seconds')
        onClose()
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error('[ForgotPassword] Caught error:', err)
      setError('Erro ao enviar email')
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recuperar Senha" size="sm">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl">✅</div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Email Enviado!</h3>
            <p className="text-sm text-text-secondary">
              Verifique seu email para o link de recuperação de senha.
            </p>
          </div>
        </div>
      ) : (
        <div onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Seu Email 📧
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700">
            <p>
              <strong>💡 Dica:</strong> Verifique sua pasta de spam se não receber em 5 minutos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-300 py-3 rounded-full font-bold border-2 border-primary-200 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Enviando...' : '📧 Enviar Link'}
          </button>
        </div>
      )}
    </Modal>
  )
}
