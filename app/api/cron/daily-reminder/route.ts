import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

  const sendPush = async (userIds: string[], title: string, message: string) => {
    if (userIds.length === 0) return null

    // Tenta por external_id (usuários com OneSignal.login() vinculado)
    const byId = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${ONESIGNAL_API_KEY}` },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { pt: title },
        contents: { pt: message },
        url: '/home',
        include_aliases: { external_id: userIds },
        target_channel: 'push',
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
      }),
    }).then(r => r.json()).catch(() => null)

    return byId
  }

  // Broadcast para todos os assinantes (cobre quem ainda não tem external_id vinculado)
  const sendBroadcast = async (title: string, message: string) => {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${ONESIGNAL_API_KEY}` },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { pt: title },
        contents: { pt: message },
        url: '/home',
        included_segments: ['Subscribed Users'],
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
      }),
    })
    return res.json()
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Buscar todos os usuários ativos
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('user_type', ['beta', 'patient', 'paid'])

    if (usersError || !allUsers) {
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    // Buscar última atividade de cada usuária
    const { data: lastActivities } = await supabase
      .from('user_activity_history')
      .select('user_id, activity_date')
      .order('activity_date', { ascending: false })

    // Mapear última atividade por usuária
    const lastActivityByUser = new Map<string, string>()
    for (const row of lastActivities || []) {
      if (!lastActivityByUser.has(row.user_id)) {
        lastActivityByUser.set(row.user_id, row.activity_date)
      }
    }

    const inactiveFor3Days: string[] = []
    const inactiveToday: string[] = []

    for (const user of allUsers) {
      const lastActivity = lastActivityByUser.get(user.id)

      // Já se exercitou hoje — pula
      if (lastActivity === today) continue

      // Sem atividade há 3+ dias (mas já foi ativa alguma vez)
      if (lastActivity && lastActivity <= threeDaysAgo) {
        inactiveFor3Days.push(user.id)
      } else {
        // Inativa apenas hoje (ou nunca foi ativa)
        inactiveToday.push(user.id)
      }
    }

    // Envio por external_id (usuários com login vinculado)
    const [reengageResult, dailyResult] = await Promise.all([
      sendPush(
        inactiveFor3Days,
        'Sentimos sua falta! 🌸',
        'Faz alguns dias que você não aparece. Que tal um exercício rápido hoje? Seu bebê agradece!'
      ),
      sendPush(
        inactiveToday,
        'Hora de se mover, mamãe! 💪',
        'Seu exercício de hoje está esperando. Seu bebê agradece!'
      ),
    ])

    // Broadcast de fallback: cobre assinantes sem external_id vinculado ainda
    const broadcastResult = await sendBroadcast(
      'Hora de se mover, mamãe! 💪',
      'Seu exercício de hoje está esperando. Seu bebê agradece!'
    )

    return NextResponse.json({
      message: 'Lembretes enviados',
      daily: { notified: inactiveToday.length, onesignal: dailyResult },
      reengagement: { notified: inactiveFor3Days.length, onesignal: reengageResult },
      broadcast: broadcastResult,
      skipped: allUsers.length - inactiveToday.length - inactiveFor3Days.length,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
