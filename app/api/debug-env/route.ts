import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NADA'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NADA'

  const res = await fetch(
    `${url}/rest/v1/pending_checkouts?asaas_payment_id=eq.pay_5wfu1bgsuctc84e0&select=status&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  )
  const body = await res.text()

  return NextResponse.json({
    url: url.slice(0, 50),
    keyLen: key.length,
    keyStart: key.slice(0, 20),
    httpStatus: res.status,
    body,
  })
}
