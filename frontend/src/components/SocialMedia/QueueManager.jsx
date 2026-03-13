import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        posted:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Posted' },
        failed:    { bg: 'bg-red-500/15',     text: 'text-red-400',     dot: 'bg-red-400',     label: 'Failed' },
        scheduled: { bg: 'bg-violet-500/15',  text: 'text-violet-400',  dot: 'bg-violet-400',  label: 'Scheduled' },
        pending:   { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400',     label: 'Pending' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>
            {s.label}
        </span>
    );
}

// ── Best Time Suggestions ─────────────────────────────────────────────────────
const BEST_TIMES = {
    instagram: ['Mon 6PM', 'Wed 11AM', 'Fri 9AM', 'Sat 10AM'],
    facebook:  ['Tue 1PM', 'Thu 3PM',  'Fri 1PM', 'Sun 12PM'],
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function QueueManager() {
    const [activePlatform, setActivePlatform] = useState('instagram');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [reschedulingId, setReschedulingId] = useState(null);
    const [newTime, setNewTime] = useState('');

    const token  = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { fetchPosts(); }, [activePlatform]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${activePlatform}/posts`, config);
            const all = res.data.data.posts || [];
            // Only show pending/scheduled (queue = not yet published)
            const queue = all.filter(p => p.status === 'pending' || p.status === 'scheduled');
            queue.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
            setPosts(queue);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Remove this post from the queue?')) return;
        setDeletingId(postId);
        try {
            await axios.delete(`${API_URL}/v1/social/${activePlatform}/posts/${postId}`, config);
            toast.success('Post removed from queue');
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const handleReschedule = async (postId) => {
        if (!newTime) return toast.error('Pick a new date & time first');
        setReschedulingId(postId);
        try {
            const scheduledAtUTC = new Date(newTime).toISOString();
            await axios.patch(
                `${API_URL}/v1/social/${activePlatform}/posts/${postId}`,
                { scheduledAt: scheduledAtUTC },
                config
            );
            toast.success('Rescheduled successfully ✅');
            setNewTime('');
            setReschedulingId(null);
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reschedule');
        } finally {
            setReschedulingId(null);
        }
    };

    const platforms = [
        { key: 'instagram', label: 'Instagram', icon: '📷', color: 'from-yellow-400 via-pink-500 to-purple-600', accent: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
        { key: 'facebook',  label: 'Facebook',  icon: '📘', color: 'from-blue-600 to-indigo-700',                accent: 'text-blue-400',  border: 'border-blue-500/30',  bg: 'bg-blue-500/10'  },
    ];
    const curr = platforms.find(p => p.key === activePlatform);

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <div className="mx-auto max-w-6xl">

                {/* ── Header ── */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${curr.color} flex items-center justify-center shadow-lg`}>
                                <svg className="h-5 w-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black text-[var(--foreground)]">Queue Manager</h1>
                        </div>
                        <p className="text-[var(--foreground)]/40 ml-13">Manage your upcoming scheduled posts across all platforms.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchPosts} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-[var(--foreground)]/60 hover:bg-white/10 hover:text-[var(--foreground)] transition-all flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Refresh
                        </button>
                        <Link to="/my-services" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                            + Add Post
                        </Link>
                    </div>
                </header>

                {/* ── Platform Tabs ── */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit mb-8">
                    {platforms.map(p => (
                        <button key={p.key} onClick={() => setActivePlatform(p.key)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${activePlatform === p.key ? `bg-gradient-to-r ${p.color} text-[var(--foreground)] shadow` : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70'}`}>
                            <span>{p.icon}</span> {p.label}
                            {activePlatform === p.key && posts.length > 0 && (
                                <span className="bg-black/20 text-[var(--foreground)] text-[10px] font-black px-1.5 py-0.5 rounded-full">{posts.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Queue List ── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                            {loading ? (
                                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"/></div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="text-5xl mb-4">🗂️</div>
                                    <h3 className="text-[var(--foreground)]/60 font-bold mb-2">Queue is empty</h3>
                                    <p className="text-[var(--foreground)]/30 text-sm mb-6">No pending posts for {curr.label}. Schedule some content!</p>
                                    <Link to="/my-services" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black text-sm">
                                        Schedule a Post
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/[0.05]">
                                    {/* Header */}
                                    <div className="px-6 py-4 flex items-center justify-between">
                                        <h2 className="text-[var(--foreground)] font-black">{curr.label} Queue</h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${curr.border} ${curr.bg} ${curr.accent}`}>
                                            {posts.length} post{posts.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {posts.map((post, i) => {
                                        const d = new Date(post.scheduledAt);
                                        const isEditing = reschedulingId === post._id || (newTime && reschedulingId === null);
                                        return (
                                            <div key={i} className="p-6 hover:bg-white/[0.03] transition-colors group">
                                                <div className="flex items-start gap-4">
                                                    {/* Position number */}
                                                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-[var(--foreground)]/30 shrink-0">
                                                        {i + 1}
                                                    </div>

                                                    {/* Thumbnail */}
                                                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/5">
                                                        {post.mediaUrl ? (
                                                            post.mediaType === 'VIDEO'
                                                                ? <div className="h-full w-full flex items-center justify-center text-xl">🎬</div>
                                                                : <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" onError={e => e.target.style.display='none'}/>
                                                        ) : <div className="h-full w-full flex items-center justify-center text-xl">📷</div>}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[var(--foreground)]/80 text-sm font-semibold line-clamp-2 mb-2 group-hover:text-[var(--foreground)] transition-colors">
                                                            {post.caption || <span className="text-[var(--foreground)]/20 italic">No caption</span>}
                                                        </p>
                                                        <div className="flex items-center gap-3 flex-wrap mb-3">
                                                            <StatusBadge status={post.status}/>
                                                            <span className={`text-[10px] font-bold ${curr.accent} uppercase tracking-widest`}>
                                                                📅 {d.toLocaleDateString([], {month:'short',day:'numeric'})} · {d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-[var(--foreground)]/20 uppercase tracking-widest">{post.mediaType}</span>
                                                        </div>

                                                        {/* Reschedule inline */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <input type="datetime-local" value={reschedulingId === post._id ? newTime : ''}
                                                                onFocus={() => setReschedulingId(post._id)}
                                                                onChange={e => setNewTime(e.target.value)}
                                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[var(--foreground)] text-xs focus:outline-none focus:border-purple-500 transition-all [color-scheme:dark] max-w-[200px]"/>
                                                            {reschedulingId === post._id && newTime && (
                                                                <button onClick={() => handleReschedule(post._id)}
                                                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-black text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                                                                    Reschedule
                                                                </button>
                                                            )}
                                                            {reschedulingId === post._id && (
                                                                <button onClick={() => { setReschedulingId(null); setNewTime(''); }}
                                                                    className="text-[10px] text-[var(--foreground)]/30 font-bold hover:text-[var(--foreground)]/60 transition">
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delete */}
                                                    <button onClick={() => handleDelete(post._id)} disabled={deletingId === post._id}
                                                        className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all shrink-0 opacity-0 group-hover:opacity-100">
                                                        {deletingId === post._id
                                                            ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar: Best times + Quick links ── */}
                    <div className="space-y-6">
                        {/* Best Times */}
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                            <h3 className="text-[var(--foreground)] font-black mb-1 flex items-center gap-2">
                                <span>⚡</span> Best Times to Post
                            </h3>
                            <p className="text-[var(--foreground)]/30 text-xs mb-5">Recommended for {curr.label}</p>
                            <div className="space-y-2">
                                {BEST_TIMES[activePlatform].map((t, i) => (
                                    <div key={i} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${curr.border} ${curr.bg}`}>
                                        <span className="text-sm font-bold text-[var(--foreground)]">{t}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${curr.accent}`}>
                                            {i === 0 ? '🔥 Best' : i === 1 ? '✨ Great' : 'Good'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                            <h3 className="text-[var(--foreground)] font-black mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link to="/my-services" className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-bold text-[var(--foreground)]/70 hover:bg-white/[0.07] hover:text-[var(--foreground)] transition-all">
                                    <span className="text-base">✏️</span> Create New Post
                                </Link>
                                <Link to="/social/calendar" className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-bold text-[var(--foreground)]/70 hover:bg-white/[0.07] hover:text-[var(--foreground)] transition-all">
                                    <span className="text-base">📅</span> Calendar View
                                </Link>
                                <Link to="/analytics" className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-bold text-[var(--foreground)]/70 hover:bg-white/[0.07] hover:text-[var(--foreground)] transition-all">
                                    <span className="text-base">📊</span> View Analytics
                                </Link>
                            </div>
                        </div>

                        {/* Queue summary */}
                        {posts.length > 0 && (
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                                <h3 className="text-[var(--foreground)] font-black mb-4">Queue Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--foreground)]/50 text-sm">In Queue</span>
                                        <span className="text-[var(--foreground)] font-black">{posts.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--foreground)]/50 text-sm">Next Post</span>
                                        <span className={`text-sm font-bold ${curr.accent}`}>
                                            {new Date(posts[0]?.scheduledAt).toLocaleDateString([], {month:'short',day:'numeric'})}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--foreground)]/50 text-sm">Last Post</span>
                                        <span className="text-[var(--foreground)]/40 text-sm">
                                            {new Date(posts[posts.length - 1]?.scheduledAt).toLocaleDateString([], {month:'short',day:'numeric'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
