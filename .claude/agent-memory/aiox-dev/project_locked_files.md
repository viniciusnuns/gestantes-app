---
name: project-locked-files
description: Two files in gestantes-app are locked from modification — app/page.tsx (onboarding) and lib/data.ts (mock data)
metadata:
  type: project
---

In the gestantes-app project, two files are explicitly off-limits for modification:

- `app/page.tsx` — the 4-step onboarding flow (welcome → pregnancy data → objectives → discomforts → success → redirects to `/home`)
- `lib/data.ts` — mock data definitions (User, Exercise, CommunityPost, Achievement, currentUser, exercises, communityPosts, ranking, achievements, pregnancyCalendar)

**Why:** Owner declared them locked in the build brief — they're considered "done" and any change risks regressing the onboarding flow or breaking the data contract other pages depend on.

**How to apply:** Read these files freely for context, but never edit them. If you need additional helpers, add NEW files under `lib/` (e.g., `lib/useProgress.ts` for client-side progress state). If a data shape needs extension, prefer wrapping/deriving in a new module rather than modifying `lib/data.ts`.
