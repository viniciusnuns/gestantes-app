'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/shared/Modal'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao processar solicitação')
        return
      }

      if (data.token) {
        onClose()
        router.push(`/reset-password?token=${data.token}`)
      } else {
        // Email não encontrado — mostra mensagem genérica sem revelar
        setError('Se esse email estiver cadastrado, você será redirecionada para redefinir sua senha.')
      }
    } catch (err) {
      setError('Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setError(null)
    setEmail('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Senha" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Digite seu email para criar uma nova senha.
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
          {loading ? '⏳ Aguarde...' : 'Continuar'}
        </button>
      </div>
    </Modal>
  )
}
