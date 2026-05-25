import { NextRequest, NextResponse } from 'next/server'
import { ensureDailyActivitiesForDate } from '@/lib/generateDailyActivities'

export async function POST(request: NextRequest) {
  try {
    const { userId, targetDate, weekAtRegistration } = await request.json()

    if (!userId || !targetDate || typeof weekAtRegistration !== 'number') {
      return NextResponse.json(
        { error: 'Missing userId, targetDate, or weekAtRegistration' },
        { status: 400 }
      )
    }

    console.log('[API/activities/ensure-date] Ensuring activities for:', targetDate)

    const result = await ensureDailyActivitiesForDate(userId, targetDate, weekAtRegistration)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Activities ensured for date',
    })
  } catch (error: any) {
    console.error('[API/activities/ensure-date] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
