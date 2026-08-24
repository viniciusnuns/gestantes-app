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
  }).then(r => ({ status: r.status, body: r.json() })).catch(e => ({ error: String(e) }))

  const appBody = appRes && 'body' in appRes ? await appRes.body : null

  return NextResponse.json({
    envCheck,
    onesignalApp: {
      status: appRes && 'status' in appRes ? appRes.status : 'error',
      name: appBody && typeof appBody === 'object' && 'name' in appBody ? appBody.name : undefined,
      error: appBody && typeof appBody === 'object' && 'errors' in appBody ? appBody.errors : undefined,
      raw: appBody,
    },
  })
}
