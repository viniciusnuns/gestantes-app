import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'gem-diag') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY

  const envCheck = {
    appId: ONESIGNAL_APP_ID
      ? `${ONESIGNAL_APP_ID.substring(0, 8)}... (${ONESIGNAL_APP_ID.length} chars)`
      : 'MISSING',
    apiKey: ONESIGNAL_API_KEY
      ? `${ONESIGNAL_API_KEY.substring(0, 16)}... (${ONESIGNAL_API_KEY.length} chars)`
      : 'MISSING',
  }

  // Testa autenticação consultando o app (sem enviar notificação)
  const appRes = await fetch(`https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}`, {
    headers: { Authorization: `Key ${ONESIGNAL_API_KEY}` },
  })
  const appBody = await appRes.json()

  // Testa broadcast real para "Subscribed Users"
  const broadcastRes = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Key ${ONESIGNAL_API_KEY}` },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      headings: { pt: 'Teste de diagnóstico 🔧' },
      contents: { pt: 'Se você recebeu isso, as notificações estão funcionando!' },
      url: '/home',
      included_segments: ['Subscribed Users'],
    }),
  })
  const broadcastBody = await broadcastRes.json()

  return NextResponse.json({
    envCheck,
    onesignalApp: {
      status: appRes.status,
      name: appBody?.name,
      players: appBody?.players,
      messageable_players: appBody?.messageable_players,
    },
    broadcastTest: {
      status: broadcastRes.status,
      id: broadcastBody?.id,
      recipients: broadcastBody?.recipients,
      errors: broadcastBody?.errors,
      raw: broadcastBody,
    },
  })
}
