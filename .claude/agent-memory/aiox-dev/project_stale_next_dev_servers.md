---
name: stale-next-dev-servers
description: Symptom — Next.js <Link> clicks silently fail OR NEXT_PUBLIC_* env vars appear ignored. Cause is multiple concurrent `next dev` servers sharing the same .next/ cache.
metadata:
  type: project
---

When the user reports that `<Link href="...">` clicks do nothing OR that a freshly-added `NEXT_PUBLIC_*` env var is "not being read" on this project, the root cause is almost always multiple `next dev` processes running concurrently. Symptoms include Next auto-falling-back to port 3001/3002/etc.

**Why:** This project has been observed (2026-05-22, twice in one day) running three concurrent `next dev` instances after repeated `npm run dev` calls without killing prior ones. Two failure modes:
1. **Link navigation no-ops** — the browser tab on the fallback port loads a JS bundle whose client-side router map is out of sync with what the server has built. `.next/server/app/` showed `login/` built but missing `signup/`.
2. **NEXT_PUBLIC_* env vars appear stale** — Next inlines them at build time. The OLDEST server (typically on :3000, started before the env was added) serves a bundle without the value. Browser usually defaults to :3000, so the user hits the stale build. The newest server on :3002 has the correct value but nobody's visiting it. Symptom is confusing because partial features may work (e.g., the env-gated UI banner may show on one page reload but not affect a different code path that's still serving stale code).

**How to apply:** Before debugging the React/env code itself, run `ps aux | grep "next dev"` and `lsof -nP -iTCP -sTCP:LISTEN | grep node`. If multiple servers exist, kill all stale ones and tell the user EXPLICITLY which port the surviving server is on (they're probably hitting :3000 out of habit). Full reset: `pkill -f "next dev" ; pkill -f "next-server" ; rm -rf .next ; npm run dev`. Only investigate the code after confirming a single clean dev server still reproduces the issue.

Related: [[locked-files]] (Option C architecture means middleware can't be blamed for Link navigation failures — it's a pass-through), [[demo-mode]] (the env-var-ignored symptom hit demo mode specifically).
