import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  padded?: boolean
}

export default function Card({
  children,
  hover = false,
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-warm-100',
        padded && 'p-4',
        hover && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
