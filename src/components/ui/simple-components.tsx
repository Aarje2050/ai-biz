/**
 * File: src/components/ui/simple-components.tsx
 * 
 * Simple UI components as fallbacks (no external dependencies)
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

// Simple Badge Component
export function SimpleBadge({ 
  children, 
  variant = 'default',
  className,
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Simple Switch Component
export function SimpleSwitch({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-gray-300',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-background shadow transform ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// Simple Select Component
export function SimpleSelect({
  value,
  onValueChange,
  placeholder,
  children,
  className,
  ...props
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )
}

// Simple Option Component
export function SimpleOption({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}

// Export everything
export const FallbackComponents = {
  Badge: SimpleBadge,
  Switch: SimpleSwitch,
  Select: SimpleSelect,
  Option: SimpleOption
}