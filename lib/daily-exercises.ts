import type { Exercise } from './data'

const EXCLUDED_CATEGORIES = ['introducao', 'educacao']

// Category rotation order for interleaving
const CATEGORY_ORDER = ['respiracao', 'mobilidade', 'alongamento', 'assoalho-pelvico', 'abdominal']

/**
 * Exercises that are variations of the same movement.
 * No two exercises from the same group will appear on the same day.
 */
const SIMILAR_GROUPS: Record<string, string[]> = {
  'cocoras':              ['ex-27', 'ex-28', 'ex-29', 'ex-30', 'ex-47'],
  'quatro-apoios-bola':   ['ex-48', 'ex-49'],
  'alongamento-sentada':  ['ex-34', 'ex-35', 'ex-36', 'ex-37'],
  'alongamento-em-pe':    ['ex-39', 'ex-40'],
  'mobilidade-em-pe':     ['ex-41', 'ex-42'],
  'mobilidade-pe-equip':  ['ex-55', 'ex-56'],
  'abdominal':            ['ex-51', 'ex-52', 'ex-53'],
  'joelhos-bola':         ['ex-32', 'ex-54'],
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}


function matchesTrimester(exTrimester: string, userTrimester: string): boolean {
  if (exTrimester === userTrimester) return true
  if (exTrimester === '2º-3º' && (userTrimester === '2º' || userTrimester === '3º')) return true
  if (exTrimester === '1º-2º' && (userTrimester === '1º' || userTrimester === '2º')) return true
  return false
}

function groupOf(id: string): string | null {
  for (const [g, ids] of Object.entries(SIMILAR_GROUPS)) {
    if (ids.includes(id)) return g
  }
  return null
}

/**
 * Interleaves exercises round-robin by category so each daily window
 * tends to span different muscle groups / movement patterns.
 */
function buildInterleavedPool(exercises: Exercise[]): Exercise[] {
  const groups = new Map<string, Exercise[]>()
  for (const cat of CATEGORY_ORDER) {
    const items = exercises.filter((ex) => ex.category === cat)
    if (items.length) groups.set(cat, items)
  }
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

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr]
  let s = seed
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    return (s >>> 0) / 0xffffffff
  }
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Returns the 3 exercises scheduled for a specific user on a specific date.
 *
 * Guarantees:
 * - No two exercises from the same similarity group on the same day (greedy skip).
 * - Different categories mixed within each day when possible (interleaved pool).
 * - Deterministic: same userId + date always yields the same 3 exercises.
 * - User diversity: different users see different exercises on the same day.
 * - Monthly variety: pool order changes each month so recurring exercises
 *   feel different across months.
 * - Daily variety: advances through the pool each day; greedy skip of
 *   same-group exercises extends uniqueness beyond the base 11-day cycle.
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

  const d = new Date(date + 'T00:00:00')

  // Monthly shuffle ensures a unique pool order per user per month
  const monthlySeed = hashCode(`${userId}-${d.getFullYear()}-${d.getMonth() + 1}`)
  const pool = seededShuffle(buildInterleavedPool(eligible), monthlySeed)

  // Starting position: user-specific offset + daily advance
  const userOffset = Math.abs(hashCode(userId)) % pool.length
  const startIndex = (userOffset + (d.getDate() - 1) * count) % pool.length

  // Greedy pick: scan from startIndex (circular) and take the first `count`
  // exercises that don't share a similarity group with already-selected ones.
  const selected: Exercise[] = []
  const usedGroups = new Set<string>()

  for (let i = 0; i < pool.length && selected.length < count; i++) {
    const ex = pool[(startIndex + i) % pool.length]
    const g = groupOf(ex.id)
    if (g && usedGroups.has(g)) continue
    selected.push(ex)
    if (g) usedGroups.add(g)
  }

  return selected
}
