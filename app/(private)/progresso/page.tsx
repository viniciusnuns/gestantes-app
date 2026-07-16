'use client'

import { useState, useEffect } from 'react'
import { Star, Check, Lock, Crown, History, Share2 } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import { achievements, type Achievement } from '@/lib/data'
import AchievementModal from '@/components/AchievementModal'
import RatingCard from '@/components/feedback/RatingCard'
import NPSCard from '@/components/feedback/NPSCard'
import { cn, formatDateStringBR, getLocalDateBR, getDefaultAvatar } from '@/lib/utils'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
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
  const guardReady = useAuthGuard()
  const [tab, setTab] = useState<TabId>('ranking')
  const header = useUserHeader()
  const stats = useUserStats()
  const ranking = useRanking()
  const activities = useActivityHistory()
  const currentUser = getCurrentUser()

  // Get this week's active days (Sunday to Saturday)
  const today = new Date()
  const todayStr = getLocalDateBR(today)

  // Calculate week start (Sunday of current week)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = getLocalDateBR(weekStart)

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

  if (!guardReady) return <div className="min-h-screen bg-warm-50"><BottomNav /></div>

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
        {tab === 'conquistas' && <AchievementsTab userId={currentUser?.id} userName={header.name} activeDays={stats.active_days} />}
        {tab === 'historico' && (
          <HistoryTab activities={activities} stats={stats} userName={header.name} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

/* ---------------- Ranking Tab ---------------- */
type RankingView = 'semanal' | 'mensal' | 'geral'

const RANKING_VIEWS: { id: RankingView; label: string; hint: string }[] = [
  { id: 'semanal', label: '🗓 Semana',  hint: 'Reinicia toda segunda-feira' },
  { id: 'mensal',  label: '📅 Mês',     hint: 'Reinicia no 1º de cada mês' },
  { id: 'geral',   label: '🏆 Geral',   hint: 'Pontuação acumulada total' },
]

function getPeriodStart(view: RankingView): string {
  const today = new Date()
  if (view === 'semanal') {
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    return getLocalDateBR(monday)
  }
  if (view === 'mensal') {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  }
  return '2000-01-01'
}

function RankingTab({
  ranking,
  userPosition,
  userId,
}: {
  ranking: any[]
  userPosition: number
  userId?: string
  userName: string
}) {
  const [view, setView] = useState<RankingView>('geral')
  const [periodRanking, setPeriodRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (view === 'geral') { setLoading(false); return }

    const fetch = async () => {
      setLoading(true)
      try {
        const startStr = getPeriodStart(view)
        const todayStr = getLocalDateBR()

        const { data, error } = await supabase
          .from('user_activity_history')
          .select('user_id, points_earned, activity_date')
          .gte('activity_date', startStr)
          .lte('activity_date', todayStr)

        if (error || !data) return

        const byUser: Record<string, { points: number; days: Set<string> }> = {}
        for (const row of data) {
          if (!byUser[row.user_id]) byUser[row.user_id] = { points: 0, days: new Set() }
          byUser[row.user_id].points += row.points_earned ?? 0
          byUser[row.user_id].days.add(row.activity_date)
        }

        const nameMap: Record<string, string> = {}
        for (const r of ranking) nameMap[r.user_id] = r.name

        // Busca nomes de usuárias que têm atividades no período mas não estão no top 20 geral
        const missingIds = Object.keys(byUser).filter(id => !nameMap[id])
        if (missingIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, name')
            .in('id', missingIds)
          if (usersData) {
            for (const u of usersData) nameMap[u.id] = u.name || ''
          }
        }

        setPeriodRanking(
          Object.entries(byUser)
            .map(([user_id, { points, days }]) => ({
              user_id,
              name: nameMap[user_id] || '',
              points,
              days: days.size,
            }))
            .sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points
              if (a.user_id === userId) return -1
              if (b.user_id === userId) return 1
              return 0
            })
        )
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [view, ranking, userId])

  useEffect(() => {
    const ids = ranking.map(r => r.user_id)
    if (ids.length === 0) return
    supabase
      .from('users')
      .select('id, avatar_url')
      .in('id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string | null> = {}
        for (const u of data) map[u.id] = u.avatar_url
        setAvatarMap(map)
      })
  }, [ranking])

  const currentHint = RANKING_VIEWS.find(v => v.id === view)!.hint

  // Entries and position logic per view
  const entries = view === 'geral'
    ? ranking.map(r => ({ user_id: r.user_id, name: r.name || '', points: r.total_points, days: r.active_days }))
    : periodRanking

  const getPosition = (points: number) => entries.filter(r => r.points > points).length + 1
  const myEntry = entries.find(r => r.user_id === userId)
  const myPosition = myEntry ? getPosition(myEntry.points) : (view === 'geral' ? userPosition : 0)

  return (
    <section>
      {/* Sub-tabs */}
      <div className="flex gap-1.5 mb-3">
        {RANKING_VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors',
              view === id
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-text-secondary hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <ul>
          {loading ? (
            <li className="flex items-center justify-center py-6 text-sm text-text-secondary">
              Carregando...
            </li>
          ) : entries.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-8 text-sm text-text-secondary gap-1">
              <span className="text-2xl">💪</span>
              Nenhuma prática neste período ainda
            </li>
          ) : (
            entries.map((r) => {
              const isMe = userId && r.user_id === userId
              const position = getPosition(r.points)
              const isPodium = position <= 3
              return (
                <li
                  key={r.user_id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border-b border-warm-100 last:border-b-0',
                    isMe && 'bg-primary-50'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    isPodium ? 'bg-accent-300 text-white' : 'bg-warm-200 text-text-secondary'
                  )}>
                    {isPodium ? <Crown size={14} /> : position}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarMap[r.user_id] || getDefaultAvatar(r.user_id)}
                    alt={r.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm truncate',
                      isMe ? 'font-bold text-primary-600' : 'font-semibold text-text-primary'
                    )}>
                      {r.name} {isMe && '(você)'}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {r.days} dia{r.days !== 1 ? 's' : ''} ativo{r.days !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-text-primary">{r.points}</p>
                    <p className="text-[10px] text-text-light uppercase">pts</p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </Card>

      <p className="text-[11px] text-text-light text-center mt-3">
        {myPosition > 0 ? `Você está na posição #${myPosition} · ` : ''}{currentHint}
      </p>
    </section>
  )
}

/* ---------------- Achievements Tab ---------------- */
function AchievementsTab({ userId, userName, activeDays }: { userId?: string; userName: string; activeDays: number }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Achievement | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [showNPS, setShowNPS] = useState(false)

  useEffect(() => {
    const loadUnlockedAchievements = async () => {
      if (!userId) { setIsLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', userId)
        if (error) return
        setUnlockedAchievements((data || []).map((a: any) => a.achievement_id))
      } finally {
        setIsLoading(false)
      }
    }
    loadUnlockedAchievements()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const npsKey = `nps_shown_${userId}`
    const ratingKey = `rating_shown_${userId}`
    if (activeDays >= 5 && !localStorage.getItem(npsKey)) {
      setShowNPS(true)
    } else if (activeDays >= 3 && !localStorage.getItem(ratingKey)) {
      setShowRating(true)
    }
  }, [userId, activeDays])

  const handleDismissNPS = () => {
    if (userId) localStorage.setItem(`nps_shown_${userId}`, '1')
    setShowNPS(false)
  }

  const handleDismissRating = () => {
    if (userId) localStorage.setItem(`rating_shown_${userId}`, '1')
    setShowRating(false)
  }

  return (
    <section>
      {selected && (
        <AchievementModal achievement={selected} onClose={() => setSelected(null)} />
      )}

      {showNPS && userId && (
        <div className="mb-4">
          <NPSCard userId={userId} userName={userName} onDismiss={handleDismissNPS} />
        </div>
      )}

      {!showNPS && showRating && userId && (
        <div className="mb-4">
          <RatingCard userId={userId} userName={userName} onDismiss={handleDismissRating} />
        </div>
      )}

      <h2 className="font-semibold text-text-primary mb-3 px-1">
        Suas conquistas
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => {
          const isUnlocked = unlockedAchievements.includes(a.id)
          return (
            <button
              key={a.id}
              onClick={() => isUnlocked && setSelected(a)}
              disabled={!isUnlocked}
              className={cn(
                'text-left w-full',
                !isUnlocked && 'cursor-default'
              )}
            >
              <Card
                className={cn(
                  '!p-4 text-center transition-all',
                  isUnlocked && 'hover:shadow-md hover:-translate-y-0.5 active:scale-95',
                  !isUnlocked && 'opacity-60'
                )}
              >
                <div className="relative inline-flex">
                  <span className="text-4xl">{a.icon}</span>
                  {!isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-warm-200 text-text-secondary flex items-center justify-center">
                      <Lock size={10} />
                    </span>
                  )}
                  {isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
                      <Share2 size={9} />
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-text-primary mt-2">
                  {a.name}
                </h3>
                <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                  {a.description}
                </p>
                {isUnlocked && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 uppercase">
                    Desbloqueada
                  </span>
                )}
              </Card>
            </button>
          )
        })}
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
