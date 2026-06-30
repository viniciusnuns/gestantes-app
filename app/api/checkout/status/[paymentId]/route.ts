import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getPayment, isPaymentConfirmed } from '@/lib/asaas'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params

    // 1. Verifica Supabase primeiro — webhook pode ter confirmado antes do polling
    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('asaas_payment_id', paymentId)
      .single()

    if (pending?.status === 'CONFIRMED') {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', pending.email)
        .single()
      console.log(`[checkout/status] ${paymentId} → já confirmado via webhook, userId=${user?.id}`)
      return NextResponse.json({ confirmed: true, userId: user?.id, email: pending.email })
    }

    // 2. Webhook ainda não processou — consulta Asaas diretamente
    const payment = await getPayment(paymentId)
    const confirmed = isPaymentConfirmed(payment.status)
    console.log(`[checkout/status] ${paymentId} → Asaas status=${payment.status} confirmed=${confirmed}`)

    if (!confirmed) {
      return NextResponse.json({ confirmed: false, status: payment.status, paymentId })
    }

    // 3. Asaas confirmou mas webhook ainda não chegou — cria usuário como fallback
    if (!pending) {
      return NextResponse.json({ confirmed: true, userId: undefined, email: undefined })
    }

    const userId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: insertError } = await supabase.from('users').insert([{
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
      has_ebook_gestacao: true,
      has_ebook_parto: pending.add_ebook_parto === true,
      account_created_at: now,
      created_at: now,
      updated_at: now,
    }])

    if (insertError) {
      // Usuário já existe (race com webhook) — busca o existente
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', pending.email)
        .single()
      return NextResponse.json({ confirmed: true, userId: existingUser?.id, email: pending.email })
    }

    await supabase
      .from('pending_checkouts')
      .update({ status: 'CONFIRMED' })
      .eq('asaas_payment_id', paymentId)

    return NextResponse.json({ confirmed: true, userId, email: pending.email })

  } catch (err: any) {
    console.error('[checkout/status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
