---
name: project-video-integration-decision
description: Gestar em Movimento video — Mux+HLS was RECOMMENDED but team shipped YouTube iframe embed instead; recommendation NOT adopted
metadata:
  type: project
---

UPDATE 2026-05-28 (verified against code): The Mux/HLS recommendation below was NOT adopted. Actual implementation is `components/video/YouTubePlayer.tsx` (YouTube iframe embed) + `youtube_video_id` column on exercises (`2026-05-25_add_youtube_video_id_exercises.sql`) + a `video_progress` table tracking watched_seconds/completed. So the access-control / no-recommended-videos concerns below are UNRESOLVED in production.

**Why:** Team chose fastest path to ship (iframe embed, zero encoding/storage cost) over the managed-player recommendation. Pragmatic MVP call.

**How to apply:** When asked about video, the current truth is YouTube embed — do NOT assume Mux exists. If content-safety (YouTube "recommended" surfacing unrelated content) or access-control becomes a requirement, the Mux migration below is the standing recommendation. Use `youtube-nocookie.com` + `rel=0` as a cheap interim mitigation.

--- ORIGINAL RECOMMENDATION (not implemented) ---
Recommended Mux (managed HLS/DASH, adaptive bitrate, signed URLs) over YouTube-embed (no access control, branding, ads risk) and self-hosting. Supabase stores metadata (mux_playback_id, exercise_id, duration); native HLS via hls.js. MVP 5 videos. Thumbnails via Mux Image API. Signed URLs expire 24h.
Rationale: medical/wellness content for pregnant women needs professional presentation without YouTube surfacing inappropriate content after playback.
