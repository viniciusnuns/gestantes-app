-- RPC Function: Bootstrap page data in a single call
-- Consolidates 4 independent queries into 1 RPC call
-- Reduces round-trips from 4 to 1 on page load

CREATE OR REPLACE FUNCTION get_page_data_bootstrap(user_id UUID)
RETURNS TABLE(
  profile JSONB,
  activities JSONB,
  stats JSONB,
  ranking JSONB
) LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_profile JSONB;
  v_activities JSONB;
  v_stats JSONB;
  v_ranking JSONB;
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;

  -- 1. Fetch user profile
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'week_at_registration', week_at_registration,
    'registration_date', registration_date,
    'account_created_at', account_created_at,
    'created_at', created_at
  ) INTO v_profile
  FROM users
  WHERE id = user_id;

  -- 2. Fetch user activities (up to today only)
  SELECT jsonb_agg(row_to_json(t) ORDER BY completed_at DESC)
  INTO v_activities
  FROM (
    SELECT id, user_id, exercise_id, exercise_name, activity_date,
           completed_at, points_earned, source, daily_activity_id
    FROM user_activity_history
    WHERE user_id = user_id AND activity_date <= v_today
  ) t;

  -- 3. Fetch user stats (from view if exists, else manual aggregate)
  SELECT jsonb_build_object(
    'user_id', user_id,
    'total_points', total_points,
    'active_days', active_days,
    'total_completions', total_completions,
    'first_activity_date', first_activity_date,
    'last_activity_date', last_activity_date
  ) INTO v_stats
  FROM v_user_stats
  WHERE user_id = user_id;

  -- Fallback if view doesn't exist: manual aggregation
  IF v_stats IS NULL THEN
    SELECT jsonb_build_object(
      'user_id', user_id,
      'total_points', COALESCE(SUM(points_earned), 0),
      'active_days', COALESCE(COUNT(DISTINCT activity_date), 0),
      'total_completions', COALESCE(COUNT(*), 0),
      'first_activity_date', MIN(activity_date),
      'last_activity_date', MAX(activity_date)
    ) INTO v_stats
    FROM user_activity_history
    WHERE user_id = user_id;
  END IF;

  -- 4. Fetch ranking (top 100)
  SELECT jsonb_agg(row_to_json(t))
  INTO v_ranking
  FROM (
    SELECT position, user_id, name, total_points, active_days, total_completions
    FROM v_ranking
    ORDER BY position ASC
    LIMIT 100
  ) t;

  -- Return all data as single row
  RETURN QUERY SELECT v_profile, v_activities, v_stats, v_ranking;
END;
$$;

-- Grant execution permission to authenticated users (custom auth)
GRANT EXECUTE ON FUNCTION get_page_data_bootstrap(UUID) TO anon, authenticated;
