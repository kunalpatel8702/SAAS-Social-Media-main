import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '../lib/utils'

/**
 * Animated sun/moon toggle button.
 * Swaps icons with a smooth rotate+scale exit/enter via Framer Motion.
 */
export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200',
        'border border-[var(--border)] bg-[var(--surface)]',
        'hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-from)]',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.8} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 30,  opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
