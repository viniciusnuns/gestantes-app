import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Preços em centavos de USD
export const STRIPE_PRICES = {
  full:         { amount: 3700, currency: 'usd', display: '$37' },
  parto:        { amount: 1200, currency: 'usd', display: '$12' },
  apoio:        { amount:  900, currency: 'usd', display: '$9'  },
  'upgrade-parto-to-full': { amount: 2600, currency: 'usd', display: '$26' },
  'upgrade-apoio-to-full': { amount: 2900, currency: 'usd', display: '$29' },
  'ebook-gestacao': { amount: 300, currency: 'usd', display: '$3' },
  'ebook-parto':    { amount: 300, currency: 'usd', display: '$3' },
} as const

export type StripeProductType = keyof typeof STRIPE_PRICES
