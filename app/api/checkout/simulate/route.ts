import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const BASE = 'https://sandbox.asaas.com/api/v3'

function asaasHeaders() {
  return { 'Content-Type': 'application/json', 'access_token': process.env.ASAAS_API_KEY! }
}

// Endpoint APENAS para sandbox — simula e já cria o usuário sem depender do polling
export async function POST(request: NextRequest) {
  if (process.env.ASAAS_SANDBOX !== 'true') {
    return NextResponse.json({ error: 'Only available in sandbox' }, { status: 403 })
  }

  const { paymentId } = await request.json()

  // Tenta receiveInCash para forçar confirmação
  const simRes = await fetch(`${BASE}/payments/${paymentId}/receiveInCash`, {
    method: 'POST',
    headers: asaasHeaders(),
    body: JSON.stringify({
      paymentDate: new Date().toISOString().split('T')[0],
      value: 47.00,
    }),
  })
  const simData = await simRes.json()
  console.log('[simulate] receiveInCash', paymentId, simRes.status, JSON.stringify(simData))

  // Se falhou E não é "já não pendente", retorna erro
  const notPending = simData?.errors?.some((e: any) =>
    e.description?.toLowerCase().includes('pendente') ||
    e.description?.toLowerCase().includes('pending')
  )
  if (!simRes.ok && !notPending) {
    return NextResponse.json(
      { error: simData?.errors?.[0]?.description || 'Erro na simulação' },
      { status: 400 }
    )
  }

  // receiveInCash OK OU pagamento já não estava pendente → cria usuário direto do pending_checkout
  const { data: pending } = await getSupabaseAdmin()
    .from('pending_checkouts')
    .select('*')
    .eq('asaas_payment_id', paymentId)
    .maybeSingle()

  if (!pending) {
    console.log('[simulate] pending_checkout não encontrado para', paymentId)
    return NextResponse.json({ ok: true, userAlreadyCreated: true })
  }

  if (pending.status === 'CONFIRMED') {
    return NextResponse.json({ ok: true, userAlreadyCreated: true })
  }

  // Verifica se usuário já existe
  const { data: existingUser } = await getSupabaseAdmin()
    .from('users')
    .select('id, email')
    .eq('email', pending.email)
    .maybeSingle()

  if (existingUser) {
    await getSupabaseAdmin()
      .from('pending_checkouts')
      .update({ status: 'CONFIRMED' })
      .eq('asaas_payment_id', paymentId)
    return NextResponse.json({ ok: true, userId: existingUser.id, email: existingUser.email })
  }

  // Cria usuário
  const userId = crypto.randomUUID()
  const now = new Date().toISOString()
  const { error: insertError } = await getSupabaseAdmin().from('users').insert([{
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

  if (insertError) {
    console.error('[simulate] insert user error', insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await getSupabaseAdmin()
    .from('pending_checkouts')
    .update({ status: 'CONFIRMED' })
    .eq('asaas_payment_id', paymentId)

  console.log('[simulate] usuário criado', userId, pending.email)
  return NextResponse.json({ ok: true, userId, email: pending.email })
}
