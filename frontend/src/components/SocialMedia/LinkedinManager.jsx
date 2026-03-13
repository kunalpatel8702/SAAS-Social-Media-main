import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LinkedinManager({ service }) {
    const location = useLocation();
    const serviceId = service?._id;
    const platformName = 'LinkedIn';

    const [accounts, setAccounts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const platformPath = 'linkedin';

    // Scheduling Form State
    const [selectedAccount, setSelectedAccount] = useState('');
    const [text, setText] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('connected') === 'linkedin') {
            toast.success(`${platformName} account connected successfully!`);
        }

        fetchAccounts();
        fetchPosts();
    }, [location]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/accounts`, config);
            setAccounts(res.data.data.accounts);
            if (res.data.data.accounts.length > 0) {
                setSelectedAccount(res.data.data.accounts[0]._id);
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/posts`, config);
            setPosts(res.data.data.posts);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/auth-url?serviceId=${serviceId}`, config);
            // Redirect user to OAuth page
            window.location.href = res.data.url;
        } catch (err) {
            toast.error('Failed to get connection URL');
            setConnecting(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedAccount || !text || !scheduledAt) {
            return toast.error('Please fill required fields (Account, Text, Schedule Date)');
        }

        try {
            await axios.post(`${API_URL}/v1/social/${platformPath}/schedule`, {
                linkedinAccountId: selectedAccount,
                text,
                mediaUrl,
                scheduledAt
            }, config);

            toast.success('Post scheduled successfully!');
            setText('');
            setMediaUrl('');
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule post', {
                duration: 6000,
                style: { maxWidth: '500px' }
            });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <div className="mx-auto max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--foreground)] mb-2">{platformName} Manager</h1>
                        <p className="text-[var(--foreground)]/40">Connect your accounts and schedule your content.</p>
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-[var(--foreground)] font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
                    >
                        {connecting ? 'Redirecting...' : `Connect with ${platformName}`}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Scheduling Form */}
                    <div className="lg:col-span-1">
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-3xl sticky top-28">
                            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                                <span className="text-2xl">📅</span> Schedule Post
                            </h2>

                            <form onSubmit={handleSchedule} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Select Account</label>
                                    <select
                                        value={selectedAccount}
                                        onChange={(e) => setSelectedAccount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        {accounts.length === 0 && <option value="">No accounts connected</option>}
                                        {accounts.map(acc => (
                                            <option key={acc._id} value={acc._id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Media URL (Optional Image)</label>
                                    <input
                                        type="text"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[var(--foreground)]/10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Post Text</label>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Write something engaging..."
                                        rows="4"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[var(--foreground)]/10 resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Schedule Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-blue-400 hover:text-[var(--foreground)] transition-all shadow-lg active:scale-95"
                                >
                                    Schedule Post
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Posts List & Connected Accounts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Connected Accounts Quick View */}
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {accounts.map(acc => (
                                <div key={acc._id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 shrink-0">
                                    <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
                                        <img src={acc.profilePicture} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--foreground)]">@{acc.name}</p>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</p>
                                    </div>
                                </div>
                            ))}
                            {accounts.length === 0 && (
                                <p className="text-[var(--foreground)]/20 text-sm font-medium italic">No accounts connected yet...</p>
                            )}
                        </div>

                        {/* Recent & Pending Posts */}
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-10">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Scheduling Queue</h2>

                            <div className="space-y-4">
                                {loading && (
                                    <div className="flex justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                                    </div>
                                )}

                                {posts.length === 0 && !loading && (
                                    <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                                        <p className="text-[var(--foreground)]/20 font-medium">No posts scheduled in the queue.</p>
                                    </div>
                                )}

                                {posts.map(post => (
                                    <div key={post._id} className="group flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.05] hover:border-white/10">
                                        <div className="flex items-center gap-6">
                                            {post.mediaUrl && (
                                                <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                                                    <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <img src={post.linkedinAccountId?.profilePicture} className="h-4 w-4 rounded-full" alt="" />
                                                    <span className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">{post.linkedinAccountId?.name}</span>
                                                </div>
                                                <p className="text-[var(--foreground)] font-bold line-clamp-1 mb-2 max-w-sm">{post.text}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                                        📅 {new Date(post.scheduledAt).toLocaleString()}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${post.status === 'posted' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        post.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-blue-500/10 text-blue-400'
                                                        }`}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                                {post.errorMessage && <p className="text-[10px] text-red-500 mt-2 font-medium italic">Error: {post.errorMessage}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
