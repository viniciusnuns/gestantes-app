'use client'

import { useEffect } from 'react'
import { useOptimizedSync } from '@/lib/hooks/useOptimizedSync'

/**
 * Root initializer component that sets up the activity store
 * Uses optimized parallel RPCs (4x faster than sequential queries)
 */
export default function RootInitializer({ children }: { children: React.ReactNode }) {
  // Sync optimized page data on app mount
  useOptimizedSync()

  return <>{children}</>
}
