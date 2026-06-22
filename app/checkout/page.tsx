'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Shield, Lock, CreditCard, QrCode, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { CHECKOUT_CONFIG } from '@/lib/checkout-config'

type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return digits.slice(0, 3) + '.' + digits.slice(3)
  if (digits.length <= 9) return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6)
  return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9)
}

export default function CheckoutPage() {
  const router = useRouter()
  const [billingType, setBillingType] = useState<BillingType>('PIX')
  const [showFeatures, setShowFeatures] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Personal data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')

  // Card data
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
    if (billingType === 'CREDIT_CARD') {
      if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
        setError('Preencha todos os dados do cartão.')
        return
      }
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
          cpf: cpf || undefined,
          billingType,
          card: billingType === 'CREDIT_CARD' ? {
            holderName: cardHolder,
            number: cardNumber.replace(/\s/g, ''),
            expiryMonth: expiryMonth?.trim(),
            expiryYear: expiryYear?.trim().length === 2
              ? '20' + expiryYear.trim()
              : expiryYear?.trim(),
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
        // Cartão aprovado: cria sessão e redireciona
        const sessionData = { userId: data.userId, email: data.email, timestamp: new Date().toISOString() }
        localStorage.setItem('customAuthSession', JSON.stringify(sessionData))
        router.push('/checkout/sucesso?metodo=cartao')
        return
      }

      if (data.billingType === 'PIX') {
        sessionStorage.setItem('pix_data', JSON.stringify({
          paymentId: data.paymentId,
          pixQrCode: data.pixQrCode,
          pixPayload: data.pixPayload,
          pixExpiration: data.pixExpiration,
          email: email.trim().toLowerCase(),
        }))
        router.push(`/checkout/pix?id=${data.paymentId}`)
        return
      }

      if (data.billingType === 'BOLETO') {
        router.push(`/checkout/boleto?url=${encodeURIComponent(data.boletoUrl || '')}&id=${data.paymentId}`)
        return
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/pregnant-yoga.webp" alt="Logo" width={36} height={36} className="rounded-full object-cover" />
            <span className="font-bold text-text-primary text-sm">Gestar em Movimento</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
            <Lock size={13} />
            Ambiente 100% seguro
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8">

        {/* Coluna esquerda — Produto */}
        <div className="flex flex-col gap-5">
          {/* Card do produto */}
          <div className="bg-white rounded-3xl shadow-sm border border-warm-200 overflow-hidden">
            <div className="relative h-40 lg:h-52">
              <Image
                src="/pregnant-yoga.webp"
                alt="Gestar em Movimento"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-0.5">Programa completo</p>
                <h1 className="text-white text-xl font-bold leading-tight">Gestar em Movimento</h1>
              </div>
            </div>
            <div className="p-5">
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Exercícios seguros para toda a gestação, desenvolvidos pela Dra. Fabiana Pinheiro, fisioterapeuta especializada.
              </p>

              {/* Features toggle no mobile */}
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="lg:hidden w-full flex items-center justify-between text-sm font-medium text-text-primary mb-2"
              >
                O que está incluído
                {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <ul className={`space-y-2.5 ${showFeatures ? '' : 'hidden lg:block'}`}>
                {CHECKOUT_CONFIG.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Preço */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
            <p className="text-text-light text-sm mb-1">Valor total</p>
            <p className="text-3xl font-bold text-text-primary">{CHECKOUT_CONFIG.priceDisplay}</p>
            <p className="text-text-secondary text-sm mt-1">
              ou {CHECKOUT_CONFIG.installments}x de{' '}
              <span className="font-semibold">R$ {CHECKOUT_CONFIG.installmentValue.toFixed(2).replace('.', ',')}</span> no cartão
            </p>
          </div>

          {/* Garantia + Segurança */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white border border-warm-200 rounded-2xl p-4 flex items-start gap-3">
              <Shield size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Garantia de {CHECKOUT_CONFIG.guaranteeDays} dias</p>
                <p className="text-xs text-text-secondary mt-0.5">Reembolso total sem burocracia</p>
              </div>
            </div>
            <div className="flex-1 bg-white border border-warm-200 rounded-2xl p-4 flex items-start gap-3">
              <Lock size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Dados protegidos</p>
                <p className="text-xs text-text-secondary mt-0.5">Criptografia SSL 256-bit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita — Formulário */}
        <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Finalize sua compra</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dados pessoais */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Seus dados</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Maria Silva"
                    className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Senha de acesso</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Forma de pagamento */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Forma de pagamento</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { type: 'PIX' as BillingType, icon: <QrCode size={16} />, label: 'PIX', sub: 'Instantâneo' },
                  { type: 'CREDIT_CARD' as BillingType, icon: <CreditCard size={16} />, label: 'Cartão', sub: 'Aprovação imediata' },
                  { type: 'BOLETO' as BillingType, icon: <FileText size={16} />, label: 'Boleto', sub: '3 dias úteis' },
                ].map(({ type, icon, label, sub }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBillingType(type)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                      billingType === type
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-warm-200 bg-white text-text-secondary hover:border-warm-300'
                    }`}
                  >
                    {icon}
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="text-[10px] leading-tight opacity-70">{sub}</span>
                  </button>
                ))}
              </div>

              {/* PIX info */}
              {billingType === 'PIX' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode size={16} className="text-green-600" />
                    <p className="text-sm font-semibold text-green-700">Pagamento via PIX</p>
                  </div>
                  <p className="text-xs text-green-600 leading-relaxed">
                    Após confirmar, você verá o QR code para pagamento. O acesso é liberado em segundos após a confirmação.
                  </p>
                </div>
              )}

              {/* Boleto info */}
              {billingType === 'BOLETO' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-amber-600" />
                    <p className="text-sm font-semibold text-amber-700">Pagamento via Boleto</p>
                  </div>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    O boleto vence em 3 dias úteis. O acesso é liberado em até 1 dia útil após o pagamento.
                  </p>
                </div>
              )}

              {/* Campos do cartão */}
              {billingType === 'CREDIT_CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Número do cartão</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Nome no cartão</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/AA"
                        inputMode="numeric"
                        className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="000"
                        inputMode="numeric"
                        className="w-full border border-warm-300 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-400 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-base py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Processando...</>
              ) : (
                <>
                  <Lock size={18} />
                  {billingType === 'PIX' ? 'Gerar QR Code PIX' :
                   billingType === 'BOLETO' ? 'Gerar Boleto' :
                   'Pagar com Cartão'}
                </>
              )}
            </button>

            <p className="text-center text-xs text-text-light">
              Ao continuar, você concorda com os{' '}
              <a href="/terms" className="underline hover:text-text-secondary">termos de uso</a>.
              Pagamento processado com segurança pela Asaas.
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-text-light text-xs">
          <div className="flex items-center gap-1.5"><Shield size={13} /><span>Compra segura</span></div>
          <div className="flex items-center gap-1.5"><Lock size={13} /><span>SSL 256-bit</span></div>
          <div className="flex items-center gap-1.5"><CheckCircle size={13} /><span>7 dias de garantia</span></div>
        </div>
        <p className="text-text-light text-xs text-center">
          © {new Date().getFullYear()} Gestar em Movimento · Dra. Fabiana Pinheiro
        </p>
      </footer>
    </div>
  )
}
