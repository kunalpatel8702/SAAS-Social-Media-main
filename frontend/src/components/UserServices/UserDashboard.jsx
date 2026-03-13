import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, LayoutDashboard, Search, Zap, Activity,
    ArrowRight, TrendingUp, BarChart3, Globe, CheckCircle2,
    Clock, RefreshCw, Cpu, Layers, Target, Award
} from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemV = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function CountUp({ end, duration = 1200, prefix = '', suffix = '' }) {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        if (end === 0) { setCurrent(0); return; }
        const start = 0;
        const step = end / (duration / 16);
        let val = start;
        const timer = setInterval(() => {
            val += step;
            if (val >= end) { setCurrent(end); clearInterval(timer); }
            else setCurrent(Math.floor(val));
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <>{prefix}{current.toLocaleString()}{suffix}</>;
}

export default function UserDashboard({ user }) {
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchSubscriptions = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/automation/my/subscriptions`, config);
            setSubscriptions(res.data.data.subscriptions);
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchAnalytics = useCallback(async () => {
        if (!token) return;
        setAnalyticsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/analytics/stats`, config);
            if (res.data.success) {
                setAnalytics(res.data.data.summary);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSubscriptions();
        fetchAnalytics();
    }, []);

    const handleDiagnostics = () => {
        fetchSubscriptions();
        fetchAnalytics();
    };

    // Compute stats — prefer real analytics, fall back to subscriptions count
    const activeSubscriptions = analytics?.activeSubscriptions ?? subscriptions.filter(s => s.isActive).length;
    const totalTasks = analytics?.totalTasks ?? 0;
    const efficiencyGain = analytics?.efficiencyGain ?? 0;
    const totalLeads = analytics?.totalLeads ?? 0;
    const socialPosted = analytics?.social?.posted ?? 0;
    const socialTotal = analytics?.social?.total ?? 0;
    const totalCampaigns = analytics?.totalCampaigns ?? 0;

    const statCards = [
        {
            label: 'Active Subscriptions',
            value: activeSubscriptions,
            suffix: '',
            prefix: '',
            badge: activeSubscriptions > 0 ? 'Live' : 'None',
            badgeColor: activeSubscriptions > 0 ? 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10' : 'text-[var(--muted)] border-[var(--border)] bg-[var(--surface-hover)]',
            icon: <LayoutDashboard className="h-5 w-5 text-[var(--accent-from)]" />,
            trend: activeSubscriptions > 0 ? 'Optimal Status' : 'No Services',
            trendColor: activeSubscriptions > 0 ? 'text-[var(--success)]' : 'text-[var(--muted)]',
            description: 'Active automation plans'
        },
        {
            label: 'Total Tasks',
            value: totalTasks,
            suffix: '',
            prefix: '',
            badge: 'Cycle',
            badgeColor: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
            icon: <Zap className="h-5 w-5 text-cyan-400" />,
            trend: totalTasks > 0 ? 'Aggregated' : 'No data yet',
            trendColor: totalTasks > 0 ? 'text-cyan-400' : 'text-[var(--muted)]',
            description: 'Posts + campaign items'
        },
        {
            label: 'Efficiency Gain',
            value: efficiencyGain,
            suffix: '%',
            prefix: efficiencyGain > 0 ? '+' : '',
            badge: 'Delta',
            badgeColor: efficiencyGain >= 70 ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : efficiencyGain > 0 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-[var(--muted)] border-[var(--border)] bg-[var(--surface-hover)]',
            icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
            trend: efficiencyGain >= 70 ? 'Peak Capacity' : efficiencyGain > 0 ? 'Improving' : 'No Activity',
            trendColor: efficiencyGain >= 70 ? 'text-emerald-400' : efficiencyGain > 0 ? 'text-yellow-400' : 'text-[var(--muted)]',
            description: 'Success rate across all work'
        },
    ];

    const breakdownItems = [
        { label: 'Posts Published', value: socialPosted, icon: <Globe className="w-4 h-4 text-[var(--accent-from)]" />, color: 'var(--accent-from)' },
        { label: 'Leads Generated', value: totalLeads, icon: <Target className="w-4 h-4 text-cyan-400" />, color: '#22d3ee' },
        { label: 'Campaigns Run', value: totalCampaigns, icon: <BarChart3 className="w-4 h-4 text-violet-400" />, color: '#a78bfa' },
        { label: 'Posts Scheduled', value: (analytics?.social?.scheduled ?? 0), icon: <Clock className="w-4 h-4 text-amber-400" />, color: '#fbbf24' },
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">System Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
                            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Commander'}</span>.
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed font-light">
                            Monitor your active automation agents, real-time performance metrics, and system health from your operations center.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDiagnostics}
                        disabled={loading || analyticsLoading}
                        className="glass-strong px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-[var(--surface-hover)] transition-colors border-[var(--border-strong)] text-[var(--foreground)] shadow-sm hover:shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-60"
                    >
                        {analyticsLoading
                            ? <Loader2 className="w-4 h-4 text-[var(--accent-from)] animate-spin" />
                            : <RefreshCw className="w-4 h-4 text-[var(--accent-from)]" />}
                        {analyticsLoading ? 'Syncing...' : 'Run Diagnostics'}
                    </motion.button>
                </motion.header>

                {/* Last Updated */}
                {lastUpdated && (
                    <motion.p variants={itemV} className="text-[10px] text-[var(--muted-subtle)] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
                        Last synced: {lastUpdated.toLocaleTimeString()}
                    </motion.p>
                )}

                {/* MAIN BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* Left: Active Agents panel */}
                    <motion.div variants={itemV} className="md:col-span-12 xl:col-span-8 glass-strong rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 z-10 relative gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)] tracking-tight">Active Agents</h2>
                                <p className="text-[var(--muted)] text-sm mt-1.5 font-medium">Real-time status of your deployed intelligences</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-subtle)] bg-[var(--surface)] px-4 py-2 rounded-full border border-[var(--border)] shadow-inner">
                                    <Zap className="w-3 h-3 text-[var(--accent-from)]" /> Live Feed
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[var(--surface)] px-4 py-2 rounded-full border border-[var(--border)]">
                                    <Layers className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-400">{subscriptions.length}</span>
                                    <span className="text-[var(--muted-subtle)]">Deployed</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 z-10 relative">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-full py-16">
                                    <div className="p-4 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] mb-4">
                                        <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
                                    </div>
                                    <p className="text-[var(--muted)] text-sm font-medium tracking-wide uppercase animate-pulse">Syncing neural pathways...</p>
                                </div>
                            ) : subscriptions.length === 0 ? (
                                <motion.div variants={itemV} className="flex flex-col items-center justify-center text-center h-full py-16 lg:py-24 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface)] to-transparent">
                                    <div className="h-20 w-20 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-xl shadow-[var(--accent-glow)] hover:scale-105 transition-transform cursor-pointer">
                                        <Cpu className="h-10 w-10 text-[var(--muted-subtle)]" />
                                    </div>
                                    <h3 className="text-[var(--foreground)] text-xl font-bold mb-3 tracking-tight">Idle State Detected</h3>
                                    <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto text-sm leading-relaxed">Your neural grid is currently empty. Deploy agents from the marketplace to start automating.</p>
                                    <Link to="/all-services">
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="gradient-btn px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold tracking-wide">
                                            Explore Marketplace <ArrowRight className="w-4 h-4 ml-1" />
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-4">
                                    {subscriptions.map((sub, i) => (
                                        <motion.div
                                            variants={itemV}
                                            whileHover={{ scale: 1.01, x: 4 }}
                                            key={i}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-[var(--accent-glow)]/20 hover:bg-[var(--surface-elevated)]"
                                        >
                                            <div className="flex items-center gap-5 mb-4 sm:mb-0 w-full sm:w-auto">
                                                <div className="h-14 w-14 shrink-0 rounded-2xl bg-[var(--background-alt)] border border-[var(--border)] flex items-center justify-center text-2xl shadow-inner group-hover:bg-[var(--surface-hover)] group-hover:border-[var(--accent-from)]/30 transition-colors overflow-hidden">
                                                    {sub.service?.icon?.startsWith?.('http')
                                                        ? <img src={sub.service.icon} alt="" className="h-full w-full object-cover" />
                                                        : <span>{sub.service?.icon || <Cpu className="w-6 h-6 text-[var(--accent-from)]" />}</span>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[var(--foreground)] text-lg tracking-tight group-hover:text-[var(--accent-from)] transition-colors">
                                                        {sub.service?.name || 'Unnamed Agent'}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {sub.service?.features?.slice(0, 2).map((f, idx) => (
                                                            <span key={idx} className="text-[9px] uppercase tracking-[0.15em] font-bold text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                                                                {f}
                                                            </span>
                                                        ))}
                                                        {sub.service?.features?.length > 2 && (
                                                            <span className="text-[9px] font-bold text-[var(--muted-subtle)] bg-[var(--background-alt)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                                                                +{sub.service.features.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-6 sm:gap-8 w-full sm:w-auto border-t border-[var(--border)] sm:border-0 pt-4 sm:pt-0">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-sm font-black text-[var(--foreground)] tracking-tight">
                                                        {sub.amountPaid || sub.service?.price} <span className="text-[var(--muted)] font-medium text-xs ml-0.5">{sub.currency || sub.service?.currency}</span>
                                                    </p>
                                                    <p className="text-[9px] text-[var(--muted-subtle)] font-bold uppercase tracking-widest mt-1">Allocation</p>
                                                </div>

                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2",
                                                    sub.isActive
                                                        ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                                                        : "bg-[var(--danger)]/5 text-[var(--danger)] border-[var(--danger)]/20"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", sub.isActive ? "bg-[var(--success)] animate-pulse" : "bg-[var(--danger)]/50")} />
                                                    {sub.isActive ? 'Active' : 'Offline'}
                                                </div>

                                                <Link to={`/service-manager/${sub.service?._id}`}>
                                                    <button className="h-10 w-10 shrink-0 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--muted-subtle)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] group-hover:border-[var(--accent-from)]/50 group-hover:bg-[var(--surface-hover)] shadow-sm">
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Stats + Breakdown */}
                    <div className="md:col-span-12 xl:col-span-4 flex flex-col gap-6 lg:gap-8">

                        {/* Stat Cards */}
                        {statCards.map((stat, i) => (
                            <motion.div
                                variants={itemV}
                                whileHover={{ scale: 1.02, y: -3 }}
                                key={i}
                                className="bento-card p-7 flex flex-col justify-between relative overflow-hidden group border border-[var(--border)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] shadow-sm"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="flex justify-between items-start mb-5 z-10">
                                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-[var(--background)] border border-[var(--border)] group-hover:border-[var(--accent-from)]/30 group-hover:rotate-3 group-hover:scale-110 transition-all shadow-inner">
                                        {stat.icon}
                                    </div>
                                    <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border", stat.badgeColor)}>
                                        {stat.badge}
                                    </span>
                                </div>

                                <div className="z-10">
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <p className="text-4xl font-black text-[var(--foreground)] tracking-tighter">
                                            {analyticsLoading
                                                ? <span className="animate-pulse text-[var(--muted)]">—</span>
                                                : <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
                                        </p>
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-wider", stat.trendColor)}>{stat.trend}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Activity Breakdown Mini Card */}
                        <motion.div
                            variants={itemV}
                            className="bento-card p-6 relative overflow-hidden border border-[var(--border)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)]"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <Award className="w-4 h-4 text-[var(--accent-from)]" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Activity Breakdown</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {breakdownItems.map((item, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                                        <div className="flex items-center gap-1.5">
                                            {item.icon}
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-subtle)]">{item.label}</span>
                                        </div>
                                        <p className="text-2xl font-black text-[var(--foreground)]">
                                            {analyticsLoading ? <span className="animate-pulse text-[var(--muted)] text-base">—</span> : item.value.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                </div>
            </motion.div>
        </div>
    );
}
