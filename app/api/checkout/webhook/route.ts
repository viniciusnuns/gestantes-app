import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Valida token do webhook Asaas
    const webhookToken = request.headers.get('asaas-access-token')
    if (process.env.ASAAS_WEBHOOK_TOKEN && webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, payment } = body

    const confirmedEvents = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']
    if (!confirmedEvents.includes(event)) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const paymentId = payment?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('asaas_payment_id', paymentId)
      .single()

    if (!pending || pending.status === 'CONFIRMED') {
      return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    // Verifica se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', pending.email)
      .single()

    if (!existingUser) {
      const userId = crypto.randomUUID()
      const now = new Date().toISOString()

      await supabase.from('users').insert([{
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
      }])
    }

    await supabase
      .from('pending_checkouts')
      .update({ status: 'CONFIRMED' })
      .eq('asaas_payment_id', paymentId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[checkout/webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
