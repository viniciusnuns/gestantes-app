import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getPayment, isPaymentConfirmed } from '@/lib/asaas'

export const dynamic = 'force-dynamic'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

export async function GET(
  _request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  // Lê as credenciais dentro do handler para garantir os valores mais recentes
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    const { paymentId } = params

    // 1. Verifica Supabase primeiro via fetch direto (cache: no-store evita cache Next.js)
    const sbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/pending_checkouts?asaas_payment_id=eq.${paymentId}&select=status,email,password_hash,name,add_ebook_parto&limit=1`,
      {
        cache: 'no-store',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    )
    const rawBody = await sbRes.text()
    let rows: any[] = []
    try { rows = JSON.parse(rawBody) } catch {}
    const pending = Array.isArray(rows) ? (rows[0] ?? null) : null

    console.log(`[checkout/status] ${paymentId} → raw:`, rawBody.slice(0, 200))

    if (pending?.status === 'CONFIRMED') {
      // Busca userId do usuário criado pelo webhook
      const uRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(pending.email)}&select=id&limit=1`,
        {
          cache: 'no-store',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
        }
      )
      const users: any[] = await uRes.json()
      const userId = users?.[0]?.id
      console.log(`[checkout/status] ${paymentId} → confirmado via webhook, userId=${userId}`)
      return NextResponse.json({ confirmed: true, userId, email: pending.email }, { headers: NO_CACHE })
    }

    // 2. Supabase não confirmou — consulta Asaas
    const payment = await getPayment(paymentId)
    const confirmed = isPaymentConfirmed(payment.status)
    console.log(`[checkout/status] ${paymentId} → Asaas status=${payment.status} confirmed=${confirmed} pendingStatus=${pending?.status}`)

    if (!confirmed) {
      return NextResponse.json({ confirmed: false, status: payment.status }, { headers: NO_CACHE })
    }

    // 3. Asaas confirmou mas webhook ainda não chegou — cria usuário como fallback
    if (!pending) {
      return NextResponse.json({ confirmed: true, userId: undefined, email: undefined }, { headers: NO_CACHE })
    }

    const now = new Date().toISOString()

    // Upgrade: usuária já existe, só atualiza product_type → não cria usuário novo
    if (pending.product_type === 'upgrade-to-full') {
      const { data: existingUser } = await supabase
        .from('users').select('id').eq('email', pending.email).single()
      if (existingUser) {
        await supabase.from('users')
          .update({ product_type: 'full', has_ebook_gestacao: true, bypass_time_lock: true, updated_at: now })
          .eq('id', existingUser.id)
        await supabase.from('pending_checkouts').update({ status: 'CONFIRMED' }).eq('asaas_payment_id', paymentId)
        return NextResponse.json({ confirmed: true, userId: existingUser.id, email: pending.email }, { headers: NO_CACHE })
      }
      return NextResponse.json({ confirmed: true, userId: undefined, email: pending.email }, { headers: NO_CACHE })
    }

    // Ebook Gestação: usuária já existe, só ativa o acesso ao ebook
    if (pending.product_type === 'ebook-gestacao') {
      const { data: existingUser } = await supabase
        .from('users').select('id').eq('email', pending.email).single()
      if (existingUser) {
        await supabase.from('users')
          .update({ has_ebook_gestacao: true, updated_at: now })
          .eq('id', existingUser.id)
        await supabase.from('pending_checkouts').update({ status: 'CONFIRMED' }).eq('asaas_payment_id', paymentId)
        return NextResponse.json({ confirmed: true, userId: existingUser.id, email: pending.email }, { headers: NO_CACHE })
      }
      return NextResponse.json({ confirmed: true, userId: undefined, email: pending.email }, { headers: NO_CACHE })
    }

    const userId = crypto.randomUUID()

    const { error: insertError } = await supabase.from('users').insert([{
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
      product_type: pending.product_type || 'full',
      has_ebook_gestacao: pending.product_type !== 'parto',
      has_ebook_parto: pending.add_ebook_parto === true,
      account_created_at: now,
      created_at: now,
      updated_at: now,
    }])

    if (insertError) {
      const { data: existingUser } = await supabase
        .from('users').select('id').eq('email', pending.email).single()
      return NextResponse.json({ confirmed: true, userId: existingUser?.id, email: pending.email }, { headers: NO_CACHE })
    }

    await supabase.from('pending_checkouts').update({ status: 'CONFIRMED' }).eq('asaas_payment_id', paymentId)

    return NextResponse.json({ confirmed: true, userId, email: pending.email }, { headers: NO_CACHE })

  } catch (err: any) {
    console.error('[checkout/status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
