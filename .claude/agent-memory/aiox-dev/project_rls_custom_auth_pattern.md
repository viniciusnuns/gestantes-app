---
name: project-rls-custom-auth-pattern
description: This project uses custom auth (lib/customAuth.ts), so auth.uid() returns null in RLS — use permissive policies + app-layer isolation
metadata:
  type: project
---

All Supabase migrations in this project MUST use permissive RLS policies (`USING (true)` and `WITH CHECK (true)`) because the app uses a CUSTOM AUTH system (`lib/customAuth.ts`) that stores sessions in localStorage and never authenticates against Supabase Auth. Tightening policies to `auth.uid() = user_id` will silently break ALL inserts/reads (auth.uid() returns null).

**Why:** The existing event-log migration (`2026-05-24_event_log_architecture.sql`) established this pattern for `user_activity_history` and `daily_activities`. It's documented inline as tech-debt TD-001 ("Migrate to Supabase Auth + enable strict RLS"). Story 1.4's `video_progress` followed the same pattern.

**How to apply:** When a story spec or template prescribes `auth.uid() = user_id` policies, ADAPT to `(true)` policies and add a comment block referencing TD-001 with the exact policy lines to swap in once Supabase Auth lands. Isolation is enforced in TypeScript via `getCurrentUser()` from [[project-locked-files]]'s sibling `lib/customAuth.ts`.
