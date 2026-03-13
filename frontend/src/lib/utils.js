import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and resolves Tailwind conflicts using tailwind-merge.
 * Usage: cn('px-4 py-2', condition && 'bg-indigo-500', 'hover:opacity-90')
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
