import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminSession } from '../middleware'

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request)
  if (authError) return authError

  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 500)
    const offset = Number(searchParams.get('offset')) || 0

    const { data, error } = await supabase.rpc('admin_users_list', {
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      console.error('[admin_users_list]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        total_count: data?.length || 0,
        users: data || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[admin_users_list] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
