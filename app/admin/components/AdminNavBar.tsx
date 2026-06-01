'use client'

import { useAdminAuth } from '@/lib/useAdminAuth'

export function AdminNavBar() {
  const { admin, logout } = useAdminAuth()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitoramento de usuárias - Gestar em Movimento
          </p>
        </div>

        {admin && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {admin.email}
              </p>
              <p className="text-xs text-gray-500">
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
