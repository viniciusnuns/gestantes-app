import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, achievementId } = await request.json()

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: 'Missing userId or achievementId' },
        { status: 400 }
      )
    }

    const supabaseUrl = 'https://odirmtmompghjgmhotml.supabase.co'
    const supabaseServiceKey = 'sb_publishable_60Fl-nhRPO7Mhd50BSLvdA_3eLie2s6'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)

    if (error) {
      console.error('[API] Error removing achievement:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`[API] Removed ${achievementId} from user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Achievement removed',
      userId,
      achievementId,
    })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
