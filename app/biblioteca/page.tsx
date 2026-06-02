'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import LibraryExerciseCard from '@/components/library/ExerciseCard'
import { exercises } from '@/lib/data'
import { cn } from '@/lib/utils'

type TrimesterTab = 'Todos' | '1º Trimestre' | '2º Trimestre' | '3º Trimestre'
type SecondaryFilter = 'todos' | 'introducao' | 'educacao' | 'curto' | 'medio' | 'longo' | 'parto' | 'respiracao' | 'pelve' | 'relaxamento'

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
  { id: 'curto', label: '≤ 5 min' },
  { id: 'medio', label: '6–10 min' },
  { id: 'longo', label: '> 10 min' },
  { id: 'parto', label: 'Parto' },
  { id: 'respiracao', label: 'Respiração' },
  { id: 'pelve', label: 'Pelve' },
  { id: 'relaxamento', label: 'Relaxamento' },
]

function matchesTrimester(exTrimester: string, exCategory: string, tab: TrimesterTab): boolean {
  // Always show introduction and education content for all trimesters
  if (exCategory === 'introducao' || exCategory === 'educacao') return true
  if (tab === 'Todos') return true
  return tab.startsWith(exTrimester)
}

function matchesSecondary(category: string, duration: number, filter: SecondaryFilter): boolean {
  switch (filter) {
    case 'todos':
      return true
    case 'introducao':
      return category === 'introducao'
    case 'educacao':
      return category === 'educacao'
    case 'curto':
      return duration <= 5
    case 'medio':
      return duration > 5 && duration <= 10
    case 'longo':
      return duration > 10
    case 'parto':
      return category === 'parto'
    case 'respiracao':
      return category === 'respiracao'
    case 'pelve':
      return category === 'pelve' || category === 'assoalho-pelvico'
    case 'relaxamento':
      return category === 'relaxamento'
    default:
      return true
  }
}

export default function LibraryPage() {
  const [tab, setTab] = useState<TrimesterTab>('Todos')
  const [secondary, setSecondary] = useState<SecondaryFilter>('todos')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q)
      return (
        matchesTrimester(ex.trimester, ex.category, tab) &&
        matchesSecondary(ex.category, ex.duration, secondary) &&
        matchesQuery
      )
    })
  }, [tab, secondary, query])

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
                <LibraryExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
