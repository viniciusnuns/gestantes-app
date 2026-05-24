'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile } from '@/lib/customAuth'
import { getRouteDecision, type UserType } from '@/lib/route-policy'

interface AuthGateProps {
  children: React.ReactNode
  requiredUserType?: 'patient' | 'therapist'
}

export function AuthGate({ children, requiredUserType }: AuthGateProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null)
  const [userProfile, setUserProfile] = useState<{
    onboarding_completed: boolean
    user_type: UserType
  } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser()
        console.log('[AuthGate] getCurrentUser returned:', user)
        if (!user) {
          console.log('[AuthGate] No user session found')
          setIsCheckingAuth(false)
          return
        }

        setCurrentUser(user)

        console.log('[AuthGate] Calling getUserProfile with userId:', user.id)
        const profile = await getUserProfile(user.id)
        console.log('[AuthGate] getUserProfile returned:', profile)
        if (profile) {
          setUserProfile({
            onboarding_completed: profile.onboarding_completed,
            user_type: profile.user_type as UserType
          })
        } else {
          // Use defaults if getUserProfile fails (for new users)
          console.log('[AuthGate] getUserProfile returned null - using defaults')
          setUserProfile({
            onboarding_completed: false,
            user_type: 'patient'
          })
        }
      } catch (error) {
        console.error('[AuthGate] Error checking auth:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Check route policy and redirect if needed
  useEffect(() => {
    if (isCheckingAuth) return

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
    const decision = getRouteDecision({
      hasSession: !!currentUser,
      userType: userProfile?.user_type || null,
      onboardingCompleted: userProfile?.onboarding_completed || false,
      path: pathname
    })

    console.log('[AuthGate] Route decision:', {
      pathname,
      hasSession: !!currentUser,
      userType: userProfile?.user_type || null,
      onboardingCompleted: userProfile?.onboarding_completed || false,
      decision
    })

    if (!decision.allow && decision.redirect) {
      console.log('[AuthGate] Setting shouldRedirect to:', decision.redirect)
      setShouldRedirect(decision.redirect)
    }
  }, [isCheckingAuth, currentUser, userProfile])

  // Execute redirect if needed
  useEffect(() => {
    if (shouldRedirect) {
      console.log('[AuthGate] Executing redirect to:', shouldRedirect)
      router.push(shouldRedirect)
      console.log('[AuthGate] Router.push called')
    }
  }, [shouldRedirect, router])

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Check route decision
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const decision = getRouteDecision({
    hasSession: !!currentUser,
    userType: userProfile?.user_type || null,
    onboardingCompleted: userProfile?.onboarding_completed || false,
    path: pathname
  })

  // Deny access
  if (!decision.allow && !decision.redirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Acesso negado</p>
          <p className="text-gray-600 text-sm mt-2">{decision.reason}</p>
        </div>
      </div>
    )
  }

  // Check required user type
  if (requiredUserType && userProfile?.user_type !== requiredUserType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Tipo de usuário incorreto</p>
          <p className="text-gray-600 text-sm mt-2">
            Esta página é apenas para {requiredUserType === 'therapist' ? 'profissionais' : 'gestantes'}
          </p>
        </div>
      </div>
    )
  }

  // Allow access
  return <>{children}</>
}
