'use client'

import { useState, useEffect } from 'react'
import {
  getOverviewStats,
  getTrimesterStats,
  getTopAchievements,
  getActivityStats,
  getUsersList,
  OverviewStats as Stats,
  TrimesterStat,
  Achievement,
  ActivityStat,
  UserListItem,
} from '@/lib/admin-client'
import { getAchievementName, getAchievementEmoji } from '@/lib/achievements-map'
import { OverviewStats } from './components/OverviewStats'
import { UsersList } from './components/UsersList'

export default function AdminDashboard() {
  const [overviewStats, setOverviewStats] = useState<Stats | null>(null)
  const [trimesterStats, setTrimesterStats] = useState<TrimesterStat[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStat | null>(null)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60_000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading((prev) => prev) // keep spinner only on first load
      const [overview, trimester, topAch, activity, usersList] = await Promise.all([
        getOverviewStats(),
        getTrimesterStats(),
        getTopAchievements(),
        getActivityStats(),
        getUsersList(50, 0),
      ])

      setOverviewStats(overview)
      setTrimesterStats(trimester)
      setAchievements(topAch)
      setActivityStats(activity)
      setUsers(usersList.users)
      setTotalUsers(usersList.total_count)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      {overviewStats && <OverviewStats data={overviewStats} />}

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trimester Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Por Trimestre
          </h3>
          <div className="space-y-3">
            {trimesterStats.map((stat) => (
              <div key={stat.trimester} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {stat.trimester}º trimestre
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {stat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Achievements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conquistas Populares
          </h3>
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div key={ach.achievement_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getAchievementEmoji(ach.achievement_id)}</span>
                  <span className="text-sm text-gray-700 truncate">
                    {getAchievementName(ach.achievement_id)}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {ach.users_count} usuárias
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Metrics */}
        {activityStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atividade Média
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 uppercase">Dias Ativos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activityStats.avg_active_days}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Pontos Médios</p>
                <p className="text-2xl font-bold text-green-600">
                  {activityStats.avg_points}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Mediana de Pontos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activityStats.median_points}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <UsersList initialUsers={users} totalCount={totalUsers} />
    </div>
  )
}
