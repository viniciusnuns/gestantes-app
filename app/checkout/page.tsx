'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  CheckCircle, Shield, Lock, CreditCard, QrCode, FileText,
  Star, ChevronDown, ChevronUp, Loader2, Clock, MessageCircle
} from 'lucide-react'
import { CHECKOUT_CONFIG } from '@/lib/checkout-config'

type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

const TESTIMONIALS = [
  { name: 'Ana Paula M.', weeks: '32 semanas', text: 'Melhor decisão da minha gestação. Faço todos os dias e me sinto muito mais disposta!', stars: 5 },
  { name: 'Carla S.', weeks: '28 semanas', text: 'Os exercícios são práticos, dá para fazer em casa mesmo. A Dra. Fabiana explica tudo muito bem.', stars: 5 },
  { name: 'Juliana R.', weeks: '36 semanas', text: 'Me ajudou demais na preparação para o parto. Recomendo para todas as gestantes!', stars: 5 },
]

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
}
function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3)
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const key = 'checkout_timer_end'
    let end = parseInt(sessionStorage.getItem(key) || '0')
    if (!end || end < Date.now()) {
      end = Date.now() + 15 * 60 * 1000
      sessionStorage.setItem(key, String(end))
    }
    const tick = () => {
      const diff = end - Date.now()
      if (diff <= 0) { setTimeLeft('00:00'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

export default function CheckoutPage() {
  const router = useRouter()
  const countdown = useCountdown()
  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (!cpf || cpf.replace(/\D/g, '').length < 11) {
      setError('Informe seu CPF.')
      return
    }
    if (billingType === 'CREDIT_CARD' && (!cardNumber || !cardHolder || !cardExpiry || !cardCvv)) {
      setError('Preencha todos os dados do cartão.')
      return
    }

    setLoading(true)
    const [expiryMonth, expiryYear] = (cardExpiry || '').split('/')

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          cpf,
          billingType,
          card: billingType === 'CREDIT_CARD' ? {
            holderName: cardHolder,
            number: cardNumber.replace(/\s/g, ''),
            expiryMonth: expiryMonth?.trim(),
            expiryYear: expiryYear?.trim().length === 2 ? '20' + expiryYear.trim() : expiryYear?.trim(),
            ccv: cardCvv,
          } : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Erro ao processar pagamento. Tente novamente.')
        setLoading(false)
        return
      }

      if (data.confirmed && data.billingType === 'CREDIT_CARD') {
        localStorage.setItem('customAuthSession', JSON.stringify({
          userId: data.userId, email: data.email, timestamp: new Date().toISOString()
        }))
        router.push('/checkout/sucesso?metodo=cartao')
        return
      }

      if (data.billingType === 'PIX') {
        sessionStorage.setItem('pix_data', JSON.stringify({
          paymentId: data.paymentId, pixQrCode: data.pixQrCode,
          pixPayload: data.pixPayload, pixExpiration: data.pixExpiration,
          email: email.trim().toLowerCase(),
        }))
        router.push(`/checkout/pix?id=${data.paymentId}`)
        return
      }

      router.push(`/checkout/boleto?url=${encodeURIComponent(data.boletoUrl || '')}&id=${data.paymentId}`)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/pregnant-yoga.webp" alt="Logo" width={32} height={32} className="rounded-full object-cover" />
            <span className="font-bold text-gray-800 text-sm">Gestar em Movimento</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
            <Lock size={12} />
            Compra 100% segura
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 lg:gap-8 items-start">

        {/* ── COLUNA ESQUERDA — Produto ── */}
        <div className="flex flex-col gap-5 order-2 lg:order-1">

          {/* Card principal do produto */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="relative h-48 lg:h-56">
              <Image src="/pregnant-yoga.webp" alt="Gestar em Movimento" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Acesso imediato
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Programa completo</p>
                <h1 className="text-white text-2xl font-bold leading-tight">Gestar em Movimento</h1>
              </div>
            </div>

            <div className="p-5">
              {/* Criadora */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Image src="/pregnant-yoga.webp" alt="Dra. Fabiana" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Criado por</p>
                  <p className="text-sm font-bold text-gray-800">Dra. Fabiana Pinheiro</p>
                  <p className="text-xs text-gray-500">Fisioterapeuta Pélvica</p>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-800">4,9</span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-600">+847 mães</span>
              </div>

              {/* Features */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="lg:hidden w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3"
              >
                O que está incluído
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <ul className={`space-y-2.5 ${showDetails ? '' : 'hidden lg:block'}`}>
                {CHECKOUT_CONFIG.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Depoimentos */}
          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.weeks}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Garantia */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Garantia de 7 dias</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Se não ficar satisfeita, devolvemos 100% do valor — sem burocracia, sem perguntas.
              </p>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA — Formulário ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-4">

          {/* Resumo do pedido */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-800 px-5 py-3 flex items-center justify-between">
              <p className="text-white text-sm font-semibold">Resumo do pedido</p>
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">1 item</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Gestar em Movimento</p>
                <p className="text-xs text-gray-500 mt-0.5">Acesso imediato · Vitalício</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gray-800">R$ 47,00</p>
                <p className="text-xs text-gray-400">ou 12x de R$ 3,92</p>
              </div>
            </div>

            {/* Countdown */}
            {countdown && countdown !== '00:00' && (
              <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Clock size={14} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium flex-1">Oferta por tempo limitado</p>
                <span className="text-sm font-black text-amber-600 font-mono">{countdown}</span>
              </div>
            )}
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Método de pagamento */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Forma de pagamento</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'PIX' as BillingType, icon: <QrCode size={15} />, label: 'PIX', badge: 'Mais rápido' },
                    { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={15} />, label: 'Cartão', badge: '' },
                    { type: 'BOLETO' as BillingType, icon: <FileText size={15} />, label: 'Boleto', badge: '' },
                  ].map(({ type, icon, label, badge }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBillingType(type)}
                      className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                        billingType === type
                          ? 'border-rose-400 bg-rose-50 text-rose-600'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                      {icon}
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  ))}
                </div>

                {billingType === 'PIX' && (
                  <div className="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <QrCode size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      <strong>PIX instantâneo.</strong> Você recebe o QR code e o acesso é liberado em segundos após o pagamento.
                    </p>
                  </div>
                )}
                {billingType === 'BOLETO' && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <FileText size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Boleto bancário.</strong> Vence em 3 dias úteis. Acesso liberado em até 1 dia útil após o pagamento.
                    </p>
                  </div>
                )}
              </div>

              {/* Dados pessoais */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Seus dados de acesso</p>
                <div className="space-y-2.5">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nome completo" className={inputCls} required />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="E-mail" className={inputCls} required />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Crie uma senha (mín. 6 caracteres)" className={inputCls} required minLength={6} />
                  <input type="text" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))}
                    placeholder="CPF (000.000.000-00)" className={inputCls} required inputMode="numeric" />
                </div>
              </div>

              {/* Dados do cartão */}
              {billingType === 'CREDIT_CARD' && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Dados do cartão</p>
                  <div className="space-y-2.5">
                    <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="Número do cartão" inputMode="numeric"
                      className={`${inputCls} font-mono tracking-wider`} />
                    <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="Nome igual no cartão" className={`${inputCls} uppercase`} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="Validade MM/AA" inputMode="numeric" className={`${inputCls} font-mono`} />
                      <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="CVV" inputMode="numeric" className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-black text-base py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Processando...</>
                ) : (
                  <>
                    <Lock size={17} />
                    {billingType === 'PIX' ? 'Gerar QR Code PIX' :
                     billingType === 'BOLETO' ? 'Gerar Boleto' :
                     `Pagar R$ 47,00`}
                  </>
                )}
              </button>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                  <Lock size={11} /><span>SSL seguro</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                  <Shield size={11} /><span>7 dias garantia</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                  <CheckCircle size={11} /><span>Asaas</span>
                </div>
              </div>
            </form>
          </div>

          {/* Suporte WhatsApp */}
          <a
            href="https://wa.me/5547989293040?text=Olá! Tenho uma dúvida sobre o Gestar em Movimento."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <MessageCircle size={16} className="text-emerald-500" />
            Dúvidas? Fale com o suporte
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Gestar em Movimento · Dra. Fabiana Pinheiro ·{' '}
          <a href="/terms" className="underline hover:text-gray-600">Termos de uso</a>
        </p>
      </footer>
    </div>
  )
}
