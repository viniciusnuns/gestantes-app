'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function SucessoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get('metodo')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          router.push('/onboarding')
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <header className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <Image src="/pregnant-yoga.webp" alt="Logo" width={32} height={32} className="rounded-full object-cover" />
          <span className="font-bold text-text-primary text-sm">Gestar em Movimento</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-full max-w-sm">
          {/* Ícone de sucesso */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle size={44} className="text-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={18} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Parabéns, mamãe!</span>
            <Sparkles size={18} className="text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-3 leading-tight">
            {metodo === 'pix'
              ? 'PIX confirmado! Acesso liberado 🎉'
              : 'Pagamento aprovado! 🎉'}
          </h1>

          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Sua conta no Gestar em Movimento está criada e pronta. Que começo de jornada incrível para você e seu bebê! 🌸
          </p>

          <div className="bg-white rounded-2xl border border-warm-200 p-5 mb-8 text-left space-y-3">
            {[
              'Acesso imediato a todos os exercícios',
              'Calendário personalizado já configurado',
              'Suporte via WhatsApp disponível',
              'Conteúdo atualizado regularmente',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/onboarding')}
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200 mb-3"
          >
            Começar agora
            <ArrowRight size={18} />
          </button>

          <p className="text-xs text-text-light">
            Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  )
}
