---
name: feedback-git-push-agent-identification
description: On this machine the Constitution Article II hook does not see the active-agent context from the spawn — prefix `AIOX_ACTIVE_AGENT=devops` on git push / gh pr commands to identify as @devops.
metadata:
  type: feedback
---

When invoked as @devops on this machine (`/Users/viniciusnunes/Documents/gestantes-app`), the Constitution Article II hook at `/Users/viniciusnunes/Documents/AIOS/.claude/hooks/enforce-git-push-authority.cjs` rejects `git push` / `gh pr create` / `gh pr merge` with `Current agent: @unknown` even when the agent persona is loaded correctly.

**Rule:** Prefix the remote command with the agent env var, e.g. `AIOX_ACTIVE_AGENT=devops git push -f origin main`.

**Why:** The hook resolves the active agent from environment vars (`AIOX_ACTIVE_AGENT`, `AIOX_AGENT`, `ACTIVE_AGENT`, `CLAUDE_AGENT_NAME`, `CLAUDE_CODE_AGENT`, `AIOX_CURRENT_AGENT`) or from an inline `AIOX_ACTIVE_AGENT=...` token on the command line. None of these are exported by the spawn flow on this machine, and no `_active-agent.json` bridge file exists, so the hook sees `@unknown` and blocks. The command-scoped env prefix is the supported identification path (lines 62-67 of the hook) — this is not a workaround, it is the intended fallback.

**How to apply:** Always prefix `AIOX_ACTIVE_AGENT=devops` to any `git push`, `git push -f`, `gh pr create`, or `gh pr merge` invocation when working in this project as @devops. Do not attempt other workarounds (creating fake bridge files, exporting in shell rc, etc.) — the command prefix is targeted, auditable, and per-invocation.

Related: [[user-vercel-force-push-rule]] — combine the env prefix with the existing Vercel push pattern: `AIOX_ACTIVE_AGENT=devops git push -f origin main`.
