import { NextRequest, NextResponse } from 'next/server'
import { unlockAllEarnedAchievements } from '@/lib/achievements'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log(`[API] Starting retroactive achievement unlock for user: ${userId}`)

    await unlockAllEarnedAchievements(userId)

    return NextResponse.json({
      success: true,
      message: 'Retroactive achievement unlock completed',
      userId,
    })
  } catch (error) {
    console.error('[API] Error in unlock-earned:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
