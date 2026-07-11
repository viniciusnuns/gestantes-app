'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import { CHECKOUT_CONFIG } from '@/lib/checkout-config'
import { supabase } from '@/lib/supabase'

function BoletoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const boletoUrl = (() => {
    const raw = searchParams.get('url')
    if (!raw) return null
    try {
      const parsed = new URL(decodeURIComponent(raw))
      if (!parsed.hostname.endsWith('asaas.com')) return null
      return parsed.href
    } catch {
      return null
    }
  })()
  const paymentId = searchParams.get('id')

  const [checking, setChecking] = useState(false)
  const [paid, setPaid] = useState(false)

  const checkPayment = useCallback(async () => {
    if (!paymentId) return
    try {
      const res = await fetch(`/api/checkout/status/${paymentId}`)
      const data = await res.json()
      if (data.confirmed) {
        if (data.userId) {
          localStorage.setItem('customAuthSession', JSON.stringify({
            userId: data.userId,
            email: data.email,
            timestamp: new Date().toISOString(),
          }))
        }
        setPaid(true)
        window.location.href = '/checkout/sucesso?metodo=boleto'
      }
    } catch {}
  }, [paymentId])

  useEffect(() => {
    if (!paymentId) return
    const channel = supabase.channel(`checkout:${paymentId}`)
    channel
      .on('broadcast', { event: 'payment_confirmed' }, ({ payload }) => {
        if (payload?.userId) {
          localStorage.setItem('customAuthSession', JSON.stringify({
            userId: payload.userId,
            email: payload.email,
            timestamp: new Date().toISOString(),
          }))
        }
        setPaid(true)
        window.location.href = '/checkout/sucesso?metodo=boleto'
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [paymentId])

  // Polling a cada 30s (boleto pode demorar dias, mas o webhook chega na hora)
  useEffect(() => {
    if (!paymentId) return
    const interval = setInterval(checkPayment, 30_000)
    return () => clearInterval(interval)
  }, [paymentId, checkPayment])

  const handleManualCheck = async () => {
    setChecking(true)
    await checkPayment()
    setChecking(false)
  }

  if (!boletoUrl && !paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Dados do boleto não encontrados.</p>
          <button onClick={() => router.push('/checkout')} className="text-primary-500 underline text-sm">
            Voltar ao checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <Image src="/pregnant-yoga.webp" alt="Logo" width={28} height={28} className="rounded-full object-cover" />
          <span className="font-bold text-text-primary text-sm">Gestar em Movimento</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4">
        <div className="w-full max-w-sm">

          <div className="bg-white rounded-3xl shadow-sm border border-warm-200 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-6 pt-6 pb-8 text-center text-white">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Total a pagar</p>
              <p className="text-4xl font-bold">{CHECKOUT_CONFIG.priceDisplay}</p>
              <p className="text-xs opacity-70 mt-2">Boleto bancário — vence em 3 dias úteis</p>
            </div>

            <div className="px-6 pb-6 pt-4">
              {paid ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle size={40} className="text-green-500" />
                  <p className="font-semibold text-text-primary">Pagamento confirmado!</p>
                  <p className="text-sm text-text-secondary">Redirecionando...</p>
                  <Loader2 size={16} className="animate-spin text-primary-400" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-text-secondary text-center mb-5">
                    Clique no botão abaixo para abrir ou imprimir seu boleto. O acesso é liberado assim que o pagamento for compensado.
                  </p>

                  {boletoUrl ? (
                    <a
                      href={boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all"
                    >
                      <ExternalLink size={16} />
                      Abrir boleto
                    </a>
                  ) : (
                    <div className="w-full py-3.5 rounded-xl bg-warm-100 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-warm-400" />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-warm-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs text-text-light">Aguardando confirmação do pagamento</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 px-5 py-4 mt-3">
            <p className="text-xs font-semibold text-text-primary mb-3 uppercase tracking-wide">Como pagar</p>
            <ol className="space-y-2">
              {[
                'Clique em "Abrir boleto" para visualizar o documento',
                'Pague pelo app do banco ou em qualquer lotérica',
                'O pagamento é compensado em até 3 dias úteis',
                'Você receberá acesso automático assim que confirmado',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className="text-sm text-text-light hover:text-primary-500 transition-colors disabled:opacity-50"
            >
              {checking ? 'Verificando...' : 'Já paguei e não recebi acesso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BoletoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-50" />}>
      <BoletoContent />
    </Suspense>
  )
}
