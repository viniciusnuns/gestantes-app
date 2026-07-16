'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export default function PixelTracker() {
  useEffect(() => {
    window.fbq?.('track', 'ViewContent', {
      content_name: 'Gestar em Movimento',
      content_category: 'Saúde Gestante',
      value: 197.00,
      currency: 'BRL',
    })
  }, [])

  return null
}
