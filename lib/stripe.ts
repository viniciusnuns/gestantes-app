import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Países da zona do Euro
export const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
])

export function getCurrency(country: string): 'usd' | 'eur' {
  return EURO_COUNTRIES.has(country) ? 'eur' : 'usd'
}

// Preços em centavos
export const STRIPE_PRICES = {
  full: {
    usd: { amount: 3700, display: '$37' },
    eur: { amount: 3200, display: '€32' },
  },
  parto: {
    usd: { amount: 1200, display: '$12' },
    eur: { amount: 1100, display: '€11' },
  },
  apoio: {
    usd: { amount:  900, display: '$9'  },
    eur: { amount:  800, display: '€8'  },
  },
  'upgrade-parto-to-full': {
    usd: { amount: 2600, display: '$26' },
    eur: { amount: 2400, display: '€24' },
  },
  'upgrade-apoio-to-full': {
    usd: { amount: 2900, display: '$29' },
    eur: { amount: 2700, display: '€27' },
  },
  'ebook-gestacao': {
    usd: { amount: 300, display: '$3' },
    eur: { amount: 300, display: '€3' },
  },
  'ebook-parto': {
    usd: { amount: 300, display: '$3' },
    eur: { amount: 300, display: '€3' },
  },
} as const

export type StripeProductType = keyof typeof STRIPE_PRICES

export function getPrice(productType: StripeProductType, currency: 'usd' | 'eur') {
  return STRIPE_PRICES[productType][currency]
}
