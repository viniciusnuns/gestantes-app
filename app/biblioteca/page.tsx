'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import LibraryExerciseCard from '@/components/library/ExerciseCard'
import { exercises } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useActivityStore } from '@/lib/stores/activityStore'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

type TrimesterTab = 'Todos' | '1º Trimestre' | '2º Trimestre' | '3º Trimestre'
type CategoryFilter = 'todos' | 'introducao' | 'educacao' | 'parto' | 'apoio' | 'meditacao' | 'respiracao' | 'pelve' | 'mobilidade' | 'alongamento' | 'abdominal'

const TRIMESTER_TABS: TrimesterTab[] = [
  'Todos',
  '1º Trimestre',
  '2º Trimestre',
  '3º Trimestre',
]

const CATEGORY_GRID = [
  { id: 'introducao' as CategoryFilter, label: 'Introdução', emoji: '🎬', unit: 'vídeos' },
  { id: 'educacao' as CategoryFilter, label: 'Educação', emoji: '📚', unit: 'vídeos' },
  { id: 'mobilidade' as CategoryFilter, label: 'Mobilidade', emoji: '💪', unit: 'ex.' },
  { id: 'alongamento' as CategoryFilter, label: 'Alongamento', emoji: '🤸', unit: 'ex.' },
  { id: 'respiracao' as CategoryFilter, label: 'Respiração', emoji: '🫁', unit: 'ex.' },
  { id: 'pelve' as CategoryFilter, label: 'Pelve', emoji: '🦋', unit: 'ex.' },
  { id: 'abdominal' as CategoryFilter, label: 'Abdominal', emoji: '🏋️', unit: 'ex.' },
  { id: 'meditacao' as CategoryFilter, label: 'Meditação', emoji: '🧘', unit: 'vídeos', locked: true },
  { id: 'parto' as CategoryFilter, label: 'Parto', emoji: '🤱', unit: 'vídeos', locked: true },
] as const

const TIMED_LOCKED_CATEGORIES = new Set(['meditacao', 'parto'])
const UNLOCK_DAYS = 7

function daysUnlockRemaining(accountCreatedAt: string | null | undefined): number {
  if (!accountCreatedAt) return 0
  const elapsed = Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / 86_400_000)
  return Math.max(0, UNLOCK_DAYS - elapsed)
}

function matchesTrimester(exTrimester: string, exCategory: string, tab: TrimesterTab): boolean {
  if (exCategory === 'introducao' || exCategory === 'educacao' || exCategory === 'parto' || exCategory === 'meditacao') return true
  if (tab === 'Todos') return true
  if (exTrimester === 'todos') return true
  if (exTrimester === '2º-3º') return tab === '2º Trimestre' || tab === '3º Trimestre'
  if (exTrimester === '1º-2º') return tab === '1º Trimestre' || tab === '2º Trimestre'
  return tab.startsWith(exTrimester)
}

function matchesCategory(category: string, filter: CategoryFilter): boolean {
  if (filter === 'todos') return true
  if (filter === 'pelve') return category === 'pelve' || category === 'assoalho-pelvico'
  return category === filter
}

function LibraryPageContent() {
  const guardReady = useAuthGuard()
  const searchParams = useSearchParams()
  const initialCat = (searchParams.get('cat') ?? 'todos') as CategoryFilter
  const [tab, setTab] = useState<TrimesterTab>('Todos')
  const [category, setCategory] = useState<CategoryFilter>(initialCat)
  const [query, setQuery] = useState('')

  const store = useActivityStore()
  const completedIds = store.activities.map((a) => a.exercise_id)

  const daysLeft = daysUnlockRemaining(store.userProfile?.account_created_at)
  const isCategoryLocked = (catId: string) => TIMED_LOCKED_CATEGORIES.has(catId) && daysLeft > 0

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    exercises.forEach((ex) => {
      const key = ex.category === 'assoalho-pelvico' ? 'pelve' : ex.category
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [])

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q)
      return (
        matchesTrimester(ex.trimester, ex.category, tab) &&
        matchesCategory(ex.category, category) &&
        matchesQuery
      )
    })
  }, [tab, category, query])

  const selectedCatData = CATEGORY_GRID.find((c) => c.id === category)

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
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-5">
        {/* Category grid — hidden during search */}
        {!query && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-secondary mb-3">Escolha uma categoria</p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORY_GRID.map((cat) => {
                const locked = isCategoryLocked(cat.id)
                const isSelected = category === cat.id
                const count = categoryCounts[cat.id] || 0

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(isSelected ? 'todos' : cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                      isSelected
                        ? 'bg-primary-50 border-primary-300 shadow-sm'
                        : 'bg-white border-warm-100 hover:border-warm-200 active:bg-warm-50',
                      locked && 'opacity-60'
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className={cn(
                      'text-xs font-bold text-center leading-tight',
                      isSelected ? 'text-primary-600' : 'text-text-primary',
                      locked && 'text-text-secondary'
                    )}>
                      {cat.label}
                    </span>
                    {locked ? (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                        🔒 {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-secondary">
                        {count} {cat.unit}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            <p className="text-4xl mb-3">🔍</p>
            Nenhum exercício encontrado com esses filtros.
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary mb-3">
              {selectedCatData && category !== 'todos'
                ? `${selectedCatData.label} · ${filtered.length} ${filtered.length === 1 ? 'item' : 'itens'}`
                : `${filtered.length} ${filtered.length === 1 ? 'exercício' : 'exercícios'}`}
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
