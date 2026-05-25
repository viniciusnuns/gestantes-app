-- Add youtube_video_id to exercises (preventive migration)
-- Story 1.1 — Schema YouTube
-- Created by @dev (Dex) — 2026-05-25
--
-- CONTEXT
-- =======
-- The MVP uses YouTube unlisted videos as the cheapest validation path for
-- exercise playback. Exercises are currently a static array in `lib/data.ts`
-- (no Supabase `exercises` table exists yet). This migration is PREVENTIVE:
-- it documents the schema shape the application expects so that when the
-- `exercises` table is created in Supabase, the column is in place from day one.
--
-- PROVIDER DECOUPLING (forward-looking)
-- =====================================
-- The field is named `youtube_video_id` for MVP clarity, but the application
-- treats it as a provider-agnostic foreign key. Post-MVP migration to Bunny.net
-- (or Mux) will introduce a `video_provider` + `video_id` pair and deprecate
-- this column. Until then, NULL = exercise has no video (image-only fallback).
--
-- IDEMPOTENCY
-- ===========
-- `IF NOT EXISTS` guards make this safe to re-run; `IF EXISTS` on the table
-- guard means this migration is a no-op if the `exercises` table has not yet
-- been created (which is the current MVP state).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'exercises'
  ) THEN
    EXECUTE 'ALTER TABLE exercises ADD COLUMN IF NOT EXISTS youtube_video_id TEXT';

    EXECUTE $cmt$
      COMMENT ON COLUMN exercises.youtube_video_id IS
        'YouTube video ID (11 chars) for unlisted video playback. Nullable — exercises without video remain functional (image-only fallback). Provider-agnostic: will be replaced by (video_provider, video_id) pair when migrating to Bunny.net / Mux post-MVP.'
    $cmt$;
  ELSE
    RAISE NOTICE 'Table "exercises" does not exist yet — migration is a no-op. Re-run after creating the table.';
  END IF;
END $$;
