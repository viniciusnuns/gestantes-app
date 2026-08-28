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

async function sbAtomicConfirm(sessionId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/pending_checkouts?stripe_session_id=eq.${sessionId}&status=neq.CONFIRMED`,
    {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify({ status: 'CONFIRMED' }),
    }
  )
  const text = await res.text()
  try { return JSON.parse(text) } catch { return [] }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[stripe/webhook] signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const session = event.data.object as any
  const sessionId = session.id
  const email = session.customer_email || session.metadata?.email
  const productType = session.metadata?.productType || 'full'
  const name = session.metadata?.name || ''
  const value = (session.amount_total || 0) / 100

  const confirmedRows = await sbAtomicConfirm(sessionId)
  const pending = confirmedRows[0] ?? null

  if (!pending) {
    return NextResponse.json({ ok: true, alreadyProcessed: true })
  }

  // Verifica se usuária já existe
  const existingRows = await sbGet(`users?email=eq.${encodeURIComponent(email)}&select=id&limit=1`)
  if (existingRows[0]) {
    return NextResponse.json({ ok: true, alreadyExists: true })
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
    .catch(err => console.error('[stripe/webhook] email error:', err))

  const nameParts = name.trim().split(/\s+/)
  await sendCAPIEvent({
    eventName: 'Purchase',
    email,
    value,
    sourceUrl: 'https://gestaremovimento.com.br/checkout/sucesso',
    eventId: sessionId,
    firstName: nameParts[0] || undefined,
    lastName: nameParts.slice(1).join(' ') || undefined,
    externalId: userId,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
