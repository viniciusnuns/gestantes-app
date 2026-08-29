'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
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

function PaymentForm({ display, paymentIntentId, onSuccess, onError }: {
  display: string
  paymentIntentId: string
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/checkout/sucesso?metodo=stripe`,
      },
    })

    if (error) {
      onError(error.message || 'Payment failed. Please try again.')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await fetch('/api/checkout/stripe/confirm-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        })
      } catch {
        // webhook vai compensar se a chamada falhar
      }
      onSuccess()
    } else {
      onError('Payment could not be confirmed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
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
  )
}

export default function StripePaymentElement({ clientSecret, paymentIntentId, display, onSuccess, onError }: Props) {
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
            borderRadius: '12px',
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
      <PaymentForm display={display} paymentIntentId={paymentIntentId} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
