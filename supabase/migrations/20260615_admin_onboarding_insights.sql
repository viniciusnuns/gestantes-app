-- Admin insights from onboarding data: first pregnancy, objectives, discomforts

CREATE OR REPLACE FUNCTION admin_stats_first_pregnancy()
RETURNS TABLE (
  first_time BIGINT,
  experienced BIGINT,
  unknown_count BIGINT,
  total BIGINT,
  first_time_percent INTEGER
) AS $$
SELECT
  COUNT(*) FILTER (WHERE first_pregnancy = true) AS first_time,
  COUNT(*) FILTER (WHERE first_pregnancy = false) AS experienced,
  COUNT(*) FILTER (WHERE first_pregnancy IS NULL) AS unknown_count,
  COUNT(*) AS total,
  COALESCE(
    ROUND(COUNT(*) FILTER (WHERE first_pregnancy = true)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE first_pregnancy IS NOT NULL), 0) * 100)::INTEGER,
    0
  ) AS first_time_percent
FROM users
WHERE user_type IN ('patient', 'beta') OR user_type IS NULL;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION admin_stats_top_objectives()
RETURNS TABLE (
  objective TEXT,
  users_count BIGINT,
  percentage NUMERIC
) AS $$
SELECT
  obj AS objective,
  COUNT(*) AS users_count,
  ROUND(COUNT(*)::NUMERIC / NULLIF(
    (SELECT COUNT(*) FROM users
     WHERE (user_type IN ('patient', 'beta') OR user_type IS NULL)
       AND objectives IS NOT NULL
       AND array_length(objectives, 1) > 0),
    0
  ) * 100, 1) AS percentage
FROM users,
  unnest(objectives) AS obj
WHERE (user_type IN ('patient', 'beta') OR user_type IS NULL)
  AND objectives IS NOT NULL
GROUP BY obj
ORDER BY users_count DESC;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION admin_stats_top_discomforts()
RETURNS TABLE (
  discomfort TEXT,
  users_count BIGINT,
  percentage NUMERIC
) AS $$
SELECT
  dis AS discomfort,
  COUNT(*) AS users_count,
  ROUND(COUNT(*)::NUMERIC / NULLIF(
    (SELECT COUNT(*) FROM users
     WHERE (user_type IN ('patient', 'beta') OR user_type IS NULL)
       AND discomforts IS NOT NULL
       AND array_length(discomforts, 1) > 0),
    0
  ) * 100, 1) AS percentage
FROM users,
  unnest(discomforts) AS dis
WHERE (user_type IN ('patient', 'beta') OR user_type IS NULL)
  AND discomforts IS NOT NULL
GROUP BY dis
ORDER BY users_count DESC;
$$ LANGUAGE SQL STABLE;

GRANT EXECUTE ON FUNCTION admin_stats_first_pregnancy() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_stats_top_objectives() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_stats_top_discomforts() TO anon, authenticated;
