-- Event-Log Architecture for Gestar em Movimento
-- Supports exercise repetition, automatic week progression, and full data persistence
-- Created by Dara (Data Engineer) - 2026-05-24

-- ============================================================================
-- TABLE: daily_activities
-- Purpose: Catalog of suggested daily exercises (generated or manual)
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  exercise_id TEXT NOT NULL,
  slot_order SMALLINT NOT NULL CHECK (slot_order BETWEEN 1 AND 10),
  trimester SMALLINT NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  week_number SMALLINT NOT NULL CHECK (week_number BETWEEN 1 AND 42),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, activity_date, slot_order)
);

CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date
  ON daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_exercise
  ON daily_activities(user_id, exercise_id);

COMMENT ON TABLE daily_activities IS 'Suggested exercises for each user per day (3 slots per day)';
COMMENT ON COLUMN daily_activities.slot_order IS 'Position in daily suggestion list (1, 2, or 3)';
COMMENT ON COLUMN daily_activities.trimester IS 'Pregnancy trimester (1, 2, or 3)';

-- ============================================================================
-- TABLE: user_activity_history
-- Purpose: Event log (append-only) of all exercise completions
-- Supports intentional repetitions (same exercise, different dates = separate events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL, -- Snapshot of exercise name at completion time
  activity_date DATE NOT NULL, -- In São Paulo timezone (enforced by trigger)
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  points_earned INTEGER NOT NULL DEFAULT 20 CHECK (points_earned BETWEEN 0 AND 1000),
  source TEXT NOT NULL DEFAULT 'biblioteca'
    CHECK (source IN ('home', 'biblioteca', 'calendario', 'admin')),
  daily_activity_id UUID REFERENCES daily_activities(id) ON DELETE SET NULL,

  -- Event log is append-only; no unique constraints to support repetitions
  CONSTRAINT valid_source CHECK (source IN ('home', 'biblioteca', 'calendario', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_user_activity_history_user_date_desc
  ON user_activity_history(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_history_user_completed_at_desc
  ON user_activity_history(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_history_user_exercise_date
  ON user_activity_history(user_id, exercise_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_history_completed_at_brin
  ON user_activity_history USING BRIN (completed_at);

COMMENT ON TABLE user_activity_history IS 'Append-only event log of all exercise completions (source of truth)';
COMMENT ON COLUMN user_activity_history.activity_date IS 'Date activity was completed (São Paulo timezone)';
COMMENT ON COLUMN user_activity_history.points_earned IS 'Points awarded for this completion (default 20)';
COMMENT ON COLUMN user_activity_history.source IS 'Where the activity was marked (biblioteca, home, etc.)';

-- ============================================================================
-- TRIGGER: enforce_activity_date_brt
-- Purpose: Ensure activity_date is always in São Paulo timezone (YYYY-MM-DD)
-- ============================================================================
CREATE OR REPLACE FUNCTION enforce_activity_date_brt()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert completed_at to São Paulo timezone and extract date
  NEW.activity_date := (NEW.completed_at AT TIME ZONE 'America/Sao_Paulo')::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TRIGGER trg_enforce_activity_date_brt
  BEFORE INSERT OR UPDATE ON user_activity_history
  FOR EACH ROW
  EXECUTE FUNCTION enforce_activity_date_brt();

-- ============================================================================
-- VIEW: v_user_stats
-- Purpose: Aggregate statistics for each user (points, active days, etc.)
-- ============================================================================
CREATE OR REPLACE VIEW v_user_stats AS
SELECT
  uah.user_id,
  COALESCE(SUM(uah.points_earned), 0) AS total_points,
  COALESCE(COUNT(DISTINCT uah.activity_date), 0) AS active_days,
  COALESCE(COUNT(*), 0) AS total_completions,
  COALESCE(MIN(uah.activity_date), NULL) AS first_activity_date,
  COALESCE(MAX(uah.activity_date), NULL) AS last_activity_date
FROM user_activity_history uah
GROUP BY uah.user_id;

COMMENT ON VIEW v_user_stats IS 'User-level aggregate statistics for points and activity tracking';

-- ============================================================================
-- VIEW: v_ranking
-- Purpose: Real-time ranking by points (top performers)
-- ============================================================================
CREATE OR REPLACE VIEW v_ranking AS
SELECT
  RANK() OVER (ORDER BY vs.total_points DESC) AS position,
  u.id AS user_id,
  u.name,
  vs.total_points,
  vs.active_days,
  vs.total_completions
FROM v_user_stats vs
LEFT JOIN users u ON vs.user_id = u.id
WHERE u.user_type = 'patient' OR u.user_type IS NULL
ORDER BY vs.total_points DESC;

COMMENT ON VIEW v_ranking IS 'Real-time ranking of users by points earned';

-- ============================================================================
-- RLS POLICIES
-- Note: Using permissive policies for MVP with custom auth
-- Tech-debt TD-001: Migrate to Supabase Auth + enable strict RLS
-- ============================================================================
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_history ENABLE ROW LEVEL SECURITY;

-- Permissive: All users can read (data isolation enforced at app layer)
CREATE POLICY "Users can read their own daily activities"
  ON daily_activities FOR SELECT
  USING (true); -- Isolation enforced at app layer with getCurrentUser()

CREATE POLICY "Users can read their own activity history"
  ON user_activity_history FOR SELECT
  USING (true); -- Isolation enforced at app layer with getCurrentUser()

-- Insert only to own history
CREATE POLICY "Users can insert their own activity history"
  ON user_activity_history FOR INSERT
  WITH CHECK (true); -- Isolation enforced at app layer

-- ============================================================================
-- GRANTS (for public schema)
-- ============================================================================
GRANT SELECT, INSERT ON daily_activities TO anon, authenticated;
GRANT SELECT, INSERT ON user_activity_history TO anon, authenticated;
GRANT SELECT ON v_user_stats TO anon, authenticated;
GRANT SELECT ON v_ranking TO anon, authenticated;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
-- 1. Execute this migration in Supabase SQL Editor
-- 2. Verify tables created: SELECT * FROM daily_activities LIMIT 0;
-- 3. Verify views: SELECT * FROM v_ranking LIMIT 0;
-- 4. Run data migration script (user_exercises → user_activity_history)
-- 5. Test with sample data:
--    INSERT INTO user_activity_history(user_id, exercise_id, exercise_name, completed_at, source)
--    VALUES('user-uuid', 'ex-1', 'Respiração Consciente', NOW(), 'biblioteca');
-- 6. Tech-debt items to track:
--    - TD-001: Migrate to Supabase Auth for strict RLS
--    - TD-002: Materialized view for v_ranking at 500+ users
--    - TD-003: Partition user_activity_history at 1M+ events
