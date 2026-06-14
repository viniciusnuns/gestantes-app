export const INTRO_VIDEOS = ['ex-0', 'ex-10', 'ex-11', 'ex-12'] as const

export const TRIMESTER_WELCOME: Record<string, string> = {
  '1º': 'ex-13',
  '2º': 'ex-14',
  '3º': 'ex-15',
}

export const EDUCATION_VIDEOS = [
  'ex-16', 'ex-17', 'ex-18', 'ex-19', 'ex-20', 'ex-21', 'ex-60',
] as const

export const PARTO_VIDEOS = [
  'ex-61', 'ex-62', 'ex-63', 'ex-64', 'ex-65', 'ex-66', 'ex-67', 'ex-68', 'ex-69', 'ex-70',
] as const

export type TrailStatus =
  | { type: 'initial'; nextVideoId: string; done: number; total: 5 }
  | { type: 'transition'; nextVideoId: string; trimester: string }
  | null

export function getTrailStatus(completedIds: string[], trimester: string): TrailStatus {
  // Phase 1: Intro videos must be watched in order
  const nextIntro = INTRO_VIDEOS.find((id) => !completedIds.includes(id))
  if (nextIntro) {
    return {
      type: 'initial',
      nextVideoId: nextIntro,
      done: INTRO_VIDEOS.indexOf(nextIntro),
      total: 5,
    }
  }

  // Phase 2: Current trimester welcome
  const welcomeId = TRIMESTER_WELCOME[trimester]
  if (welcomeId && !completedIds.includes(welcomeId)) {
    const hasWatchedAnyWelcome = Object.values(TRIMESTER_WELCOME).some((id) =>
      completedIds.includes(id)
    )
    if (hasWatchedAnyWelcome) {
      // Trimester transition — user already completed initial trail
      return { type: 'transition', nextVideoId: welcomeId, trimester }
    }
    // Still on the initial trail (step 5/5)
    return { type: 'initial', nextVideoId: welcomeId, done: 4, total: 5 }
  }

  return null
}

// Calendar is unlocked once the 5-video initial trail is complete
export function isCalendarUnlocked(completedIds: string[]): boolean {
  const allIntroWatched = INTRO_VIDEOS.every((id) => completedIds.includes(id))
  const anyWelcomeWatched = Object.values(TRIMESTER_WELCOME).some((id) =>
    completedIds.includes(id)
  )
  return allIntroWatched && anyWelcomeWatched
}

// Returns the next trail video ID, or null if current video is the last one
export function getNextTrailVideoId(currentId: string, trimester: string): string | null {
  const trailOrder = [...INTRO_VIDEOS, TRIMESTER_WELCOME[trimester]].filter(Boolean)
  const idx = trailOrder.indexOf(currentId)
  if (idx === -1) return undefined as unknown as null // not a trail video
  if (idx === trailOrder.length - 1) return null // last video — trail done
  return trailOrder[idx + 1]
}

// Returns true if the given exercise ID is part of the initial trail
export function isTrailVideo(id: string): boolean {
  return (INTRO_VIDEOS as readonly string[]).includes(id) ||
    Object.values(TRIMESTER_WELCOME).includes(id)
}

// Returns the next education video ID in sequence, or null if last
export function getNextEducationVideoId(currentId: string): string | null {
  const idx = (EDUCATION_VIDEOS as readonly string[]).indexOf(currentId)
  if (idx === -1) return undefined as unknown as null
  if (idx === EDUCATION_VIDEOS.length - 1) return null
  return EDUCATION_VIDEOS[idx + 1]
}

// Returns true if the given exercise ID is an education video
export function isEducationVideo(id: string): boolean {
  return (EDUCATION_VIDEOS as readonly string[]).includes(id)
}

// Returns status for the education trail (next unwatched video)
export type EducationTrailStatus = {
  nextVideoId: string
  done: number
  total: number
} | null

export function getEducationTrailStatus(completedIds: string[]): EducationTrailStatus {
  const nextVideo = EDUCATION_VIDEOS.find((id) => !completedIds.includes(id))
  if (!nextVideo) return null
  return {
    nextVideoId: nextVideo,
    done: EDUCATION_VIDEOS.indexOf(nextVideo),
    total: EDUCATION_VIDEOS.length,
  }
}

export function getEducationProgress(completedIds: string[]): { done: number; total: number } {
  const done = EDUCATION_VIDEOS.filter((id) => completedIds.includes(id)).length
  return { done, total: EDUCATION_VIDEOS.length }
}

// ─── Parto trail ──────────────────────────────────────────────────────────────

export function isPartoUnlocked(weekNumber: number): boolean {
  return weekNumber >= 30
}

export type PartoTrailStatus = {
  nextVideoId: string
  done: number
  total: number
} | null

export function getPartoTrailStatus(completedIds: string[], weekNumber: number): PartoTrailStatus {
  if (!isPartoUnlocked(weekNumber)) return null
  const nextVideo = PARTO_VIDEOS.find((id) => !completedIds.includes(id))
  if (!nextVideo) return null
  return {
    nextVideoId: nextVideo,
    done: (PARTO_VIDEOS as readonly string[]).indexOf(nextVideo),
    total: PARTO_VIDEOS.length,
  }
}

export function isPartoVideo(id: string): boolean {
  return (PARTO_VIDEOS as readonly string[]).includes(id)
}

export function getNextPartoVideoId(currentId: string): string | null {
  const idx = (PARTO_VIDEOS as readonly string[]).indexOf(currentId)
  if (idx === -1) return undefined as unknown as null
  if (idx === PARTO_VIDEOS.length - 1) return null
  return PARTO_VIDEOS[idx + 1]
}

export function getPartoProgress(completedIds: string[]): { done: number; total: number } {
  const done = PARTO_VIDEOS.filter((id) => completedIds.includes(id)).length
  return { done, total: PARTO_VIDEOS.length }
}
