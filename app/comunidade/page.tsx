'use client'

import { useMemo, useState } from 'react'
import { PenSquare } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import PostCard from '@/components/community/PostCard'
import { communityPosts } from '@/lib/data'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: '1º trimestre', label: '1º trim.' },
  { id: '2º trimestre', label: '2º trim.' },
  { id: '3º trimestre', label: '3º trim.' },
  { id: 'pós-parto', label: 'Pós-parto' },
  { id: 'trabalho-parto', label: 'Trabalho de parto' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CommunityPage() {
  const [tab, setTab] = useState<TabId>('todas')

  const filtered = useMemo(() => {
    if (tab === 'todas') return communityPosts
    return communityPosts.filter((p) => p.category === tab)
  }, [tab])

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Comunidade</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Conversas entre gestantes em movimento
              </p>
            </div>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-primary-300 text-white flex items-center justify-center hover:bg-primary-400 shadow-sm"
              aria-label="Criar publicação"
            >
              <PenSquare size={18} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto -mx-1 px-1 pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                  tab === t.id
                    ? 'bg-secondary-300 text-white'
                    : 'bg-warm-100 text-text-secondary hover:bg-warm-200'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            <p className="text-4xl mb-3">💬</p>
            Ainda não há posts nessa categoria.
            <br />
            Seja a primeira a compartilhar!
          </div>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>

      <BottomNav />
    </div>
  )
}
