---
name: feedback-no-npm-install
description: npm install is sandbox-blocked, but typecheck and build DO work (node_modules already present); lint is not configured in this project
metadata:
  type: feedback
---

In `/Users/viniciusnunes/Documents/gestantes-app`:

- `npm install` — **blocked** by sandbox (network deny). Don't run it.
- `npx tsc --noEmit` — **works**. Use this for TypeScript verification.
- `npm run build` — **works** (Next.js production build). Use this when a full route compilation check is warranted.
- `npm run lint` — **does not work**: ESLint isn't configured in this project; `next lint` drops to an interactive setup prompt. Treat as N/A and document it as pre-existing.

**Why:** `node_modules` is already installed and committed-equivalent in this workspace, so anything that only reads existing packages runs fine. Only the package-fetch path is denied. ESLint config was simply never added by the project owner.

**How to apply:**
- After implementing a story, run `npx tsc --noEmit` and `npm run build` for verification.
- For lint, note "ESLint not configured (pre-existing)" in the story's verification notes — don't try to configure it unless the story asks.
- Also still do the manual review pass: imports resolve, props match interfaces, Next 14 dynamic-route params are sync `{ params: { id } }`, Tailwind classes are literal so the content scanner picks them up.
