'use client'

import { useState } from 'react'
import { Star, Check, Lock, Crown, History } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import { achievements } from '@/lib/data'
import { cn, formatDateStringBR } from '@/lib/utils'
import { useActivityInit } from '@/lib/hooks/useActivityInit'
import { getCurrentUser } from '@/lib/customAuth'
import {
  useUserHeader,
  useUserStats,
  useRanking,
  useActivityHistory,
} from '@/lib/stores/activityStore'

const TABS = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'conquistas', label: 'Conquistas' },
  { id: 'historico', label: 'Histórico' },
] as const

type TabId = (typeof TABS)[number]['id']

const WEEK_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function ProgressPage() {
  useActivityInit()

  const [tab, setTab] = useState<TabId>('ranking')
  const header = useUserHeader()
  const stats = useUserStats()
  const ranking = useRanking()
  const activities = useActivityHistory()
  const currentUser = getCurrentUser()

  // Get this week's active days (Sunday to Saturday)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Calculate week start (Sunday of current week)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const weekActiveDays = new Array(7).fill(false)
  activities.forEach((activity) => {
    const actDateStr = activity.activity_date
    // Check if activity is within this week
    if (actDateStr >= weekStartStr && actDateStr <= todayStr) {
      const actDate = new Date(actDateStr + 'T00:00:00')
      const dayIndex = actDate.getDay()
      weekActiveDays[dayIndex] = true
    }
  })

  const activeCount = weekActiveDays.filter(Boolean).length
  const userInRanking = currentUser ? ranking.find((r) => r.user_id === currentUser.id) : null

  // Calculate friendly position: count how many users have MORE points than current user
  const userPositionFriendly = stats.total_points > 0
    ? ranking.filter(r => r.total_points > stats.total_points).length + 1
    : 0

  // For ranking list, sort to show current user first among those with same points
  const sortedRanking = [...ranking].sort((a, b) => {
    const sameTotalPoints = a.total_points === b.total_points
    if (sameTotalPoints && currentUser) {
      if (a.user_id === currentUser.id) return -1
      if (b.user_id === currentUser.id) return 1
    }
    return 0
  })

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
            <span className="text-5xl font-bold">{stats.total_points}</span>
          </div>
          <p className="text-sm opacity-90 mt-2">
            Posição #{userPositionFriendly} no ranking · {stats.active_days} dias ativos
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
            {weekActiveDays.map((active, idx) => (
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
        {tab === 'ranking' && (
          <RankingTab ranking={sortedRanking} userPosition={userPositionFriendly} userId={currentUser?.id} userName={header.name} />
        )}
        {tab === 'conquistas' && <AchievementsTab />}
        {tab === 'historico' && (
          <HistoryTab activities={activities} stats={stats} userName={header.name} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

/* ---------------- Ranking Tab ---------------- */
function RankingTab({
  ranking,
  userPosition,
  userId,
  userName,
}: {
  ranking: any[]
  userPosition: number
  userId?: string
  userName: string
}) {
  // Calculate position for each entry based on how many have more points
  const getPositionForPoints = (points: number) => {
    return ranking.filter(r => r.total_points > points).length + 1
  }

  return (
    <section>
      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Ranking de gestantes
      </h2>
      <Card className="!p-0 overflow-hidden">
        <ul>
          {ranking.length === 0 ? (
            <li className="flex items-center justify-center py-6 text-sm text-text-secondary">
              Nenhum dado de ranking ainda
            </li>
          ) : (
            ranking.map((r) => {
              const isMe = userId && r.user_id === userId
              const position = getPositionForPoints(r.total_points)
              const isPodium = position <= 3
              return (
                <li
                  key={r.user_id}
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
                    {isPodium ? <Crown size={14} /> : position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        isMe ? 'font-bold text-primary-600' : 'font-semibold text-text-primary'
                      )}
                    >
                      {r.name || 'Anônima'} {isMe && '(você)'}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {r.active_days} dias ativos
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-text-primary">
                      {r.total_points}
                    </p>
                    <p className="text-[10px] text-text-light uppercase">pts</p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </Card>
      {userPosition > 0 && (
        <p className="text-[11px] text-text-light text-center mt-3">
          Você está na posição #{userPosition} · continue praticando!
        </p>
      )}
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
  activities,
  stats,
  userName,
}: {
  activities: any[]
  stats: any
  userName: string
}) {
  // Get unique dates sorted in reverse (most recent first)
  const dateSet = new Set(activities.map((a) => a.activity_date))
  const uniqueDates = Array.from(dateSet).sort().reverse().slice(0, 10)

  return (
    <section>
      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Histórico recente
      </h2>
      <Card className="!p-5">
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-500">{stats.total_points}</p>
            <p className="text-[11px] text-text-secondary">pontos totais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-500">
              {stats.active_days}
            </p>
            <p className="text-[11px] text-text-secondary">dias totais</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-500">
              {stats.total_completions}
            </p>
            <p className="text-[11px] text-text-secondary">práticas</p>
          </div>
        </div>

        {uniqueDates.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-6">
            <History size={28} className="mx-auto mb-2 opacity-50" />
            Nenhuma prática registrada ainda.
            <br />
            Comece pela aba <span className="font-semibold">Biblioteca</span>!
          </div>
        ) : (
          <ul className="space-y-2 border-t border-warm-100 pt-3">
            {uniqueDates.map((date) => {
              const count = activities.filter((a) => a.activity_date === date).length
              return (
                <li
                  key={date}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" />
                    <span className="text-text-primary">
                      {formatDateStringBR(date)}
                    </span>
                  </span>
                  <span className="text-xs text-text-secondary">
                    {count} prática{count !== 1 ? 's' : ''}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <p className="text-[11px] text-text-light text-center mt-3">
        Usuária: {userName}
      </p>
    </section>
  )
}
