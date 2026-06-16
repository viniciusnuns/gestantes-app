import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

export async function GET(req: NextRequest) {
  // Verificar autorização do cron Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Buscar todos os usuários ativos
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('user_type', ['beta', 'patient', 'paid'])

    if (usersError || !allUsers) {
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    // Buscar quem já completou atividade hoje
    const { data: todayActivity } = await supabase
      .from('user_activity_history')
      .select('user_id')
      .eq('activity_date', today)

    const activeToday = new Set((todayActivity || []).map(a => a.user_id))

    // Filtrar quem NÃO completou nada hoje
    const toNotify = allUsers.filter(u => !activeToday.has(u.id))

    if (toNotify.length === 0) {
      return NextResponse.json({ message: 'Todas as usuárias já se exercitaram hoje!', notified: 0 })
    }

    // Enviar push para todas via external_id
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { pt: 'Hora de se mover, mamãe! 💪' },
        contents: { pt: 'Seu exercício de hoje está esperando. Seu bebê agradece!' },
        url: '/home',
        include_aliases: { external_id: toNotify.map(u => u.id) },
        target_channel: 'push',
      }),
    })

    const result = await response.json()

    return NextResponse.json({
      message: 'Lembretes enviados',
      notified: toNotify.length,
      skipped: activeToday.size,
      onesignal: result,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
