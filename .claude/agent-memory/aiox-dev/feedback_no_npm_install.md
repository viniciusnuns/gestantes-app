---
name: feedback-no-npm-install
description: npm install/lint/typecheck are sandbox-blocked in this project; verify via careful code review instead
metadata:
  type: feedback
---

`npm install`, `npm run lint`, `npm run build` are blocked by the Bash sandbox in `/Users/viniciusnunes/Documents/gestantes-app`. `node_modules` does not exist locally.

**Why:** Sandbox denies network/package operations; the workflow expects the user (or a separate process) to run `npm install` outside the agent.

**How to apply:** Do not assume `npm run lint` / `typecheck` are runnable. Instead, do a careful manual review pass before reporting "done": check imports resolve, props match interfaces, dynamic-route params shape matches Next 14 (sync `{ params: { id } }`, not Promise), and Tailwind classes are literal (not template-built) so the content scanner picks them up.
