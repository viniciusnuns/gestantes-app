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

  const userId = searchParams.get('userId')

  let pushResult = null
  if (userId) {
    // Envia para usuário específico por external_id
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${ONESIGNAL_API_KEY}` },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { pt: 'Teste de notificação 🔔' },
        contents: { pt: 'Se você recebeu isso, as notificações estão funcionando!' },
        url: '/home',
        include_aliases: { external_id: [userId] },
        target_channel: 'push',
      }),
    })
    pushResult = await res.json()
  } else {
    // Broadcast para todos os inscritos
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
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
    pushResult = await res.json()
  }

  return NextResponse.json({
    envCheck,
    onesignalApp: {
      status: appRes.status,
      name: appBody?.name,
      players: appBody?.players,
      messageable_players: appBody?.messageable_players,
    },
    pushTest: {
      target: userId ? `user:${userId}` : 'broadcast:Subscribed Users',
      id: pushResult?.id,
      recipients: pushResult?.recipients,
      errors: pushResult?.errors,
      raw: pushResult,
    },
  })
}
