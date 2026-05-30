import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminKey } from '../../middleware'

export async function GET(request: NextRequest) {
  const authError = requireAdminKey(request)
  if (authError) return authError

  try {
    const { data, error } = await supabase.rpc('admin_stats_overview')

    if (error) {
      console.error('[admin_stats_overview]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0] || {}, { status: 200 })
  } catch (error) {
    console.error('[admin_stats_overview] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
