import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  const PIXEL_ID = '2243468039733508'

  if (!token) {
    return NextResponse.json({ error: 'META_CAPI_ACCESS_TOKEN não configurado' }, { status: 500 })
  }

  const hashedEmail = crypto.createHash('sha256').update('debug@gestaremovimento.com.br').digest('hex')

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: 'https://gestaremovimento.com.br/checkout/sucesso',
      action_source: 'website',
      user_data: { em: [hashedEmail] },
      custom_data: { value: 1, currency: 'BRL' },
      event_id: `debug-${Date.now()}`,
    }],
    access_token: token,
    test_event_code: 'TEST13016',
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )

  const responseBody = await res.json()

  return NextResponse.json({
    status: res.status,
    ok: res.ok,
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 8) + '...',
    metaResponse: responseBody,
  })
}
