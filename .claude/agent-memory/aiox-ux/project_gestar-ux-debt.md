---
name: project-gestar-ux-debt
description: UX debt found in Gestar em Movimento audit (2026-05-28) — accessibility, feedback, and auth-gate gaps
metadata:
  type: project
---

UX audit of Gestar em Movimento (2026-05-28). Strong, consistent visual design; debt concentrated in accessibility + feedback, not features.

**Key findings (re-verify before re-citing — code changes fast):**
- **Accessibility is the worst dimension.** Whole codebase had only ~10 `aria-*` and ~13 `alt=` attributes. Icon-only buttons lack accessible names: logout in `app/home/page.tsx` (uses `title` not `aria-label`), back buttons in `app/biblioteca/[id]/page.tsx`, the floating "+" post button, BottomNav links (icon + tiny 10-11px label, no aria-current). `ProgressBar` has `role="progressbar"` but no `aria-valuenow/valuemin/valuemax`. `Modal` close button has no `aria-label` and no focus trap / Esc handler / `role="dialog"`.
- **AuthGate is DISABLED.** `app/(private)/layout.tsx` returns `<>{children}</>` with AuthGate commented out + "TODO: Uncomment after login/auth is working". Private pages render for unauthenticated users.
- **Loading UX is text-only "Carregando…"** everywhere (home, dashboard, comunidade, biblioteca detail, AuthGate) — no skeletons, causes layout shift on mobile.
- **Completion feedback is weak.** `app/biblioteca/[id]/page.tsx` `handleComplete` logs activity then just flips button to "Concluído hoje" — no toast/celebration. (Note: earlier memory said it used setTimeout redirect — that's the OTHER file `app/exercise/[id]/page.tsx` which is a near-duplicate stub. There are TWO exercise-detail routes: `app/biblioteca/[id]` is the real one wired into BottomNav/home; `app/exercise/[id]` is an orphan stub.)
- **Color contrast risk:** `text-secondary` `#8B7B8B` and `text-light` `#A89BA9` on warm-white `#FBF8F4` are likely below WCAG AA 4.5:1 for the small (11px) labels used in stat cards and BottomNav.
- **Two exercise-detail routes** (`app/biblioteca/[id]` vs `app/exercise/[id]`) = duplicated/divergent code, a consistency hazard.

**UX Health Score assigned: 6.4/10** (visual/consistency ~8.5, dragged down by accessibility ~3 and feedback ~5, plus the disabled auth gate as a trust risk).

**Why:** highest-leverage fixes for the audience (pregnant women on mobile) and most reuse existing `components/shared` primitives.
**How to apply:** prefer adding aria/labels to existing components over building new ones; re-grep aria/alt counts before re-claiming.

Related: [[project-gestar-em-movimento]] [[feedback-gestar-audit-style]]
