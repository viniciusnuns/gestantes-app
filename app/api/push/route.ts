import { NextRequest, NextResponse } from 'next/server'

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { userId, userIds, all, title, message, url } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'title e message são obrigatórios' }, { status: 400 })
    }

    const body: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { pt: title, en: title },
      contents: { pt: message, en: message },
    }

    if (url) body.url = url

    if (all) {
      body.included_segments = ['All']
    } else if (userIds?.length > 0) {
      body.include_aliases = { external_id: userIds }
      body.target_channel = 'push'
    } else if (userId) {
      body.include_aliases = { external_id: [userId] }
      body.target_channel = 'push'
    } else {
      return NextResponse.json({ error: 'userId, userIds ou all é obrigatório' }, { status: 400 })
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
