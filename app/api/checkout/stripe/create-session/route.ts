import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { stripe, STRIPE_PRICES, getCurrency, getPrice, type StripeProductType } from '@/lib/stripe'
import { CHECKOUT_CONFIG, PARTO_CHECKOUT_CONFIG, DORES_CHECKOUT_CONFIG } from '@/lib/checkout-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = 'https://gestaremovimento.com.br'

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

    // Verifica e-mail duplicado
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já possui uma conta. Faça login.' }, { status: 409 })
    }

    const currency = getCurrency(country)
    const price = getPrice(priceKey, currency)

    const passwordHash = await bcrypt.hash(password, 8)

    // Salva pending com hash da senha — o webhook vai criar a usuária após pagamento
    const { error: pendingError } = await supabase.from('pending_checkouts').insert([{
      email: normalizedEmail,
      name,
      password_hash: passwordHash,
      billing_type: 'STRIPE',
      value: price.amount / 100,
      status: 'PENDING',
      product_type: productType,
      payment_provider: 'stripe',
    }])

    if (pendingError) throw new Error(pendingError.message)

    const successUrl = productType === 'parto'
      ? `${APP_URL}/parte/checkout/sucesso?metodo=stripe`
      : productType === 'apoio'
        ? `${APP_URL}/apoio/checkout/sucesso?metodo=stripe`
        : `${APP_URL}/checkout/sucesso?metodo=stripe`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          unit_amount: price.amount,
          product_data: {
            name: getProductName(productType),
            description: 'Gestar em Movimento · Dra. Fabiana Pinheiro',
          },
        },
        quantity: 1,
      }],
      customer_email: normalizedEmail,
      metadata: {
        email: normalizedEmail,
        productType,
        name,
        currency,
      },
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: productType === 'parto'
        ? `${APP_URL}/parte/checkout`
        : productType === 'apoio'
          ? `${APP_URL}/apoio/checkout`
          : `${APP_URL}/checkout`,
    })

    // Associa session_id ao pending_checkout
    await supabase
      .from('pending_checkouts')
      .update({ stripe_session_id: session.id })
      .eq('email', normalizedEmail)
      .eq('payment_provider', 'stripe')
      .eq('status', 'PENDING')

    return NextResponse.json({ url: session.url, currency, display: price.display })
  } catch (err: any) {
    console.error('[stripe/create-session]', err)
    return NextResponse.json({ error: err.message || 'Erro ao criar sessão' }, { status: 500 })
  }
}
