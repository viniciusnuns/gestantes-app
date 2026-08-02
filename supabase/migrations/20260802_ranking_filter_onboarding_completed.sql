-- Fix: excluir do ranking usuárias que não concluíram o onboarding
-- Problema: customSignUp insere em users imediatamente no cadastro (onboarding_completed = false),
-- fazendo qualquer pessoa que cria conta aparecer no ranking com 0 pontos.
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
    WHERE u.onboarding_completed = true
      AND (u.user_type != 'moderator' OR u.user_type IS NULL)
    GROUP BY u.id, u.name
  ) ranked
  ORDER BY total_pts DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION get_ranking_top(INT) TO anon, authenticated;
