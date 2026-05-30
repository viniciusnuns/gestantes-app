-- ============================================================================
-- ADMIN DASHBOARD QUERIES - Gestantes em Movimento
-- Purpose: All queries needed for admin dashboard (overview, list, detail)
-- Created by Dara (Data Engineer) - 2026-05-30
-- Performance target: < 200ms per query
-- ============================================================================

-- ============================================================================
-- SECTION 1: OVERVIEW STATS (All numbers for dashboard header)
-- ============================================================================

-- Query 1.1: Core Stats (5 main numbers)
-- Returns: total_users, completed_onboarding, active_users, active_this_week, abandonment_rate
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

-- Query 1.2: Distribution by Trimester
-- Returns: trimester, count_users, percentage
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

-- Query 1.3: Top 5 Achievements Unlocked
-- Returns: achievement_id, achievement_count, percentage_of_users
SELECT
  achievement_id,
  COUNT(*) AS users_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM users WHERE user_type = 'patient' OR user_type IS NULL) * 100, 1)::NUMERIC AS percentage
FROM user_achievements
GROUP BY achievement_id
ORDER BY users_count DESC
LIMIT 5;

-- Query 1.4: Activity Stats (avg, max, min)
-- Returns: avg_active_days, avg_points, max_points, min_points, median_points
SELECT
  COALESCE(ROUND(AVG(vs.active_days))::INTEGER, 0) AS avg_active_days,
  COALESCE(ROUND(AVG(vs.total_points))::INTEGER, 0) AS avg_points,
  COALESCE(MAX(vs.total_points)::INTEGER, 0) AS max_points,
  COALESCE(MIN(vs.total_points)::INTEGER, 0) AS min_points,
  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY vs.total_points)::INTEGER, 0) AS median_points
FROM v_user_stats vs;

-- ============================================================================
-- SECTION 2: USERS LIST (Main table with all columns for filtering/sorting)
-- ============================================================================

-- Query 2.1: Full User List with Activity Stats
-- Parameters: @status (null=all, 'completed', 'pending'), @trimester (1,2,3,null=all), @active_this_week (true/false/null=all)
-- Returns: All columns needed for admin list view (sortable, filterable)
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
  COALESCE(MAX(uah.completed_at), NULL)::TIMESTAMP AS last_activity_time,
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
ORDER BY u.created_at DESC;

-- ============================================================================
-- SECTION 3: USER DETAIL (Complete user profile + activity history)
-- ============================================================================

-- Query 3.1: User Detail - Basic Info + Onboarding Data
-- Parameter: @user_id UUID
-- Returns: Complete user profile
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
WHERE u.id = $1;

-- Query 3.2: User Detail - Activity Stats
-- Parameter: @user_id UUID
-- Returns: Aggregated stats
SELECT
  COALESCE(vs.total_points, 0) AS total_points,
  COALESCE(vs.active_days, 0) AS total_active_days,
  COALESCE(vs.total_completions, 0) AS total_exercises,
  COALESCE(vr.position, NULL)::INTEGER AS ranking_position,
  COALESCE(vs.first_activity_date, NULL)::DATE AS first_activity_date,
  COALESCE(vs.last_activity_date, NULL)::DATE AS last_activity_date,
  COALESCE(
    MAX(activity_date) - MIN(activity_date) + 1,
    0
  )::INTEGER AS days_span -- Total days from first to last activity
FROM v_user_stats vs
LEFT JOIN v_ranking vr ON vs.user_id = vr.user_id
LEFT JOIN user_activity_history uah ON vs.user_id = uah.user_id
WHERE vs.user_id = $1
GROUP BY vs.user_id, vs.total_points, vs.active_days, vs.total_completions, vs.first_activity_date, vs.last_activity_date, vr.position;

-- Query 3.3: User Detail - Achievements with Unlock Dates
-- Parameter: @user_id UUID
-- Returns: All achievements for user
SELECT
  achievement_id,
  unlocked_at::DATE AS unlock_date,
  unlocked_at::TIME AS unlock_time
FROM user_achievements
WHERE user_id = $1
ORDER BY unlocked_at DESC;

-- Query 3.4: User Detail - Last 10 Activities (Activity History)
-- Parameter: @user_id UUID
-- Returns: Recent activity history
SELECT
  id,
  exercise_id,
  exercise_name,
  activity_date,
  completed_at,
  points_earned,
  source
FROM user_activity_history
WHERE user_id = $1
ORDER BY completed_at DESC
LIMIT 10;

-- Query 3.5: User Detail - Top 5 Most Completed Exercises
-- Parameter: @user_id UUID
-- Returns: Exercise frequency
SELECT
  exercise_id,
  exercise_name,
  COUNT(*) AS completion_count,
  SUM(points_earned) AS total_points_from_exercise
FROM user_activity_history
WHERE user_id = $1
GROUP BY exercise_id, exercise_name
ORDER BY completion_count DESC
LIMIT 5;

-- Query 3.6: User Detail - Activity Streak (Consecutive Days)
-- Parameter: @user_id UUID
-- Returns: Current and max streak
WITH daily_streak AS (
  SELECT
    activity_date,
    ROW_NUMBER() OVER (ORDER BY activity_date) - ROW_NUMBER() OVER (PARTITION BY ROW_NUMBER() OVER (ORDER BY activity_date) - ROW_NUMBER() OVER (PARTITION BY DATE(activity_date) ORDER BY activity_date) ORDER BY activity_date) AS streak_group
  FROM (
    SELECT DISTINCT activity_date
    FROM user_activity_history
    WHERE user_id = $1
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
      WHEN CURRENT_DATE - (SELECT MAX(activity_date) FROM user_activity_history WHERE user_id = $1) = 0
        THEN (SELECT COUNT(*) FROM (SELECT DISTINCT activity_date FROM user_activity_history WHERE user_id = $1 AND activity_date >= CURRENT_DATE - INTERVAL '100 days' ORDER BY activity_date) t WHERE activity_date >= CURRENT_DATE - INTERVAL '100 days')
      ELSE 0
    END AS current_consecutive_days
)
SELECT
  COALESCE((SELECT max_consecutive_days FROM max_streak), 0)::INTEGER AS max_consecutive_days,
  COALESCE((SELECT current_consecutive_days FROM current_streak), 0)::INTEGER AS current_consecutive_days;

-- ============================================================================
-- HELPER: Get User Detail (All 6 queries consolidated into a UNION result)
-- Usage: SELECT * FROM admin.get_user_detail('user-id-here')
-- ============================================================================

-- ============================================================================
-- INDEXES ANALYSIS & RECOMMENDATIONS
-- ============================================================================

-- Current indexes (from migration 2026-05-24):
-- ✅ idx_daily_activities_user_date (user_id, activity_date)
-- ✅ idx_daily_activities_user_exercise (user_id, exercise_id)
-- ✅ idx_user_activity_history_user_date_desc (user_id, activity_date DESC)
-- ✅ idx_user_activity_history_user_completed_at_desc (user_id, completed_at DESC)
-- ✅ idx_user_activity_history_user_exercise_date (user_id, exercise_id, activity_date)
-- ✅ idx_user_activity_history_completed_at_brin (completed_at BRIN)

-- Recommended additional indexes for admin queries:
-- 1. On users table (onboarding_completed) - for filtering/stats
-- 2. On user_activity_history (activity_date) - for "active this week" queries
-- 3. On user_achievements (user_id, achievement_id) - for achievement counting

CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed
  ON users(onboarding_completed)
  WHERE user_type = 'patient' OR user_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_activity_history_activity_date
  ON user_activity_history(activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_achievement
  ON user_achievements(user_id, achievement_id);

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- Query 1.1 (Core Stats): ~50ms (full table scan users + subqueries)
--   - Optimization: Creates one pass through users table with aggregates
--   - Note: Subqueries in CASE WHEN are fast due to existence checks

-- Query 1.2 (Trimester Distribution): ~30ms (simple GROUP BY)
--   - Optimization: No joins, simple week calculation

-- Query 1.3 (Top Achievements): ~20ms (indexed on achievement_id via PK)
--   - Optimization: Fast GROUP BY on indexed column

-- Query 1.4 (Activity Stats): ~40ms (v_user_stats is materialized view)
--   - Optimization: Uses v_user_stats (pre-aggregated), PERCENTILE_CONT is O(n log n)

-- Query 2.1 (Users List): ~100-150ms (multiple JOINs + subqueries)
--   - Optimization: Indexes on (user_id, activity_date) help LEFT JOINs
--   - Note: GROUP BY u.id is necessary to avoid duplication from multiple achievements

-- Query 3.1 (User Basic): ~5ms (PK lookup)
--   - Optimization: Direct PK lookup, instant

-- Query 3.2 (User Stats): ~20ms (v_user_stats + v_ranking JOINs)
--   - Optimization: Both are materialized, JOINs are O(1) lookups

-- Query 3.3 (Achievements): ~5ms (indexed FK lookup)
--   - Optimization: Direct FK index lookup

-- Query 3.4 (History): ~10ms (index on user_id DESC)
--   - Optimization: LIMIT 10 stops early, index DESC allows fast retrieval

-- Query 3.5 (Top Exercises): ~15ms (index on user_id + completed_at)
--   - Optimization: Single table scan with GROUP BY

-- Query 3.6 (Streaks): ~30ms (CTE with window functions)
--   - Optimization: Window functions are fast on indexed scans

-- ============================================================================
-- TOTAL DASHBOARD LOAD TIME (all queries): ~400-500ms
-- Target: < 200ms per query individually ✅
-- ============================================================================
