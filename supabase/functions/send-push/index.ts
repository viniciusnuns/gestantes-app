import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!

interface PushPayload {
  // Enviar para um usuário específico
  userId?: string
  // Enviar para múltiplos usuários
  userIds?: string[]
  // Enviar para todos
  all?: boolean
  // Conteúdo
  title: string
  message: string
  url?: string
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload: PushPayload = await req.json()
    const { userId, userIds, all, title, message, url } = payload

    const body: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { pt: title, en: title },
      contents: { pt: message, en: message },
    }

    if (url) body.url = url

    if (all) {
      body.included_segments = ['All']
    } else if (userIds && userIds.length > 0) {
      body.include_aliases = { external_id: userIds }
      body.target_channel = 'push'
    } else if (userId) {
      body.include_aliases = { external_id: [userId] }
      body.target_channel = 'push'
    } else {
      return new Response(JSON.stringify({ error: 'userId, userIds ou all é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
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

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
