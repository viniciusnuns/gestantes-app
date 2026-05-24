import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://odirmtmompghjgmhotml.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_60Fl-nhRPO7Mhd50BSLvdA_3eLie2s6'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    // Create client and verify token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      console.error('[/api/me] Invalid token:', userError?.message)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = userData.user.id
    const userEmail = userData.user.email || ''

    console.log('[/api/me] Authenticated user:', userId, 'email:', userEmail)

    // Try to fetch profile from database - now with working RLS policy
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, name, week, phone, onboarding_completed, user_type')
        .eq('id', userId)
        .single()

      if (!profileError && profile) {
        console.log('[/api/me] Profile found in database')
        return NextResponse.json({
          id: userId,
          email: userEmail,
          name: profile.name || null,
          week: profile.week || null,
          phone: profile.phone || null,
          onboarding_completed: profile.onboarding_completed || false,
          user_type: profile.user_type || 'patient'
        })
      }
    } catch (dbError) {
      console.warn('[/api/me] Database query failed, using defaults:', dbError)
    }

    // Fallback: return minimal profile if database query fails
    console.log('[/api/me] Returning default profile (new user)')
    return NextResponse.json({
      id: userId,
      email: userEmail,
      name: null,
      week: 20,
      phone: null,
      onboarding_completed: false,
      user_type: 'patient'
    })
  } catch (error: any) {
    console.error('[/api/me] Unexpected error:', error.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
