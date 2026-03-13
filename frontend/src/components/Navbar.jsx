import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
// No logo import needed anymore

export default function Navbar({ user, onSignUp, onLogin, onLogout, isAdmin }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const useHeroAesthetic = isHome && !isScrolled

  const textColor = useHeroAesthetic ? 'text-white' : 'text-black dark:text-white'
  const mutedTextColor = useHeroAesthetic ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white'
  const dropdownText = useHeroAesthetic
    ? 'text-white/70 hover:text-white hover:bg-white/5'
    : 'text-black/70 hover:text-black hover:bg-black/5 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5'
  const dropdownBg = useHeroAesthetic
    ? 'bg-[#0a0a0c]/95 border-white/10'
    : 'bg-white/95 dark:bg-[#0a0a0c]/95 border-black/10 dark:border-white/10'
  const navBgClass = isScrolled
    ? 'bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
    : 'bg-transparent'
  const btnBorder = useHeroAesthetic ? 'border border-white/10 bg-white/5 hover:bg-white/10' : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'pt-2' : 'pt-6'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-500 rounded-[2rem] px-6 py-3 ${navBgClass}`}>
          {/* Logo / Brand */}
          <a href={isAdmin ? "/admin" : "/"} className="group flex items-center gap-2 transition-all duration-300">
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className={`font-brand text-2xl font-extrabold tracking-tighter ${textColor}`}>
                  Automation
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-violet-300 transition-all duration-500">
                    Owl
                  </span>
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-indigo-400/80">
                {isAdmin ? 'Management Console' : 'Autonomous AI Systems'}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {!user ? (
              <>
                {['Solutions', 'Process', 'Case Studies', 'About'].map((item) => (
                  <Link
                    key={item}
                    className={`relative transition-colors group py-2 ${mutedTextColor}`}
                    to={item === 'Solutions' ? '/all-services' : item === 'Process' ? '/process' : `/#${item.toLowerCase().replace(' ', '-')}`}
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 h-px w-0 bg-indigo-500 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </>
            ) : isAdmin ? (
              <>
                <Link className={mutedTextColor} to="/admin">Analytics</Link>
                <div className="relative group py-2">
                  <span className={`${mutedTextColor} cursor-default flex items-center gap-1`}>
                    Automations <ChevronDown className="h-3 w-3" />
                  </span>
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-2xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-1.5 overflow-hidden border ${dropdownBg}`}>
                    <Link to="/admin/automation" className={`block px-4 py-2.5 text-xs font-medium rounded-xl ${dropdownText}`}>Launch Automation</Link>
                    <Link to="/admin/manage-automation" className={`block px-4 py-2.5 text-xs font-medium rounded-xl ${dropdownText}`}>Manage Grid</Link>
                  </div>
                </div>
                <Link className={mutedTextColor} to="/admin/users">Users</Link>
                <Link className={mutedTextColor} to="/admin/videos">Videos</Link>
              </>
            ) : (
              <>
                <Link className={mutedTextColor} to="/dashboard">Dashboard</Link>
                <Link className={mutedTextColor} to="/my-services">My Services</Link>
                <Link className={mutedTextColor} to="/all-services">Marketplace</Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {user.profilePicture && (
                  <img src={user.profilePicture} alt="" className="h-8 w-8 rounded-full border border-indigo-500/30 object-cover shadow-sm" />
                )}
                <span className={`hidden text-sm font-medium sm:block ${textColor}`}>
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={onLogout}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${btnBorder} ${textColor}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onLogin}
                  className={`hidden text-sm font-semibold transition-colors md:block ${mutedTextColor}`}
                >
                  Login
                </button>
                <button
                  onClick={onSignUp}
                  className="gradient-btn rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className={`md:hidden ${textColor}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-4 px-4 md:hidden"
          >
            <div className={`rounded-3xl p-6 backdrop-blur-2xl shadow-2xl ${dropdownBg}`}>
              <nav className="flex flex-col gap-4">
                {['Solutions', 'Process', 'Case Studies', 'About'].map((item) => (
                  <Link
                    key={item}
                    to={item === 'Solutions' ? '/all-services' : item === 'Process' ? '/process' : `/#${item.toLowerCase().replace(' ', '-')}`}
                    className={`text-lg font-medium ${mutedTextColor}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <div className="h-px bg-white/10 my-2" />
                {!user && (
                  <button
                    onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}
                    className="gradient-btn rounded-2xl py-4 font-bold text-white"
                  >
                    Get Started
                  </button>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

