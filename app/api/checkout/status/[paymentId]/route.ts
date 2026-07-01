import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getPayment, isPaymentConfirmed } from '@/lib/asaas'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

export async function GET(
  _request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params

    // 1. Verifica Supabase primeiro via fetch direto (diagnóstico)
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/pending_checkouts?asaas_payment_id=eq.${paymentId}&select=*&limit=1`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const rows: any[] = await sbRes.json()
    const pending = rows?.[0] ?? null

    console.log(`[checkout/status] ${paymentId} → Supabase pending:`, JSON.stringify(pending), 'keyLen:', SERVICE_KEY.length)

    if (pending?.status === 'CONFIRMED') {
      // Busca userId do usuário criado pelo webhook
      const uRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(pending.email)}&select=id&limit=1`,
        {
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
        }
      )
      const users: any[] = await uRes.json()
      const userId = users?.[0]?.id
      console.log(`[checkout/status] ${paymentId} → confirmado via webhook, userId=${userId}`)
      return NextResponse.json({ confirmed: true, userId, email: pending.email })
    }

    // 2. Supabase não confirmou — consulta Asaas
    const payment = await getPayment(paymentId)
    const confirmed = isPaymentConfirmed(payment.status)
    console.log(`[checkout/status] ${paymentId} → Asaas status=${payment.status} confirmed=${confirmed} pendingStatus=${pending?.status}`)

    if (!confirmed) {
      return NextResponse.json({ confirmed: false, status: payment.status, paymentId, _debug: { supabaseStatus: pending?.status ?? 'NOT_FOUND', keySet: SERVICE_KEY.length > 10 } })
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
      const { data: existingUser } = await supabase
        .from('users').select('id').eq('email', pending.email).single()
      return NextResponse.json({ confirmed: true, userId: existingUser?.id, email: pending.email })
    }

    await supabase.from('pending_checkouts').update({ status: 'CONFIRMED' }).eq('asaas_payment_id', paymentId)

    return NextResponse.json({ confirmed: true, userId, email: pending.email })

  } catch (err: any) {
    console.error('[checkout/status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
