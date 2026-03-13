import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InstagramManager() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        caption: '',
        mediaUrl: '',
        mediaType: 'IMAGE',
        price: 0,
        category: 'Lifestyle',
        isActive: true
    });

    const token = localStorage.getItem('adminToken');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/social/instagram-marketplace`);
            setPosts(res.data.data.posts);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/v1/social/instagram-marketplace`, formData, config);
            toast.success('Instagram post added successfully!');
            setShowAddForm(false);
            setFormData({
                caption: '',
                mediaUrl: '',
                mediaType: 'IMAGE',
                price: 0,
                category: 'Lifestyle',
                isActive: true
            });
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add post');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`${API_URL}/v1/social/instagram-marketplace/${id}`, config);
            toast.success('Post deleted');
            fetchPosts();
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--foreground)]">Instagram Post Marketplace</h2>
                    <p className="text-[var(--foreground)]/60">Manage posts that users can buy and activate</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-3 font-bold text-[var(--foreground)] transition hover:opacity-90"
                >
                    {showAddForm ? 'Cancel' : 'Add New Post'}
                </button>
            </div>

            {showAddForm && (
                <div className="mb-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">Create New Marketplace Post</h3>
                    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Caption</label>
                            <textarea
                                name="caption"
                                required
                                rows={3}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 outline-none transition"
                                placeholder="Enter an engaging caption..."
                                value={formData.caption}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Media URL (Image/Video)</label>
                            <input
                                type="text"
                                name="mediaUrl"
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 outline-none transition"
                                placeholder="https://..."
                                value={formData.mediaUrl}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Media Type</label>
                            <select
                                name="mediaType"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 outline-none"
                                value={formData.mediaType}
                                onChange={handleInputChange}
                            >
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                                <option value="REELS">Reels</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Price (INR)</label>
                            <input
                                type="number"
                                name="price"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 outline-none"
                                value={formData.price}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">Category</label>
                            <input
                                type="text"
                                name="category"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[var(--foreground)] focus:border-purple-500/50 outline-none"
                                value={formData.category}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-purple-600 py-4 font-bold text-[var(--foreground)] transition hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Marketplace Post'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <div key={post._id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-white/20">
                        <div className="aspect-square w-full overflow-hidden bg-white/5">
                            {post.mediaType === 'IMAGE' ? (
                                <img src={post.mediaUrl} alt="Post" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-[var(--foreground)]/40">
                                    [Video/Reels Content]
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400 uppercase tracking-wider">
                                    {post.category}
                                </span>
                                <span className="text-[var(--foreground)] font-bold">
                                    {post.price > 0 ? `₹${post.price}` : 'FREE'}
                                </span>
                            </div>
                            <p className="line-clamp-2 text-sm text-[var(--foreground)]/70 mb-4">{post.caption}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
                                >
                                    Delete
                                </button>
                                <button
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-[var(--foreground)] transition hover:bg-white/10"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {posts.length === 0 && !loading && (
                <div className="text-center py-20 text-[var(--foreground)]/40">
                    No posts added to marketplace yet.
                </div>
            )}
        </div>
    );
}
