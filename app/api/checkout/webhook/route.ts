import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/email'
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
  try {
    // Valida token do webhook Asaas
    const webhookToken = request.headers.get('asaas-access-token')
    if (process.env.ASAAS_WEBHOOK_TOKEN && webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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

    const pendingRows = await sbGet(`pending_checkouts?asaas_payment_id=eq.${paymentId}&select=*&limit=1`)
    const pending = pendingRows[0] ?? null

    if (!pending || pending.status === 'CONFIRMED') {
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
        week: 20,
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
        has_ebook_gestacao: true,
        has_ebook_parto: pending.add_ebook_parto === true,
      })

      confirmedUserId = userId

      sendWelcomeEmail(pending.name, pending.email).catch(err =>
        console.error('[checkout/webhook] email error:', err)
      )
    }

    await sbPatch('pending_checkouts', `asaas_payment_id=eq.${paymentId}`, { status: 'CONFIRMED' })

    // CAPI: Purchase confirmado pelo servidor Asaas (mais confiável que o pixel do browser)
    if (pending?.email) {
      sendCAPIEvent({
        eventName: 'Purchase',
        email: pending.email,
        value: pending.value ?? 197,
        sourceUrl: 'https://gestaremovimento.com.br/checkout/sucesso',
        eventId: paymentId,
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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
