'use client'

import { useState } from 'react'
import { UserListItem } from '@/lib/admin-client'
import { UserDetailModal } from './UserDetailModal'

interface UsersListProps {
  initialUsers: UserListItem[]
  totalCount: number
}

export function UsersList({ initialUsers, totalCount }: UsersListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 50

  const handleNextPage = () => {
    setPage(page + 1)
  }

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1)
  }

  const getTrimesterLabel = (trimester: number | null) => {
    if (!trimester) return '-'
    return `${trimester}º trimestre`
  }

  const statusBadge = (completed: boolean) => {
    if (completed) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Completo
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
        Pendente
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Usuárias</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Onboarding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Trimestre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Dias Ativos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Pontos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Ranking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Push
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.signup_date).toLocaleDateString('pt-BR')}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {statusBadge(user.onboarding_completed)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {getTrimesterLabel(user.trimester)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user.active_days}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {user.total_points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.ranking_position ? (
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      #{user.ranking_position}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.push_subscribed ? (
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      🔔 Sim
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                      Não
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver Detalhe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando {page * limit + 1} até{' '}
          {Math.min((page + 1) * limit, totalCount)} de {totalCount}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={(page + 1) * limit >= totalCount}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
