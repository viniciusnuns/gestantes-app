'use client'

import { useEffect } from 'react'

declare global { interface Window { fbq?: (...args: unknown[]) => void } }

export default function PartoPixelTracker() {
  useEffect(() => {
    window.fbq?.('track', 'ViewContent', {
      content_name: 'Parto Landing Page',
      content_category: 'parto',
      value: 67.00,
      currency: 'BRL',
    })
  }, [])

  return null
}
