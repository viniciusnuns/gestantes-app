import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { name, email, whatsapp, score, answers, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    const utmParams: Record<string, string> = {}
    if (utm_source) utmParams.utm_source = utm_source
    if (utm_medium) utmParams.utm_medium = utm_medium
    if (utm_campaign) utmParams.utm_campaign = utm_campaign
    if (utm_content) utmParams.utm_content = utm_content
    if (utm_term) utmParams.utm_term = utm_term

    await supabase.from('quiz_leads').upsert(
      {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        whatsapp: whatsapp?.replace(/\D/g, '') || null,
        score,
        answers,
        ...(Object.keys(utmParams).length ? { utm_params: utmParams } : {}),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[api/quiz-lead]', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
