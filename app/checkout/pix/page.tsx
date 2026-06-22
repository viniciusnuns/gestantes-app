'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Copy, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react'

function PixContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('id')

  const [pixData, setPixData] = useState<{
    pixQrCode: string
    pixPayload: string
    pixExpiration: string
    email: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [checkCount, setCheckCount] = useState(0)

  useEffect(() => {
    const raw = sessionStorage.getItem('pix_data')
    if (raw) {
      try {
        setPixData(JSON.parse(raw))
      } catch {}
    }
  }, [])

  const checkPayment = useCallback(async () => {
    if (!paymentId) return
    setPolling(true)
    try {
      const res = await fetch(`/api/checkout/status/${paymentId}`)
      const data = await res.json()
      if (data.confirmed) {
        if (data.userId) {
          const sessionData = { userId: data.userId, email: data.email, timestamp: new Date().toISOString() }
          localStorage.setItem('customAuthSession', JSON.stringify(sessionData))
        }
        sessionStorage.removeItem('pix_data')
        router.push('/checkout/sucesso?metodo=pix')
      } else {
        setCheckCount(c => c + 1)
      }
    } catch {
      setCheckCount(c => c + 1)
    } finally {
      setPolling(false)
    }
  }, [paymentId, router])

  // Polling automático a cada 4 segundos
  useEffect(() => {
    if (!paymentId) return
    const interval = setInterval(checkPayment, 4000)
    return () => clearInterval(interval)
  }, [paymentId, checkPayment])

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <Image src="/pregnant-yoga.webp" alt="Logo" width={32} height={32} className="rounded-full object-cover" />
          <span className="font-bold text-text-primary text-sm">Gestar em Movimento</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
              <Clock size={14} className="text-amber-500 animate-pulse" />
              <span className="text-sm text-amber-700 font-medium">Aguardando pagamento</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-warm-200 p-6 text-center">
            <h1 className="text-lg font-bold text-text-primary mb-1">Pague com PIX</h1>
            <p className="text-sm text-text-secondary mb-6">
              Abra o app do seu banco e escaneie o QR code
            </p>

            {/* QR Code */}
            {pixData?.pixQrCode ? (
              <div className="inline-block border-4 border-white shadow-sm rounded-2xl overflow-hidden mb-5">
                <Image
                  src={`data:image/png;base64,${pixData.pixQrCode}`}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="block"
                />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] mx-auto bg-warm-100 rounded-2xl flex items-center justify-center mb-5">
                <Loader2 size={32} className="animate-spin text-warm-400" />
              </div>
            )}

            {/* PIX copia e cola */}
            {pixData?.pixPayload && (
              <div className="mb-5">
                <p className="text-xs text-text-light mb-2">Ou use o código PIX copia e cola:</p>
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 text-left mb-2">
                  <p className="text-xs text-text-secondary font-mono break-all leading-relaxed line-clamp-2">
                    {pixData.pixPayload}
                  </p>
                </div>
                <button
                  onClick={copyPixCode}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                  }`}
                >
                  {copied ? (
                    <><CheckCircle size={16} /> Copiado!</>
                  ) : (
                    <><Copy size={16} /> Copiar código PIX</>
                  )}
                </button>
              </div>
            )}

            {/* Polling status */}
            <div className="border-t border-warm-100 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-text-light">
                {polling ? (
                  <><Loader2 size={12} className="animate-spin" /> Verificando pagamento...</>
                ) : (
                  <><RefreshCw size={12} /> Verificação automática ativa</>
                )}
              </div>
              {checkCount > 0 && (
                <p className="text-xs text-text-light mt-1">Verificação #{checkCount} — aguardando confirmação</p>
              )}
            </div>
          </div>

          {/* Instruções */}
          <div className="mt-6 bg-white rounded-2xl border border-warm-200 p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Como pagar:</h3>
            <ol className="space-y-2">
              {[
                'Abra o app do seu banco',
                'Acesse a área PIX',
                'Escaneie o QR code ou use o código copia e cola',
                'Confirme o pagamento de R$ 47,00',
                'Acesso liberado automaticamente em segundos!',
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

          <button
            onClick={checkPayment}
            disabled={polling}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-warm-200 text-sm text-text-secondary hover:bg-warm-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={polling ? 'animate-spin' : ''} />
            Já paguei — verificar agora
          </button>
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
