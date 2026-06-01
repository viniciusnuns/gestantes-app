'use client'

import { usePathname } from 'next/navigation'
import { ProtectedAdminPage } from './ProtectedAdminPage'
import { AdminNavBar } from './components/AdminNavBar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Login page does NOT require admin protection — it's the way in.
  // Without this bypass, the protection check creates an infinite redirect
  // loop (login → protected → redirect to login → ...).
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <ProtectedAdminPage>
      <div className="min-h-screen bg-gray-50">
        <AdminNavBar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedAdminPage>
  )
}
