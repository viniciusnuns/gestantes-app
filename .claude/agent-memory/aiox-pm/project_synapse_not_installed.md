---
name: project-synapse-not-installed
description: gestantes-app does NOT have the AIOX/SYNAPSE engine installed — diagnose-synapse and similar AIOX framework tasks cannot run here
metadata:
  type: project
---

The `diagnose-synapse` task (and other AIOX framework tasks) cannot execute against `gestantes-app`. This project is a plain Next.js + Supabase app, NOT an AIOX-instrumented project.

**Evidence (audit 2026-05-28):**
- No `.aiox-core/` in `/Users/viniciusnunes/Documents/gestantes-app` (so no `core-config.yaml`, no `synapse/diagnostics/synapse-diagnostics.js`, no tasks/templates/checklists).
- No `.aiox/` runtime dir (no `gotchas.json`, no handoffs, no session state).
- `.claude/` in this project contains ONLY `agent-memory/` (the persistent memory dirs for aiox-pm, aiox-analyst, aiox-architect, aiox-data-engineer, aiox-qa, aiox-ux). No `commands/`, no `agents/`, no `skills/`, no `rules/`.
- The AIOX framework itself (with `.aiox-core/core/synapse/...`) lives at `/Users/viniciusnunes/Documents/AIOS/`, a SEPARATE repo. The CLAUDE.md/skills/rules in context are loaded from AIOS, not from gestantes-app.
- No `~/.claude/settings.json`, no `~/.claude/logs/`, no `~/.claude/hooks/` → timing hooks are NOT installed, so NO_TIMING_DATA for any session.

**Why:** The AIOX agents operate ON gestantes-app via cross-project memory, but the SYNAPSE context engine and timing instrumentation were never installed INTO gestantes-app.

**How to apply:**
- For SYNAPSE diagnostics, run from the AIOS repo (`/Users/viniciusnunes/Documents/AIOS`), not gestantes-app, OR install SYNAPSE into gestantes-app first.
- Do not attempt `node .../synapse-diagnostics.js` with cwd=gestantes-app — the module path does not resolve here.
- Timing/performance analysis requires installing PreToolUse/PostToolUse hooks in `~/.claude/settings.json` first; until then all sessions report NO_TIMING_DATA.
- Other AIOX agents have already audited this app (see [[project-gestar-em-movimento]] and sibling agent-memory dirs aiox-qa, aiox-ux, aiox-analyst, aiox-architect, aiox-data-engineer with 2026-05 audit files).
