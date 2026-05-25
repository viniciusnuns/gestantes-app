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
  const [isExpanded, setIsExpanded] = useState(false)
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
    <div
      className={isExpanded ? '' : 'relative w-full aspect-video bg-black rounded-lg overflow-hidden'}
      style={isExpanded ? {
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        backgroundColor: '#000',
        borderRadius: 0,
        overflow: 'hidden',
      } : {}}
    >
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
          {/* YouTube iframe (mounted only after first Play click) — NO native fullscreen */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&autoplay=1`}
            title={title || 'Vídeo do exercício'}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />

          {/*
            CRITICAL — transparent overlays block YouTube branding/navigation.
            Design: two full-width horizontal stripes that leave the red progress bar FREE.
            1. Top bar (60px): blocks title, channel, volume, CC, settings
            2. Bottom bar (100px): blocks time display, share, "More videos", YouTube logo
            The red progress bar stays perfectly clickable in the middle.
          */}
          {/* Custom expand/minimize button — replaces native YouTube fullscreen */}
          {isPlaying && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded transition-colors"
              title={isExpanded ? 'Minimizar' : 'Expandir tela'}
              aria-label={isExpanded ? 'Minimizar' : 'Expandir tela'}
            >
              {isExpanded ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 3.5h9v9h-9v-9zm0 10h9v3h-9v-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V15a2 2 0 01-2 2h-1C9.716 17 3 10.284 3 2v-1z" />
                </svg>
              )}
            </button>
          )}

          {/*
            CRITICAL — transparent overlays block YouTube branding/navigation.
            Blocks title/channel (top) and share/"More videos"/logo (bottom).

            Solution: Custom expand button replaces native YouTube fullscreen.
            When expanded, the container becomes position:fixed (our CSS context),
            so overlays always stay on top of YouTube controls. No iframe fullscreen context.
          */}
          {/* Top-left overlay — blocks title/channel (88% left) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '88%',
              height: '110px',
              zIndex: 99999999999999,
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
            role="presentation"
          />
          {/* Bottom overlay — blocks share/"More videos"/logo (100% width, 72px height) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '72px',
              zIndex: 99999999999999,
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
            role="presentation"
          />
        </>
      )}
    </div>
  )
}

export default YouTubePlayer
