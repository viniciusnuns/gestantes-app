---
name: project-custom-auth
description: Gestar-em-Movimento uses custom JWT auth in localStorage, NOT Supabase Auth — auth.uid() is unreliable in RLS
metadata:
  type: project
---

The Gestar em Movimento (gestantes-app) project uses a **custom authentication system** instead of Supabase Auth:

- `lib/customAuth.ts` handles signup/signin with bcrypt password hashing
- Session stored in `localStorage` as `customAuthSession`
- `users.id` is a client-generated UUID (`crypto.randomUUID()`), NOT `auth.users.id`
- Foreign key `users_id_fkey` to `auth.users` was REMOVED (`remove-auth-fk.sql`)
- Current RLS policies use `auth.uid() = id OR true` — i.e. effectively permissive
- `users.password_hash` column stores bcrypt hash directly

**Why:** PRD decision to avoid Supabase Auth complexity for 8-12 users; custom auth was already implemented before the data engineer reviewed.

**How to apply:**
- NEVER write RLS policies relying solely on `auth.uid()` — it will be NULL because client is not authenticated via Supabase Auth
- Either (a) keep RLS permissive `USING (true)` and enforce isolation in application layer, or (b) migrate to Supabase Auth as a separate epic, or (c) use a service role + custom claim header
- Any new tables MUST follow the same pattern — using `auth.uid()` will silently fail closed (return zero rows) for all queries
- For MVP (8-12 users) the pragmatic choice is permissive RLS + app-layer enforcement; flag this as tech debt
