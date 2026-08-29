import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { stripe, getCurrency, getPrice, type StripeProductType, STRIPE_PRICES } from '@/lib/stripe'
import { CHECKOUT_CONFIG, PARTO_CHECKOUT_CONFIG, DORES_CHECKOUT_CONFIG } from '@/lib/checkout-config'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getProductName(productType: string): string {
  if (productType === 'parto') return PARTO_CHECKOUT_CONFIG.productName
  if (productType === 'apoio') return DORES_CHECKOUT_CONFIG.productName
  return CHECKOUT_CONFIG.productName
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, productType = 'full', country = 'US' } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const priceKey = productType as StripeProductType
    if (!(priceKey in STRIPE_PRICES)) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
    }

    const { data: existing } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This email already has an account. Please log in.' }, { status: 409 })
    }

    const currency = getCurrency(country)
    const price = getPrice(priceKey, currency)
    const passwordHash = await bcrypt.hash(password, 8)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.amount,
      currency,
      payment_method_types: ['card'],
      metadata: {
        email: normalizedEmail,
        productType,
        name,
        currency,
      },
    })

    // Apaga qualquer pending anterior para este e-mail+stripe (double-click protection)
    await getSupabaseAdmin()
      .from('pending_checkouts')
      .delete()
      .eq('email', normalizedEmail)
      .eq('payment_provider', 'stripe')
      .eq('status', 'PENDING')

    const { error: pendingError } = await getSupabaseAdmin().from('pending_checkouts').insert([{
      email: normalizedEmail,
      name,
      password_hash: passwordHash,
      billing_type: 'STRIPE',
      value: price.amount / 100,
      status: 'PENDING',
      product_type: productType,
      payment_provider: 'stripe',
      stripe_payment_intent_id: paymentIntent.id,
    }])

    if (pendingError) throw new Error(pendingError.message)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      currency,
      display: price.display,
    })
  } catch (err: any) {
    console.error('[stripe/create-intent]', err)
    getSupabaseAdmin().from('checkout_errors').insert([{
      billing_type: 'STRIPE',
      email: null,
      error_message: err.message ?? 'unknown',
      error_type: 'stripe_create_intent_exception',
      metadata: { stage: 'create-intent' },
    }]).catch(() => {})
    return NextResponse.json({ error: err.message || 'Erro ao criar pagamento' }, { status: 500 })
  }
}
