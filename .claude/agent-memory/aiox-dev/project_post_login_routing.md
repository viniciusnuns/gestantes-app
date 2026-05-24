---
name: project-post-login-routing
description: Post-login redirect honors onboarding_completed; /home is outside (private)/ so it self-fetches the profile
metadata:
  type: project
---

After successful `signIn()` in `components/auth/LoginForm.tsx`, the form hits `/api/me` with the freshly-issued access token and routes to `/onboarding` (when `onboarding_completed === false`) or `/home` (when true). On any `/api/me` failure it falls back to `/onboarding` — never `/home` — so brand-new users always see the onboarding wizard instead of landing on `/home` with empty data.

**Why:** `app/home/page.tsx` lives OUTSIDE the `app/(private)/` route group, so the `<AuthGate />` from `app/(private)/layout.tsx` never wraps `/home`. That means route-policy (`lib/route-policy.ts`) Scenario 3 ("patient + onboarding pending → /onboarding") is NEVER enforced for `/home`. The decision has to be made by the login form itself, not delegated to a gate that doesn't exist there.

**Related bug fixed 2026-05-22:** `app/home/page.tsx` had `useEffect(() => { if (!loading) fetchUserProfile() }, [user])` — `loading` started `true` and only flipped inside `fetchUserProfile`, so the call NEVER ran and the page sat on "Carregando..." forever. Now gated on `authLoading` (from useAuth) instead, with a cleanup flag to avoid setState after unmount.

**Related bug fixed 2026-05-22:** `app/api/me/route.ts` was calling `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)`, but those env vars are NOT defined in `.env.local` — only `NEXT_PUBLIC_DEMO_MODE` is. The route now falls back to the same hardcoded Supabase URL + anon key used by `lib/supabase.ts`. Without this, every `/api/me` request returned 500 and the onboarding-redirect logic in LoginForm silently degraded to the safe default.

**Related bug fixed 2026-05-22:** LoginForm was reading the access token directly from `data.session?.access_token` returned by `useAuth.signIn()`. In some flows that field was undefined, so the `if (accessToken)` guard caused the fetch to be skipped entirely (silent fallback to `/onboarding`) OR, when called without the header, returned 401 "No authorization header". Fix: always call `supabase.auth.getSession()` to read the persisted/storage-settled token, matching the exact pattern used by `AuthGate.tsx` and `app/home/page.tsx`. Rule of thumb: NEVER trust the session embedded in the `signInWithPassword` response payload — always re-read via `getSession()` before authenticated fetches.

**How to apply:**
- If you ever move `/home` UNDER `(private)/`, simplify LoginForm to just `router.push('/home')` — AuthGate will then enforce the onboarding redirect via `getRouteDecision()` Scenario 3.
- Until that move happens, ANY new post-login redirect must consult `/api/me` (or another profile source) before deciding the target — do not assume `/home` is safe for incomplete-onboarding users.
- If you add new public endpoints that need Supabase, mirror the env-var-with-fallback pattern in `/api/me/route.ts`. Pure `process.env.X!` without a fallback will crash silently in dev because `.env.local` only holds `NEXT_PUBLIC_DEMO_MODE`.
- Bug-class pattern to grep for: `if (!loading)` (or any local-state guard) inside a `useEffect` that's also responsible for SETTING that same state to false. Always set up the loading exit in a `finally` block guarded only by a cleanup ref, not by the loading flag itself.

Related: [[project-auth-architecture]] explains why middleware is a pass-through and AuthGate runs client-side. [[project-locked-files]] notes `app/page.tsx` is the landing page (unlocked 2026-05-22).
