---
name: project-locked-files
description: app/page.tsx is locked from modification; lib/data.ts is normally locked but is unlocked for explicit YouTube/video schema stories
metadata:
  type: project
---

In the gestantes-app project, file lock status:

- `app/page.tsx` (4-step onboarding flow) — **LOCKED**. Never edit; risks regressing onboarding.
- `lib/data.ts` (mock data: User, Exercise, currentUser, exercises, communityPosts, ranking, achievements, pregnancyCalendar) — **conditionally unlocked**. The owner explicitly authorized modification for the YouTube/video schema initiative (Story 1.1 added `youtube_video_id?: string` to `Exercise` and populated ex-1…ex-5 on 2026-05-25). Treat further edits as locked unless the spawning story explicitly says otherwise.

**Why:** Onboarding is "done" per the owner. `lib/data.ts` is the canonical data contract everything else reads, so historical instinct is to extend it via wrapper modules — but for the YouTube initiative the owner decided the field belongs on the canonical `Exercise` interface (to avoid downstream confusion when the data moves to Supabase).

**How to apply:**
- `app/page.tsx`: still off-limits.
- `lib/data.ts`: edit only when the active story explicitly directs it (e.g., schema additions for the [[project-video-integration-decision]] pipeline). Otherwise, add NEW files under `lib/` (e.g., `lib/useProgress.ts`).
- Whenever extending the `Exercise` interface, keep new fields **optional** so existing items (ex-6…ex-9) and any seed scripts don't break.
