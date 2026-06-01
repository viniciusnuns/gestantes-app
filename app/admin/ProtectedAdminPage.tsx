'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'

export function ProtectedAdminPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { admin, loading, error, isAdmin } = useAdminAuth()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [loading, isAdmin, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">
            {error || 'Acesso negado'}
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
