import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { name, email, whatsapp, score, answers } = await req.json()

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    await supabase.from('quiz_leads').upsert(
      {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        whatsapp: whatsapp?.replace(/\D/g, '') || null,
        score,
        answers,
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
