'use client'

import { useEffect } from 'react'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function DoresPixelTracker() {
  useEffect(() => {
    window.fbq?.('track', 'ViewContent', {
      content_name: 'Dores Landing Page',
      content_category: 'dores',
      value: 67.00,
      currency: 'BRL',
    })
  }, [])

  return null
}
