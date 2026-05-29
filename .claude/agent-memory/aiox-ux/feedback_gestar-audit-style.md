---
name: feedback-gestar-audit-style
description: How the user expects UX audits delivered for the Gestar em Movimento app
metadata:
  type: feedback
---

For UX/UI audits on this project, deliver: Nielsen 10-heuristic evaluation (pass/fail count), a 1-10 UX Health Score, Top-5 quick wins (high-impact/low-effort), ASCII wireframes for the top 3 improvements, and phase-2 design-system recommendations. Return findings as the assistant message (no report .md files).

**Why:** the spawn brief explicitly requested this exact deliverable structure.
**How to apply:** keep critiques evidence-based — cite the actual file/line/className observed, since the codebase contradicted surface assumptions (e.g., tokens labeled "primary" are warm-rose, not pink; data comes from Zustand+RPC, not REST). Always read the real component before claiming a UX defect. Related: [[project-gestar-em-movimento]]
