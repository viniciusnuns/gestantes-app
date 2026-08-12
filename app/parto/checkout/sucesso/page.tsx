'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { PARTO_PIX_PRICE } from '@/lib/checkout-config'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

function SucessoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get('metodo')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const paymentId = searchParams.get('id')
      || sessionStorage.getItem('checkout_payment_id')
      || (() => { try { return JSON.parse(sessionStorage.getItem('pix_data') || '{}').paymentId } catch { return null } })()
    if (paymentId) sessionStorage.removeItem('checkout_payment_id')
    const valueParam = searchParams.get('value')
    const pixelValue = valueParam ? parseFloat(valueParam) : PARTO_PIX_PRICE
    if (paymentId) {
      window.fbq?.('track', 'Purchase', { value: pixelValue, currency: 'BRL' }, { eventID: paymentId })
    } else {
      window.fbq?.('track', 'Purchase', { value: pixelValue, currency: 'BRL' })
    }
    window.fbq?.('track', 'ViewContent', { content_name: 'Compra Confirmada', value: pixelValue, currency: 'BRL' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('checkout_paid', 'true')
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/onboarding')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #FDF4F8 0%, #F3F0FF 100%)' }}>

      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            <h1 className="text-3xl font-black text-gray-800">Compra confirmada!</h1>
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <p className="text-gray-600 text-lg">
            Suas aulas sobre o Parto estão liberadas.
          </p>
          {metodo === 'cartao' && (
            <p className="text-sm text-gray-500">Pagamento aprovado via cartão de crédito.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left space-y-3">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">O que você desbloqueou</p>
          {[
            '10 aulas completas sobre o trabalho de parto',
            'Fases do parto explicadas pela Dra. Fabiana',
            'Posições, exercícios e orientações para o grande dia',
            'Acesso pelo celular, tablet ou computador',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={() => router.push('/onboarding')}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-lg py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
            Começar agora
            <ArrowRight size={20} />
          </button>
          <p className="text-xs text-gray-400">
            Redirecionando automaticamente em {countdown}s...
          </p>
        </div>

        <div className="flex justify-center">
          <Image src="/pregnant-yoga.webp" alt="Gestar em Movimento" width={80} height={80} className="rounded-full object-cover opacity-60" />
        </div>
      </div>
    </div>
  )
}

export default function PartoSucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  )
}
