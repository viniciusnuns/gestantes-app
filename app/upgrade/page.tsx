'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Lock, QrCode, CreditCard, Check, Shield, ArrowLeft } from 'lucide-react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { getCurrentUser } from '@/lib/customAuth'
import { useActivityStore } from '@/lib/stores/activityStore'
import { UPGRADE_PIX_PRICE, UPGRADE_CARD_INSTALLMENTS } from '@/lib/checkout-config'

const CardFields = dynamic(() => import('@/components/checkout/CardFields'), {
  loading: () => <div className="h-40 rounded-xl bg-gray-50 animate-pulse mt-2" />,
})

type BillingType = 'PIX' | 'CREDIT_CARD'

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3)
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white'

const FEATURES_UNLOCK = [
  'Todos os exercícios de mobilidade, pelve e respiração',
  'Aulas de meditação e relaxamento',
  'Exercícios de alongamento e abdominal hipopressivo',
  'Calendário personalizado completo',
  'Conteúdo de educação gestacional',
  'Apoio emocional e bem-estar',
]

export default function UpgradePage() {
  const guardReady = useAuthGuard()
  const router = useRouter()
  const userProfile = useActivityStore(s => s.userProfile)

  // Redireciona usuárias que já têm acesso full (em effect, não no render)
  useEffect(() => {
    if (userProfile && userProfile.product_type !== 'parto') {
      router.replace('/home')
    }
  }, [userProfile, router])

  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardMonth, setCardMonth] = useState('')
  const [cardYear, setCardYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installmentCount, setInstallmentCount] = useState(12)
  const [phone, setPhone] = useState('')

  const selectedInstallment = UPGRADE_CARD_INSTALLMENTS.find(i => i.count === installmentCount) || UPGRADE_CARD_INSTALLMENTS[2]
  const currentPrice = billingType === 'CREDIT_CARD' ? selectedInstallment.total : UPGRADE_PIX_PRICE

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!cpf || cpf.replace(/\D/g, '').length < 11) { setError('Informe seu CPF.'); return }
    if (billingType === 'CREDIT_CARD') {
      if (!cardNumber || !cardHolder || !cardMonth || !cardYear || !cardCvv) { setError('Preencha todos os dados do cartão.'); return }
      if (!phone) { setError('Informe o telefone do titular do cartão.'); return }
    }

    const user = getCurrentUser()
    if (!user) { router.replace('/login'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cpf,
          billingType,
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
        if (data.paymentId) sessionStorage.setItem('checkout_payment_id', data.paymentId)
        router.push(`/upgrade/sucesso?metodo=cartao&value=${currentPrice}`)
        return
      }

      if (data.billingType === 'PIX') {
        sessionStorage.setItem('pix_data', JSON.stringify({
          paymentId: data.paymentId,
          pixQrCode: data.pixQrCode,
          pixPayload: data.pixPayload,
          pixExpiration: data.pixExpiration,
          email: user.email,
          value: data.value,
          successUrl: '/upgrade/sucesso',
        }))
        router.push(`/checkout/pix?id=${data.paymentId}`)
        return
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  if (!guardReady) return <div className="min-h-screen bg-white" />

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-4 py-3 bg-white sticky top-0 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Lock size={13} />
            <span>Compra segura</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            ✨ Upgrade especial para você
          </div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            Desbloqueie o App Completo
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Você já tem acesso às aulas de Parto. Com o upgrade, todos os exercícios da gestação são seus.
          </p>
        </div>

        {/* O que você vai desbloquear */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">O que você vai desbloquear</p>
          <div className="space-y-2.5">
            {FEATURES_UNLOCK.map(f => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} className="text-white" />
                </div>
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de pagamento */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <form onSubmit={handleSubmit}>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex">
              {([
                { type: 'PIX' as BillingType, icon: <QrCode size={14} />, label: 'Pix' },
                { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={14} />, label: 'Cartão' },
              ] as const).map(({ type, icon, label }) => (
                <button key={type} type="button" onClick={() => setBillingType(type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    billingType === type
                      ? 'border-purple-500 text-purple-700 bg-purple-50/50'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                  {icon}{label}
                  {type === 'PIX' && (
                    <span className="ml-1 bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">mais rápido</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">

              {/* Preço destacado */}
              <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${billingType === 'PIX' ? 'bg-emerald-50 border border-emerald-200' : 'bg-purple-50 border border-purple-200'}`}>
                <div>
                  {billingType === 'PIX' ? (
                    <>
                      <p className="text-sm font-bold text-emerald-800">PIX · à vista</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Acesso liberado em segundos após o pagamento</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-purple-800">Cartão de crédito</p>
                      <p className="text-xs text-purple-600 mt-0.5">{selectedInstallment.display} · total R${selectedInstallment.total.toFixed(2).replace('.', ',')}</p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  {billingType === 'PIX' ? (
                    <p className="text-xl font-black text-emerald-800">R$147</p>
                  ) : (
                    <p className="text-xl font-black text-purple-800">R${selectedInstallment.value.toFixed(2).replace('.', ',')}<span className="text-sm font-normal">/mês</span></p>
                  )}
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  onBlur={e => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputCls}
                  required
                  inputMode="numeric"
                />
              </div>

              {/* Campos de cartão */}
              {billingType === 'CREDIT_CARD' && (
                <>
                  <CardFields
                    cardNumber={cardNumber} setCardNumber={setCardNumber}
                    cardHolder={cardHolder} setCardHolder={setCardHolder}
                    cardMonth={cardMonth} setCardMonth={setCardMonth}
                    cardYear={cardYear} setCardYear={setCardYear}
                    cardCvv={cardCvv} setCardCvv={setCardCvv}
                    installmentCount={installmentCount} setInstallmentCount={setInstallmentCount}
                    installments={UPGRADE_CARD_INSTALLMENTS}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Telefone do titular"
                    className={inputCls}
                    inputMode="numeric"
                  />
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-base shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}
              >
                {loading ? (
                  <span className="animate-pulse">Processando...</span>
                ) : billingType === 'PIX' ? (
                  <>
                    <QrCode size={18} />
                    Gerar QR Code PIX · R$147
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Fazer upgrade · {selectedInstallment.display}
                  </>
                )}
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Shield size={12} />
                  Pagamento seguro
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Check size={12} />
                  Garantia de 7 dias
                </div>
              </div>

            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
