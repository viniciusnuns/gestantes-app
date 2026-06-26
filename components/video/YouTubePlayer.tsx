'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [playerReady, setPlayerReady] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { trackEvent } = useTrackVideoEvent()

  const playerDivId = useRef(`yt-${Math.random().toString(36).slice(2)}`)
  const playerRef = useRef<YT.Player | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const unmutedRef = useRef(false)

  const sessionIdRef = useRef('')
  const playStartMsRef = useRef<number | null>(null)
  const trackEventRef = useRef(trackEvent)
  const trackingIdRef = useRef(trackingId || videoId)
  const onProgressRef = useRef(onProgress)

  useEffect(() => { trackEventRef.current = trackEvent }, [trackEvent])
  useEffect(() => { trackingIdRef.current = trackingId || videoId }, [trackingId, videoId])
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  // Inicia o player automaticamente quando a página abre.
  useEffect(() => {
    loadYTApi().then(() => setIsPlaying(true))
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    let cancelled = false

    console.log('[YTPlayer] clique recebido, aguardando API...')

    loadYTApi().then(() => {
      if (cancelled) return

      console.log('[YTPlayer] API pronta, criando player...')

      playerRef.current = new window.YT.Player(playerDivId.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,         // muted autoplay — iOS honra; desmutamos no PLAYING
          playsinline: 1,  // evita fullscreen forçado no iOS
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (e) => {
            console.log('[YTPlayer] onReady disparado, chamando playVideo()')
            e.target.playVideo()
            setPlayerReady(true)
          },
          onStateChange: (e) => {
            console.log('[YTPlayer] onStateChange:', e.data)

            if (e.data === window.YT.PlayerState.PLAYING) {
              // Desmuta na primeira vez que entra em PLAYING
              if (!unmutedRef.current) {
                unmutedRef.current = true
                e.target.unMute()
                e.target.setVolume(100)
                console.log('[YTPlayer] unMute executado')
              }

              // Inicia polling de progresso
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
          },
        },
      })

      console.log('[YTPlayer] player criado')
    })

    return () => {
      cancelled = true
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [isPlaying, videoId])

  // Registra evento play uma vez por sessão
  useEffect(() => {
    if (!isPlaying || sessionIdRef.current) return
    sessionIdRef.current = crypto.randomUUID?.() ?? `sess-${Date.now()}`
    playStartMsRef.current = Date.now()
    trackEvent(trackingIdRef.current, 'play', 0, sessionIdRef.current)
  }, [isPlaying, trackEvent])

  // Ao desmontar: registra completed e destrói player
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

  return (
    <div
      className={isExpanded ? '' : 'relative w-full aspect-video bg-black rounded-lg overflow-hidden'}
      style={isExpanded ? {
        position: 'fixed', inset: 0, zIndex: 99999999,
        backgroundColor: '#000', borderRadius: 0, overflow: 'hidden',
      } : {}}
    >
      <>
          {/* Thumbnail visível enquanto o player carrega */}
          {!playerReady && (
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={title || 'Vídeo do exercício'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* YT.Player substitui este div pelo iframe */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <div id={playerDivId.current} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Botão expand / minimizar */}
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

          {/* Overlays transparentes — bloqueiam logo e "Watch on YouTube" */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '88%', height: '100px', zIndex: 99999999999999, pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0)' }} role="presentation" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '72px', zIndex: 99999999999999, pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0)' }} role="presentation" />
      </>
    </div>
  )
}

export default YouTubePlayer
