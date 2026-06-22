/**
 * Route Policy Decision Engine
 *
 * Pure function that implements 11-scenario decision table for route protection.
 * Determines access based on: (hasSession, userType, onboardingCompleted, path)
 */

export type UserType = 'patient' | 'therapist' | null;

export interface RouteDecision {
  allow: boolean;
  redirect?: string;
  reason: string;
}

interface RoutePolicyInput {
  hasSession: boolean;
  userType: UserType;
  onboardingCompleted: boolean;
  path: string;
}

/**
 * 11-Scenario Decision Table
 *
 * Scenario 1:  No session, any path → /login (public routes allowed)
 * Scenario 2:  Session + patient + onboarding done → allow home/dashboard
 * Scenario 3:  Session + patient + onboarding pending → /onboarding
 * Scenario 4:  Session + therapist + any → /therapist/dashboard
 * Scenario 5:  Session + onboarding + trying private route → /onboarding
 * Scenario 6:  Session + patient + trying therapist route → /home
 * Scenario 7:  Session + therapist + trying patient route → /therapist/dashboard
 * Scenario 8:  Public routes (login, signup) + has session → redirect to appropriate home
 * Scenario 9:  Invalid user_type → /login
 * Scenario 10: Onboarding route + completed → redirect to home
 * Scenario 11: Non-existent routes → 404 (app handles)
 */
export function getRouteDecision(input: RoutePolicyInput): RouteDecision {
  const { hasSession, userType, onboardingCompleted, path } = input;

  // Scenario 1: No session
  if (!hasSession) {
    // Allow public routes
    if (isPublicRoute(path)) {
      return {
        allow: true,
        reason: 'Public route accessible without session',
      };
    }
    // Redirect to login
    return {
      allow: false,
      redirect: '/login',
      reason: 'No session - redirect to login',
    };
  }

  // Scenario 9: Invalid user_type
  if (!userType || !['patient', 'therapist'].includes(userType)) {
    return {
      allow: false,
      redirect: '/login',
      reason: 'Invalid user type',
    };
  }

  // Scenario 8: Public routes with active session → redirect home
  if (isPublicRoute(path) && hasSession) {
    const homeRoute = userType === 'therapist' ? '/therapist/dashboard' : '/home';
    return {
      allow: false,
      redirect: homeRoute,
      reason: `Already logged in as ${userType} - redirect to ${homeRoute}`,
    };
  }

  // Scenario 3: Patient + onboarding pending
  if (userType === 'patient' && !onboardingCompleted) {
    if (path === '/onboarding') {
      return {
        allow: true,
        reason: 'Patient completing onboarding',
      };
    }
    return {
      allow: false,
      redirect: '/onboarding',
      reason: 'Patient must complete onboarding first',
    };
  }

  // Scenario 10: Onboarding route + completed
  if (path === '/onboarding' && onboardingCompleted) {
    const homeRoute = userType === 'therapist' ? '/therapist/dashboard' : '/home';
    return {
      allow: false,
      redirect: homeRoute,
      reason: 'Onboarding already completed - redirect home',
    };
  }

  // Scenario 6: Patient trying therapist routes
  if (userType === 'patient' && isTherapistRoute(path)) {
    return {
      allow: false,
      redirect: '/home',
      reason: 'Patient cannot access therapist routes',
    };
  }

  // Scenario 7: Therapist trying patient routes
  if (userType === 'therapist' && isPatientRoute(path)) {
    return {
      allow: false,
      redirect: '/therapist/dashboard',
      reason: 'Therapist cannot access patient routes',
    };
  }

  // Scenario 2 & 4: Patient or therapist with valid session + completed onboarding
  if (hasSession && onboardingCompleted) {
    // Check route belongs to user type
    if (userType === 'patient' && isPatientRoute(path)) {
      return {
        allow: true,
        reason: 'Patient accessing patient routes',
      };
    }
    if (userType === 'therapist' && isTherapistRoute(path)) {
      return {
        allow: true,
        reason: 'Therapist accessing therapist routes',
      };
    }
  }

  // Default: allow if route matches user type
  return {
    allow: true,
    reason: 'Route policy allows access',
  };
}

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(path: string): boolean {
  const publicRoutes = ['/login', '/signup', '/'];
  const publicPrefixes = ['/checkout'];
  return publicRoutes.includes(path) || publicPrefixes.some(p => path.startsWith(p));
}

/**
 * Check if route is therapist-only
 */
function isTherapistRoute(path: string): boolean {
  return path.startsWith('/therapist') || path.startsWith('/dashboard');
}

/**
 * Check if route is patient-only
 */
function isPatientRoute(path: string): boolean {
  const patientRoutes = ['/home', '/onboarding', '/activity', '/profile', '/health'];
  return patientRoutes.some(route => path === route || path.startsWith(route + '/'));
}

/**
 * Get the appropriate home route for a user type
 */
export function getHomeRoute(userType: UserType): string {
  return userType === 'therapist' ? '/therapist/dashboard' : '/home';
}
