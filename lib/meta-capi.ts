import crypto from 'crypto'

const PIXEL_ID = '2243468039733508'
const API_VERSION = 'v19.0'

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

interface CAPIEventOptions {
  eventName: 'InitiateCheckout' | 'Purchase'
  email: string
  value: number
  sourceUrl: string
  eventId?: string
}

export async function sendCAPIEvent(options: CAPIEventOptions): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return

  const { eventName, email, value, sourceUrl, eventId } = options

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: sourceUrl,
    action_source: 'website',
    user_data: {
      em: [hashEmail(email)],
    },
    custom_data: {
      value,
      currency: 'BRL',
    },
  }

  if (eventId) event.event_id = eventId

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event], access_token: token }),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      console.error('[meta-capi] Error:', text)
    }
  } catch (err) {
    console.error('[meta-capi] Failed to send event:', err)
  }
}
