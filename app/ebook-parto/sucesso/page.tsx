'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { BookOpen } from 'lucide-react'

function EbookPartoSuccessContent() {
  const guardReady = useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get('metodo') || 'pix'
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    if (!guardReady) return

    window.fbq?.('track', 'Purchase', { value: 17, currency: 'BRL', content_name: 'Ebook Parto' })

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          router.replace('/meus-ebooks')
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [guardReady, router])

  if (!guardReady) return null

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)' }}>
          <BookOpen size={40} className="text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shadow">
          ✓
        </div>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-2">
        Ebook desbloqueado!
      </h1>
      <p className="text-gray-500 text-sm max-w-xs mb-2">
        {metodo === 'cartao'
          ? 'Pagamento aprovado! Seu ebook Gestante Bem Informada: Parto já está disponível.'
          : 'Pagamento confirmado! Seu ebook Gestante Bem Informada: Parto já está disponível.'}
      </p>

      <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 max-w-xs w-full">
        <p className="text-sm font-semibold text-rose-800 mb-1">📖 Gestante Bem Informada: Parto</p>
        <p className="text-xs text-rose-700">11 capítulos · PDF completo · Dra. Fabiana Pinheiro</p>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Indo para Meus Ebooks em {countdown}s...
      </p>

      <button
        onClick={() => router.replace('/meus-ebooks')}
        className="mt-3 text-sm font-bold text-rose-700 underline underline-offset-2"
      >
        Ir para Meus Ebooks →
      </button>
    </div>
  )
}

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function EbookPartoSucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <EbookPartoSuccessContent />
    </Suspense>
  )
}
