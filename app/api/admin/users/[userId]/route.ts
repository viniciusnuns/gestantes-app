import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminSession } from '../../middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authError = await requireAdminSession(request)
  if (authError) return authError

  try {
    const userId = params.userId

    const [basicInfo, stats, achievements, activities, topExercises, streak] =
      await Promise.all([
        supabase.rpc('admin_user_basic_info', { p_user_id: userId }),
        supabase.rpc('admin_user_stats', { p_user_id: userId }),
        supabase.rpc('admin_user_achievements', { p_user_id: userId }),
        supabase.rpc('admin_user_activities', { p_user_id: userId }),
        supabase.rpc('admin_user_top_exercises', { p_user_id: userId }),
        supabase.rpc('admin_user_streak', { p_user_id: userId }),
      ])

    if (
      basicInfo.error ||
      stats.error ||
      achievements.error ||
      activities.error ||
      topExercises.error ||
      streak.error
    ) {
      const errorMsg =
        basicInfo.error?.message ||
        stats.error?.message ||
        achievements.error?.message ||
        activities.error?.message ||
        topExercises.error?.message ||
        streak.error?.message

      console.error('[admin_user_detail]', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    return NextResponse.json(
      {
        basic_info: basicInfo.data?.[0] || null,
        activity_stats: stats.data?.[0] || null,
        achievements: achievements.data || [],
        recent_activities: activities.data || [],
        top_exercises: topExercises.data || [],
        streak: streak.data?.[0] || null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[admin_user_detail] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
