'use client'

import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  clientSecret: string
  paymentIntentId: string
  display: string
  onSuccess: () => void
  onError: (msg: string) => void
}

function PaymentForm({ display, onSuccess, onError }: {
  display: string
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [expressReady, setExpressReady] = useState(false)

  async function doConfirm() {
    if (!stripe || !elements) return false

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/checkout/sucesso?metodo=stripe`,
      },
    })

    if (error) {
      onError(error.message || 'Payment failed. Please try again.')
      return false
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await fetch('/api/checkout/stripe/confirm-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        })
      } catch {
        // webhook compensa se chamada falhar
      }
      onSuccess()
      return true
    }

    onError('Payment could not be confirmed. Please try again.')
    return false
  }

  // Apple Pay / Google Pay — confirmação via ExpressCheckoutElement
  const handleExpressConfirm = async () => {
    setLoading(true)
    const { error: submitError } = await elements!.submit()
    if (submitError) { onError(submitError.message || 'Payment failed.'); setLoading(false); return }
    const ok = await doConfirm()
    if (!ok) setLoading(false)
  }

  // Cartão — submit manual
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const ok = await doConfirm()
    if (!ok) setLoading(false)
  }

  return (
    <div className="space-y-4">

      {/* Apple Pay / Google Pay — botões de carteira no topo */}
      <ExpressCheckoutElement
        onConfirm={handleExpressConfirm}
        onReady={({ availablePaymentMethods }) => {
          if (availablePaymentMethods) setExpressReady(true)
        }}
        options={{
          buttonHeight: 48,
          buttonTheme: { applePay: 'black', googlePay: 'black' },
          paymentMethods: { applePay: 'auto', googlePay: 'auto', link: 'never' },
        }}
      />

      {/* Divisor "or pay with card" — só aparece se tiver Apple/Google Pay */}
      {expressReady && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or pay with card</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Campos de cartão */}
      <form onSubmit={handleCardSubmit} className="space-y-4">
        <PaymentElement
          options={{
            layout: { type: 'accordion', defaultCollapsed: false },
            wallets: { applePay: 'never', googlePay: 'never' },
          }}
        />

        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-black text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing payment...</>
          ) : (
            <><Lock size={16} /> Pay {display}</>
          )}
        </button>

        <p className="text-xs text-gray-300 text-center leading-relaxed">
          By clicking pay you agree to our{' '}
          <a href="/terms" className="underline">Terms of Use</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  )
}

export default function StripePaymentElement({ clientSecret, display, onSuccess, onError }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#f43f5e',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            borderRadius: '10px',
            fontFamily: 'system-ui, sans-serif',
          },
          rules: {
            '.Input': { border: '1px solid #e5e7eb', boxShadow: 'none' },
            '.Input:focus': { border: '1px solid #fda4af', boxShadow: '0 0 0 3px rgba(244,63,94,0.1)' },
          },
        },
        locale: 'en',
      }}
    >
      <PaymentForm display={display} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
