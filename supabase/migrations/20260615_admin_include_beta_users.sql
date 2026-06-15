-- Include beta users in admin_users_list function
-- Previously only showed user_type = 'patient', now includes 'beta' too

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
  LEAST(
    COALESCE(u.week_at_registration, u.week, 20) +
    FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(u.registration_date, u.created_at, NOW()))) / 604800)::INTEGER,
    40
  )::SMALLINT AS current_week,
  CASE
    WHEN LEAST(
      COALESCE(u.week_at_registration, u.week, 20) +
      FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(u.registration_date, u.created_at, NOW()))) / 604800)::INTEGER,
      40
    ) BETWEEN 1 AND 13 THEN 1
    WHEN LEAST(
      COALESCE(u.week_at_registration, u.week, 20) +
      FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(u.registration_date, u.created_at, NOW()))) / 604800)::INTEGER,
      40
    ) BETWEEN 14 AND 26 THEN 2
    WHEN LEAST(
      COALESCE(u.week_at_registration, u.week, 20) +
      FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(u.registration_date, u.created_at, NOW()))) / 604800)::INTEGER,
      40
    ) BETWEEN 27 AND 42 THEN 3
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
    WHEN EXISTS(
      SELECT 1 FROM user_activity_history
      WHERE user_id = u.id AND activity_date >= CURRENT_DATE - INTERVAL '7 days'
    ) THEN true
    ELSE false
  END AS active_this_week
FROM users u
LEFT JOIN v_user_stats vs ON u.id = vs.user_id
LEFT JOIN v_ranking vr ON u.id = vr.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_activity_history uah ON u.id = uah.user_id
WHERE u.user_type IN ('patient', 'beta') OR u.user_type IS NULL
GROUP BY
  u.id, u.email, u.name, u.created_at, u.onboarding_completed,
  u.onboarding_completed_at, u.week, u.week_at_registration,
  u.registration_date, vs.active_days, vs.total_completions,
  vs.total_points, vr.position
ORDER BY u.created_at DESC
LIMIT p_limit
OFFSET p_offset;
$$ LANGUAGE SQL STABLE;

GRANT EXECUTE ON FUNCTION admin_users_list(INTEGER, INTEGER) TO anon, authenticated;
