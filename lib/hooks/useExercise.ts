'use client'

import { useEffect, useState } from 'react'
import type { Exercise } from '@/lib/data'

export interface UseExerciseResult {
  exercise: Exercise | null
  isLoading: boolean
  error: string | null
}

/**
 * Fetches a single exercise by ID from `GET /api/exercises/[id]`.
 *
 * Follows the project's existing hook patterns (plain `useState` + `useEffect`,
 * no SWR / React Query — these aren't in the dependency tree yet).
 *
 * The hook is resilient to:
 * - Empty `id` (does nothing, stays in loading=false state)
 * - 404 responses (sets a friendly error message, exercise stays null)
 * - Network errors (caught and surfaced via `error`)
 * - Component unmount during fetch (state updates are no-ops via `cancelled` flag)
 *
 * @example
 * ```tsx
 * const { exercise, isLoading, error } = useExercise(params.id)
 * if (isLoading) return <Spinner />
 * if (error || !exercise) return <NotFound />
 * return <ExerciseView exercise={exercise} />
 * ```
 */
export function useExercise(id: string): UseExerciseResult {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setExercise(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`/api/exercises/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Exercício não encontrado')
          }
          throw new Error(`Erro ao carregar exercício (${res.status})`)
        }
        return res.json() as Promise<Exercise>
      })
      .then((data) => {
        if (cancelled) return
        setExercise(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Erro desconhecido ao carregar exercício'
        setError(message)
        setExercise(null)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { exercise, isLoading, error }
}
