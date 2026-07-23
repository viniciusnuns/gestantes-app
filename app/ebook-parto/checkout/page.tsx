'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Lock, QrCode, CreditCard, Check, Shield, ArrowLeft, BookOpen } from 'lucide-react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { getCurrentUser } from '@/lib/customAuth'
import { EBOOK_PARTO_PRICE } from '@/lib/checkout-config'

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

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white'

const CHAPTERS_PREVIEW = [
  'Mala de maternidade: o que levar',
  'Parto humanizado: seus direitos',
  'Fases do trabalho de parto',
  'Analgesia e opções de alívio da dor',
  '+ 7 capítulos',
]

export default function EbookPartoCheckoutPage() {
  const guardReady = useAuthGuard()
  const router = useRouter()

  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardMonth, setCardMonth] = useState('')
  const [cardYear, setCardYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [phone, setPhone] = useState('')

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
      const res = await fetch('/api/checkout/ebook-parto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cpf,
          billingType,
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
        router.push('/ebook-parto/sucesso?metodo=cartao')
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
          successUrl: '/ebook-parto/sucesso',
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
        <div className="flex items-center gap-4 bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-5 border border-rose-200">
          <div className="w-14 h-18 bg-white/70 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 p-3">
            <BookOpen size={28} className="text-rose-700" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-0.5">Ebook Digital</p>
            <h1 className="text-lg font-black text-rose-900 leading-tight">Gestante Bem Informada</h1>
            <p className="text-sm text-rose-700">Parto — Dra. Fabiana Pinheiro</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">O que você vai receber</p>
          {CHAPTERS_PREVIEW.map((ch) => (
            <div key={ch} className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={14} className="text-rose-500 flex-shrink-0" />
              {ch}
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <form onSubmit={handleSubmit}>

            <div className="border-b border-gray-200 flex">
              {([
                { type: 'PIX' as BillingType, icon: <QrCode size={14} />, label: 'Pix' },
                { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={14} />, label: 'Cartão' },
              ] as const).map(({ type, icon, label }) => (
                <button key={type} type="button" onClick={() => setBillingType(type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    billingType === type
                      ? 'border-rose-500 text-rose-700 bg-rose-50/50'
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

              <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${billingType === 'PIX' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                <div>
                  <p className={`text-sm font-bold ${billingType === 'PIX' ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {billingType === 'PIX' ? 'PIX · à vista' : 'Cartão · à vista'}
                  </p>
                  <p className={`text-xs mt-0.5 ${billingType === 'PIX' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Acesso imediato ao ebook em PDF
                  </p>
                </div>
                <p className={`text-2xl font-black ${billingType === 'PIX' ? 'text-emerald-800' : 'text-rose-800'}`}>
                  R$17
                </p>
              </div>

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

              {billingType === 'CREDIT_CARD' && (
                <>
                  <CardFields
                    cardNumber={cardNumber} setCardNumber={setCardNumber}
                    cardHolder={cardHolder} setCardHolder={setCardHolder}
                    cardMonth={cardMonth} setCardMonth={setCardMonth}
                    cardYear={cardYear} setCardYear={setCardYear}
                    cardCvv={cardCvv} setCardCvv={setCardCvv}
                    installmentCount={1} setInstallmentCount={() => {}}
                    installments={[{ count: 1, value: EBOOK_PARTO_PRICE, display: `1x R$${EBOOK_PARTO_PRICE.toFixed(2).replace('.', ',')}`, total: EBOOK_PARTO_PRICE }]}
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
                style={{ background: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)' }}
              >
                {loading ? (
                  <span className="animate-pulse">Processando...</span>
                ) : billingType === 'PIX' ? (
                  <><QrCode size={18} />Gerar QR Code PIX · R$17</>
                ) : (
                  <><CreditCard size={18} />Comprar ebook · R$17</>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Shield size={12} />
                  Pagamento seguro
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Check size={12} />
                  Entrega imediata
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
