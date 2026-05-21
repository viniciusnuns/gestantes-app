import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient'
  className?: string
  trackClassName?: string
  fillClassName?: string
  showLabel?: boolean
  label?: string
}

const variantClasses = {
  primary: 'bg-primary-300',
  secondary: 'bg-secondary-300',
  accent: 'bg-accent-400',
  gradient: 'gradient-primary',
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  className,
  trackClassName,
  fillClassName,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>{label || 'Progresso'}</span>
          <span className="font-medium">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-warm-200 rounded-full h-2.5 overflow-hidden',
          trackClassName
        )}
      >
        <div
          className={cn(
            'h-2.5 rounded-full transition-all duration-500',
            variantClasses[variant],
            fillClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
