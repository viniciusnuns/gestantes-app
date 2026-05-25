import { NextRequest, NextResponse } from 'next/server'
import { generateDailyActivities } from '@/lib/generateDailyActivities'

export async function POST(request: NextRequest) {
  try {
    const { userId, weekAtRegistration } = await request.json()

    if (!userId || typeof weekAtRegistration !== 'number') {
      return NextResponse.json(
        { error: 'Missing userId or weekAtRegistration' },
        { status: 400 }
      )
    }

    console.log('[API/activities/generate] Generating for user:', userId, 'week:', weekAtRegistration)

    const result = await generateDailyActivities(userId, weekAtRegistration)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${result.generated} daily activities`,
      generated: result.generated,
    })
  } catch (error: any) {
    console.error('[API/activities/generate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
