import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'primary' | 'secondary' | 'accent' | 'neutral' | 'success'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  accent: 'bg-accent-100 text-accent-700',
  neutral: 'bg-warm-200 text-text-secondary',
  success: 'bg-emerald-100 text-emerald-700',
}

export default function Badge({ children, tone = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
