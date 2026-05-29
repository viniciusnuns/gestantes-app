---
name: project-n1-strategy
description: Gestar em Movimento N+1 scaling strategy — staged plan from RPC+SWR (MVP) to materialized views (500+ DAU), reject GraphQL
metadata:
  type: project
---

App currently makes 5-8 serial Supabase queries per page (useAuth → useProgress → activityStore.loadUserData fetches profile + activity_history + v_user_stats + v_ranking serially). At 12 DAU invisible; at 500 DAU each page load is 20-50 serial queries → timeout.

**Why:** Architecture treats every hook as independent data fetcher; no aggregation layer; v_user_stats and v_ranking are regular views (not materialized), recomputed per query under RLS.

**How to apply:** Recommended sequence is staged, NEVER all-at-once:
1. AGORA (MVP, 0-50 DAU): Supabase RPC `get_user_bootstrap(user_id)` returning profile+stats+activities+ranking in 1 RT; client SWR caching for ranking; HTTP cache headers on /api/me. Cost: 1-2 days, zero schema change, deletes serial-query problem.
2. 100 DAU: Add `select()` with FK embedding for hot lists (Supabase auto-JOIN). Keep RPC for bootstrap.
3. 500+ DAU: Materialize v_user_stats and v_ranking (`REFRESH ... CONCURRENTLY` via pg_cron 1min); add Upstash Redis for ranking.
4. NEVER: GraphQL+Apollo (overhead unjustified for single-tenant per-user data); DataLoader (Next.js serverless means no per-request batching benefit — each function invocation is isolated).

Key constraint: app uses custom auth (NOT Supabase Auth), so RLS uses anon key everywhere — any RPC must be SECURITY DEFINER with explicit user_id parameter validation, NOT auth.uid().

UPDATE 2026-05-28 (verified vs runtime path): Step 1 SHIPPED but via a DIFFERENT artifact than the doc claims, and THREE data stacks now coexist. The ACTUAL live path is `app/RootInitializer.tsx → useOptimizedSync → useOptimizedPageData` which fires 4 PARALLEL `supabase.rpc()` calls (`get_user_header`, `get_user_activities_latest`, `get_user_stats_and_ranking`, `get_ranking_top`) defined in `create_optimized_rpcs.sql` (all SECURITY DEFINER, GRANT anon). NOTE: `useOptimizedPageData` uses plain useState/useEffect — NO SWR, NO dedup, NO cache; it refetches on every mount. The SWR-cached path (`usePageData` + `usePageDataSync` + `get_page_data_bootstrap` RPC) is DEAD CODE — nothing imports usePageDataSync. The original serial N+1 path (`useActivityInit` → `activityStore.loadUserData`, 4 serial awaits incl `v_user_stats`+`v_ranking` regular views) is ALSO dead but still present. So `docs/OPTIMIZATION_STATUS.md` is wrong: it describes the bootstrap+SWR design that did NOT win. Recommend deleting the two dead stacks and adding SWR to the live `useOptimizedPageData`.

BUGS found in SQL (verify against deployed DB before trusting): (1) `get_page_data_bootstrap` (the dead RPC) has unqualified `user_id` everywhere — `WHERE user_id = user_id` is always-true (param name collides with column), would return ALL users' rows; harmless only because it's dead. (2) `get_user_stats_and_ranking` uses `FULL OUTER JOIN users u ON u.id = p_user_id` — odd construction, returns name even with zero activities but fragile. Ranking RPCs do per-call full-table GROUP BY over users⋈activity_history — fine at 12 DAU, the 500+ matview step is the real fix.

Related: [[project-api-me-404-root-cause]] (same RLS-without-JWT root cause), [[project-sync-architecture]] (event-log model that RPC must respect).
