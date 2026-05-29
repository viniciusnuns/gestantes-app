---
name: project-audit-findings-2026-05
description: Key DB audit findings (last verified 2026-05-28) — bootstrap RPC bug CONFIRMED present, ranking scaling threshold, index gaps, community counter drift. Verify against live code/DB before acting.
metadata:
  type: project
---

Full DB audit performed 2026-05-28 (Dara). Findings that are NOT obvious from a clean read of current code and must be re-verified before acting:

**1. `get_page_data_bootstrap` parameter-shadowing bug — CONFIRMED STILL PRESENT 2026-05-28.**
In `supabase/migrations/create_rpc_bootstrap.sql` the function param is named `user_id` and the body does `WHERE user_id = user_id` (column = column = always true) in all 3 sub-selects. As written it returns ALL users' data, not the caller's — a correctness + privacy leak under permissive RLS. Function header even has a comment acknowledging the bug at the bottom (lines 30-31). The 4 granular RPCs in `create_optimized_rpcs.sql` (get_user_profile / get_today_activities / get_user_stats_and_ranking / get_recent_activities) correctly use `p_user_id` and SUPERSEDE it.
**Why:** non-obvious PL/pgSQL name-resolution trap; superseded but left in place.
**How to apply:** DROP get_page_data_bootstrap entirely (it is superseded, not just buggy). Confirm no client calls it before dropping (grep usePageData vs useOptimizedPageData). If it must stay, rename param to p_user_id and qualify columns.

**2. `get_user_stats_and_ranking` (RPC #3) issues — verified in create_optimized_rpcs.sql.**
`rank` sub-select returns NULL for users with ZERO activities (they are absent from user_totals/ranked CTEs, so `(SELECT rank FROM ranked WHERE user_id = p_user_id)` yields NULL for new signups). total_points/active_days are COALESCE'd to 0 but rank is not. Also re-aggregates ALL users × all activities on EVERY call (two full scans of user_activity_history) — this is the function that breaks first under load.
**How to apply:** when ranking is materialized, point rank lookup at `mv_ranking` (O(1) index lookup). COALESCE rank to (total_users) or null-safe value for zero-activity users.

**3. Scaling thresholds (so we don't over-engineer early).**
- Covering index `idx_uah_user_points_covering (user_id) INCLUDE (points_earned, activity_date)` is the single biggest win — add now. Existing indexes: idx_uah_unique_daily (UNIQUE user_id,activity_id,activity_date), idx_uah_user_id, idx_uah_user_date (user_id, activity_date DESC).
- idx_uah_user_id is REDUNDANT — idx_uah_user_date and the unique index both lead with user_id. Drop idx_uah_user_id.
- Materialize `v_ranking` → `mv_ranking` at ~100 users (10-min stale is fine; refresh on a cron or after-write trigger debounce).
- Partition `user_activity_history` BY RANGE(activity_date) monthly ONLY at ~1M rows (well beyond 1000 users × 9mo ≈ 270k rows).
- BRIN on completed_at is PREMATURE until ~1M rows.
**Why:** prevents premature partitioning/Redis; MV beats Redis and stored counters (user_progress already proves stored counters drift).

**4. Mixed RLS state.**
Legacy `supabase-setup.sql` has strict `auth.uid()` policies that are DEAD under custom auth (return 0 rows). New tables (user_activity_history, posts/comments/post_likes, video_progress) use permissive `USING(true)`. `fix-rls-*.sql` files in repo root were applied ad-hoc and are NOT in supabase/migrations/ — so the migrations folder does NOT reproduce prod. Consolidate before relying on it for DR. See [[project-custom-auth]].

**5. Integrity gaps:** NO foreign keys anywhere point to `users(id)` — user_activity_history.user_id, posts.user_id, comments.user_id, post_likes.user_id, video_progress.user_id are all bare UUIDs (orphan risk on user delete; comments/post_likes DO cascade from posts but not from users). `users`/`daily_activities` lack updated_at triggers. Consider soft-delete on `users` (health-app audit trail).

**6. Community counters drift (migrations/004 + 005).**
posts.likes_count / comments_count are app-maintained (004 comment says so); 005 is a recalculate-counters script — its existence proves they already drifted once. Same anti-pattern as legacy user_progress. Replace with on-the-fly COUNT via view or trigger-maintained counters.

**7. DUAL write paths + DUAL read paths (verified 2026-05-28).**
Two write paths: lib/exercises.ts saveExerciseCompletion → UPSERT user_exercises (OLD); lib/stores/activityStore.ts markComplete → INSERT user_activity_history (NEW). The event-log migration backfills user_exercises → user_activity_history ONCE (not ongoing), so any completion still routed through the old path is invisible to stats/ranking. Two read paths: usePageData (buggy bootstrap RPC) and useOptimizedPageData (4 granular RPCs).
**How to apply:** pick ONE write path (activityStore.markComplete → user_activity_history) and ONE read path (useOptimizedPageData). Retire useProgress.completeExercise + lib/exercises.ts + user_exercises after backfill; delete get_page_data_bootstrap. Re-verify which UI components call which before deleting.
