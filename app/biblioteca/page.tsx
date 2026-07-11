'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import LibraryExerciseCard from '@/components/library/ExerciseCard'
import { exercises } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useActivityStore, useUserHeader } from '@/lib/stores/activityStore'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

type TrimesterTab = 'Todos' | '1º Trimestre' | '2º Trimestre' | '3º Trimestre'
type SecondaryFilter = 'todos' | 'introducao' | 'educacao' | 'parto' | 'apoio' | 'meditacao' | 'respiracao' | 'pelve' | 'mobilidade' | 'alongamento' | 'abdominal'

const TRIMESTER_TABS: TrimesterTab[] = [
  'Todos',
  '1º Trimestre',
  '2º Trimestre',
  '3º Trimestre',
]

const SECONDARY_FILTERS: { id: SecondaryFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'introducao', label: 'Introdução' },
  { id: 'educacao', label: 'Educação' },
  { id: 'respiracao', label: 'Respiração' },
  { id: 'mobilidade', label: 'Mobilidade' },
  { id: 'alongamento', label: 'Alongamento' },
  { id: 'pelve', label: 'Pelve' },
  { id: 'abdominal', label: 'Abdominal' },
  { id: 'parto', label: 'Parto' },
  { id: 'apoio', label: 'Apoio' },
  { id: 'meditacao', label: 'Meditação' },
]

function matchesTrimester(exTrimester: string, exCategory: string, tab: TrimesterTab): boolean {
  if (exCategory === 'introducao' || exCategory === 'educacao' || exCategory === 'parto' || exCategory === 'meditacao') return true
  if (tab === 'Todos') return true
  if (exTrimester === 'todos') return true
  if (exTrimester === '2º-3º') return tab === '2º Trimestre' || tab === '3º Trimestre'
  if (exTrimester === '1º-2º') return tab === '1º Trimestre' || tab === '2º Trimestre'
  return tab.startsWith(exTrimester)
}

function matchesSecondary(category: string, filter: SecondaryFilter): boolean {
  switch (filter) {
    case 'todos': return true
    case 'introducao': return category === 'introducao'
    case 'educacao': return category === 'educacao'
    case 'parto': return category === 'parto'
    case 'apoio': return category === 'apoio'
    case 'meditacao': return category === 'meditacao'
    case 'respiracao': return category === 'respiracao'
    case 'pelve': return category === 'pelve' || category === 'assoalho-pelvico'
    case 'mobilidade': return category === 'mobilidade'
    case 'alongamento': return category === 'alongamento'
    case 'abdominal': return category === 'abdominal'
    default: return true
  }
}

const TIMED_LOCKED_CATEGORIES = new Set(['meditacao', 'parto'])
const UNLOCK_DAYS = 7

function daysUnlockRemaining(accountCreatedAt: string | null | undefined): number {
  if (!accountCreatedAt) return 0
  const created = new Date(accountCreatedAt).getTime()
  const elapsed = Math.floor((Date.now() - created) / 86_400_000)
  return Math.max(0, UNLOCK_DAYS - elapsed)
}

function LibraryPageContent() {
  const guardReady = useAuthGuard()
  const searchParams = useSearchParams()
  const initialCat = (searchParams.get('cat') ?? 'todos') as SecondaryFilter
  const [tab, setTab] = useState<TrimesterTab>('Todos')
  const [secondary, setSecondary] = useState<SecondaryFilter>(initialCat)
  const [query, setQuery] = useState('')

  const store = useActivityStore()
  const header = useUserHeader()
  const completedIds = store.activities.map((a) => a.exercise_id)

  const daysLeft = daysUnlockRemaining(store.userProfile?.account_created_at)
  const isCategoryLocked = (category: string) =>
    TIMED_LOCKED_CATEGORIES.has(category) && daysLeft > 0

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q)
      return (
        matchesTrimester(ex.trimester, ex.category, tab) &&
        matchesSecondary(ex.category, secondary) &&
        matchesQuery
      )
    })
  }, [tab, secondary, query])

  if (!guardReady) return <div className="min-h-screen bg-warm-50"><BottomNav /></div>

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <h1 className="text-xl font-bold text-text-primary">Biblioteca</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Exercícios pensados para cada fase da sua gestação
          </p>

          {/* Search */}
          <div className="relative mt-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-full pl-9 pr-3 py-2 bg-warm-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-primary-300"
            />
          </div>

          {/* Trimester tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
            {TRIMESTER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                  tab === t
                    ? 'bg-primary-300 text-white'
                    : 'bg-warm-100 text-text-secondary hover:bg-warm-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Secondary filters */}
          <div className="flex gap-2 mt-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
            {SECONDARY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSecondary(f.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition-colors',
                  secondary === f.id
                    ? 'bg-secondary-100 border-secondary-300 text-secondary-700'
                    : 'bg-white border-warm-200 text-text-secondary hover:border-secondary-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-2xl mx-auto px-5 py-5">
        {/* Banner de categoria bloqueada */}
        {daysLeft > 0 && (secondary === 'meditacao' || secondary === 'parto') && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-xl mt-0.5">🔒</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {secondary === 'meditacao' ? 'Meditação' : 'Parto'} disponível em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Este conteúdo será liberado automaticamente 7 dias após sua inscrição.
              </p>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            <p className="text-4xl mb-3">🔍</p>
            Nenhum exercício encontrado com esses filtros.
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary mb-3">
              {filtered.length} {filtered.length === 1 ? 'exercício' : 'exercícios'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((ex) => (
                <LibraryExerciseCard
                  key={ex.id}
                  exercise={ex}
                  locked={isCategoryLocked(ex.category)}
                  allTimeCompletedIds={completedIds}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-50" />}>
      <LibraryPageContent />
    </Suspense>
  )
}
