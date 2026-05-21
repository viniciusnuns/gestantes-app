'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Users, Calendar, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/comunidade', label: 'Comunidade', icon: Users },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/progresso', label: 'Progresso', icon: Trophy },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-warm-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== '/home' && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors',
                isActive
                  ? 'text-primary-400'
                  : 'text-text-light hover:text-primary-300'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                className={cn(isActive && 'scale-110 transition-transform')}
              />
              <span
                className={cn(
                  'text-[11px] leading-none',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
