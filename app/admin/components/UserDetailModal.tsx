'use client'

import { useState, useEffect } from 'react'
import { getUserDetail, resetUserPassword, UserDetail } from '@/lib/admin-client'
import { getAchievementName, getAchievementEmoji } from '@/lib/achievements-map'

interface UserDetailModalProps {
  userId: string
  onClose: () => void
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [removingAch, setRemovingAch] = useState<string | null>(null)

  const handleRemoveAchievement = async (achievementId: string) => {
    if (!confirm(`Remover conquista "${getAchievementName(achievementId)}"?`)) return
    setRemovingAch(achievementId)
    try {
      await fetch('/api/achievements/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, achievementId }),
      })
      setData((prev) => prev ? {
        ...prev,
        achievements: prev.achievements.filter((a) => a.achievement_id !== achievementId),
      } : prev)
    } finally {
      setRemovingAch(null)
    }
  }
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchUserDetail()
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      const detail = await getUserDetail(userId)
      setData(detail)
    } catch (err) {
      setError('Erro ao carregar detalhes do usuário')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      setResetting(true)
      await resetUserPassword(userId)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Erro ao resetar senha')
      console.error(err)
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!data || !data.basic_info) return null

  const { basic_info, activity_stats, achievements, top_exercises } = data

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-start justify-between">
          <div className="text-white">
            <h2 className="text-2xl font-bold">{basic_info.name}</h2>
            <p className="text-blue-100 text-sm">{basic_info.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white text-2xl font-light hover:opacity-80"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reset Password Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Senha resetada para 123456
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Telefone</p>
                <p className="text-sm font-medium text-gray-900">
                  {basic_info.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Data de Cadastro</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(basic_info.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Semana Atual</p>
                <p className="text-sm font-medium text-gray-900">
                  {basic_info.current_week}ª semana
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Trimestre</p>
                <p className="text-sm font-medium text-gray-900">
                  {basic_info.trimester}º trimestre
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={basic_info.healthy_pregnancy}
                  disabled
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Gravidez Saudável
                </span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={!basic_info.had_intercurrence}
                  disabled
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-700">Sem Intercorrências</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={basic_info.doctor_approved}
                  disabled
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-700">Aprovado Médico</span>
              </div>
            </div>
          </section>

          {/* Activity Stats */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas de Atividade
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 uppercase">Pontos Totais</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activity_stats?.total_points ?? 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 uppercase">Dias Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {activity_stats?.total_active_days ?? 0}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 uppercase">Exercícios</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activity_stats?.total_exercises ?? 0}
                </p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 uppercase">Ranking</p>
                <p className="text-2xl font-bold text-pink-600">
                  {activity_stats?.ranking_position ? `#${activity_stats.ranking_position}` : '-'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Primeira atividade</p>
                <p className="font-medium">
                  {activity_stats?.first_activity_date
                    ? new Date(activity_stats.first_activity_date).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Última atividade</p>
                <p className="font-medium">
                  {activity_stats?.last_activity_date
                    ? new Date(activity_stats.last_activity_date).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
            </div>
          </section>

          {/* Achievements */}
          {(achievements?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Conquistas ({achievements.length})
              </h3>
              <div className="space-y-2">
                {achievements.map((ach) => (
                  <div key={ach.achievement_id} className="flex items-center gap-2 p-2 bg-amber-50 rounded">
                    <span className="text-lg">{getAchievementEmoji(ach.achievement_id)}</span>
                    <span className="text-sm font-medium">{getAchievementName(ach.achievement_id)}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(ach.unlock_date).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => handleRemoveAchievement(ach.achievement_id)}
                      disabled={removingAch === ach.achievement_id}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Remover conquista"
                    >
                      {removingAch === ach.achievement_id ? '...' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top Exercises */}
          {(top_exercises?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Exercícios Favoritos
              </h3>
              <div className="space-y-2">
                {top_exercises.map((ex) => (
                  <div key={ex.exercise_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{ex.exercise_name}</p>
                      <p className="text-xs text-gray-600">
                        {ex.completion_count}x completado
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      +{ex.total_points_from_exercise} pts
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reset Password */}
          <section className="border-t pt-6">
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {resetting ? 'Resetando...' : 'Resetar Senha para 123456'}
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
