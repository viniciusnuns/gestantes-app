---
name: project_qa-gate-history
description: Record of QA gate decisions for gestantes-app — 2026-05-28 baseline FAIL, re-verified same day at HEAD e922eba (still FAIL, with 3 baseline items corrected)
metadata:
  type: project
---

**2026-05-28 — Full QA audit (Quinn). Gate: FAIL. Re-verified same day at HEAD e922eba — still FAIL.**

Code-verified blocking drivers (current code):
- Security: no tenant isolation — anon-readable `users` (incl password_hash) + SECURITY DEFINER RPCs granted to anon with caller-supplied `p_user_id` and no `auth.uid()` (live IDOR) + unauthenticated service-role routes. See [[project_security-posture]]. Blocking for a health/PII app in production.
- Test coverage: 0% — no test files (`*.test.*`/`*.spec.*` = none), no jest/vitest/playwright/cypress/testing-library in deps, no `.github` CI.
- Lint not runnable: `eslint` not installed, no eslint config; `npm run lint` (next lint) cannot run in CI.
- TypeScript: `tsc --noEmit` passes clean (TSC_EXIT=0) — the one healthy signal.
- ensure-date non-atomic (check-then-insert, no unique constraint) → duplicate daily_activities under concurrency.

Baseline items CORRECTED on re-verification (were stale — do not re-report blindly):
- Realtime DOES exist now: `lib/stores/activityStore.ts` has a real `supabase.channel(...).on('postgres_changes', ...)` per-user subscription. (Baseline wrongly said "ZERO channels.")
- `/api/me` IDOR is gone (now Bearer-token gated via supabase.auth.getUser, but app uses custom auth → it's dead code with no callers).
- The store `reset()` no-op and `useOptimizedSync` pendingWrites-before-insert data-loss shapes are not in current code.

**Why:** Baseline so future reviews detect real fixes vs. re-reports — and so already-corrected items are not re-flagged.

**How to apply:** On next gate, re-verify each item by reading the named file (relay can be flaky — see [[project_tooling-blocker]]; run an `echo MARKER` sanity check first). The security cluster is the gate blocker; the rest are quality gaps.
