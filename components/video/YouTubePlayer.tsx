'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export interface YouTubePlayerProps {
  /** YouTube video ID (11 chars) — e.g. `jNcC6rg0Zxw` */
  videoId: string
  /** Optional title used for the thumbnail alt text and the play button label. */
  title?: string
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
 */
export function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

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
