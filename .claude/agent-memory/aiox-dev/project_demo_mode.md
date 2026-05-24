---
name: project-demo-mode
description: NEXT_PUBLIC_DEMO_MODE env flag in lib/useAuth.ts bypasses Supabase email validation/rate-limits for local dev signup
metadata:
  type: project
---

The gestantes-app supports a DEMO MODE for local development, gated by `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` (gitignored).

**What it does (added 2026-05-22, redesigned later same day to be UI-silent; domain fixed `.local` → `.test` 2026-05-22):**
- `lib/useAuth.ts` → `signUp()` ignores the user-typed email when demo mode is on, generates `demo-{base36ts}-{6charRand}@demo.test` (`.test` is RFC 2606 reserved for testing — Supabase rejected `.local` as invalid), sends THAT to Supabase, persists it to `localStorage['lastDemoEmail']` on success, and returns it as `demoEmail`
- `components/auth/SignupForm.tsx` is visually IDENTICAL to production — no banner, no special input type, no "demo email" success screen. User types whatever email, hits submit, the form silently swaps in the generated email under the hood.
- `components/auth/LoginForm.tsx` reads `localStorage['lastDemoEmail']` in a `useEffect` and silently pre-fills the email field in demo mode. To the user it looks like browser autofill — no demo messaging.
- `DEMO_EMAIL_STORAGE_KEY` is exported from `useAuth.ts` so both forms share the constant
- `components/auth/AuthForm.tsx` and `TherapistAuthForm.tsx` were NOT updated — `TherapistAuthForm` bypasses `useAuth` entirely (calls `supabase.auth.signUp` directly), so demo mode doesn't apply there

**Why:** Supabase has a 60-min rate-limit on signups with the same email, which blocked iteration on the new signup → onboarding flow. The owner explicitly requested env-var-gated demo mode (Option 1) over creating users directly in DB. The UI-silent redesign (later 2026-05-22) was requested because the user wanted the demo experience to be indistinguishable from production — no yellow banners, no "demo account created" green box, just transparent signup that always works.

**How to apply:**
- Future signup-flow changes must preserve the `demoEmail` field in `signUp()`'s return shape AND the localStorage persistence — `LoginForm` depends on the latter for round-trip login
- The UI must remain VISUALLY IDENTICAL between demo and production modes. If you add a demo-mode UI element, you're violating the design intent — re-check with owner before shipping
- NEVER set `NEXT_PUBLIC_DEMO_MODE=true` in any production env (the `.env.local` comment warns about this)
- If you add new signup entry points (e.g., social login), apply the same env-gated bypass pattern for consistency
- `TherapistAuthForm` calls `supabase.auth.signUp` directly (bypasses `useAuth`) — demo mode does NOT apply there; if therapist signup ever needs the same treatment, refactor it through `useAuth` first
- Login (`signIn`) itself was intentionally NOT modified — demo accounts authenticate via their generated `demo-*@demo.test` email like any normal credential. The LoginForm just auto-prefills, but the auth call is unchanged.
- If Supabase ever rejects `.test` too, fall back to `.example` (also RFC 2606 reserved). Do NOT use `.com`/`.app` — those are real TLDs and risk hitting actual mail servers.
