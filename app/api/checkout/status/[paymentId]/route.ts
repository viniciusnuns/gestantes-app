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

    const payment = await getPayment(paymentId)
    const confirmed = isPaymentConfirmed(payment.status)
    console.log(`[checkout/status] ${paymentId} → ${payment.status} confirmed=${confirmed}`)

    if (!confirmed) {
      return NextResponse.json({ confirmed: false, status: payment.status, paymentId })
    }

    // Verifica se usuário já foi criado (webhook pode ter chegado antes)
    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('asaas_payment_id', paymentId)
      .single()

    if (!pending || pending.status === 'CONFIRMED') {
      // Webhook já processou — busca userId para logar o usuário na tela
      const email = pending?.email
      let userId: string | undefined
      if (email) {
        const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
        userId = user?.id
      }
      return NextResponse.json({ confirmed: true, userAlreadyCreated: true, userId, email })
    }

    // Cria usuário agora (fallback do polling)
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
      account_created_at: now,
      created_at: now,
      updated_at: now,
    }])

    if (!insertError) {
      await supabase
        .from('pending_checkouts')
        .update({ status: 'CONFIRMED' })
        .eq('asaas_payment_id', paymentId)
    }

    return NextResponse.json({
      confirmed: true,
      userId,
      email: pending.email,
    })
  } catch (err: any) {
    console.error('[checkout/status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
