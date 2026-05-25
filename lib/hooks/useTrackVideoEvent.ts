'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'

export type VideoEventType = 'play' | 'pause' | 'completed'

/**
 * Fire-and-forget tracker for YouTube video interactions (Story 1.4).
 *
 * Design goals:
 * - **Never block the player.** Insert is awaited internally but the public
 *   `trackEvent` function returns synchronously (Promise is intentionally
 *   discarded). Caller can `void trackEvent(...)` for clarity.
 * - **Silent failure.** Any error (network down, RLS reject, missing user)
 *   is logged at `console.warn` level and swallowed — the player must keep
 *   working even if Supabase is unreachable.
 * - **Custom-auth aware.** Reads user identity from `getCurrentUser()`
 *   (localStorage session), not from Supabase Auth. RLS on
 *   `video_progress` is intentionally permissive — see migration
 *   `2026-05-25_video_progress.sql` for details.
 *
 * Why a hook (and not a plain util)?
 * Keeps API symmetry with other client hooks in `lib/hooks/`, and makes it
 * trivial to wrap with telemetry/feature flags later without touching call sites.
 *
 * @example
 * ```tsx
 * const { trackEvent } = useTrackVideoEvent()
 * const sessionId = useRef(crypto.randomUUID()).current
 * trackEvent('ex-1', 'play', 0, sessionId)
 * ```
 */
export function useTrackVideoEvent() {
  const trackEvent = useCallback(
    (
      videoId: string,
      eventType: VideoEventType,
      watchedSec: number,
      sessionId: string
    ): void => {
      // Fire-and-forget: never block the caller.
      void (async () => {
        try {
          const user = getCurrentUser()
          if (!user?.id) {
            // No authenticated user — nothing to track. Quietly skip.
            return
          }

          if (!videoId || !sessionId) {
            // Defensive: invalid call, do not insert garbage rows.
            return
          }

          const { error } = await supabase.from('video_progress').insert({
            user_id: user.id,
            video_id: videoId,
            event_type: eventType,
            watched_until_sec: Math.max(0, Math.floor(watchedSec)),
            session_id: sessionId,
          })

          if (error) {
            // Network/RLS/constraint error. Log at warn (not error) — this is
            // observability noise, not a UX failure.
            console.warn('[useTrackVideoEvent] insert failed:', error.message)
          }
        } catch (err) {
          // Swallow EVERYTHING. The player must not break because of tracking.
          console.warn('[useTrackVideoEvent] unexpected error:', err)
        }
      })()
    },
    []
  )

  return { trackEvent }
}

export default useTrackVideoEvent
