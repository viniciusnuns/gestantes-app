import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function requireAdminSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminRecord } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRecord) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
