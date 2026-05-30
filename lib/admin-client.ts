const API_BASE = '/api/admin'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key-here'

export interface OverviewStats {
  total_users: number
  completed_onboarding: number
  onboarding_completion_rate: number
  users_with_activities: number
  active_this_week: number
  abandoned_users: number
  abandonment_rate_percent: number
}

export interface TrimesterStat {
  trimester: number
  user_count: number
  percentage: number
}

export interface Achievement {
  achievement_id: string
  users_count: number
  percentage: number
}

export interface ActivityStat {
  avg_active_days: number
  avg_points: number
  max_points: number
  min_points: number
  median_points: number
}

export interface UserListItem {
  id: string
  email: string
  name: string
  signup_date: string
  onboarding_completed: boolean
  onboarding_completed_date: string | null
  current_week: number
  trimester: number
  active_days: number
  total_exercises: number
  total_points: number
  ranking_position: number | null
  achievements_count: number
  last_activity_date: string | null
  last_activity_time: string | null
  active_this_week: boolean
}

export interface UserDetail {
  basic_info: {
    id: string
    email: string
    name: string
    phone: string
    created_at: string
    onboarding_completed: boolean
    onboarding_completed_at: string | null
    current_week: number
    trimester: number
    healthy_pregnancy: boolean
    had_intercurrence: boolean
    doctor_approved: boolean
    objectives: string[]
    discomforts: string[]
  }
  activity_stats: {
    total_points: number
    total_active_days: number
    total_exercises: number
    ranking_position: number | null
    first_activity_date: string | null
    last_activity_date: string | null
    days_span: number
  }
  achievements: Array<{
    achievement_id: string
    unlock_date: string
    unlock_time: string
  }>
  recent_activities: Array<{
    id: string
    exercise_id: string
    exercise_name: string
    activity_date: string
    completed_at: string
    points_earned: number
    source: string
  }>
  top_exercises: Array<{
    exercise_id: string
    exercise_name: string
    completion_count: number
    total_points_from_exercise: number
  }>
  streak: {
    max_consecutive_days: number
    current_consecutive_days: number
  }
}

async function fetchWithAuth(url: string) {
  const response = await fetch(url, {
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getOverviewStats(): Promise<OverviewStats> {
  return fetchWithAuth(`${API_BASE}/stats/overview`)
}

export async function getTrimesterStats(): Promise<TrimesterStat[]> {
  return fetchWithAuth(`${API_BASE}/stats/by-trimester`)
}

export async function getTopAchievements(): Promise<Achievement[]> {
  return fetchWithAuth(`${API_BASE}/stats/top-achievements`)
}

export async function getActivityStats(): Promise<ActivityStat> {
  return fetchWithAuth(`${API_BASE}/stats/activity`)
}

export async function getUsersList(
  limit: number = 50,
  offset: number = 0
): Promise<{ total_count: number; users: UserListItem[] }> {
  return fetchWithAuth(
    `${API_BASE}/users?limit=${limit}&offset=${offset}`
  )
}

export async function getUserDetail(userId: string): Promise<UserDetail> {
  return fetchWithAuth(`${API_BASE}/users/${userId}`)
}

export async function resetUserPassword(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
    method: 'POST',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to reset password: ${response.statusText}`)
  }
}
