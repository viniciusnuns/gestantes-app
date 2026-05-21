'use client'

import { useState } from 'react'
import { Star, Check, Lock, Crown, History } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import { achievements, ranking, currentUser } from '@/lib/data'
import { useProgress, getWeekActivity } from '@/lib/useProgress'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'conquistas', label: 'Conquistas' },
  { id: 'historico', label: 'Histórico' },
] as const

type TabId = (typeof TABS)[number]['id']

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export default function ProgressPage() {
  const [tab, setTab] = useState<TabId>('ranking')
  const { state, hydrated } = useProgress()

  const week = hydrated ? getWeekActivity(state.activeDays) : new Array(7).fill(false)
  const activeCount = week.filter(Boolean).length
  const userPosition = ranking.find((r) => r.name === 'Você')?.position ?? 4

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="gradient-primary text-white px-5 pt-8 pb-12 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-wider opacity-90">
            Seus pontos
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star size={28} className="text-accent-300" fill="currentColor" />
            <span className="text-5xl font-bold">{state.points}</span>
          </div>
          <p className="text-sm opacity-90 mt-2">
            Posição #{userPosition} no ranking · {state.activeDays.length || 0} dias ativos
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 -mt-8 space-y-5">
        {/* Week activity */}
        <Card className="!p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-text-primary">Esta semana</h2>
            <span className="text-xs text-text-secondary">
              {activeCount}/7 dias
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((active, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                    active
                      ? 'bg-primary-300 text-white'
                      : 'bg-warm-100 text-text-light'
                  )}
                >
                  {active ? <Check size={16} strokeWidth={3} /> : null}
                </div>
                <span className="text-[10px] font-semibold text-text-secondary">
                  {WEEK_LABELS[idx]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 bg-warm-100 p-1 rounded-xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-colors',
                tab === t.id
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'ranking' && <RankingTab userPosition={userPosition} />}
        {tab === 'conquistas' && <AchievementsTab />}
        {tab === 'historico' && (
          <HistoryTab activeDays={state.activeDays} points={state.points} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

/* ---------------- Ranking Tab ---------------- */
function RankingTab({ userPosition }: { userPosition: number }) {
  return (
    <section>
      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Top gestantes da semana
      </h2>
      <Card className="!p-0 overflow-hidden">
        <ul>
          {ranking.map((r, idx) => {
            const isMe = r.name === 'Você'
            const isPodium = r.position <= 3
            return (
              <li
                key={r.position}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border-b border-warm-100 last:border-b-0',
                  isMe && 'bg-primary-50'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    isPodium
                      ? 'bg-accent-300 text-white'
                      : 'bg-warm-200 text-text-secondary'
                  )}
                >
                  {isPodium ? <Crown size={14} /> : r.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm truncate',
                      isMe ? 'font-bold text-primary-600' : 'font-semibold text-text-primary'
                    )}
                  >
                    {r.name} {isMe && '(você)'}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {r.streak} dias seguidos
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-text-primary">
                    {r.points}
                  </p>
                  <p className="text-[10px] text-text-light uppercase">pts</p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
      <p className="text-[11px] text-text-light text-center mt-3">
        Você está na posição #{userPosition} · continue praticando!
      </p>
    </section>
  )
}

/* ---------------- Achievements Tab ---------------- */
function AchievementsTab() {
  return (
    <section>
      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Suas conquistas
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <Card
            key={a.id}
            className={cn(
              '!p-4 text-center',
              !a.unlocked && 'opacity-60'
            )}
          >
            <div className="relative inline-flex">
              <span className="text-4xl">{a.icon}</span>
              {!a.unlocked && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-warm-200 text-text-secondary flex items-center justify-center">
                  <Lock size={10} />
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-text-primary mt-2">
              {a.name}
            </h3>
            <p className="text-[11px] text-text-secondary mt-1 leading-snug">
              {a.description}
            </p>
            {a.unlocked && (
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 uppercase">
                Desbloqueada
              </span>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}

/* ---------------- History Tab ---------------- */
function HistoryTab({
  activeDays,
  points,
}: {
  activeDays: string[]
  points: number
}) {
  const recent = [...activeDays].sort().reverse().slice(0, 10)

  return (
    <section>
      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Histórico recente
      </h2>
      <Card className="!p-5">
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-500">{points}</p>
            <p className="text-[11px] text-text-secondary">pontos totais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-500">
              {activeDays.length}
            </p>
            <p className="text-[11px] text-text-secondary">dias totais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-500">
              {Math.floor(points / 20)}
            </p>
            <p className="text-[11px] text-text-secondary">práticas</p>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-6">
            <History size={28} className="mx-auto mb-2 opacity-50" />
            Nenhuma prática registrada ainda.
            <br />
            Comece pela aba <span className="font-semibold">Biblioteca</span>!
          </div>
        ) : (
          <ul className="space-y-2 border-t border-warm-100 pt-3">
            {recent.map((day) => (
              <li
                key={day}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-text-primary">
                    {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </span>
                <span className="text-xs text-text-secondary">Ativa</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-[11px] text-text-light text-center mt-3">
        Usuária: {currentUser.name} · semana {currentUser.week}
      </p>
    </section>
  )
}
