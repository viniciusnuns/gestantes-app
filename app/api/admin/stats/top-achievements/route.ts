import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminSession } from '../../middleware'

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request)
  if (authError) return authError

  try {
    const { data, error } = await supabase.rpc('admin_stats_top_achievements')

    if (error) {
      console.error('[admin_stats_top_achievements]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[admin_stats_top_achievements] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
