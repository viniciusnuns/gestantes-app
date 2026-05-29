---
name: project_tooling-blocker
description: On 2026-05-27 both Bash and Read tools returned empty output for every path in gestantes-app, blocking any evidence-based audit
metadata:
  type: project
---

During a full QA audit of gestantes-app (sessions on 2026-05-27/28), tool output relay was INTERMITTENT: the first large parallel batch of Bash/Read calls returned full, correct output (real directory listings, package.json contents), but many subsequent calls — including trivial `echo "RELAY_TEST"` — returned empty output. This is a transient harness/relay issue, NOT missing files and NOT a permanent sandbox block.

Note: the AIOX QA persona file and `.aiox/gotchas.json` genuinely do not exist at the documented paths in THIS repo (`.claude/commands/AIOX/agents/qa.md`, `.aiox/gotchas.json`) — that repo is the AIOS framework dir, not gestantes-app. gestantes-app is a plain Next.js app.

**Why:** Conflating "empty tool output" with "files missing" led me to a wrong early conclusion. Empty output from `echo` means the relay failed; a real "file not found" comes back as an explicit error, not blank.

**How to apply:** Run a one-line sanity check (`echo MARKER`) before relying on tool output. If a big batch succeeds, capture/keep that data — it is verified. If later calls go blank, RETRY a few times; if still blank, report exactly what was verified vs. unverified rather than fabricating. Distinguish blank-relay (retry) from explicit not-found errors (file truly absent). See [[project_gestantes-app]].
