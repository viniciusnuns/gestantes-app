---
name: project_gestar_em_movimento
description: Gestar em Movimento app — Next.js 14 wellness app for Brazilian pregnant women, MVP stage, LGPD-sensitive health data
metadata:
  type: project
---

Gestar em Movimento is a Next.js 14 (App Router) wellness app for Brazilian pregnant women. Tech: TypeScript, Tailwind, Supabase (PostgreSQL + Storage + Auth), deployed on Vercel. MVP target is 8-12 daily active users. Public timezone is America/Sao_Paulo. Data is health-sensitive (LGPD scope).

**Why:** User is validating product-market fit at small scale before broader launch. Need to know runway on free tiers before paying.

**How to apply:** When making recommendations, prioritize (1) staying on free tiers as long as ACs allow, (2) LGPD-aware suggestions (data residency, consent, encryption at rest is on Supabase by default), (3) honest scaling thresholds — don't oversell or underplay.

Key surfaces: home, comunidade (community posts/comments/likes), biblioteca (video library, YouTube embeds via [[infra_stack]]), calendario, dashboard (patient/therapist split), admin (rules editor), onboarding flow. 4 API routes total. Realtime is NOT used for community (polling/refetch pattern observed in recent commits).
