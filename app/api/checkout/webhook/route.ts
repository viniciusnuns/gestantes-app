import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail, sendPartoWelcomeEmail } from '@/lib/email'
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

// Atomic: marca CONFIRMED e retorna o registro somente se ainda estava PENDING.
// Garante que dois webhooks simultâneos (PAYMENT_RECEIVED + PAYMENT_CONFIRMED)
// nunca processem o mesmo pagamento duas vezes.
async function sbAtomicConfirm(paymentId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/pending_checkouts?asaas_payment_id=eq.${paymentId}&status=neq.CONFIRMED`,
    {
      method: 'PATCH',
      headers: sbHeaders(), // Prefer: return=representation já está no sbHeaders
      body: JSON.stringify({ status: 'CONFIRMED' }),
    }
  )
  const text = await res.text()
  try { return JSON.parse(text) } catch { return [] }
}

async function broadcastPaymentConfirmed(paymentId: string, userId: string, email: string) {
  await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({
      messages: [{ topic: `checkout:${paymentId}`, event: 'payment_confirmed', payload: { userId, email } }]
    }),
  })
}

export async function POST(request: NextRequest) {
  let body: any = null
  try {
    // Valida token do webhook Asaas
    const webhookToken = request.headers.get('asaas-access-token')
    if (process.env.ASAAS_WEBHOOK_TOKEN && webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    body = await request.json()
    const { event, payment } = body

    // Estorno ou chargeback — cancela o acesso da usuária
    const refundEvents = ['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE', 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL']
    if (refundEvents.includes(event)) {
      const paymentId = payment?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const rows = await sbGet(`pending_checkouts?asaas_payment_id=eq.${paymentId}&select=email&limit=1`)
      const email = rows[0]?.email
      if (email) {
        await sbPatch('users', `email=eq.${encodeURIComponent(email)}`, { user_type: 'cancelled' })
      }

      return NextResponse.json({ ok: true, cancelled: true })
    }

    const confirmedEvents = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']
    if (!confirmedEvents.includes(event)) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const paymentId = payment?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    // Operação atômica: só retorna o registro se conseguiu marcar como CONFIRMED.
    // Se retornar vazio, outro webhook já processou — encerra sem duplicar nada.
    const confirmedRows = await sbAtomicConfirm(paymentId)
    const pending = confirmedRows[0] ?? null

    if (!pending) {
      return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    const productType: string = pending.product_type || 'full'

    // Upgrade: usuária já existe, só atualiza product_type para full
    if (productType === 'upgrade-to-full') {
      const upgradeRows = await sbGet(`users?email=eq.${encodeURIComponent(pending.email)}&select=id&limit=1`)
      const upgradeUser = upgradeRows[0] ?? null
      if (upgradeUser) {
        await sbPatch('users', `id=eq.${upgradeUser.id}`, { product_type: 'full', has_ebook_gestacao: true, updated_at: new Date().toISOString() })
        broadcastPaymentConfirmed(paymentId, upgradeUser.id, pending.email).catch(() => {})
        return NextResponse.json({ ok: true, upgraded: true })
      }
      return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    // Verifica se usuário já existe
    const existingRows = await sbGet(`users?email=eq.${encodeURIComponent(pending.email)}&select=id&limit=1`)
    const existingUser = existingRows[0] ?? null
    let confirmedUserId = existingUser?.id

    if (!existingUser) {
      const userId = crypto.randomUUID()
      const now = new Date().toISOString()

      await sbInsert('users', {
        id: userId,
        email: pending.email,
        password_hash: pending.password_hash,
        name: pending.name,
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
        has_ebook_parto: pending.add_ebook_parto === true,
        utm_data: pending.utm_data || null,
        product_type: productType,
      })

      confirmedUserId = userId

      const emailFn = productType === 'parto' ? sendPartoWelcomeEmail : sendWelcomeEmail
      emailFn(pending.name, pending.email).catch(err =>
        console.error('[checkout/webhook] email error:', err)
      )
    }

    // CAPI: Purchase confirmado pelo servidor Asaas (mais confiável que o pixel do browser)
    if (pending?.email) {
      const nameParts = (pending.name || '').trim().split(/\s+/)
      await sendCAPIEvent({
        eventName: 'Purchase',
        email: pending.email,
        value: pending.value ?? 197,
        sourceUrl: 'https://gestaremovimento.com.br/checkout/sucesso',
        eventId: paymentId,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(' ') || undefined,
        externalId: confirmedUserId || undefined,
        fbp: pending.fbp || undefined,
        fbc: pending.fbc || undefined,
        ip: pending.client_ip || undefined,
        userAgent: pending.user_agent || undefined,
      }).catch(() => {})
    }

    // Broadcast Realtime para redirect instantâneo na página PIX (fallback: polling)
    if (confirmedUserId) {
      broadcastPaymentConfirmed(paymentId, confirmedUserId, pending.email).catch(err =>
        console.error('[checkout/webhook] broadcast error:', err)
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[checkout/webhook]', err)
    sbInsert('checkout_errors', {
      billing_type: body?.payment?.billingType ?? null,
      email: body?.payment?.externalReference ?? null,
      error_message: err.message ?? 'unknown',
      error_type: 'webhook_exception',
      metadata: { event: body?.event ?? null, paymentId: body?.payment?.id ?? null },
    }).catch(() => {})
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
