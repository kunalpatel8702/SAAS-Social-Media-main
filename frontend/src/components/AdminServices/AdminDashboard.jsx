import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CircleDollarSign, Wrench, ShieldCheck, Activity, Bell, Database, Layers, Instagram, LogOut, Lock, Command, Video, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemV = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// Helper component for animated numbers
function CountUp({ end, duration = 1200, prefix = '', suffix = '', decimals = 0 }) {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        if (end === 0) { setCurrent(0); return; }
        const start = 0;
        const step = end / (duration / 16);
        let val = start;
        const timer = setInterval(() => {
            val += step;
            if (val >= end) { setCurrent(end); clearInterval(timer); }
            else setCurrent(val);
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    
    const formatted = decimals > 0 
        ? current.toFixed(decimals) 
        : Math.floor(current).toLocaleString();
    return <>{prefix}{formatted}{suffix}</>;
}

export default function AdminDashboard({ admin, onLogout }) {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('adminToken');
    
    const fetchStats = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/admin/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.status === 'success') {
                setStatsData(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const stats = [
        { 
            label: 'Total Users', 
            value: statsData?.totalUsers ?? 0, 
            isCurrency: false,
            change: '+12%', // Keeping hardcoded trends for visual appeal for now unless we calculate month-over-month
            icon: <Users className="h-6 w-6 text-purple-400" />, 
            trend: 'Acquisition' 
        },
        { 
            label: 'Revenue', 
            value: statsData?.totalRevenue ?? 0, 
            isCurrency: true,
            decimals: 2,
            change: '+18%', 
            icon: <CircleDollarSign className="h-6 w-6 text-emerald-400" />, 
            trend: 'Financial' 
        },
        { 
            label: 'Active Services', 
            // Prefer Active Subscriptions if we want to see how many people are using services. 
            // Or totalServices for how many are in store. Let's show active subscriptions across system.
            value: statsData?.activeSubscriptions ?? 0, 
            isCurrency: false,
            change: '0%', 
            icon: <Wrench className="h-6 w-6 text-cyan-400" />, 
            trend: 'Operational' 
        },
        { 
            label: 'System Health', 
            value: statsData?.systemHealth ?? 99.9, 
            isCurrency: false,
            isPercent: true,
            decimals: 1,
            change: 'Optimal', 
            icon: <ShieldCheck className="h-6 w-6 text-indigo-400" />, 
            trend: 'Core Integrity' 
        },
    ];

    const logs = [
        { user: 'Sapan Kumar', action: 'Created new agent', time: '5 mins ago' },
        { user: 'John Doe', action: 'Upgraded to Pro', time: '12 mins ago' },
        { user: 'Alice Smith', action: 'Logged in', time: '1 hour ago' },
        { user: 'Bob Johnson', action: 'Deleted workflow', time: '3 hours ago' },
    ];

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div
                initial="hidden"
                animate="show"
                variants={containerV}
                className="mx-auto max-w-7xl"
            >
                {/* Header */}
                <motion.header variants={itemV} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--danger)]/5 border border-[var(--danger)]/20 mb-6">
                            <Lock className="h-3 w-3 text-[var(--danger)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--danger)]">Level 5 Clearance</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
                            Command <span className="gradient-text">Center</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed font-light">
                            System-wide overview, user management, and core systems control for <span className="text-[var(--foreground)] font-semibold">{admin?.name || 'Administrator'}</span>.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className="ghost-btn px-6 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border-[var(--border-strong)] shadow-sm hover:!border-[var(--danger)]/40 hover:!text-[var(--danger)] hover:!bg-[var(--danger)]/5 w-full md:w-auto transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Terminate Session
                    </motion.button>
                </motion.header>

                {/* THE BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT COLUMN: KPI Stats & Activity (col-span-8) */}
                    <div className="md:col-span-12 xl:col-span-8 flex flex-col gap-6 lg:gap-8">

                        {/* KPI Grid - Re-flowed within the left column */}
                        <motion.div variants={itemV} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {stats.map((stat, i) => (
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    key={i}
                                    className="bento-card p-8 flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] shadow-sm hover:shadow-xl hover:shadow-[var(--accent-glow)]/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="flex justify-between items-start mb-8 z-10">
                                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--background)] border border-[var(--border)] group-hover:bg-[var(--surface-hover)] group-hover:rotate-3 group-hover:scale-110 transition-all shadow-inner">
                                            {stat.icon}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm",
                                            stat.change.includes('+') || stat.change === 'Optimal'
                                                ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_12px_rgba(52,211,153,0.1)]"
                                                : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]"
                                        )}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <div className="z-10 mt-auto">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <p className="text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tighter">
                                                {loading ? (
                                                    <span className="animate-pulse text-[var(--muted)]">—</span>
                                                ) : (
                                                    <CountUp 
                                                        end={stat.value} 
                                                        prefix={stat.isCurrency ? '$' : ''} 
                                                        suffix={stat.isPercent ? '%' : ''}
                                                        decimals={stat.decimals || 0}
                                                    />
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col mt-1">
                                            <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest leading-relaxed">{stat.label}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Activity Log */}
                        <motion.div variants={itemV} className="glass-strong rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-[var(--border-strong)] flex-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:opacity-60 transition-opacity" />

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                                        <Activity className="h-6 w-6 text-[var(--accent-from)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">System Activity</h2>
                                        <p className="text-[var(--muted)] text-sm mt-1">Real-time neural grid events</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-subtle)] bg-[var(--surface)] px-4 py-2 rounded-full border border-[var(--border)] shadow-inner">
                                    Live Feed
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {logs.map((log, i) => (
                                    <motion.div
                                        whileHover={{ scale: 1.01, x: 4 }}
                                        key={i}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 hover:border-[var(--accent-from)]/40 transition-all gap-4 sm:gap-0 shadow-sm hover:shadow-md cursor-pointer hover:bg-[var(--surface-elevated)]"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[var(--accent-from)]/20 to-purple-500/10 text-[var(--accent-from)] border border-[var(--accent-from)]/30 flex items-center justify-center font-black text-lg shadow-inner">
                                                {log.user[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)]">{log.user}</p>
                                                <p className="text-sm font-medium text-[var(--muted)] mt-0.5">{log.action}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted-subtle)] bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-lg w-fit shadow-inner">
                                            {log.time}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* RIGHT COLUMN: Quick Actions (col-span-4) */}
                    <motion.div variants={itemV} className="md:col-span-12 xl:col-span-4 glass-strong rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-[var(--border-strong)] flex flex-col min-h-[500px] relative overflow-hidden">

                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="h-12 w-12 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                                <Command className="h-6 w-6 text-[var(--foreground)]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Quick Actions</h2>
                                <p className="text-[var(--muted)] text-sm mt-1">Direct system interventions</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 flex-grow relative z-10">
                            {[
                                { title: 'User Access Network', subtitle: 'View and manage permissions', icon: <Users className="h-6 w-6" />, colorClass: 'purple', action: () => navigate('/admin/users') },
                                { title: 'Video Generations', subtitle: 'View all user generated videos', icon: <Video className="h-6 w-6" />, colorClass: 'pink', action: () => navigate('/admin/videos') },
                                { title: 'Deploy New Service', subtitle: 'Add offering to global store', icon: <Layers className="h-6 w-6" />, colorClass: 'cyan', action: () => navigate('/admin/automation') },
                                { title: 'Grid Operations', subtitle: 'Modify existing automation models', icon: <Database className="h-6 w-6" />, colorClass: 'emerald', action: () => navigate('/admin/manage-automation') },
                            ].map((btn, i) => (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={btn.action}
                                    key={i}
                                    className={`flex items-center gap-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 text-left transition-all group shadow-sm hover:shadow-lg`}
                                >
                                    <div className={cn(
                                        "h-14 w-14 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-inner border",
                                        btn.colorClass === 'purple' && "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-[var(--foreground)] border-purple-500/20 group-hover:border-purple-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
                                        btn.colorClass === 'cyan' && "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[var(--foreground)] border-cyan-500/20 group-hover:border-cyan-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
                                        btn.colorClass === 'emerald' && "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[var(--foreground)] border-emerald-500/20 group-hover:border-emerald-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
                                        btn.colorClass === 'pink' && "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-[var(--foreground)] border-pink-500/20 group-hover:border-pink-500 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                                    )}>
                                        {btn.icon}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "font-bold text-[var(--foreground)] text-lg transition-colors",
                                            btn.colorClass === 'purple' && "group-hover:text-purple-400",
                                            btn.colorClass === 'cyan' && "group-hover:text-cyan-400",
                                            btn.colorClass === 'emerald' && "group-hover:text-emerald-400",
                                            btn.colorClass === 'pink' && "group-hover:text-pink-400"
                                        )}>{btn.title}</p>
                                        <p className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-1.5">{btn.subtitle}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    )
}
