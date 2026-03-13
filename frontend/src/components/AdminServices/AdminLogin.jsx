import { useState } from 'react'
import axios from 'axios'

export default function AdminLogin({ onLoginSuccess, onToggle }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [status, setStatus] = useState({ type: '', message: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus({ type: '', message: '' })

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/v1/admin/login`, formData)

            if (response.status === 200) {
                const responseData = response.data
                localStorage.setItem('adminToken', responseData.token)
                setStatus({ type: 'success', message: 'Admin logged in successfully!' })

                // Ensure the user object has the admin role for App.jsx routing
                const adminData = {
                    ...responseData.data.admin,
                    role: 'admin'
                }
                onLoginSuccess(adminData)
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Admin Login failed. Please check credentials.'
            setStatus({ type: 'error', message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0B0F]/80 p-10 shadow-2xl backdrop-blur-2xl relative">
                <button
                    onClick={onToggle}
                    className="absolute right-6 top-6 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-2xl">
                        🔐
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--foreground)]">Admin Portal</h2>
                    <p className="text-[var(--foreground)]/40">Secure access for system administrators</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition"
                            placeholder="admin@automationowl.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Security Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {status.message}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex-1 rounded-xl bg-white/5 py-4 font-bold text-[var(--foreground)] hover:bg-white/10 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 py-4 font-bold text-[var(--foreground)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Enter Dashboard'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
