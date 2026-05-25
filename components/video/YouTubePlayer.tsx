'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { useTrackVideoEvent } from '@/lib/hooks/useTrackVideoEvent'

export interface YouTubePlayerProps {
  /** YouTube video ID (11 chars) — e.g. `jNcC6rg0Zxw` */
  videoId: string
  /** Optional title used for the thumbnail alt text and the play button label. */
  title?: string
  /**
   * Optional application-level identifier used for tracking events in
   * `video_progress` (e.g. `exercise.id` = "ex-1"). Falls back to `videoId`
   * (the raw YouTube ID) when omitted. Story 1.4.
   */
  trackingId?: string
}

/**
 * Lazy-loaded YouTube player with a click-to-play thumbnail and a transparent
 * overlay that blocks the YouTube logo click area (top-left).
 *
 * Why the overlay?
 * Even with `modestbranding=1`, the YouTube logo remains clickable and would
 * navigate the gestante out of the app. The overlay is visually transparent
 * (`rgba(0,0,0,0)`) but absorbs clicks via `pointer-events: auto`, keeping
 * the user inside the experience.
 *
 * Performance:
 * - The iframe is NOT mounted until the user clicks Play — we ship only
 *   the YouTube thumbnail (~30KB) on initial render.
 * - `maxresdefault.jpg` is used; browsers gracefully fall back to a lower
 *   resolution if it doesn't exist for a given video.
 *
 * Tracking (Story 1.4):
 * - `play` event is emitted exactly once, when the iframe is first mounted.
 * - `completed` event is emitted on component unmount IF playback started,
 *   using an estimated watched-seconds based on wall-clock time since play.
 *   We cannot use the YouTube IFrame API here because we render a plain
 *   `<iframe>` (no YT.Player wrapper). MVP-acceptable per Story 1.4 AC.
 * - All tracking is fire-and-forget: a failed insert never breaks the player.
 */
export function YouTubePlayer({ videoId, title, trackingId }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { trackEvent } = useTrackVideoEvent()

  // Session ID groups all events of one mount. Generated lazily on first play
  // so we don't burn a UUID for users that never click.
  const sessionIdRef = useRef<string>('')
  // Wall-clock start time, used to estimate watched seconds on unmount.
  const playStartMsRef = useRef<number | null>(null)
  // Snapshot of trackEvent + identifiers for the unmount cleanup. Refs avoid
  // re-creating the cleanup callback (and re-firing it) on every render.
  const trackEventRef = useRef(trackEvent)
  const trackingIdRef = useRef<string>(trackingId || videoId)
  useEffect(() => {
    trackEventRef.current = trackEvent
  }, [trackEvent])
  useEffect(() => {
    trackingIdRef.current = trackingId || videoId
  }, [trackingId, videoId])

  // Emit `play` exactly once, when the iframe transitions in.
  useEffect(() => {
    if (!isPlaying) return
    if (sessionIdRef.current) return // already tracked this mount

    // crypto.randomUUID() is used project-wide (see customAuth.ts, activityStore.ts).
    // The `uuid` npm package is intentionally not a dependency.
    sessionIdRef.current =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`

    playStartMsRef.current = Date.now()
    trackEvent(trackingIdRef.current, 'play', 0, sessionIdRef.current)
  }, [isPlaying, trackEvent])

  // On unmount: if playback ever started, log a `completed` event with
  // estimated watched seconds. Conservative MVP heuristic — real >=90%
  // detection requires the YT IFrame API and is tracked as future work.
  useEffect(() => {
    return () => {
      if (!sessionIdRef.current || playStartMsRef.current === null) return
      const watchedSec = Math.max(
        0,
        Math.floor((Date.now() - playStartMsRef.current) / 1000)
      )
      trackEventRef.current(
        trackingIdRef.current,
        'completed',
        watchedSec,
        sessionIdRef.current
      )
    }
  }, [])

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {!isPlaying ? (
        <>
          {/* Thumbnail (lazy: no iframe yet) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title || 'Vídeo do exercício'}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Play button — fills the area so the entire tile is clickable */}
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
            aria-label={title ? `Assistir vídeo: ${title}` : 'Assistir vídeo'}
          >
            <Play size={64} className="text-white fill-white" />
          </button>
        </>
      ) : (
        <>
          {/* YouTube iframe (mounted only after first Play click) */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&autoplay=1`}
            title={title || 'Vídeo do exercício'}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />

          {/*
            CRITICAL — transparent overlay over YouTube logo (top-left).
            Blocks navigation away from the app while remaining imperceptible.
            Width 96px / height 56px covers the logo footprint on all viewport sizes.
          */}
          <div
            className="absolute top-0 left-0 w-24 h-14 z-10"
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
            role="presentation"
            aria-label="Bloqueia navegação para YouTube"
          />
        </>
      )}
    </div>
  )
}

export default YouTubePlayer
