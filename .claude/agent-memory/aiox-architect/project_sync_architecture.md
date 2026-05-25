---
name: project-sync-architecture
description: Gestar em Movimento app sync model — single useProgress hook is current source of state, must evolve to date-aware activity log
metadata:
  type: project
---

Gestar em Movimento (Next.js 14 + Supabase) requires 4-screen sync (Home, Calendário, Progresso, Ranking). The blocker for repetition tracking (same exercise on day 1 AND day 4 = 2 events) is the current `user_exercises` table using unique constraint `(user_id, exercise_id, date)` — only deduplicates per-day, but the `useProgress` hook conflates `completedExerciseIds` as a global flag instead of an event log.

**Why:** Original schema treated completion as boolean state, not as event history. Calendar feature now demands event-log semantics — each execution is its own scoring event.

**How to apply:** When designing data layer for this app, ALWAYS recommend an event-log table (`user_activity_history`) as authoritative truth + derived views/materialized queries for "is completed today" booleans. Never recommend storing aggregate points in a single column — derive from events. The `useProgress` hook should split into `useDailyExercises(date)` + `useActivityHistory(userId)` + `useUserStats(userId)`.

Related: [[project-api-me-404-root-cause]]
