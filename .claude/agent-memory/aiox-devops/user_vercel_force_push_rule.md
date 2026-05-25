---
name: user-vercel-force-push-rule
description: Alan's rule for this project — push to Vercel-deployed main is always `git push -f origin main`, never pull first.
metadata:
  type: user
---

Project `/Users/viniciusnunes/Documents/gestantes-app` (a gestantes / pregnancy app) deploys to Vercel from `main`. User Vinicius (vfncoach@gmail.com) follows Alan's git rules:

1. **Always force push to main** — `git push -f origin main`. Vercel re-deploys on every push to main; the remote is treated as a deployment target, not a collaboration branch.
2. **Never `git pull` before pushing.** Local main is authoritative; remote is the deployment target.
3. **Stage selectively by category** — never `git add -A` / `git add .`. Group related files into focused commits.

**How to apply:** When pushing this project, always use the force flag and skip any pre-pull steps. The full command is `AIOX_ACTIVE_AGENT=devops git push -f origin main` (the env prefix is required for the Constitution hook — see [[feedback-git-push-agent-identification]]).
