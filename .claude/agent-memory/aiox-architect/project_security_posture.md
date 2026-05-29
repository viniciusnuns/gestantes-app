---
name: project-security-posture
description: Gestar em Movimento has NO server-side authz — anon key + permissive RLS means password_hash and all user data are publicly readable
metadata:
  type: project
---

The app's entire security model is client-side only. There is NO middleware (`middleware.ts` absent) and NO server-side authorization.

UPDATE 2026-05-28 (verified vs code): `app/api/` is NO LONGER empty — it now has 4 Route Handlers (`me`, `exercises/[id]`, `activities/generate`, `activities/ensure-date`). But they provide ZERO added security: each one calls `createClient(URL, ANON_KEY)` (same public anon key, hardcoded fallback in source) and trusts a `userId` passed in the query/body with no verification. `GET /api/me?userId=<anyId>` returns any user's full row. So the API layer is a passthrough proxy, not an auth boundary — the publicly-readable-DB conclusion is unchanged. Also note a DUAL/ABANDONED auth path: `lib/useAuth.ts` wraps native Supabase Auth (`supabase.auth.signInWithPassword`, `getUser`, `onAuthStateChange`) while the real flow uses `lib/customAuth.ts` (bcrypt + localStorage). `useAuth.ts` is dead/contradictory — flag for deletion to avoid confusion. The hardcoded anon key now also appears as a literal fallback in all 4 route files, multiplying the secret's footprint.

**Why this is critical:** Custom auth (not Supabase Auth) stores bcrypt `password_hash` in `public.users`. Every RLS policy in the project is `FOR ALL USING(true) WITH CHECK(true)` granted to `anon` (see fix-rls-users.sql, fix-rls-signup.sql, event_log, community, video_progress migrations). The 4 optimized RPCs are `SECURITY DEFINER` with no caller validation. Net effect: anyone with the (public, in-bundle) anon key can `select('*')` the users table and read every email + password_hash, and read/write/delete ANY user's activity, likes, comments, video progress. `app/admin/page.tsx` does `supabase.from('users').select('*')` with zero auth gate. `customSignIn` pulls password_hash to the browser to bcrypt.compare client-side.

**How to apply:** This is the #1 redesign blocker before any real-user launch. The fix is NOT incremental RLS tweaks — it requires moving auth verification server-side (Next.js Route Handlers or Server Actions using the service_role key, OR adopting Supabase Auth so RLS can use `auth.uid()`). Until then, treat the DB as fully public. Flag this on ANY task touching auth, users table, admin, or "go to production." Do not recommend tightening individual RLS policies as a complete fix — without a real JWT identity, RLS cannot distinguish users under custom auth.

Related: [[project-api-me-404-root-cause]] (the /api/me route that fix referenced no longer exists — app has no API layer at all now), [[project-n1-strategy]] (RPCs are SECURITY DEFINER for this same RLS-without-JWT reason).
