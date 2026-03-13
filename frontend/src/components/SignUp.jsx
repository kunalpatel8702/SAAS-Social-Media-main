import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, X, Loader2 } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { cn } from '../lib/utils'

export default function SignUp({ onToggle, onSignUpSuccess, switchToLogin }) {
    // ── All original state & logic preserved exactly ──────────────────
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/v1/auth/signup`, formData)

            if (response.status === 200 || response.status === 201) {
                const responseData = response.data
                localStorage.setItem('token', responseData.token)
                toast.success('Account created successfully!')
                onSignUpSuccess(responseData.data.user)
                onToggle()
                setFormData({ name: '', email: '', password: '' })
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Connection error. Please try again.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/v1/auth/google-login`, {
                idToken: credentialResponse.credential
            })

            if (response.status === 200 || response.status === 201) {
                const responseData = response.data
                localStorage.setItem('token', responseData.token)
                toast.success('Account created with Google!')
                onSignUpSuccess(responseData.data.user)
                onToggle()
                setFormData({ name: '', email: '', password: '' })
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Google signup failed. Please try again.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        toast.error('Google Sign-In was unsuccessful. Please try again.')
    }
    // ── End of preserved logic ────────────────────────────────────────

    const fields = [
        { id: 'name',     label: 'Full name',      type: 'text',     icon: User, placeholder: 'Jane Doe' },
        { id: 'email',    label: 'Email address',  type: 'email',    icon: Mail, placeholder: 'you@example.com' },
        { id: 'password', label: 'Password',       type: 'password', icon: Lock, placeholder: '••••••••' },
    ]

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
                onClick={onToggle}
            >
                {/* Modal card */}
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: 16, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        'relative w-full max-w-md rounded-3xl p-8 shadow-2xl',
                        'glass-strong'
                    )}
                >
                    {/* Accent hairline glow */}
                    <div
                        className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2"
                        style={{ background: 'linear-gradient(90deg, transparent, var(--accent-from), var(--accent-to), transparent)' }}
                    />

                    {/* Close button */}
                    <button
                        onClick={onToggle}
                        aria-label="Close"
                        className={cn(
                            'absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150',
                            'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                        )}
                    >
                        <X className="h-4 w-4" strokeWidth={2} />
                    </button>

                    {/* Header */}
                    <div className="mb-7">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--gradient-subtle)' }}>
                            <div className="h-2 w-2 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                            Create account
                        </h2>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                            Join the intelligence revolution today.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
                            <div key={id} className="space-y-1.5">
                                <label className="block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                                    {label}
                                </label>
                                <div className="relative">
                                    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--muted-subtle)' }} strokeWidth={1.8} />
                                    <input
                                        type={type}
                                        required
                                        placeholder={placeholder}
                                        value={formData[id]}
                                        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                                        className="field w-full rounded-xl py-2.5 pl-9 pr-4 text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <motion.button
                                type="button"
                                onClick={onToggle}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="ghost-btn flex-1 rounded-xl py-2.5 text-sm"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.97 }}
                                className="gradient-btn flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating…
                                    </>
                                ) : 'Sign up'}
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--muted-subtle)] opacity-20"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--surface)] px-2" style={{ color: 'var(--muted-subtle)' }}>Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </form>

                    {/* Footer link */}
                    <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted-subtle)' }}>
                        Already have an account?{' '}
                        <span
                            onClick={switchToLogin}
                            className="cursor-pointer font-medium transition-colors hover:underline"
                            style={{ color: 'var(--accent-from)' }}
                        >
                            Log in
                        </span>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
