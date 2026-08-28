'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Shield, Lock, CreditCard, QrCode, Star, Loader2, Clock, MessageCircle } from 'lucide-react'
import { DORES_CHECKOUT_CONFIG, DORES_PIX_PRICE, DORES_CARD_INSTALLMENTS } from '@/lib/checkout-config'

const CardFields = dynamic(() => import('@/components/checkout/CardFields'), {
  loading: () => <div className="h-40 rounded-xl bg-gray-50 animate-pulse mt-2" />,
})

type BillingType = 'PIX' | 'CREDIT_CARD'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white'

const TESTIMONIALS = [
  { name: 'Janine Turco', weeks: 'Avaliação Google', text: 'Adorei o acompanhamento da Fabiana Pinheiro. Super atenciosa, dedicada e muito profissional! Acompanhou toda a minha gestação com muito cuidado. Recomendo de olhos fechados!', stars: 5 },
  { name: 'Letícia H.', weeks: 'Avaliação Google', text: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores nas costas. Recomendo!', stars: 5 },
  { name: 'Mariana S.', weeks: 'Avaliação Google', text: 'Excelente profissional! Me ajudou muito na fase final da gestação com dores e desconfortos. As orientações foram essenciais para eu me sentir mais confortável.', stars: 5 },
]

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
    const key = 'dores_checkout_timer_end'
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

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function DoresCheckoutPage() {
  const router = useRouter()
  const countdown = useCountdown()
  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [fbc, setFbc] = useState('')
  const [fbp, setFbp] = useState('')
  const [utmData, setUtmData] = useState<Record<string, string> | null>(null)
  const checkoutEventId = useRef(`ict_dores_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    window.fbq?.('track', 'InitiateCheckout', { value: DORES_PIX_PRICE, currency: 'BRL' }, { eventID: checkoutEventId.current })

    const params = new URLSearchParams(window.location.search)
    const fbclid = params.get('fbclid')
    if (fbclid) {
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`
      setFbc(fbcValue)
      document.cookie = `_fbc=${fbcValue};max-age=7776000;path=/;SameSite=Lax`
    } else {
      const fbcCookie = document.cookie.split(';').find(c => c.trim().startsWith('_fbc='))
      if (fbcCookie) setFbc(fbcCookie.trim().slice(5))
    }
    const fbpCookie = document.cookie.split(';').find(c => c.trim().startsWith('_fbp='))
    if (fbpCookie) setFbp(fbpCookie.trim().slice(5))

    try {
      const raw = sessionStorage.getItem('utm_data')
      if (raw) setUtmData(JSON.parse(raw))
    } catch {}
  }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [installmentCount, setInstallmentCount] = useState(1)

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardMonth, setCardMonth] = useState('')
  const [cardYear, setCardYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const emailsMatch = confirmEmail.length > 0 && email.toLowerCase() === confirmEmail.toLowerCase()
  const emailsMismatch = confirmEmail.length > 0 && email.toLowerCase() !== confirmEmail.toLowerCase()

  const selectedInstallment = DORES_CARD_INSTALLMENTS.find(i => i.count === installmentCount) || DORES_CARD_INSTALLMENTS[DORES_CARD_INSTALLMENTS.length - 1]
  const currentPrice = billingType === 'CREDIT_CARD' ? selectedInstallment.total : DORES_PIX_PRICE

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) { setError('Preencha todos os campos obrigatórios.'); return }
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) { setError('Os e-mails não são iguais.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (!cpf || cpf.replace(/\D/g, '').length < 11) { setError('Informe seu CPF.'); return }
    if (billingType === 'CREDIT_CARD') {
      if (!cardNumber || !cardHolder || !cardMonth || !cardYear || !cardCvv) { setError('Preencha todos os dados do cartão.'); return }
      if (!phone) { setError('Informe o telefone do titular do cartão.'); return }
      window.fbq?.('track', 'AddPaymentInfo', { value: DORES_PIX_PRICE, currency: 'BRL' })
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password, cpf, billingType,
          price: currentPrice,
          fbc: fbc || undefined,
          fbp: fbp || undefined,
          utmData: utmData || undefined,
          checkoutEventId: checkoutEventId.current,
          productType: 'dores',
          installmentCount: billingType === 'CREDIT_CARD' ? installmentCount : undefined,
          card: billingType === 'CREDIT_CARD' ? {
            holderName: cardHolder,
            number: cardNumber.replace(/\s/g, ''),
            expiryMonth: cardMonth,
            expiryYear: cardYear,
            ccv: cardCvv,
            phone: phone.replace(/\D/g, ''),
          } : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.error || 'Erro ao processar pagamento.'); setLoading(false); return }

      if (data.confirmed && data.billingType === 'CREDIT_CARD') {
        localStorage.setItem('customAuthSession', JSON.stringify({ userId: data.userId, email: data.email, timestamp: new Date().toISOString() }))
        if (data.paymentId) sessionStorage.setItem('checkout_payment_id', data.paymentId)
        router.push(`/apoio/checkout/sucesso?metodo=cartao&value=${currentPrice}`); return
      }
      if (data.billingType === 'PIX') {
        sessionStorage.setItem('pix_data', JSON.stringify({
          paymentId: data.paymentId, pixQrCode: data.pixQrCode,
          pixPayload: data.pixPayload, pixExpiration: data.pixExpiration,
          email: email.trim().toLowerCase(), value: data.value,
          successUrl: '/apoio/checkout/sucesso',
        }))
        router.push(`/checkout/pix?id=${data.paymentId}`); return
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {countdown && countdown !== '00:00' && (
        <div className="text-white text-center py-2.5 px-4 flex items-center justify-center gap-3 sticky top-0 z-50"
          style={{ background: 'linear-gradient(90deg, #7B5A94, #9B6FB5)' }}>
          <Clock size={14} className="animate-pulse" />
          <span className="text-sm font-semibold">Oferta por tempo limitado</span>
          <span className="bg-white/20 text-white text-sm font-black px-3 py-0.5 rounded-full tabular-nums">{countdown}</span>
        </div>
      )}

      <header className="border-b border-gray-100 px-4 py-3 bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/pregnant-yoga.webp" alt="Logo" width={30} height={30} className="rounded-full object-cover" />
            <span className="font-bold text-gray-800 text-sm">Gestar em Movimento</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Lock size={13} />
            <span>Compra segura</span>
          </div>
        </div>
      </header>

      {/* Banner — acima do formulário */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="relative h-[220px] overflow-hidden md:hidden">
          <Image
            src="/checkout-banner-dores.png"
            alt="Exercícios que aliviam as dores e devolvem seu bem-estar"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <Image
          src="/checkout-banner-dores.png"
          alt="Exercícios que aliviam as dores e devolvem seu bem-estar"
          width={1672}
          height={941}
          priority
          className="hidden md:block w-full h-auto"
          sizes="(min-width: 768px) 1024px"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 items-start">

        {/* Formulário */}
        <div className="order-1">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <form onSubmit={handleSubmit}>

              {/* Tabs PIX / Cartão */}
              <div className="border-b border-gray-200 flex">
                {([
                  { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={14} />, label: 'Cartão' },
                  { type: 'PIX' as BillingType, icon: <QrCode size={14} />, label: 'Pix' },
                ] as const).map(({ type, icon, label }) => (
                  <button key={type} type="button" onClick={() => setBillingType(type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                      billingType === type
                        ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}>
                    {icon}{label}
                    {type === 'PIX' && (
                      <span className="ml-1 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">+rápido</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2.5">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nome completo" className={inputCls} required autoComplete="name" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="E-mail" className={inputCls} required autoComplete="email" />
                  <div className="relative">
                    <input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)}
                      placeholder="Confirme seu e-mail"
                      className={`${inputCls} pr-9 ${emailsMatch ? 'border-emerald-400 focus:ring-emerald-300' : emailsMismatch ? 'border-red-400 focus:ring-red-300' : ''}`}
                      required autoComplete="email" />
                    {emailsMatch && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                    {emailsMismatch && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-bold">✕</span>}
                  </div>
                  {emailsMismatch && <p className="text-xs text-red-500 px-1">Os e-mails não são iguais</p>}
                  {emailsMatch && <p className="text-xs text-emerald-600 px-1">✓ E-mails conferem!</p>}

                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Crie uma senha (mín. 6 caracteres)" className={inputCls} required minLength={6} autoComplete="new-password" />

                  <div className="grid grid-cols-2 gap-2.5">
                    <input type="text" value={cpf}
                      onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      onBlur={e => setCpf(formatCPF(e.target.value))}
                      placeholder="CPF" className={inputCls} required inputMode="numeric" autoComplete="off" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="Telefone" className={inputCls} inputMode="numeric" autoComplete="tel" />
                  </div>
                </div>

                {billingType === 'CREDIT_CARD' && (
                  <CardFields
                    cardNumber={cardNumber} setCardNumber={setCardNumber}
                    cardHolder={cardHolder} setCardHolder={setCardHolder}
                    cardMonth={cardMonth} setCardMonth={setCardMonth}
                    cardYear={cardYear} setCardYear={setCardYear}
                    cardCvv={cardCvv} setCardCvv={setCardCvv}
                    installmentCount={installmentCount} setInstallmentCount={setInstallmentCount}
                    installments={DORES_CARD_INSTALLMENTS}
                  />
                )}

                {billingType === 'PIX' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <QrCode size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">PIX · R${currentPrice.toFixed(2).replace('.', ',')} à vista</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Você recebe o QR code agora. Acesso liberado em segundos após o pagamento.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full disabled:opacity-60 text-white font-black text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #9B6FB5 100%)' }}>
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Processando...</>
                  ) : (
                    <><Lock size={16} />{billingType === 'PIX' ? 'Pagar agora com PIX' : 'Pagar agora'}</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4">
                  {[
                    { icon: <Lock size={12} />, label: 'SSL seguro' },
                    { icon: <Shield size={12} />, label: '7 dias garantia' },
                    { icon: <CheckCircle size={12} />, label: 'Asaas' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1 text-gray-400 text-xs">{icon}<span>{label}</span></div>
                  ))}
                </div>

                <a href="https://wa.me/5547989293040?text=Olá! Tenho uma dúvida sobre as aulas de Alívio de Dores."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <MessageCircle size={12} className="text-emerald-500" />
                  Dúvidas? Fale com o suporte
                </a>

                <p className="text-xs text-gray-300 text-center leading-relaxed">
                  Ao clicar em pagar você declara que leu e concorda com os{' '}
                  <a href="/terms" className="underline">Termos de Uso</a> e a{' '}
                  <a href="/privacy" className="underline">Política de Privacidade</a>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Coluna direita — produto */}
        <div className="order-2 flex flex-col gap-5">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="relative h-56">
              <Image src="/pregnant-yoga.webp" alt="Alívio de Dores na Gestação" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #7B5A94, #9B6FB5)' }}>Acesso imediato</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Sequências de exercícios</p>
                <h1 className="text-white text-2xl font-black leading-tight">Alívio de Dores na Gestação</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/pregnant-yoga.webp" alt="Dra. Fabiana" width={48} height={48} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Criado por</p>
              <p className="text-sm font-bold text-gray-800">Dra. Fabiana Pinheiro</p>
              <p className="text-xs text-gray-500">Fisioterapeuta Pélvica</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">O que está incluído</p>
            <ul className="space-y-2.5">
              {DORES_CHECKOUT_CONFIG.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Depoimentos */}
          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.weeks}</p>
                  </div>
                  <div className="flex">{[...Array(t.stars)].map((_, j) => <Star key={j} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Garantia de 7 dias</p>
              <p className="text-xs text-emerald-600 mt-0.5">Se não ficar satisfeita, devolvemos 100% do valor — sem burocracia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
