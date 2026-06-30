'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Copy, CheckCircle, Loader2, FlaskConical, Clock } from 'lucide-react'
import { CHECKOUT_CONFIG } from '@/lib/checkout-config'

function useCountdown(targetMs: number) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setTimeLeft('00:00')
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return { timeLeft, expired }
}

function PixContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('id')

  const [pixData, setPixData] = useState<{
    pixQrCode: string
    pixPayload: string
    pixExpiration: string
    email: string
    paymentId?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [expiresAt] = useState(() => Date.now() + 30 * 60 * 1000)

  const { timeLeft, expired } = useCountdown(expiresAt)

  // paymentId vem da URL ou do sessionStorage como fallback (PWA pode perder a URL)
  const effectivePaymentId = paymentId || pixData?.paymentId || null

  const isSandbox = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('vercel.app')
  )

  useEffect(() => {
    const raw = sessionStorage.getItem('pix_data')
    if (raw) {
      try { setPixData(JSON.parse(raw)) } catch {}
    }
  }, [])

  const checkPayment = useCallback(async () => {
    if (!effectivePaymentId) return
    try {
      const res = await fetch(`/api/checkout/status/${effectivePaymentId}`)
      const data = await res.json()
      if (data.confirmed) {
        if (data.userId) {
          localStorage.setItem('customAuthSession', JSON.stringify({
            userId: data.userId,
            email: data.email,
            timestamp: new Date().toISOString(),
          }))
        }
        sessionStorage.removeItem('pix_data')
        router.push('/checkout/sucesso?metodo=pix')
      }
    } catch {}
  }, [effectivePaymentId, router])

  // Polling a cada 3 segundos
  useEffect(() => {
    if (!effectivePaymentId) return
    const interval = setInterval(checkPayment, 3000)
    return () => clearInterval(interval)
  }, [effectivePaymentId, checkPayment])

  // Verifica imediatamente ao retornar para a aba/app (visibilitychange + focus + pageshow)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') checkPayment() }
    const onFocus = () => checkPayment()
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) checkPayment() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onFocus)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [checkPayment])

  const handleManualCheck = async () => {
    setChecking(true)
    await checkPayment()
    setChecking(false)
  }

  const simulateSandbox = async () => {
    if (!effectivePaymentId) return
    setSimulating(true)
    try {
      const res = await fetch('/api/checkout/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: effectivePaymentId }),
      })
      const data = await res.json()
      if (data.ok) {
        if (data.userId) {
          localStorage.setItem('customAuthSession', JSON.stringify({
            userId: data.userId,
            email: data.email,
            timestamp: new Date().toISOString(),
          }))
        }
        sessionStorage.removeItem('pix_data')
        router.push('/checkout/sucesso?metodo=pix')
      } else {
        alert(`Erro na simulação: ${data.error || JSON.stringify(data)}`)
      }
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    } finally {
      setSimulating(false)
    }
  }

  const copyPixCode = async () => {
    if (!pixData?.pixPayload) return
    await navigator.clipboard.writeText(pixData.pixPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (!pixData && !paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Dados do PIX não encontrados.</p>
          <button onClick={() => router.push('/checkout')} className="text-primary-500 underline text-sm">
            Voltar ao checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <Image src="/pregnant-yoga.webp" alt="Logo" width={28} height={28} className="rounded-full object-cover" />
          <span className="font-bold text-text-primary text-sm">Gestar em Movimento</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4">
        <div className="w-full max-w-sm">

          {/* Card principal */}
          <div className="bg-white rounded-3xl shadow-sm border border-warm-200 overflow-hidden">

            {/* Topo colorido com valor */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-6 pt-6 pb-8 text-center text-white">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Total a pagar</p>
              <p className="text-4xl font-bold">{CHECKOUT_CONFIG.priceDisplay}</p>
              {pixData?.email && (
                <p className="text-xs opacity-70 mt-2">Acesso para {pixData.email}</p>
              )}
            </div>

            <div className="px-6 pb-6 -mt-4">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {pixData?.pixQrCode ? (
                  <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-warm-100">
                    <Image
                      src={`data:image/png;base64,${pixData.pixQrCode}`}
                      alt="QR Code PIX"
                      width={172}
                      height={172}
                      className="block"
                    />
                  </div>
                ) : (
                  <div className="w-[172px] h-[172px] bg-warm-100 rounded-2xl flex items-center justify-center shadow-md">
                    <Loader2 size={28} className="animate-spin text-warm-400" />
                  </div>
                )}
              </div>

              {/* Timer de expiração */}
              {timeLeft && (
                <div className={`flex items-center justify-center gap-1.5 mb-4 text-sm font-medium ${expired ? 'text-red-500' : 'text-amber-600'}`}>
                  <Clock size={14} />
                  <span>{expired ? 'PIX expirado' : `Expira em ${timeLeft}`}</span>
                </div>
              )}

              {/* Copia e cola */}
              {pixData?.pixPayload && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-warm-200" />
                    <span className="text-xs text-text-light whitespace-nowrap">ou use o código</span>
                    <div className="flex-1 h-px bg-warm-200" />
                  </div>

                  <div className="bg-warm-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-text-secondary font-mono break-all leading-relaxed line-clamp-2">
                      {pixData.pixPayload}
                    </p>
                  </div>

                  <button
                    onClick={copyPixCode}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    {copied ? (
                      <><CheckCircle size={16} /> Copiado!</>
                    ) : (
                      <><Copy size={16} /> Copiar código PIX</>
                    )}
                  </button>
                </>
              )}

              {/* Detector automático */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-warm-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-text-light">Detectando pagamento automaticamente</span>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-white rounded-2xl border border-warm-200 px-5 py-4 mt-3">
            <p className="text-xs font-semibold text-text-primary mb-3 uppercase tracking-wide">Como pagar</p>
            <ol className="space-y-2">
              {[
                'Abra o app do seu banco',
                'Escolha pagar com PIX ou QR code',
                'Escaneie o código ou use "copia e cola"',
                'Confirme e pronto — acesso liberado na hora!',
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

          {/* Botão manual de verificação */}
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary-200 bg-white text-sm font-semibold text-primary-600 hover:bg-primary-50 disabled:opacity-50 transition-colors"
          >
            {checking
              ? <><Loader2 size={15} className="animate-spin" /> Verificando...</>
              : 'Já paguei — liberar acesso'}
          </button>

          {isSandbox && effectivePaymentId && (
            <button
              onClick={simulateSandbox}
              disabled={simulating}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-sm text-violet-700 hover:bg-violet-100 disabled:opacity-50 transition-colors"
            >
              <FlaskConical size={14} className={simulating ? 'animate-pulse' : ''} />
              {simulating ? 'Simulando...' : '🧪 Simular pagamento (sandbox)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PixPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-50" />}>
      <PixContent />
    </Suspense>
  )
}
