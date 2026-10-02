import type { ReactNode } from 'react'
import './Badge.css'

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

export function Badge({
  children,
  variant = 'neutral',
}: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant}`}>
      {children}
    </span>
  )
}