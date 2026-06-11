import type { Exercise } from './data'

const EXCLUDED_CATEGORIES = ['introducao', 'educacao']

// Category rotation order for interleaving — ensures variety in each daily set
const CATEGORY_ORDER = ['respiracao', 'mobilidade', 'alongamento', 'assoalho-pelvico', 'abdominal']

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function matchesTrimester(exTrimester: string, userTrimester: string): boolean {
  if (exTrimester === userTrimester) return true
  if (exTrimester === '2º-3º' && (userTrimester === '2º' || userTrimester === '3º')) return true
  if (exTrimester === '1º-2º' && (userTrimester === '1º' || userTrimester === '2º')) return true
  return false
}

/**
 * Interleaves exercises round-robin by category so every window of 3 spans
 * at least 2 different categories.
 *
 * Example with resp[3], mob[5], along[2]:
 *   [resp0, mob0, along0, resp1, mob1, along1, resp2, mob2, mob3, mob4]
 */
function buildInterleavedPool(exercises: Exercise[]): Exercise[] {
  // Group into ordered buckets
  const groups: Map<string, Exercise[]> = new Map()
  for (const cat of CATEGORY_ORDER) {
    const items = exercises.filter((ex) => ex.category === cat)
    if (items.length) groups.set(cat, items)
  }
  // Append any category not in the fixed order
  for (const ex of exercises) {
    if (!CATEGORY_ORDER.includes(ex.category) && !groups.has(ex.category)) {
      groups.set(ex.category, exercises.filter((e) => e.category === ex.category))
    }
  }

  const buckets = Array.from(groups.values())
  const maxLen = Math.max(...buckets.map((b) => b.length))
  const pool: Exercise[] = []

  for (let i = 0; i < maxLen; i++) {
    for (const bucket of buckets) {
      if (i < bucket.length) pool.push(bucket[i])
    }
  }

  return pool
}

/**
 * Returns the 3 exercises scheduled for a specific user on a specific date.
 *
 * Properties:
 * - Deterministic: same userId + date always yields the same 3 exercises.
 * - Category variety: pool is interleaved by category (resp, mob, along…).
 * - User diversity: each user starts at a different offset in the pool.
 * - Daily rotation: advances 3 positions per day — no overlap between days.
 * - Cycle inversion: on the second pass through the pool the order reverses,
 *   so repeated exercises feel different rather than looping identically.
 */
export function getDailyExercises(
  userId: string,
  date: string,
  trimester: string,
  allExercises: Exercise[],
  count = 3
): Exercise[] {
  const eligible = allExercises.filter(
    (ex) =>
      !EXCLUDED_CATEGORIES.includes(ex.category) &&
      (matchesTrimester(ex.trimester, trimester) || ex.trimester === 'todos')
  )

  if (eligible.length === 0) return []
  if (eligible.length <= count) return eligible

  const pool = buildInterleavedPool(eligible)

  // User-specific starting offset so two users in the same trimester
  // see a different subset on the same day
  const userOffset = Math.abs(hashCode(userId)) % pool.length

  const d = new Date(date + 'T00:00:00')
  const dayOfYear = getDayOfYear(d)

  // How far into the continuous rotation are we?
  const totalOffset = userOffset + (dayOfYear - 1) * count

  // Which pass through the pool (0 = first, 1 = second, …)
  const cycleIndex = Math.floor(totalOffset / pool.length)
  const posInCycle = totalOffset % pool.length

  // Invert order on odd cycles — exercises repeat but feel like a different sequence
  const orderedPool = cycleIndex % 2 === 0 ? pool : [...pool].reverse()

  return Array.from({ length: count }, (_, i) => orderedPool[(posInCycle + i) % orderedPool.length])
}
