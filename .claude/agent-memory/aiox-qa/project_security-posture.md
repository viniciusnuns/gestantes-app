---
name: project_security-posture
description: gestantes-app has no tenant data isolation — anon-readable users table (incl password_hash), and SECURITY DEFINER RPCs granted to anon take a client-supplied user_id with no auth.uid() check (live IDOR)
metadata:
  type: project
---

Re-verified 2026-05-28 (HEAD e922eba) against current code. gestantes-app (production health app for pregnant women) still has NO real data isolation. Corrections vs. the 2026-05-28 baseline are noted.

**Live, exploitable (confirmed in current code):**
- **IDOR via optimized RPCs (PRIMARY):** `supabase/migrations/create_optimized_rpcs.sql` — `get_home_data`, `get_calendar_data`, `get_progress_data` are `SECURITY DEFINER`, take `p_user_id UUID` as a caller param, have ZERO `auth.uid()` checks, and are `GRANT EXECUTE ... TO anon`. `lib/hooks/useOptimizedPageData.ts` calls them browser-side with the anon key, passing `user.id` read from forgeable localStorage. Any anon caller can pass any UUID → that user's home/calendar/progress.
- **Anon can read entire users table incl password_hash:** `fix-rls-users.sql` + `fix-rls-signup.sql` create `FOR SELECT TO anon USING (true)` on `users`; `password_hash TEXT` is a column on that table (`supabase-setup.sql` line 22) and no column restriction exists. `lib/customAuth.ts` `customSignIn` selects `password_hash` to the browser and runs `bcrypt.compare` client-side. Anyone with the anon key (ships in bundle) can dump all hashes + PII.
- **Unauthenticated write routes:** `app/api/activities/ensure-date` and `app/api/activities/generate` take `userId` from the request body and do NO auth check. They use the shared anon-key `supabase` client (NOT service-role — `SUPABASE_SERVICE_ROLE_KEY` exists in .env.local but is unused in code), so writes are still RLS-gated; but `daily_activities` has `USING(true)` and no restrictive INSERT policy, so anon can inject daily_activities rows for ANY user_id. generateDailyActivities also returns `generated: 0` always (count bug). ensure-date path is non-atomic check-then-insert with no unique constraint → duplicate daily_activities under concurrency.
- **Session = unsigned localStorage JSON** (`customAuthSession`), no signature — trivially forgeable; this is the `user.id` fed to the RPCs above.
- **No `middleware.ts`** (confirmed absent) → `lib/route-policy.ts` AuthGate is client-only/cosmetic. **No rate limiting** anywhere.
- **Hardcoded secrets fallback:** `lib/supabase.ts` and `app/api/me/route.ts` embed the Supabase project URL + anon key as literal fallbacks in source.
- **Policy defect:** `supabase-setup.sql` declares policy "Users can insert own data" twice — once `FOR SELECT`, once `FOR INSERT` (copy-paste bug).

**Corrections to prior baseline (do NOT re-report as-is):**
- `/api/me` IDOR is GONE. Current `app/api/me/route.ts` requires a Bearer token via `supabase.auth.getUser()`. But the app uses custom localStorage auth and issues no Supabase Auth token, and grep finds NO callers → it is now DEAD/non-functional code, not an IDOR.
- The `activityStore.reset()` no-op and `useOptimizedSync` "clear pendingWrites before insert" shapes are NOT in current code. `addActivity` does proper optimistic-update + rollback.

**Why:** Custom auth bolted on instead of Supabase Auth; the client talks to the DB with the anon key, so RLS `USING(true)` + anon-granted DEFINER RPCs are the only "enforcement" — i.e. none.

**How to apply:** The architectural fix stands: verify a signed session server-side, stop reading PII/hashes with the anon key, add `auth.uid()` checks (or move reads server-side) to the RPCs, restrict the `users` SELECT policy to own-row and exclude password_hash, authenticate the service-role routes, add a unique constraint for daily_activities. Do not approve a gate while these stand. See [[project_gestantes-app]], [[project_qa-gate-history]].
