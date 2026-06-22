import { NextRequest, NextResponse } from 'next/server'

// Endpoint APENAS para sandbox — simula confirmação de pagamento via API Asaas
export async function POST(request: NextRequest) {
  if (process.env.ASAAS_SANDBOX !== 'true') {
    return NextResponse.json({ error: 'Only available in sandbox' }, { status: 403 })
  }

  const { paymentId } = await request.json()

  const res = await fetch(`https://sandbox.asaas.com/api/v3/payments/${paymentId}/receiveInCash`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': process.env.ASAAS_API_KEY!,
    },
    body: JSON.stringify({
      paymentDate: new Date().toISOString().split('T')[0],
      value: 47.00,
    }),
  })

  const data = await res.json()
  console.log('[simulate]', paymentId, JSON.stringify(data))
  return NextResponse.json(data, { status: res.ok ? 200 : 400 })
}
