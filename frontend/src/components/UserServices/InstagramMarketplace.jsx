import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InstagramMarketplace() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/instagram-marketplace`);
            setPosts(res.data.data.posts);
        } catch (err) {
            console.error('Error fetching marketplace posts:', err);
            toast.error('Failed to load marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (postId) => {
        if (!token) {
            toast.error('Please login to activate posts');
            navigate('/login');
            return;
        }

        setActivating(postId);
        try {
            await axios.post(`${API_URL}/v1/social/instagram-marketplace/activate/${postId}`, {}, config);
            toast.success('Post activated! You can now schedule it.');
            // In a full implementation, this might redirect to a 'My Active Posts' or 'Scheduler' page
        } catch (err) {
            toast.error(err.response?.data?.message || 'Activation failed');
        } finally {
            setActivating(null);
        }
    };

    return (
        <div className="py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-[var(--foreground)] mb-2">Social Media Marketplace</h2>
                    <p className="text-[var(--foreground)]/60 font-medium">Pre-designed, high-converting posts for your brand</p>
                </div>
                <div className="flex gap-4">
                    <button className="rounded-full bg-white/5 border border-white/10 px-6 py-2 text-sm font-bold text-[var(--foreground)] hover:bg-white/10 transition">
                        All Categories
                    </button>
                    <button className="rounded-full bg-purple-500/10 border border-purple-500/20 px-6 py-2 text-sm font-bold text-purple-400">
                        Instagram
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <div key={post._id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition-all hover:border-purple-500/30 hover:-translate-y-2">
                            <div className="aspect-square overflow-hidden bg-white/5">
                                <img
                                    src={post.mediaUrl}
                                    alt="Marketplace Post"
                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60"></div>
                            </div>

                            <div className="relative p-6 -mt-10 bg-gradient-to-t from-[#0B0F1A] to-transparent">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                        {post.category}
                                    </span>
                                    <span className="text-xl font-black text-[var(--foreground)]">
                                        {post.price > 0 ? `₹${post.price}` : 'FREE'}
                                    </span>
                                </div>
                                <p className="text-[var(--foreground)]/80 text-sm font-medium line-clamp-2 min-h-[2.5rem] mb-6">
                                    {post.caption}
                                </p>
                                <button
                                    onClick={() => handleActivate(post._id)}
                                    disabled={activating === post._id}
                                    className="w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-black transition hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
                                >
                                    {activating === post._id ? 'Processing...' : 'Buy & Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center py-20 rounded-3xl border border-dashed border-white/10">
                    <p className="text-[var(--foreground)]/40 font-bold uppercase tracking-widest text-sm">Marketplace coming soon</p>
                </div>
            )}
        </div>
    );
}
