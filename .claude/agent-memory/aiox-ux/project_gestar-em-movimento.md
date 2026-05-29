---
name: project-gestar-em-movimento
description: Core context for the Gestar em Movimento pregnancy wellness app — stack, design tokens, audience, structure (verified 2026-05-28)
metadata:
  type: project
---

**Gestar em Movimento** — pregnancy/gestational wellness app. Next.js 14 (App Router, all pages `'use client'`), Tailwind 3, lucide-react icons, Supabase + bcryptjs custom auth, Zustand, SWR installed but pages use raw `fetch`/Zustand.

**Audience:** Brazilian pregnant women, mobile-first. UI copy is pt-BR. Two user types: gestantes (patient app under `app/home`, `app/biblioteca`, `app/calendario`, `app/comunidade`, `app/progresso`) and therapists (`app/dashboard` = "Painel de Profissional", patient management).

**Design tokens (tailwind.config.js, verified 2026-05-28):** palette is WARM/CALM, not pink-magenta. `primary` = warm rose (300 `#D4A5A5` is the main brand, 500 `#B07070`, 600 `#9B5C5C`). `secondary` = soft purple (300 `#C4A8D9`). `accent` = peach/golden (300 `#F5C89A`). `warm` = warm-white neutrals (50 `#FBF8F4` = bg). `text` = muted mauve (primary `#5C4C5C`, secondary `#8B7B8B`, light `#A89BA9`). Font: 'Segoe UI' stack (NOT Inter). No dark mode.

**Gradients (styles/globals.css — NOTE: app uses `styles/globals.css`, not `app/globals.css`):** `.gradient-primary` = rose→purple (`#D4A5A5`→`#C4A8D9`); `.gradient-secondary` = purple→rose; `.gradient-accent` = peach→rose. Most headers and primary CTAs use `gradient-primary`. Shared `Button` primary variant = `from-primary-300 to-secondary-300`.

**Component library exists** under `components/shared/`: `Button` (4 variants), `Card`, `ProgressBar`, `Modal`, `AvatarUpload`, `Badge`. Plus `components/nav/BottomNav`, `components/home/ExerciseCard`, `components/library/ExerciseCard`, `components/video/YouTubePlayer`, `components/community/*`. NOT inline-only anymore.

**Data architecture (verified 2026-05-28):** Patient pages read from Zustand store (`lib/stores/activityStore`) hydrated by `useOptimizedSync()` (4 parallel Supabase RPCs). Static content (exercises, pregnancyCalendar) from `lib/data`. Community page queries Supabase directly via `supabase.from('community_posts')`. Therapist dashboard uses `lib/therapist`. Empty states are genuine empty-data states.

**Known stale-memory trap:** the earlier "pink/magenta primary, Inter font, no component library, app/globals.css" notes were WRONG/outdated. Always re-read tailwind.config.js + styles/globals.css before citing tokens.

Related: [[feedback-gestar-audit-style]] [[project-gestar-ux-debt]]
