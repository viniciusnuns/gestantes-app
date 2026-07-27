'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Shield, Lock, CreditCard, QrCode, FileText, Star, Loader2, Clock, MessageCircle } from 'lucide-react'
import { CHECKOUT_CONFIG, PIX_PRICE, CARD_INSTALLMENTS } from '@/lib/checkout-config'

const CardFields = dynamic(() => import('@/components/checkout/CardFields'), {
  loading: () => <div className="h-40 rounded-xl bg-gray-50 animate-pulse mt-2" />,
})

type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

const TESTIMONIALS = [
  { name: 'Janine Turco', weeks: 'Avaliação Google', text: 'Adorei o acompanhamento da Fabiana Pinheiro. Super atenciosa, dedicada e muito profissional! Acompanhou toda a minha gestação com muito cuidado. Recomendo de olhos fechados!', stars: 5 },
  { name: 'Letícia H.', weeks: 'Avaliação Google', text: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores nas costas e nos exercícios em casa. Recomendo!', stars: 5 },
  { name: 'Tábata', weeks: 'Mensagem à Dra. Fabiana', text: 'Cecília nasceu de parto normal. Consegui fazer as respirações no expulsivo bem como treinamos. Não tive laceração — foi tudo perfeito.', stars: 5 },
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

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function CheckoutPage() {
  const router = useRouter()
  const countdown = useCountdown()
  const [billingType, setBillingType] = useState<BillingType>('CREDIT_CARD')
  const [fbc, setFbc] = useState('')
  const [fbp, setFbp] = useState('')
  const [utmData, setUtmData] = useState<Record<string, string> | null>(null)
  const checkoutEventId = useRef(`ict_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

  useEffect(() => {
    window.fbq?.('track', 'InitiateCheckout', { value: 197.00, currency: 'BRL' }, { eventID: checkoutEventId.current })

    // Captura fbclid da URL (presente quando a usuária vem de um anúncio Meta)
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

    // Lê _fbp (criado automaticamente pelo pixel do Meta)
    const fbpCookie = document.cookie.split(';').find(c => c.trim().startsWith('_fbp='))
    if (fbpCookie) setFbp(fbpCookie.trim().slice(5))

    // Lê UTMs salvos pela landing page
    try {
      const raw = localStorage.getItem('utm_data')
      if (raw) setUtmData(JSON.parse(raw))
    } catch {}
  }, [])

  const isFirstBillingRender = useRef(true)
  useEffect(() => {
    if (isFirstBillingRender.current) { isFirstBillingRender.current = false; return }
    window.fbq?.('track', 'AddPaymentInfo', { value: CHECKOUT_CONFIG.price, currency: 'BRL' })
  }, [billingType])

  const [addEbookParto, setAddEbookParto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ORDER_BUMP_PRICE = 17

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')

  const emailsMatch = confirmEmail.length > 0 && email.toLowerCase() === confirmEmail.toLowerCase()
  const emailsMismatch = confirmEmail.length > 0 && email.toLowerCase() !== confirmEmail.toLowerCase()

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardMonth, setCardMonth] = useState('')
  const [cardYear, setCardYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installmentCount, setInstallmentCount] = useState(12)

  const ebookExtra = addEbookParto ? ORDER_BUMP_PRICE : 0
  const adjustedInstallments = CARD_INSTALLMENTS.map(opt => {
    const adjustedTotal = Math.round((opt.total + ebookExtra) * 100) / 100
    const adjustedValue = Math.round(adjustedTotal / opt.count * 100) / 100
    return { ...opt, value: adjustedValue, total: adjustedTotal }
  })
  const selectedInstallment = adjustedInstallments.find(i => i.count === installmentCount) || adjustedInstallments[adjustedInstallments.length - 1]
  const currentPrice = billingType === 'CREDIT_CARD' ? selectedInstallment.total : PIX_PRICE + ebookExtra

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
          addEbookParto,
          fbc: fbc || undefined,
          fbp: fbp || undefined,
          utmData: utmData || undefined,
          checkoutEventId: checkoutEventId.current,
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
        router.push(`/checkout/sucesso?metodo=cartao&value=${currentPrice}`); return
      }
      if (data.billingType === 'PIX') {
        sessionStorage.setItem('pix_data', JSON.stringify({ paymentId: data.paymentId, pixQrCode: data.pixQrCode, pixPayload: data.pixPayload, pixExpiration: data.pixExpiration, email: email.trim().toLowerCase(), value: data.value }))
        router.push(`/checkout/pix?id=${data.paymentId}`); return
      }
      router.push(`/checkout/boleto?url=${encodeURIComponent(data.boletoUrl || '')}&id=${data.paymentId}`)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Barra countdown — topo */}
      {countdown && countdown !== '00:00' && (
        <div className="bg-rose-500 text-white text-center py-2.5 px-4 flex items-center justify-center gap-3 sticky top-0 z-50">
          <Clock size={14} className="animate-pulse" />
          <span className="text-sm font-semibold">Oferta por tempo limitado</span>
          <span className="bg-white/20 text-white text-sm font-black px-3 py-0.5 rounded-full tabular-nums">{countdown}</span>
        </div>
      )}

      {/* Header */}
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
        {/* Mobile: altura fixa com corte central */}
        <div className="relative h-[220px] overflow-hidden md:hidden">
          <Image
            src="/checkout-banner.png"
            alt="Falta pouco para você dar o melhor para você e seu bebê"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        {/* Desktop: imagem inteira na proporção original */}
        <Image
          src="/checkout-banner.png"
          alt="Falta pouco para você dar o melhor para você e seu bebê"
          width={1672}
          height={941}
          priority
          className="hidden md:block w-full h-auto"
          sizes="(min-width: 768px) 1024px"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 items-start">

        {/* ── COLUNA ESQUERDA — Formulário ── */}
        <div className="order-1">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <form onSubmit={handleSubmit}>

              {/* Tabs de pagamento */}
              <div className="border-b border-gray-200 flex">
                {([
                  { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={14} />, label: 'Cartão' },
                  { type: 'BOLETO' as BillingType, icon: <FileText size={14} />, label: 'Boleto' },
                  { type: 'PIX' as BillingType, icon: <QrCode size={14} />, label: 'Pix' },
                ] as const).map(({ type, icon, label }) => (
                  <button key={type} type="button" onClick={() => setBillingType(type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                      billingType === type
                        ? 'border-rose-500 text-rose-600 bg-rose-50/50'
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

                {/* Dados pessoais */}
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

                {/* Campos de cartão — carregados dinamicamente só quando necessário */}
                {billingType === 'CREDIT_CARD' && (
                  <CardFields
                    cardNumber={cardNumber} setCardNumber={setCardNumber}
                    cardHolder={cardHolder} setCardHolder={setCardHolder}
                    cardMonth={cardMonth} setCardMonth={setCardMonth}
                    cardYear={cardYear} setCardYear={setCardYear}
                    cardCvv={cardCvv} setCardCvv={setCardCvv}
                    installmentCount={installmentCount} setInstallmentCount={setInstallmentCount}
                    installments={adjustedInstallments}
                  />
                )}

                {/* Info PIX */}
                {billingType === 'PIX' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <QrCode size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">PIX · R${currentPrice.toFixed(2).replace('.', ',')} à vista</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Você recebe o QR code agora. Acesso liberado em segundos após o pagamento.</p>
                    </div>
                  </div>
                )}

                {/* Info Boleto */}
                {billingType === 'BOLETO' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <FileText size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">Boleto · R${currentPrice.toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs text-amber-600 mt-0.5">Vence em 3 dias úteis. Acesso liberado em até 1 dia útil após o pagamento.</p>
                    </div>
                  </div>
                )}

                {/* Erro */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <button type="submit" disabled={loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-black text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Processando...</>
                  ) : (
                    <><Lock size={16} />
                    {billingType === 'PIX' ? 'Pagar agora com PIX' :
                     billingType === 'BOLETO' ? 'Gerar boleto' :
                     'Pagar agora'}</>
                  )}
                </button>

                {/* ORDER BUMP — Ebook Parto */}
                <div
                  onClick={() => setAddEbookParto(v => !v)}
                  className="cursor-pointer rounded-xl border-2 p-4 transition-all select-none"
                  style={{
                    borderColor: addEbookParto ? '#f59e0b' : '#fde68a',
                    background: addEbookParto ? '#fffbeb' : '#fffdf5',
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${addEbookParto ? 'bg-amber-400 border-amber-400' : 'border-amber-300 bg-white'}`}>
                        {addEbookParto && <CheckCircle size={13} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-xs font-black uppercase tracking-wide" style={{ color: '#92400e' }}>
                          ✨ Oferta especial — adicione agora
                        </p>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs line-through text-gray-400">R$ 47</p>
                          <p className="text-sm font-black text-amber-600">+ R$ 17</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1">📖 Ebook: Gestante Bem Informada — Parto</p>
                      <p className="text-xs leading-relaxed text-gray-500">
                        Plano de parto, parto humanizado, analgesia, fases do trabalho de parto e muito mais — criado pela Dra. Fabiana.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust + suporte */}
                <div className="flex items-center justify-center gap-4">
                  {[
                    { icon: <Lock size={12} />, label: 'SSL seguro' },
                    { icon: <Shield size={12} />, label: '7 dias garantia' },
                    { icon: <CheckCircle size={12} />, label: 'Asaas' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1 text-gray-400 text-xs">{icon}<span>{label}</span></div>
                  ))}
                </div>

                <a href="https://wa.me/5547989293040?text=Olá! Tenho uma dúvida sobre o Gestar em Movimento."
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

        {/* ── COLUNA DIREITA — Produto + Prova Social ── */}
        <div className="order-2 flex flex-col gap-5">

          {/* Hero do produto */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="relative h-56">
              <Image src="/pregnant-yoga.webp" alt="Gestar em Movimento" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Acesso imediato</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Programa completo</p>
                <h1 className="text-white text-2xl font-black leading-tight">Gestar em Movimento</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Criadora */}
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

          {/* Features */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">O que está incluído</p>
            <ul className="space-y-2.5">
              {CHECKOUT_CONFIG.features.map((f, i) => (
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
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600 flex-shrink-0">
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

          {/* Garantia */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Garantia de 7 dias</p>
              <p className="text-xs text-emerald-600 mt-0.5">Se não ficar satisfeita, devolvemos 100% do valor — sem burocracia, sem perguntas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
