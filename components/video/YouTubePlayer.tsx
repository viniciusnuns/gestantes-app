'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { useTrackVideoEvent } from '@/lib/hooks/useTrackVideoEvent'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface YouTubePlayerProps {
  videoId: string
  title?: string
  trackingId?: string
  onPlay?: () => void
  /** Called periodically with 0–1 progress while video is playing. */
  onProgress?: (percent: number) => void
}

let ytApiPromise: Promise<void> | null = null

function loadYTApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise<void>((resolve) => {
    if (typeof window === 'undefined') return
    if (window.YT?.Player) { resolve(); return }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }

    if (!document.getElementById('yt-iframe-api')) {
      const script = document.createElement('script')
      script.id = 'yt-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })
  return ytApiPromise
}

export function YouTubePlayer({ videoId, title, trackingId, onPlay, onProgress }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { trackEvent } = useTrackVideoEvent()

  const iframeId = useRef(`yt-${Math.random().toString(36).slice(2)}`)
  const playerRef = useRef<YT.Player | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sessionIdRef = useRef('')
  const playStartMsRef = useRef<number | null>(null)
  const trackEventRef = useRef(trackEvent)
  const trackingIdRef = useRef(trackingId || videoId)
  const onProgressRef = useRef(onProgress)

  useEffect(() => { trackEventRef.current = trackEvent }, [trackEvent])
  useEffect(() => { trackingIdRef.current = trackingId || videoId }, [trackingId, videoId])
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  // Pre-load YT API on mount so it's ready when user clicks play.
  useEffect(() => { loadYTApi() }, [])

  // Attach YT.Player to the existing iframe for progress tracking (after API loads).
  useEffect(() => {
    if (!isPlaying) return
    let cancelled = false

    loadYTApi().then(() => {
      if (cancelled) return

      const onStateChange = (e: YT.OnStateChangeEvent) => {
        if (e.data === window.YT.PlayerState.PLAYING) {
          if (!pollRef.current) {
            pollRef.current = setInterval(() => {
              try {
                const p = playerRef.current
                if (!p) return
                const duration = p.getDuration()
                if (duration > 0) onProgressRef.current?.(p.getCurrentTime() / duration)
              } catch { /* ignore */ }
            }, 500)
          }
        } else {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
          if (e.data === window.YT.PlayerState.ENDED) onProgressRef.current?.(1)
        }
      }

      // Attach to existing iframe (already autoplay-ing from src URL)
      playerRef.current = new window.YT.Player(iframeId.current, {
        events: { onStateChange },
      })
    })

    return () => {
      cancelled = true
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [isPlaying, videoId])

  // Track play event once
  useEffect(() => {
    if (!isPlaying || sessionIdRef.current) return
    sessionIdRef.current = crypto.randomUUID?.() ?? `sess-${Date.now()}`
    playStartMsRef.current = Date.now()
    trackEvent(trackingIdRef.current, 'play', 0, sessionIdRef.current)
  }, [isPlaying, trackEvent])

  // On unmount: log completed event and destroy player
  useEffect(() => {
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      if (sessionIdRef.current && playStartMsRef.current !== null) {
        const watchedSec = Math.max(0, Math.floor((Date.now() - playStartMsRef.current) / 1000))
        trackEventRef.current(trackingIdRef.current, 'completed', watchedSec, sessionIdRef.current)
      }
      try { playerRef.current?.destroy() } catch { /* ignore */ }
    }
  }, [])

  const handlePlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  return (
    <div
      className={isExpanded ? '' : 'relative w-full aspect-video bg-black rounded-lg overflow-hidden'}
      style={isExpanded ? {
        position: 'fixed', inset: 0, zIndex: 99999999,
        backgroundColor: '#000', borderRadius: 0, overflow: 'hidden',
      } : {}}
    >
      {!isPlaying ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title || 'Vídeo do exercício'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
            aria-label={title ? `Assistir vídeo: ${title}` : 'Assistir vídeo'}
          >
            <Play size={64} className="text-white fill-white" />
          </button>
        </>
      ) : (
        <>
          {/* Iframe criado diretamente com autoplay=1 na URL — garante play em 1 clique no iOS */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <iframe
              id={iframeId.current}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={title || 'Vídeo'}
            />
          </div>

          {/* Expand / minimize button */}
          <button
            onClick={() => setIsExpanded((x) => !x)}
            style={{ position: 'absolute', bottom: '80px', right: '23px', zIndex: 50, pointerEvents: 'auto' }}
            className="bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-lg transition-colors shadow-lg"
            title={isExpanded ? 'Minimizar' : 'Expandir tela cheia'}
            aria-label={isExpanded ? 'Minimizar' : 'Expandir tela cheia'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>

          {/* Transparent overlays — block YouTube branding/navigation */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '88%', height: '100px', zIndex: 99999999999999, pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0)' }} role="presentation" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '72px', zIndex: 99999999999999, pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0)' }} role="presentation" />
        </>
      )}
    </div>
  )
}

export default YouTubePlayer
