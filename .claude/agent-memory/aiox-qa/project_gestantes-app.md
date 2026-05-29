---
name: project_gestantes-app
description: gestantes-app is a pregnancy-tracking MVP in production on Vercel with custom auth, Zustand, realtime Postgres, and recently parallelized RPCs
metadata:
  type: project
---

gestantes-app (Portuguese "gestantes" = pregnant women) is an MVP in production at https://gestantes-app.vercel.app.

Stated architecture (per user, not yet verified against code):
- Custom auth (not Supabase Auth / not NextAuth — flagged for verification)
- Zustand for client state
- Realtime Postgres subscriptions (Supabase-style)
- 4 parallel RPCs replaced a sequential path: ~1.35s → ~186ms
- Main surfaces ("Produções"): Home, Calendário, Progresso, Biblioteca, Comunidade

**Why:** Owner requested a full QA audit (coverage, critical path, edge cases, load, security/RLS, data consistency) and a PASS/CONCERNS/FAIL gate.

**How to apply:** When the audit can actually run, prioritize RLS cross-tenant isolation (health data), the signup→onboarding→complete-exercise→sync critical path, and offline/realtime data-loss risk. Treat "custom auth" as a high-risk area until the implementation is read. See [[project_tooling-blocker]].
