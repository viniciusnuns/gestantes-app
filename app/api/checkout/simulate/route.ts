import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://sandbox.asaas.com/api/v3'

function asaasHeaders() {
  return { 'Content-Type': 'application/json', 'access_token': process.env.ASAAS_API_KEY! }
}

// Endpoint APENAS para sandbox — simula confirmação de pagamento via API Asaas
export async function POST(request: NextRequest) {
  if (process.env.ASAAS_SANDBOX !== 'true') {
    return NextResponse.json({ error: 'Only available in sandbox' }, { status: 403 })
  }

  const { paymentId } = await request.json()

  const res = await fetch(`${BASE}/payments/${paymentId}/receiveInCash`, {
    method: 'POST',
    headers: asaasHeaders(),
    body: JSON.stringify({
      paymentDate: new Date().toISOString().split('T')[0],
      value: 47.00,
    }),
  })

  const data = await res.json()
  console.log('[simulate] receiveInCash', paymentId, res.status, JSON.stringify(data))

  if (res.ok) {
    return NextResponse.json({ ok: true, status: data.status })
  }

  // Pagamento não estava pendente — verifica status atual
  const checkRes = await fetch(`${BASE}/payments/${paymentId}`, { headers: asaasHeaders() })
  const checkData = await checkRes.json()
  console.log('[simulate] current status', paymentId, checkData.status)

  const CONFIRMED = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']
  if (CONFIRMED.includes(checkData.status)) {
    // Já confirmado — retorna ok para o cliente redirecionar
    return NextResponse.json({ ok: true, status: checkData.status, alreadyConfirmed: true })
  }

  return NextResponse.json(
    { error: data?.errors?.[0]?.description || 'Erro na simulação', currentStatus: checkData.status },
    { status: 400 }
  )
}
