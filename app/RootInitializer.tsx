'use client'

import { useEffect } from 'react'
import { useActivityInit } from '@/lib/hooks/useActivityInit'

/**
 * Root initializer component that sets up the activity store
 * This component ensures activity data is loaded and synced on app startup
 */
export default function RootInitializer({ children }: { children: React.ReactNode }) {
  // Initialize activity store on app mount
  useActivityInit()

  return <>{children}</>
}
