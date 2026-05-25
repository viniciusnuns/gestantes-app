---
name: project-video-provider-decision
description: Product owner overrode architect's Mux recommendation — MVP uses YouTube unlisted for cheap validation, then migrates to Bunny.net/Mux post-engagement-validation
metadata:
  type: project
---

The video provider decision for gestantes-app changed on 2026-05-25:

- **Original architect recommendation (Aria):** Mux + native `<video>` + HLS, with YouTube explicitly rejected for branding/ads/recommendations.
- **Product owner override (2026-05-25):** MVP ships with **YouTube unlisted** as the cheapest validation path. Post-engagement-validation, migrate to **Bunny.net** (or Mux) as originally designed.

**Why:** Validating engagement on 5 exercises with the team's own unlisted recordings is cheaper than provisioning Mux/Bunny infrastructure before knowing whether users will even play videos. The "leve possível" and branding concerns are accepted as MVP debt.

**How to apply:**
- When working on the video pipeline (Stories 1.1-1.5), use YouTube unlisted IDs (`youtube_video_id` field on `Exercise`).
- Keep the schema **provider-agnostic in spirit**: future migration will introduce a `(video_provider, video_id)` pair and deprecate `youtube_video_id`. JSDoc on the field already flags this.
- Do NOT load video players on grid pages — keep lazy-load on Play tap, same UX principle as the original Mux plan.
- Thumbnails: use existing `exercise.image` (Unsplash) for now; switch to `https://i.ytimg.com/vi/{id}/hqdefault.jpg` only if Story 1.3 explicitly says so.
- The prior `project_video_integration_decision.md` (architect memory) describes the *target* architecture, not the *current* MVP — read it as the post-validation north star.
