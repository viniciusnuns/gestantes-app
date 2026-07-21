'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActivityStore } from '@/lib/stores/activityStore'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

function UpgradeSuccessContent() {
  const guardReady = useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get('metodo') || 'pix'
  const valueParam = searchParams.get('value')
  const pixelValue = valueParam ? parseFloat(valueParam) : 147.00
  const paymentId = searchParams.get('id')

  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!guardReady) return

    // Dispara pixel de Purchase com eventID para deduplicação com CAPI
    if (paymentId) {
      window.fbq?.('track', 'Purchase', { value: pixelValue, currency: 'BRL' }, { eventID: paymentId })
    } else {
      window.fbq?.('track', 'Purchase', { value: pixelValue, currency: 'BRL' })
    }

    // Recarrega o perfil do store para refletir product_type: 'full'
    useActivityStore.getState().loadUserData()

    // Countdown para redirecionar para home
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          router.replace('/home')
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [guardReady, router, pixelValue, paymentId])

  if (!guardReady) return null

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Animação */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}>
          ✨
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shadow">
          ✓
        </div>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-2">
        Upgrade realizado!
      </h1>
      <p className="text-gray-500 text-sm max-w-xs mb-2">
        {metodo === 'cartao'
          ? 'Seu cartão foi aprovado! Você já tem acesso a todo o conteúdo do app.'
          : 'Pagamento confirmado! Você já tem acesso a todo o conteúdo do app.'}
      </p>

      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-2xl px-6 py-4 space-y-2 max-w-xs w-full">
        {['Exercícios de mobilidade, pelve e respiração', 'Meditação e relaxamento', 'Educação gestacional', 'Calendário completo'].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm text-purple-800">
            <span className="text-purple-500">✓</span>
            {f}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Redirecionando para o app em {countdown}s...
      </p>

      <button
        onClick={() => router.replace('/home')}
        className="mt-3 text-sm font-bold text-purple-700 underline underline-offset-2"
      >
        Ir agora →
      </button>
    </div>
  )
}

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UpgradeSuccessContent />
    </Suspense>
  )
}
