---
name: project-video-integration-decision
description: Gestar em Movimento video architecture decision — Mux for streaming, Supabase for metadata, event-log for analytics. MVP=5 videos
metadata:
  type: project
---

Gestar em Movimento needs to add real video playback to its Biblioteca (currently shows only image+placeholder Play button at `app/biblioteca/[id]/page.tsx`). Current `exercises` is a static array in `lib/data.ts` with ~10 mock exercises.

**Decision (2026-05-25):** Hybrid Mux + Supabase + native HTMLVideoElement.
- **Mux** for video hosting/HLS streaming (best price/quality for adaptive bitrate at this scale; superior to Vimeo Pro for ~500-1k users; Cloudflare Stream is the runner-up if budget is tight)
- **Supabase tables** `videos` (1:1 to exercise) + `video_sources` (multi-resolution refs) + `video_progress` (event log)
- **Native `<video>` + hls.js** loaded dynamically — avoids 200kb+ React video players
- **5 videos for MVP** to validate engagement before scaling content production

**Why:** Performance is non-negotiable ("leve possível" requirement). Gestantes use mobile data — adaptive HLS streaming saves bandwidth vs progressive MP4. YouTube was rejected (branding/ads/recommendations break the gentle UX). Self-hosting Supabase Storage was rejected (no adaptive bitrate, costly bandwidth at scale).

**How to apply:** When working on video-related stories in this project, recommend lazy-loading the HLS player only when user taps Play (not on page mount). Thumbnails come from Mux's image API (`https://image.mux.com/{playback_id}/thumbnail.webp?width=400`) — never load video metadata on Biblioteca grid. Event-log progress (`video_progress` table) is authoritative for analytics, same pattern as [[project-sync-architecture]] for exercises.
