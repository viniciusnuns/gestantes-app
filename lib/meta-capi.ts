import crypto from 'crypto'

const PIXEL_ID = '2243468039733508'
const API_VERSION = 'v19.0'

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('55') ? digits : `55${digits}`
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

function hashText(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

interface CAPIEventOptions {
  eventName: 'InitiateCheckout' | 'Purchase'
  email: string
  value: number
  sourceUrl: string
  eventId?: string
  fbc?: string
  fbp?: string
  ip?: string
  userAgent?: string
  phone?: string
  firstName?: string
  lastName?: string
  externalId?: string
}

export async function sendCAPIEvent(options: CAPIEventOptions): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return

  const { eventName, email, value, sourceUrl, eventId, fbc, fbp, ip, userAgent, phone, firstName, lastName, externalId } = options

  const userData: Record<string, unknown> = { em: [hashEmail(email)] }
  if (fbc) userData.fbc = fbc
  if (fbp) userData.fbp = fbp
  if (ip) userData.client_ip_address = ip
  if (userAgent) userData.client_user_agent = userAgent
  if (phone) userData.ph = [hashPhone(phone)]
  if (firstName) userData.fn = [hashText(firstName)]
  if (lastName) userData.ln = [hashText(lastName)]
  if (externalId) userData.external_id = [hashText(externalId)]

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: sourceUrl,
    action_source: 'website',
    user_data: userData,
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
