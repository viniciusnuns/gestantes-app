import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminKey } from '../../../middleware'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authError = requireAdminKey(request)
  if (authError) return authError

  try {
    const userId = params.userId

    // Get user email first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Mark all previous reset tokens as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('user_id', userId)

    // Create a new password reset token (unique for each reset)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('password_resets')
      .insert([
        {
          user_id: userId,
          email: user.email,
          token: token,
          expires_at: expiresAt,
          used: true, // Mark as already used by admin
        },
      ])

    if (error) {
      console.error('[reset_password]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Password reset to 123456' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[reset_password] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
