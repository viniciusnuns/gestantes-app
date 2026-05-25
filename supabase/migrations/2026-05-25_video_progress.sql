-- Video Progress Tracking — Story 1.4
-- Append-only event log of YouTube video interactions per user.
-- Created: 2026-05-25
--
-- IMPORTANT — Auth context:
-- This project uses CUSTOM AUTH (lib/customAuth.ts), not Supabase Auth.
-- `auth.uid()` is therefore NOT available in RLS policies. We follow the same
-- permissive RLS pattern used by user_activity_history (2026-05-24 migration):
-- isolation is enforced at the app layer via getCurrentUser(). When the project
-- migrates to Supabase Auth (tech-debt TD-001), tighten these policies in a
-- single follow-up migration.

-- ============================================================================
-- TABLE: video_progress
-- Purpose: Per-event log (play | pause | completed) of video interactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'completed')),
  watched_until_sec INTEGER NOT NULL DEFAULT 0 CHECK (watched_until_sec >= 0),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lookup: latest events per user/video (analytics + "did she finish?" checks)
CREATE INDEX IF NOT EXISTS idx_video_progress_user_video_created
  ON video_progress(user_id, video_id, created_at DESC);

-- Lookup: events of a single playback session
CREATE INDEX IF NOT EXISTS idx_video_progress_session
  ON video_progress(session_id);

COMMENT ON TABLE video_progress IS 'Append-only event log of video play/pause/completed interactions (Story 1.4)';
COMMENT ON COLUMN video_progress.video_id IS 'Application-level video identifier (e.g. exercise.youtube_video_id or exercise.id)';
COMMENT ON COLUMN video_progress.event_type IS 'play = iframe mounted; pause = optional MVP; completed = >= 90% watched or component unmount';
COMMENT ON COLUMN video_progress.watched_until_sec IS 'Estimated seconds watched at event time (0 for play, ~total at completed)';
COMMENT ON COLUMN video_progress.session_id IS 'Client-generated UUID grouping events of one playback session';

-- ============================================================================
-- RLS POLICIES
-- Permissive (MVP): all isolation lives in the app layer (getCurrentUser()).
-- Tech-debt TD-001: tighten to `auth.uid() = user_id` after Supabase Auth migration.
-- ============================================================================
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_progress_own_insert"
  ON video_progress FOR INSERT
  WITH CHECK (true); -- App-layer isolation via getCurrentUser()

CREATE POLICY "video_progress_own_read"
  ON video_progress FOR SELECT
  USING (true); -- App-layer isolation via getCurrentUser()

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT, INSERT ON video_progress TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE video_progress_id_seq TO anon, authenticated;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Run in Supabase SQL Editor before deploying client code.
-- 2. Verify with: SELECT * FROM video_progress LIMIT 0;
-- 3. After Supabase Auth migration, replace policies with:
--      WITH CHECK (auth.uid() = user_id)   -- INSERT
--      USING      (auth.uid() = user_id)   -- SELECT
