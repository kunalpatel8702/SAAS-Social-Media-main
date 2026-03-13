import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
    Users, Target, Mail, Phone, BarChart3, TrendingUp,
    CheckCircle2, AlertCircle, Eye, MousePointer2, RefreshCw, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helper Components (Outside main component) ───────────────────────────────

function StatBar({ label, value, max, color }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[var(--foreground)]/60">{label}</span>
                <span className="text-xs font-black text-[var(--foreground)]">{value}</span>
            </div>
            <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        posted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
        failed: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
        scheduled: { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
        pending: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
}

function MiniChart({ data, color }) {
    if (!data || data.length < 2) return <div className="h-10 flex items-end gap-0.5">{Array.from({ length: 7 }, (_, i) => <div key={i} className={`flex-1 rounded-full opacity-20 ${color}`} style={{ height: '4px' }} />)}</div>;
    const max = Math.max(...data, 1);
    return (
        <div className="h-10 flex items-end gap-0.5">
            {data.slice(-7).map((v, i) => (
                <div key={i} className={`flex-1 rounded-full ${color} transition-all duration-500`} style={{ height: `${Math.max(3, (v / max) * 100)}%`, opacity: 0.4 + (i / 7) * 0.6 }} />
            ))}
        </div>
    );
}

function KPICard({ label, value, icon, trend, color }) {
    const colorMap = {
        emerald: 'shadow-emerald-500/10 border-emerald-500/10',
        blue: 'shadow-blue-500/10 border-blue-500/10',
        purple: 'shadow-purple-500/10 border-purple-500/10',
        amber: 'shadow-amber-500/10 border-amber-500/10',
    };
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-3xl border bg-white/5 p-6 backdrop-blur-xl flex flex-col justify-between ${colorMap[color]}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5`}>{icon}</div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{trend}</span>
            </div>
            <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-black text-white">{value?.toLocaleString()}</h4>
            </div>
        </motion.div>
    );
}

function SocialMiniCard({ platform, value, icon, color }) {
    return (
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{icon}</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{platform}</span>
            </div>
            <p className="text-xl font-black text-white">{value}</p>
        </div>
    );
}

const DATE_RANGES = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'All time', days: 0 },
];

function exportCsv(posts) {
    const headers = ['Caption', 'Status', 'Scheduled At', 'Platform', 'Media Type'];
    const rows = posts.map(p => [
        `"${(p.caption || '').replace(/"/g, '""')}"`,
        p.status,
        new Date(p.scheduledAt).toLocaleString(),
        p.platform || 'instagram',
        p.mediaType || 'IMAGE'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'posts-report.csv'; a.click();
    URL.revokeObjectURL(url);
}

// ── Main Dashboard Component ────────────────────────────────────────────────

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(7);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/analytics/stats`, config);
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Fetch Stats Error:', err);
            toast.error('Failed to load real-time analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-2 border-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const { summary, dailyActivity, modulePerformance, allPosts = [] } = stats || {};
    const { social = {} } = summary || {};

    // Derived stats for the cards
    const total = social.total || 0;
    const posted = social.posted || 0;
    const pending = social.scheduled || 0;
    const failed = social.failed || 0;
    const successRate = total > 0 ? Math.round((posted / total) * 100) : 0;

    // Filters
    const igFiltered = allPosts.filter(p => p.platform === 'instagram');
    const fbFiltered = allPosts.filter(p => p.platform === 'facebook');

    // Prepare chart data
    const activityData = dailyActivity?.map(d => ({
        name: d._id.split('-').slice(1).join('/'),
        count: d.count
    })) || [];

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <div className="mx-auto max-w-7xl">

                {/* ── Header ── */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <svg className="h-5 w-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black text-[var(--foreground)]">Analytics</h1>
                        </div>
                        <p className="text-[var(--foreground)]/40 ml-13">Track your post performance across all platforms.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchStats} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-[var(--foreground)]/60 hover:bg-white/10 hover:text-[var(--foreground)] transition-all flex items-center gap-2">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button onClick={() => exportCsv(allPosts)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            <Download size={18} />
                            Export Report
                        </button>
                    </div>
                </header>

                {/* ── Date Range Filter ── */}
                <div className="flex items-center gap-2 mb-8 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mr-2">Time Range:</span>
                    {DATE_RANGES.map(r => (
                        <button key={r.days} onClick={() => setRange(r.days)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${range === r.days ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-black shadow' : 'bg-white/5 border border-white/10 text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70'}`}>
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Posts', value: total, color: 'from-purple-500 to-indigo-500', icon: '📋' },
                        { label: 'Published', value: posted, color: 'from-emerald-400 to-teal-500', icon: '✅' },
                        { label: 'Pending', value: pending, color: 'from-blue-400 to-cyan-500', icon: '⏳' },
                        { label: 'Failed', value: failed, color: 'from-red-500 to-rose-500', icon: '❌' },
                        { label: 'Success Rate', value: `${successRate}%`, color: 'from-amber-400 to-orange-500', icon: '🎯' },
                    ].map((stat, i) => (
                        <div key={i} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">{stat.label}</p>
                                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</span>
                            </div>
                            <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {loading ? '—' : stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Platform Breakdown + Charts ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Instagram card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-[var(--foreground)] font-black">Instagram</h3>
                                    <p className="text-[var(--foreground)]/30 text-xs">{igFiltered.length} posts</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 900 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Facebook card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-[var(--foreground)] font-black">Facebook</h3>
                                    <p className="text-[var(--foreground)]/30 text-xs">{fbFiltered.length} posts</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] flex items-center justify-center text-[var(--foreground)]/20 text-sm italic">
                            Facebook engagement trends coming soon
                        </div>
                    </motion.div>
                </div>

                {/* ── All Posts Table ── */}
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05]">
                        <div>
                            <h2 className="text-xl font-black text-[var(--foreground)]">All Posts</h2>
                            <p className="text-[var(--foreground)]/30 text-xs">{allPosts.length} entries</p>
                        </div>
                    </div>

                    {allPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-[var(--foreground)]/60 font-bold mb-2">No posts yet</h3>
                            <p className="text-[var(--foreground)]/30 text-sm mb-6">Start scheduling posts to see analytics here</p>
                            <Link to="/my-services" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black text-sm">
                                Schedule Posts
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-4 px-8 py-3 border-b border-white/[0.05]">
                                    <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Media</div>
                                    <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Platform</div>
                                    <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Caption</div>
                                    <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Scheduled</div>
                                    <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Status</div>
                                    <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">Type</div>
                                </div>

                                <div className="divide-y divide-white/[0.04]">
                                    {allPosts.map((post, i) => {
                                        const d = new Date(post.scheduledAt || post.createdAt);
                                        const isIg = post.platform === 'instagram';
                                        return (
                                            <div key={i} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-white/[0.03] transition-colors group">
                                                <div className="col-span-1">
                                                    {post.mediaUrl ? (
                                                        post.mediaType === 'VIDEO'
                                                            ? <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">🎬</div>
                                                            : <img src={post.mediaUrl} alt="" className="h-10 w-10 rounded-lg object-cover border border-white/10" />
                                                    ) : <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">📷</div>}
                                                </div>

                                                <div className="col-span-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isIg ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                        {isIg ? '📷 IG' : '📘 FB'}
                                                    </span>
                                                </div>

                                                <div className="col-span-4">
                                                    <p className="text-[var(--foreground)]/80 text-sm truncate group-hover:text-[var(--foreground)] transition-colors">
                                                        {post.caption || <span className="text-[var(--foreground)]/20 italic">No caption</span>}
                                                    </p>
                                                </div>

                                                <div className="col-span-3">
                                                    <p className="text-[var(--foreground)]/60 text-sm font-semibold">
                                                        {d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[var(--foreground)]/30 text-xs">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>

                                                <div className="col-span-2">
                                                    <StatusBadge status={post.status} />
                                                </div>

                                                <div className="col-span-1">
                                                    <span className="text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-widest">{post.mediaType || 'IMAGE'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
