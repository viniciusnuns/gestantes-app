---
name: project-api-me-404-root-cause
description: Root cause of /api/me returning 404 even when user exists — server client doesn't propagate JWT to PostgREST so RLS filters every row
metadata:
  type: project
---

`app/api/me/route.ts` calls `createClient(URL, ANON_KEY, {auth: {persistSession: false}})` and then monkey-patches `supabase.auth.getSession` to return a fake session containing the user's access_token. This monkey-patch is INERT for PostgREST queries.

In `@supabase/supabase-js v2.106+`, the PostgREST client reads the `Authorization` header from either (a) the internal GoTrue session — disabled here by `persistSession: false`, or (b) `global.headers` passed to `createClient`, or (c) `supabase.auth.setSession()`. None of those are wired. So `.from('users').select(...)` ships with `Authorization: Bearer <ANON_KEY>`, PostgREST resolves `auth.uid() = NULL`, the RLS policy `auth.uid() = id` matches zero rows, query returns `[]` (NOT an error), and the route's `if (!profile)` branch returns 404.

**Why:** This makes the symptom paradoxical — the user provably exists in the `users` table, `auth.getUser(token)` succeeds (returns the right user id), but the subsequent SELECT silently returns empty. There is no error to catch, only an empty result.

**How to apply:** The one-line fix is to add `global: { headers: { Authorization: `Bearer ${token}` } }` to the `createClient` options and DELETE the monkey-patch. After this fix, `createInitialProfile` in LoginForm becomes a workaround for a bug that no longer exists — can be removed. Also unblocks the AuthGate flow on (private)/onboarding which currently sees `userType: null` and triggers `getRouteDecision` Scenario 9 ("Invalid user type → /login"), causing a redirect loop or "Acesso negado" flash.

**Verification before fixing:** confirm the `users` table has the `user_type` column — `.select('... user_type')` would otherwise return a 400 from PostgREST that the route also coerces into a 404 via the `profileError` branch. Base `supabase-setup.sql` does NOT create `user_type`; only `THERAPIST_SETUP.md` does.

**Related architecture:** [[project-auth-architecture]] explains why middleware is a pass-through. [[project-post-login-routing]] documents the chain of LoginForm → /api/me → /onboarding routing decisions that depend on /api/me actually returning the profile.
