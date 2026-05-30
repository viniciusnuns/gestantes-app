-- ============================================================================
-- ADMIN DASHBOARD RPC FUNCTIONS - Gestantes em Movimento
-- Purpose: Pre-built functions for admin dashboard queries
-- Created by Dara (Data Engineer) - 2026-05-30
-- ============================================================================

-- ============================================================================
-- RPC FUNCTION 1: admin_stats_overview()
-- Returns: Core stats for overview cards
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_stats_overview()
RETURNS TABLE (
  total_users BIGINT,
  completed_onboarding BIGINT,
  onboarding_completion_rate INTEGER,
  users_with_activities BIGINT,
  active_this_week BIGINT,
  abandoned_users BIGINT,
  abandonment_rate_percent INTEGER
) AS $$
SELECT
  COUNT(*) AS total_users,
  COALESCE(SUM(CASE WHEN onboarding_completed THEN 1 ELSE 0 END), 0) AS completed_onboarding,
  COALESCE(SUM(CASE WHEN onboarding_completed THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 0)::INTEGER AS onboarding_completion_rate,
  COALESCE(SUM(CASE WHEN EXISTS(SELECT 1 FROM user_activity_history WHERE user_id = users.id) THEN 1 ELSE 0 END), 0) AS users_with_activities,
  COALESCE(SUM(CASE WHEN EXISTS(SELECT 1 FROM user_activity_history WHERE user_id = users.id AND activity_date >= CURRENT_DATE - INTERVAL '7 days') THEN 1 ELSE 0 END), 0) AS active_this_week,
  COALESCE(SUM(CASE WHEN NOT EXISTS(SELECT 1 FROM user_activity_history WHERE user_id = users.id) THEN 1 ELSE 0 END), 0) AS abandoned_users,
  COALESCE(
    ROUND(
      COALESCE(SUM(CASE WHEN NOT EXISTS(SELECT 1 FROM user_activity_history WHERE user_id = users.id) THEN 1 ELSE 0 END)::NUMERIC, 0) /
      NULLIF(COUNT(*), 0) * 100
    )::INTEGER,
    0
  ) AS abandonment_rate_percent
FROM users
WHERE user_type = 'patient' OR user_type IS NULL;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 2: admin_stats_by_trimester()
-- Returns: User distribution by trimester
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_stats_by_trimester()
RETURNS TABLE (
  trimester INTEGER,
  user_count BIGINT,
  percentage INTEGER
) AS $$
SELECT
  CASE
    WHEN week BETWEEN 1 AND 13 THEN 1
    WHEN week BETWEEN 14 AND 26 THEN 2
    WHEN week BETWEEN 27 AND 42 THEN 3
    ELSE NULL
  END AS trimester,
  COUNT(*) AS user_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM users WHERE user_type = 'patient' OR user_type IS NULL) * 100)::INTEGER AS percentage
FROM users
WHERE user_type = 'patient' OR user_type IS NULL
GROUP BY trimester
ORDER BY trimester;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 3: admin_stats_top_achievements()
-- Returns: Most unlocked achievements
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_stats_top_achievements()
RETURNS TABLE (
  achievement_id TEXT,
  users_count BIGINT,
  percentage NUMERIC
) AS $$
SELECT
  achievement_id,
  COUNT(*) AS users_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM users WHERE user_type = 'patient' OR user_type IS NULL) * 100, 1)::NUMERIC AS percentage
FROM user_achievements
GROUP BY achievement_id
ORDER BY users_count DESC
LIMIT 5;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 4: admin_stats_activity()
-- Returns: Aggregate activity stats
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_stats_activity()
RETURNS TABLE (
  avg_active_days INTEGER,
  avg_points INTEGER,
  max_points INTEGER,
  min_points INTEGER,
  median_points INTEGER
) AS $$
SELECT
  COALESCE(ROUND(AVG(vs.active_days))::INTEGER, 0) AS avg_active_days,
  COALESCE(ROUND(AVG(vs.total_points))::INTEGER, 0) AS avg_points,
  COALESCE(MAX(vs.total_points)::INTEGER, 0) AS max_points,
  COALESCE(MIN(vs.total_points)::INTEGER, 0) AS min_points,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY vs.total_points)::INTEGER, 0) AS median_points
FROM v_user_stats vs;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 5: admin_users_list()
-- Returns: Complete users list with stats (paginated)
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_users_list(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  signup_date DATE,
  onboarding_completed BOOLEAN,
  onboarding_completed_date DATE,
  current_week SMALLINT,
  trimester INTEGER,
  active_days BIGINT,
  total_exercises BIGINT,
  total_points BIGINT,
  ranking_position INTEGER,
  achievements_count BIGINT,
  last_activity_date DATE,
  last_activity_time TIMESTAMP WITH TIME ZONE,
  active_this_week BOOLEAN
) AS $$
SELECT
  u.id,
  u.email,
  u.name,
  u.created_at::DATE AS signup_date,
  u.onboarding_completed,
  COALESCE(u.onboarding_completed_at::DATE, NULL) AS onboarding_completed_date,
  u.week AS current_week,
  CASE
    WHEN u.week BETWEEN 1 AND 13 THEN 1
    WHEN u.week BETWEEN 14 AND 26 THEN 2
    WHEN u.week BETWEEN 27 AND 42 THEN 3
    ELSE NULL
  END AS trimester,
  COALESCE(vs.active_days, 0) AS active_days,
  COALESCE(vs.total_completions, 0) AS total_exercises,
  COALESCE(vs.total_points, 0) AS total_points,
  COALESCE(vr.position, NULL)::INTEGER AS ranking_position,
  COALESCE(COUNT(DISTINCT ua.id), 0) AS achievements_count,
  COALESCE(MAX(uah.activity_date), NULL)::DATE AS last_activity_date,
  COALESCE(MAX(uah.completed_at), NULL)::TIMESTAMP WITH TIME ZONE AS last_activity_time,
  CASE
    WHEN EXISTS(SELECT 1 FROM user_activity_history WHERE user_id = u.id AND activity_date >= CURRENT_DATE - INTERVAL '7 days')
      THEN true
    ELSE false
  END AS active_this_week
FROM users u
LEFT JOIN v_user_stats vs ON u.id = vs.user_id
LEFT JOIN v_ranking vr ON u.id = vr.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_activity_history uah ON u.id = uah.user_id
WHERE u.user_type = 'patient' OR u.user_type IS NULL
GROUP BY u.id, u.email, u.name, u.created_at, u.onboarding_completed, u.onboarding_completed_at, u.week, vs.active_days, vs.total_completions, vs.total_points, vr.position
ORDER BY u.created_at DESC
LIMIT p_limit
OFFSET p_offset;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 6: admin_user_basic_info(user_id)
-- Returns: User profile info + onboarding data
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_basic_info(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  current_week SMALLINT,
  trimester INTEGER,
  healthy_pregnancy BOOLEAN,
  had_intercurrence BOOLEAN,
  doctor_approved BOOLEAN,
  objectives JSONB,
  discomforts JSONB
) AS $$
SELECT
  u.id,
  u.email,
  u.name,
  u.phone,
  u.created_at,
  u.onboarding_completed,
  u.onboarding_completed_at,
  u.week AS current_week,
  CASE
    WHEN u.week BETWEEN 1 AND 13 THEN 1
    WHEN u.week BETWEEN 14 AND 26 THEN 2
    WHEN u.week BETWEEN 27 AND 42 THEN 3
    ELSE NULL
  END AS trimester,
  u.healthy_pregnancy,
  u.had_intercurrence,
  u.doctor_approved,
  u.objectives,
  u.discomforts
FROM users u
WHERE u.id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 7: admin_user_stats(user_id)
-- Returns: Aggregated activity stats
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_points BIGINT,
  total_active_days BIGINT,
  total_exercises BIGINT,
  ranking_position INTEGER,
  first_activity_date DATE,
  last_activity_date DATE,
  days_span INTEGER
) AS $$
SELECT
  COALESCE(vs.total_points, 0) AS total_points,
  COALESCE(vs.active_days, 0) AS total_active_days,
  COALESCE(vs.total_completions, 0) AS total_exercises,
  COALESCE(vr.position, NULL)::INTEGER AS ranking_position,
  COALESCE(vs.first_activity_date, NULL)::DATE AS first_activity_date,
  COALESCE(vs.last_activity_date, NULL)::DATE AS last_activity_date,
  COALESCE(
    (MAX(activity_date) - MIN(activity_date) + 1)::INTEGER,
    0
  ) AS days_span
FROM v_user_stats vs
LEFT JOIN v_ranking vr ON vs.user_id = vr.user_id
LEFT JOIN user_activity_history uah ON vs.user_id = uah.user_id
WHERE vs.user_id = p_user_id
GROUP BY vs.user_id, vs.total_points, vs.active_days, vs.total_completions, vs.first_activity_date, vs.last_activity_date, vr.position;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 8: admin_user_achievements(user_id)
-- Returns: All achievements for user with unlock dates
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_achievements(p_user_id UUID)
RETURNS TABLE (
  achievement_id TEXT,
  unlock_date DATE,
  unlock_time TIME
) AS $$
SELECT
  achievement_id,
  unlocked_at::DATE AS unlock_date,
  unlocked_at::TIME AS unlock_time
FROM user_achievements
WHERE user_id = p_user_id
ORDER BY unlocked_at DESC;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 9: admin_user_activities(user_id)
-- Returns: Last 10 activities for user
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_activities(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  exercise_id TEXT,
  exercise_name TEXT,
  activity_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER,
  source TEXT
) AS $$
SELECT
  id,
  exercise_id,
  exercise_name,
  activity_date,
  completed_at,
  points_earned,
  source
FROM user_activity_history
WHERE user_id = p_user_id
ORDER BY completed_at DESC
LIMIT 10;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 10: admin_user_top_exercises(user_id)
-- Returns: Top 5 most completed exercises
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_top_exercises(p_user_id UUID)
RETURNS TABLE (
  exercise_id TEXT,
  exercise_name TEXT,
  completion_count BIGINT,
  total_points_from_exercise BIGINT
) AS $$
SELECT
  exercise_id,
  exercise_name,
  COUNT(*) AS completion_count,
  SUM(points_earned)::BIGINT AS total_points_from_exercise
FROM user_activity_history
WHERE user_id = p_user_id
GROUP BY exercise_id, exercise_name
ORDER BY completion_count DESC
LIMIT 5;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- RPC FUNCTION 11: admin_user_streak(user_id)
-- Returns: Current and max consecutive days
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_user_streak(p_user_id UUID)
RETURNS TABLE (
  max_consecutive_days INTEGER,
  current_consecutive_days INTEGER
) AS $$
WITH daily_streak AS (
  SELECT
    activity_date,
    ROW_NUMBER() OVER (ORDER BY activity_date) - ROW_NUMBER() OVER (PARTITION BY ROW_NUMBER() OVER (ORDER BY activity_date) - ROW_NUMBER() OVER (PARTITION BY DATE(activity_date) ORDER BY activity_date) ORDER BY activity_date) AS streak_group
  FROM (
    SELECT DISTINCT activity_date
    FROM user_activity_history
    WHERE user_id = p_user_id
    ORDER BY activity_date
  ) AS distinct_dates
),
streak_lengths AS (
  SELECT
    streak_group,
    COUNT(*) AS streak_length,
    MAX(activity_date) AS streak_end_date
  FROM daily_streak
  GROUP BY streak_group
),
max_streak AS (
  SELECT MAX(streak_length) AS max_consecutive_days FROM streak_lengths
),
current_streak AS (
  SELECT
    CASE
      WHEN CURRENT_DATE - (SELECT MAX(activity_date) FROM user_activity_history WHERE user_id = p_user_id) = 0
        THEN (SELECT COUNT(*) FROM (SELECT DISTINCT activity_date FROM user_activity_history WHERE user_id = p_user_id AND activity_date >= CURRENT_DATE - INTERVAL '100 days' ORDER BY activity_date) t WHERE activity_date >= CURRENT_DATE - INTERVAL '100 days')
      ELSE 0
    END AS current_consecutive_days
)
SELECT
  COALESCE((SELECT max_consecutive_days FROM max_streak), 0)::INTEGER AS max_consecutive_days,
  COALESCE((SELECT current_consecutive_days FROM current_streak), 0)::INTEGER AS current_consecutive_days;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- INDEXES FOR ADMIN QUERIES (Recommended)
-- ============================================================================

-- Index on users table for onboarding filtering
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed
  ON users(onboarding_completed)
  WHERE user_type = 'patient' OR user_type IS NULL;

-- Index on user_activity_history for "active this week" queries
CREATE INDEX IF NOT EXISTS idx_user_activity_history_activity_date
  ON user_activity_history(activity_date DESC);

-- Index on user_achievements for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_achievement
  ON user_achievements(user_id, achievement_id);

-- Index on users for week-based trimester queries
CREATE INDEX IF NOT EXISTS idx_users_week
  ON users(week)
  WHERE user_type = 'patient' OR user_type IS NULL;

-- ============================================================================
-- GRANTS (Admin RPC functions are public - auth at API level)
-- ============================================================================

GRANT EXECUTE ON FUNCTION admin_stats_overview() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_stats_by_trimester() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_stats_top_achievements() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_stats_activity() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_users_list(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_basic_info(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_stats(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_achievements(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_activities(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_top_exercises(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_user_streak(UUID) TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION admin_stats_overview() IS 'Overview stats: total users, onboarding completion, activity engagement, abandonment rate';
COMMENT ON FUNCTION admin_stats_by_trimester() IS 'User distribution across pregnancy trimesters';
COMMENT ON FUNCTION admin_stats_top_achievements() IS 'Top 5 most unlocked achievements with completion percentage';
COMMENT ON FUNCTION admin_stats_activity() IS 'Aggregate activity metrics: averages, medians, max/min points';
COMMENT ON FUNCTION admin_users_list(INTEGER, INTEGER) IS 'Paginated users list with stats (sorted by signup date DESC)';
COMMENT ON FUNCTION admin_user_basic_info(UUID) IS 'Complete user profile with onboarding data';
COMMENT ON FUNCTION admin_user_stats(UUID) IS 'User activity stats: points, days, ranking, streaks';
COMMENT ON FUNCTION admin_user_achievements(UUID) IS 'All achievements unlocked by user with dates';
COMMENT ON FUNCTION admin_user_activities(UUID) IS 'Last 10 activities (exercise completions)';
COMMENT ON FUNCTION admin_user_top_exercises(UUID) IS 'Top 5 most completed exercises';
COMMENT ON FUNCTION admin_user_streak(UUID) IS 'Consecutive days streak (current and max)';
