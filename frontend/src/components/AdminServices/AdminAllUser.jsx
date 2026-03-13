import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Trash2, User, ShieldAlert, AlertCircle, Users, Activity, CalendarDays } from 'lucide-react'
import { cn } from '../../lib/utils'

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}
const itemV = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function AdminAllUser() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/v1/admin/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.status === 'success') {
                    setUsers(response.data.data.users)
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return

        try {
            const token = localStorage.getItem('adminToken')
            await axios.delete(`${import.meta.env.VITE_API_URL}/v1/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Remove user from local state
            setUsers(users.filter(user => user._id !== userId))
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user')
        }
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div initial="hidden" animate="show" variants={containerV} className="mx-auto max-w-7xl">
                
                {/* Header Section */}
                <motion.header variants={itemV} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] mb-6">
                            <Activity className="h-4 w-4 text-[var(--success)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">User Directory</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
                            Platform <span className="gradient-text">Users</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed font-light">
                            Manage access, audit roles, and monitor engagement for all registered accounts across the neural grid.
                        </p>
                    </div>
                    
                    <div className="glass-strong px-8 py-5 rounded-3xl flex items-center justify-between gap-8 min-w-[240px] border border-[var(--border-strong)] shadow-sm">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Total Active</p>
                            <p className="text-4xl font-black text-[var(--foreground)]">{users.length}</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-from)]/10 flex items-center justify-center border border-[var(--accent-from)]/20 shadow-inner">
                            <Users className="h-7 w-7 text-[var(--accent-from)]" />
                        </div>
                    </div>
                </motion.header>

                <motion.div variants={itemV} className="glass-strong rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-[var(--border-strong)] relative overflow-hidden min-h-[500px]">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] opacity-40 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 relative z-10 w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Identity Registry</h2>
                            <p className="text-sm text-[var(--muted)] mt-1 font-medium">Categorized view of system operators</p>
                        </div>
                        {users.length > 0 && (
                            <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-2 shadow-inner">
                                <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                                <span className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Database Synced</span>
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--surface)]/50">
                                <div className="p-4 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] mb-4">
                                    <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
                                </div>
                                <p className="text-[var(--muted)] text-sm font-medium tracking-wide uppercase animate-pulse">Scanning identity matrix...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-12 text-center shadow-inner">
                                <AlertCircle className="h-12 w-12 text-[var(--danger)] mb-4" />
                                <h3 className="text-[var(--danger)] text-xl font-bold mb-2">Access Error</h3>
                                <p className="text-[var(--danger)]/80 text-sm">{error}</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-20 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface)] to-transparent">
                                <Users className="h-16 w-16 text-[var(--muted-subtle)] mb-6" />
                                <h3 className="text-[var(--foreground)] text-xl font-bold mb-2 tracking-tight">No Users Found</h3>
                                <p className="text-[var(--muted)] max-w-sm mx-auto text-sm leading-relaxed">The active registry is empty. Users will appear here upon registration.</p>
                            </div>
                        ) : (
                            <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-4">
                                
                                {/* Header Row (Hidden on small screens) */}
                                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] border-b border-[var(--border)] bg-[var(--surface-hover)] rounded-t-2xl">
                                    <div className="col-span-5">Operator Details</div>
                                    <div className="col-span-3">Assigned Role</div>
                                    <div className="col-span-3 hover:text-[var(--muted)] transition-colors cursor-pointer flex items-center gap-2">
                                        <CalendarDays className="h-3 w-3" /> Connection Date
                                    </div>
                                    <div className="col-span-1 text-right">Intervene</div>
                                </div>

                                {/* Stacked Row Cards */}
                                <div className="space-y-3 mt-4 md:mt-2">
                                    {users.map((user) => (
                                        <motion.div 
                                            variants={itemV} 
                                            whileHover={{ scale: 1.01, x: 4 }}
                                            key={user._id} 
                                            className="group flex flex-col md:grid md:grid-cols-12 md:items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 md:px-8 py-6 hover:border-[var(--accent-from)]/40 transition-all shadow-sm hover:shadow-lg hover:shadow-[var(--accent-glow)]/10 hover:bg-[var(--surface-elevated)]"
                                        >
                                            {/* User Details */}
                                            <div className="md:col-span-5 flex items-center gap-5">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--background-alt)] border border-[var(--border)] overflow-hidden font-black text-lg text-[var(--foreground)] shadow-inner group-hover:bg-[var(--surface-hover)] group-hover:border-[var(--accent-from)]/30 transition-colors">
                                                    {user.profilePicture ? (
                                                        <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        user.name ? user.name[0].toUpperCase() : <User className="h-5 w-5 text-[var(--muted)]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[var(--foreground)] text-lg truncate group-hover:text-[var(--accent-from)] transition-colors">{user.name || 'Unknown Entity'}</p>
                                                    <p className="text-[13px] font-medium text-[var(--muted)] truncate mt-0.5">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Role */}
                                            <div className="md:col-span-3 flex items-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
                                                    user.role === 'admin' 
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)] glow-pulse' 
                                                        : 'bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)]'
                                                )}>
                                                    {user.role === 'admin' ? <ShieldAlert className="h-3.5 w-3.5" /> : <User className="h-3 w-3" />}
                                                    {user.role}
                                                </div>
                                            </div>

                                            {/* Joined Date */}
                                            <div className="md:col-span-3 flex items-center text-[13px] font-bold text-[var(--muted-subtle)] uppercase tracking-wider">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>

                                            {/* Actions */}
                                            <div className="md:col-span-1 flex items-center justify-between md:justify-end border-t border-[var(--border)] md:border-0 pt-5 md:pt-0 mt-2 md:mt-0">
                                                <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Actions</span>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="h-11 w-11 shrink-0 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--danger)]/60 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors border border-[var(--border)] group-hover:border-[var(--danger)]/30 shadow-sm"
                                                    title="Eradicate Element"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
