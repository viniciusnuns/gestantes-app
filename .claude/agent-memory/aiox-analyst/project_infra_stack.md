---
name: project_infra_stack
description: Gestar em Movimento infrastructure — Vercel + Supabase, YouTube for video, no Vercel Blob, supabase anon key in client
metadata:
  type: project
---

Confirmed stack (as of 2026-05-27):
- **Vercel** project `gestantes-app` (team_0ExKTY3mtLwuM5TAYBEUATQO), likely Hobby/Free tier. Auto-deploy from main.
- **Supabase** project `odirmtmompghjgmhotml.supabase.co` — anon key is hardcoded in `lib/supabase.ts` (publishable, safe).
- **Video delivery**: YouTube embeds via `components/video/YouTubePlayer.tsx` (lazy-load, click-to-play). Zero bandwidth cost to Vercel/Supabase.
- **Storage usage**: only avatars currently bucketed in Supabase Storage. No video assets self-hosted.
- **Realtime**: code references exist but community uses refetch-on-navigate pattern (see commit 7927698 `fix: refetch posts quando navega de volta pra comunidade`), so realtime channels are minimal.

**Why:** Architectural choices matter for capacity math — YouTube offloads the most expensive workload (video bandwidth), making Vercel/Supabase free tiers viable far longer than typical wellness apps.

**How to apply:** When projecting costs/capacity, do NOT include video bandwidth in Vercel egress estimates. The community feature is the realistic scaling bottleneck (writes + reads on `community_posts/comments/likes`). RLS is enabled on all community tables.
