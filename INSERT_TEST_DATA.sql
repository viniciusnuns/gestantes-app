-- Test Data Insertion Script for Gestar em Movimento
-- Execute this in Supabase SQL Editor to populate test data
-- Replace [USER_UUID] with the actual user ID from your testing

-- ============================================================================
-- STEP 1: Insert daily activity suggestions for this week
-- ============================================================================
-- Suggestions for today + next 6 days (3 exercises per day)

INSERT INTO daily_activities(user_id, activity_date, exercise_id, slot_order, trimester, week_number, generated_at)
VALUES
  -- Today (May 24, 2026)
  ('[USER_UUID]', '2026-05-24', 'ex-1', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-24', 'ex-4', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-24', 'ex-5', 3, 2, 20, NOW()),

  -- Tomorrow (May 25)
  ('[USER_UUID]', '2026-05-25', 'ex-2', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-25', 'ex-5', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-25', 'ex-1', 3, 2, 20, NOW()),

  -- May 26
  ('[USER_UUID]', '2026-05-26', 'ex-3', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-26', 'ex-4', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-26', 'ex-6', 3, 2, 20, NOW()),

  -- May 27
  ('[USER_UUID]', '2026-05-27', 'ex-1', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-27', 'ex-2', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-27', 'ex-5', 3, 2, 20, NOW()),

  -- May 28
  ('[USER_UUID]', '2026-05-28', 'ex-4', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-28', 'ex-3', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-28', 'ex-1', 3, 2, 20, NOW()),

  -- May 29
  ('[USER_UUID]', '2026-05-29', 'ex-2', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-29', 'ex-6', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-29', 'ex-4', 3, 2, 20, NOW()),

  -- May 30
  ('[USER_UUID]', '2026-05-30', 'ex-5', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-30', 'ex-1', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-30', 'ex-3', 3, 2, 20, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Insert completed activities (histórico)
-- ============================================================================
-- Mix of completed and pending to test visualization

INSERT INTO user_activity_history(user_id, exercise_id, exercise_name, completed_at, points_earned, source, daily_activity_id)
VALUES
  -- May 22 (2 days ago)
  ('[USER_UUID]', 'ex-1', 'Respiração Consciente', '2026-05-22 14:30:00'::TIMESTAMPTZ, 20, 'biblioteca', NULL),
  ('[USER_UUID]', 'ex-4', 'Caminhada Leve', '2026-05-22 16:45:00'::TIMESTAMPTZ, 20, 'biblioteca', NULL),

  -- May 23 (yesterday)
  ('[USER_UUID]', 'ex-2', 'Alongamento Suave', '2026-05-23 10:15:00'::TIMESTAMPTZ, 20, 'biblioteca', NULL),
  ('[USER_UUID]', 'ex-5', 'Pilates Gestacional', '2026-05-23 17:00:00'::TIMESTAMPTZ, 20, 'biblioteca', NULL),

  -- May 24 (today)
  ('[USER_UUID]', 'ex-1', 'Respiração Consciente', '2026-05-24 09:30:00'::TIMESTAMPTZ, 20, 'biblioteca', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Verify data was inserted
-- ============================================================================

SELECT 'Daily Activities' as metric, COUNT(*) as count FROM daily_activities WHERE user_id = '[USER_UUID]'
UNION ALL
SELECT 'Completed Activities', COUNT(*) FROM user_activity_history WHERE user_id = '[USER_UUID]'
UNION ALL
SELECT 'User Stats', COUNT(*) FROM v_user_stats WHERE user_id = '[USER_UUID]'
UNION ALL
SELECT 'User Ranking Position', COUNT(*) FROM v_ranking WHERE user_id = '[USER_UUID]';

-- ============================================================================
-- EXPECTED OUTPUT after running this script:
-- ============================================================================
-- Calendar should show:
--   - Week 5/21-5/30 with 3 exercises per day
--   - Green dots (completed): May 22, 23, 24
--   - Yellow dots (pending): May 25-30
--   - Counts: 1/3, 1/3, 1/3, 3/3, 3/3, 3/3, 3/3
--
-- Home should show:
--   - Total points: 100 (5 activities × 20 points)
--   - Active days: 3
--   - Weekly goal: 3/5
--
-- Progresso should show:
--   - Total points: 100
--   - Total days: 3
--   - Total practices: 5
--   - Ranking position: 1 (only user with data)
