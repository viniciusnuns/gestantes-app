'use client'

import { OverviewStats as Stats } from '@/lib/admin-client'

interface OverviewStatsProps {
  data: Stats
}

export function OverviewStats({ data }: OverviewStatsProps) {
  const cards = [
    {
      label: 'Total de Usuárias',
      value: data.total_users,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Onboarding Completo',
      value: `${data.completed_onboarding}/${data.total_users}`,
      percent: data.onboarding_completion_rate,
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Com Atividades',
      value: data.users_with_activities,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Ativas esta Semana',
      value: data.active_this_week,
      color: 'bg-pink-50 border-pink-200',
    },
    {
      label: 'Abandonadas',
      value: data.abandoned_users,
      percent: data.abandonment_rate_percent,
      color: 'bg-red-50 border-red-200',
    },
    {
      label: 'Push Ativo 🔔',
      value: `${data.push_subscribed_count ?? 0}/${data.total_users}`,
      percent: data.push_subscription_rate ?? 0,
      color: 'bg-amber-50 border-amber-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${card.color} border rounded-lg p-6 transition-all hover:shadow-md`}
        >
          <p className="text-sm font-medium text-gray-700">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
          {card.percent !== undefined && (
            <p className="text-xs text-gray-600 mt-2">{card.percent}%</p>
          )}
        </div>
      ))}
    </div>
  )
}
