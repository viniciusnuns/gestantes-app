-- Fix admin_stats_by_trimester to use current calculated week
-- instead of the static 'week' column (which was the week at registration).
-- Users progress through trimesters over time; the dashboard must reflect
-- where they are NOW, not where they were when they signed up.

CREATE OR REPLACE FUNCTION admin_stats_by_trimester()
RETURNS TABLE (
  trimester INTEGER,
  user_count BIGINT,
  percentage INTEGER
) AS $$
WITH current_weeks AS (
  SELECT
    LEAST(
      COALESCE(week_at_registration, week, 20) +
      FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(registration_date, created_at, NOW()))) / 604800)::INTEGER,
      40
    ) AS current_week
  FROM users
  WHERE user_type = 'patient' OR user_type IS NULL
),
trimester_groups AS (
  SELECT
    CASE
      WHEN current_week BETWEEN 1  AND 13 THEN 1
      WHEN current_week BETWEEN 14 AND 26 THEN 2
      WHEN current_week BETWEEN 27 AND 42 THEN 3
      ELSE NULL
    END AS trimester
  FROM current_weeks
),
total AS (
  SELECT COUNT(*) AS n FROM trimester_groups WHERE trimester IS NOT NULL
)
SELECT
  tg.trimester,
  COUNT(*) AS user_count,
  ROUND(COUNT(*)::NUMERIC / NULLIF(total.n, 0) * 100)::INTEGER AS percentage
FROM trimester_groups tg, total
WHERE tg.trimester IS NOT NULL
GROUP BY tg.trimester, total.n
ORDER BY tg.trimester;
$$ LANGUAGE SQL STABLE;
