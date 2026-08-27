import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdminSession } from '../middleware'
import { sendPilatesAnnouncementEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request)
  if (authError) return authError

  try {
    const { data: users, error } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, email')
      .eq('onboarding_completed', true)
      .eq('product_type', 'full')
      .not('email', 'is', null)

    if (error) {
      console.error('[send-pilates-email] query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] }

    for (const user of users ?? []) {
      try {
        await sendPilatesAnnouncementEmail(user.name ?? '', user.email)
        results.sent++
      } catch (err) {
        results.failed++
        results.errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return NextResponse.json({
      total: (users ?? []).length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    })
  } catch (err) {
    console.error('[send-pilates-email] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
