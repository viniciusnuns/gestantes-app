---
name: project-auth-architecture
description: Option C auth architecture decisions — client-side gate, middleware no-op until @supabase/ssr migration
metadata:
  type: project
---

The "Opção C" auth refactor uses client-side route protection via `<AuthGate />` in `app/(private)/layout.tsx`, not edge middleware.

**Why:** The browser Supabase client (`@supabase/supabase-js`) stores sessions in localStorage, not cookies. Edge middleware cannot read localStorage, so any middleware-based protection would either always allow or always block — depending on how it interprets missing cookies. The first attempt at the middleware checked `sb-auth-token` cookie which never exists, causing authenticated users to be bounced to /login.

**How to apply:** Until the project migrates to `@supabase/ssr` with `createBrowserClient` + `createServerClient` (and proper cookie wiring), keep `middleware.ts` as a pass-through. All auth/onboarding/role gating belongs in `AuthGate.tsx`, which uses `useAuth` + `/api/me`. Do NOT re-add cookie checks to middleware without the SSR migration.

Related: [[feedback-no-npm-install]] (cannot verify by running build, must read code carefully).
