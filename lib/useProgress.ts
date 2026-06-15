'use client'

import { useCallback, useEffect, useState } from 'react'
import { getExerciseCompletions, saveExerciseCompletion, removeExerciseCompletion } from './exercises'
import { getCurrentUser } from './customAuth'
import { getLocalDateBR } from './utils'

const STORAGE_KEY = 'gem-progress-v1'

export interface ProgressState {
  points: number
  completedExerciseIds: string[]
  // ISO date strings (YYYY-MM-DD) when at least one exercise was done
  activeDays: string[]
  // exercise ids completed this week — used for weekly meta progress
  weeklyDone: string[]
  weeklyDoneWeekKey: string
}

const POINTS_PER_PRACTICE = 20

function todayISO(): string {
  return getLocalDateBR()
}

function currentWeekKey(): string {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  const week = Math.ceil((diff / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${week}`
}

const defaultState: ProgressState = {
  points: 320,
  completedExerciseIds: [],
  activeDays: [],
  weeklyDone: [],
  weeklyDoneWeekKey: currentWeekKey(),
}

function readState(): ProgressState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as ProgressState
    // reset weekly counter if week changed
    if (parsed.weeklyDoneWeekKey !== currentWeekKey()) {
      return {
        ...parsed,
        weeklyDone: [],
        weeklyDoneWeekKey: currentWeekKey(),
      }
    }
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

function writeState(state: ProgressState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* noop */
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const loadProgress = async () => {
      const user = getCurrentUser()

      // CRITICAL: If there's a logged-in user, ALWAYS reset localStorage first
      // This prevents cross-contamination from previous user's data
      if (user?.id) {
        setState(defaultState)

        const completedExercises = await getExerciseCompletions(user.id)

        if (completedExercises.length > 0) {
          setState(prev => ({
            ...prev,
            completedExerciseIds: completedExercises,
            weeklyDone: completedExercises,
          }))
        }
      } else {
        const localState = readState()
        setState(localState)
      }

      setHydrated(true)
    }

    loadProgress()
  }, [])

  useEffect(() => {
    if (hydrated) writeState(state)
  }, [state, hydrated])

  const completeExercise = useCallback((exerciseId: string) => {
    setState((prev) => {
      if (prev.completedExerciseIds.includes(exerciseId)) return prev
      const today = todayISO()
      return {
        ...prev,
        points: prev.points + POINTS_PER_PRACTICE,
        completedExerciseIds: [...prev.completedExerciseIds, exerciseId],
        activeDays: prev.activeDays.includes(today)
          ? prev.activeDays
          : [...prev.activeDays, today],
        weeklyDone: prev.weeklyDone.includes(exerciseId)
          ? prev.weeklyDone
          : [...prev.weeklyDone, exerciseId],
      }
    })
  }, [])

  const toggleExercise = useCallback(async (exerciseId: string) => {
    const user = getCurrentUser()
    const today = todayISO()

    // Determinar estado ANTES de mudar
    const isDone = state.completedExerciseIds.includes(exerciseId)

    try {
      setState((prev) => {
        if (isDone) {
          return {
            ...prev,
            points: Math.max(0, prev.points - POINTS_PER_PRACTICE),
            completedExerciseIds: prev.completedExerciseIds.filter((id) => id !== exerciseId),
            weeklyDone: prev.weeklyDone.filter((id) => id !== exerciseId),
          }
        }
        return {
          ...prev,
          points: prev.points + POINTS_PER_PRACTICE,
          completedExerciseIds: [...prev.completedExerciseIds, exerciseId],
          activeDays: prev.activeDays.includes(today)
            ? prev.activeDays
            : [...prev.activeDays, today],
          weeklyDone: prev.weeklyDone.includes(exerciseId)
            ? prev.weeklyDone
            : [...prev.weeklyDone, exerciseId],
        }
      })

      if (user?.id) {
        if (isDone) {
          await removeExerciseCompletion(user.id, exerciseId, today)
        } else {
          await saveExerciseCompletion(user.id, exerciseId, today)
        }
      }
    } catch (err) {
      console.error(`[useProgress] Error saving to Supabase:`, err)
      // Revert state on error
      setState((prev) => {
        if (isDone) {
          // Was done, now not done - revert to done
          return {
            ...prev,
            points: prev.points + POINTS_PER_PRACTICE,
            completedExerciseIds: [...prev.completedExerciseIds, exerciseId],
            activeDays: prev.activeDays.includes(today)
              ? prev.activeDays
              : [...prev.activeDays, today],
            weeklyDone: [...prev.weeklyDone, exerciseId],
          }
        } else {
          // Was not done, now done - revert to not done
          return {
            ...prev,
            points: Math.max(0, prev.points - POINTS_PER_PRACTICE),
            completedExerciseIds: prev.completedExerciseIds.filter((id) => id !== exerciseId),
            weeklyDone: prev.weeklyDone.filter((id) => id !== exerciseId),
          }
        }
      })
    }
  }, [state])

  const reset = useCallback(() => {
    setState(defaultState)
  }, [])

  return {
    state,
    hydrated,
    completeExercise,
    toggleExercise,
    reset,
    isCompleted: (id: string) => state.completedExerciseIds.includes(id),
  }
}

/** Returns array of length 7 (Mon..Sun) with booleans for active days this week. */
export function getWeekActivity(activeDays: string[]): boolean[] {
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7 // Mon=0..Sun=6
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek)
  monday.setHours(0, 0, 0, 0)

  const result: boolean[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = getLocalDateBR(d)
    result.push(activeDays.includes(iso))
  }
  return result
}
