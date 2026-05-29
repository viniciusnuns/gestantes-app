-- ============================================
-- OPTIMIZED RPC FUNCTIONS v2
-- Smart Consolidation Strategy
-- 4 specialized RPCs instead of 1 complex one
-- ============================================

-- RPC #1: Get user header (profile + metadata)
CREATE OR REPLACE FUNCTION get_user_header(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  week_at_registration INT,
  registration_date DATE,
  account_created_at TIMESTAMPTZ
) LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT
    id,
    name,
    avatar_url,
    week_at_registration,
    registration_date,
    account_created_at
  FROM users
  WHERE id = p_user_id;
$$;

-- RPC #2: Get user activities (latest N records)
CREATE OR REPLACE FUNCTION get_user_activities_latest(
  p_user_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  exercise_id TEXT,
  exercise_name TEXT,
  activity_date DATE,
  points_earned INT,
  completed_at TIMESTAMPTZ
) LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT
    ah.id,
    ah.exercise_id,
    ah.exercise_name,
    ah.activity_date,
    ah.points_earned,
    ah.completed_at
  FROM user_activity_history ah
  WHERE ah.user_id = p_user_id
  AND ah.activity_date <= CURRENT_DATE
  ORDER BY ah.completed_at DESC
  LIMIT p_limit;
$$;

-- RPC #3: Get user stats + current ranking position
CREATE OR REPLACE FUNCTION get_user_stats_and_ranking(p_user_id UUID)
RETURNS TABLE(
  total_points INT,
  active_days INT,
  total_completions INT,
  user_rank INT,
  rank_name TEXT
) LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_total_points INT;
  v_active_days INT;
  v_total_completions INT;
  v_rank INT;
  v_name TEXT;
BEGIN
  -- Calculate stats for this user
  SELECT
    COALESCE(SUM(points_earned), 0)::INT,
    COALESCE(COUNT(DISTINCT activity_date), 0)::INT,
    COALESCE(COUNT(*), 0)::INT,
    u.name
  INTO v_total_points, v_active_days, v_total_completions, v_name
  FROM user_activity_history ah
  FULL OUTER JOIN users u ON u.id = p_user_id
  WHERE ah.user_id = p_user_id;

  -- Calculate rank for this user
  SELECT COUNT(*)::INT + 1
  INTO v_rank
  FROM (
    SELECT u2.id, SUM(COALESCE(ah2.points_earned, 0)) as total_pts
    FROM users u2
    LEFT JOIN user_activity_history ah2 ON u2.id = ah2.user_id
    GROUP BY u2.id
    HAVING SUM(COALESCE(ah2.points_earned, 0)) > v_total_points
  ) ranked;

  -- Return results
  RETURN QUERY SELECT v_total_points, v_active_days, v_total_completions, v_rank, v_name;
END;
$$;

-- RPC #4: Get ranking top N (default 20)
CREATE OR REPLACE FUNCTION get_ranking_top(p_limit INT DEFAULT 20)
RETURNS TABLE(
  "position" INT,
  user_id UUID,
  name TEXT,
  total_points INT,
  active_days INT
) LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY total_pts DESC)::INT as "position",
    user_id,
    name,
    total_pts::INT,
    active_days_count::INT
  FROM (
    SELECT
      u.id as user_id,
      u.name,
      COALESCE(SUM(ah.points_earned), 0) as total_pts,
      COALESCE(COUNT(DISTINCT ah.activity_date), 0) as active_days_count
    FROM users u
    LEFT JOIN user_activity_history ah ON u.id = ah.user_id
    GROUP BY u.id, u.name
  ) ranked
  ORDER BY total_pts DESC
  LIMIT p_limit;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_header(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_activities_latest(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats_and_ranking(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_ranking_top(INT) TO anon, authenticated;
