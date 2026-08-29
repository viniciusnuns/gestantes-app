import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { stripe } from '@/lib/stripe'
import { sendWelcomeEmail, sendPartoWelcomeEmail, sendDoresWelcomeEmail } from '@/lib/email'
import { sendCAPIEvent } from '@/lib/meta-capi'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Prefer': 'return=representation',
  }
}

async function sbGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    cache: 'no-store',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return [] }
}

async function sbInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify(row),
  })
  return res.ok
}

async function sbPatch(table: string, filter: string, data: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  })
  return res.ok
}

export async function POST(request: NextRequest) {
  let capturedEmail: string | null = null
  let capturedIntentId: string | null = null
  try {
    const { paymentIntentId } = await request.json()
    capturedIntentId = paymentIntentId ?? null

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId required' }, { status: 400 })
    }

    // Verifica com a Stripe que o pagamento foi de fato confirmado
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 })
    }

    // Confirma atomicamente (evita criar usuária duas vezes se webhook também disparar)
    const confirmRes = await fetch(
      `${SUPABASE_URL}/rest/v1/pending_checkouts?stripe_payment_intent_id=eq.${paymentIntentId}&status=neq.CONFIRMED`,
      {
        method: 'PATCH',
        headers: sbHeaders(),
        body: JSON.stringify({ status: 'CONFIRMED' }),
      }
    )
    const confirmedRows = await confirmRes.json().catch(() => [])
    const pending = Array.isArray(confirmedRows) ? confirmedRows[0] : null

    const email = paymentIntent.metadata?.email || ''
    capturedEmail = email || null

    if (!pending) {
      // Webhook chegou primeiro — busca usuária já criada para retornar sessão
      const existingAfterWebhook = await sbGet(`users?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`)
      const u = existingAfterWebhook[0]
      return NextResponse.json({ ok: true, alreadyProcessed: true, userId: u?.id, email: u?.email || email })
    }

    const name = pending.name || paymentIntent.metadata?.name || ''
    const productType = pending.product_type || paymentIntent.metadata?.productType || 'full'
    const value = (paymentIntent.amount || 0) / 100

    // Verifica se a usuária já existe
    const existingRows = await sbGet(`users?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`)
    if (existingRows[0]) {
      return NextResponse.json({ ok: true, alreadyExists: true, userId: existingRows[0].id, email })
    }

    const userId = crypto.randomUUID()
    const now = new Date().toISOString()

    await sbInsert('users', {
      id: userId,
      email,
      password_hash: pending.password_hash,
      name,
      week_at_registration: 0,
      phone: null,
      healthy_pregnancy: true,
      had_intercurrence: false,
      doctor_approved: true,
      objectives: [],
      discomforts: [],
      onboarding_completed: false,
      onboarding_completed_at: null,
      user_type: 'patient',
      account_created_at: now,
      created_at: now,
      updated_at: now,
      has_ebook_gestacao: productType === 'full',
      has_ebook_parto: false,
      product_type: productType,
      payment_provider: 'stripe',
      cpf: null,
    })

    const emailFn = productType === 'parto' ? sendPartoWelcomeEmail
      : productType === 'apoio' || productType === 'dores' ? sendDoresWelcomeEmail
      : sendWelcomeEmail

    emailFn(name, email)
      .then(() => sbPatch('users', `id=eq.${userId}`, { welcome_email_sent_at: new Date().toISOString() }))
      .catch(err => console.error('[confirm-intent] email error:', err))

    const nameParts = name.trim().split(/\s+/)
    sendCAPIEvent({
      eventName: 'Purchase',
      email,
      value,
      sourceUrl: 'https://gestaremovimento.com.br/checkout/sucesso',
      eventId: paymentIntentId,
      firstName: nameParts[0] || undefined,
      lastName: nameParts.slice(1).join(' ') || undefined,
      externalId: userId,
    }).catch(() => {})

    return NextResponse.json({ ok: true, userId, email })
  } catch (err: any) {
    console.error('[stripe/confirm-intent]', err)
    const SUPABASE_URL_ERR = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
    const SERVICE_KEY_ERR = process.env.SUPABASE_SERVICE_ROLE_KEY!
    fetch(`${SUPABASE_URL_ERR}/rest/v1/checkout_errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY_ERR,
        'Authorization': `Bearer ${SERVICE_KEY_ERR}`,
      },
      body: JSON.stringify({
        billing_type: 'STRIPE',
        email: capturedEmail,
        error_message: err.message ?? 'unknown',
        error_type: 'stripe_confirm_intent_exception',
        metadata: { stage: 'confirm-intent', paymentIntentId: capturedIntentId },
      }),
    }).catch(() => {})
    return NextResponse.json({ error: err.message || 'Erro ao confirmar pagamento' }, { status: 500 })
  }
}
