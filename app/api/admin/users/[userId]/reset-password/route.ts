import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminSession } from '../../../middleware'
import bcrypt from 'bcryptjs'

const RESET_PASSWORD = '123456'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authError = await requireAdminSession(request)
  if (authError) return authError

  try {
    const userId = params.userId

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash the new password and update directly in users table
    const hashedPassword = await bcrypt.hash(RESET_PASSWORD, 6)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)

    if (updateError) {
      console.error('[reset_password] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('[reset_password] Password reset for user:', user.email)
    return NextResponse.json({ message: 'Password reset to 123456' }, { status: 200 })
  } catch (error) {
    console.error('[reset_password] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
