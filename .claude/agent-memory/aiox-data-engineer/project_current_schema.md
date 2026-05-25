---
name: project-current-schema
description: Current production tables in gestantes-app and what code uses them
metadata:
  type: project
---

Current production schema in gestantes-app Supabase project:

**Tables in use:**
- `users` — id (UUID, no FK), email, name, password_hash, week, week_at_registration, registration_date, estimated_due_date, onboarding_completed, objectives[], discomforts[], user_type
- `user_exercises` — UNIQUE(user_id, exercise_id, date), tracks daily completions (CURRENT MAIN TABLE used by `lib/exercises.ts`)
- `completed_activities` — id, user_id, exercise_id, exercise_name, completed_at, duration_minutes (used ONLY by `lib/therapist.ts` for therapist views — legacy)
- `user_progress` — user_id UNIQUE, points, active_days, current_streak, total_exercises (used by therapist module)
- `therapists`, `therapist_patients` — therapist module

**Code usage (verified 2026-05-24):**
- `lib/exercises.ts` → `user_exercises` (UPSERT with onConflict='user_id,exercise_id,date' — prevents same-exercise-same-day duplicates)
- `lib/therapist.ts` → `completed_activities` + `user_progress`
- `lib/useProgress.ts` → custom auth integration

**Why:** Schema evolved organically; `user_exercises` was added later to fix sync issues but `completed_activities`/`user_progress` were never deprecated, creating duplication.

**How to apply:**
- Architect's new `user_activity_history` event-log design REPLACES both `user_exercises` AND `completed_activities` (single source of truth)
- `user_progress` table becomes obsolete (replaced by view `v_user_stats`)
- Migration must: (1) backfill from user_exercises (active data), (2) optionally backfill completed_activities (legacy/therapist), (3) update `lib/exercises.ts` AND `lib/therapist.ts` AND `lib/useProgress.ts`
- DO NOT DROP old tables in same migration — soft-deprecate, validate for 1 week, then drop
