import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find(o => o.value === value);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(p => !p)}
                className={`w-full flex items-center justify-between gap-3 bg-white/5 border rounded-xl px-4 py-3 text-left transition-all ${open ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : 'border-white/10 hover:border-white/20'}`}>
                {selected ? (
                    <span className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-[var(--foreground)] text-sm font-semibold truncate">{selected.label}</span>
                    </span>
                ) : (
                    <span className="text-[var(--foreground)]/30 text-sm">{placeholder || 'Select an option'}</span>
                )}
                <svg className={`h-4 w-4 text-[var(--foreground)]/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#12162A] shadow-2xl overflow-hidden">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-[var(--foreground)]/30 text-sm italic">No accounts connected</div>
                    ) : options.map(opt => (
                        <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${value === opt.value ? 'bg-blue-500/10' : ''}`}>
                            <span className={`h-2 w-2 rounded-full shrink-0 ${value === opt.value ? 'bg-blue-400' : 'bg-white/20'}`} />
                            <span className={`text-sm font-semibold truncate ${value === opt.value ? 'text-blue-300' : 'text-[var(--foreground)]'}`}>{opt.label}</span>
                            {value === opt.value && <svg className="h-3.5 w-3.5 text-blue-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        posted:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Posted' },
        failed:    { bg: 'bg-red-500/15',     text: 'text-red-400',     dot: 'bg-red-400',     label: 'Failed' },
        scheduled: { bg: 'bg-violet-500/15',  text: 'text-violet-400',  dot: 'bg-violet-400',  label: 'Scheduled' },
        pending:   { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400',    label: 'Pending' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

// ── Avatar with fallback ──────────────────────────────────────────────────────
function Avatar({ src, name, size = 'md' }) {
    const [errored, setErrored] = useState(false);
    const sizeMap = { sm: 'h-4 w-4', md: 'h-10 w-10', lg: 'h-20 w-20 text-xl' };
    const initials = name ? name.slice(0, 2).toUpperCase() : '?';
    if (!src || errored) return (
        <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-[var(--foreground)] text-sm`}>{initials.slice(0,1)}</div>
    );
    return <img src={src} alt={name || ''} onError={() => setErrored(true)} className={`${sizeMap[size]} rounded-full object-cover`} />;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FacebookManager({ service }) {
    const location = useLocation();
    const serviceId = service?._id;
    const platformPath = 'facebook';
    const platformName = 'Facebook';

    const [accounts, setAccounts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [selectedAccount, setSelectedAccount] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('IMAGE');
    const [scheduledAt, setScheduledAt] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [submitting, setSubmitting] = useState(false);
    const [postingNow, setPostingNow] = useState(false);

    // Upload state
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [imageInputMode, setImageInputMode] = useState('upload');
    const [manualUrl, setManualUrl] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    const token  = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // ── File upload ──────────────────────────────────────────────────────────
    const validateAndPreview = useCallback(async (file) => {
        if (!file) return;
        const allowedImages = ['image/jpeg','image/jpg','image/png','image/webp'];
        const allowedVideos = ['video/mp4','video/quicktime','video/x-m4v'];
        const isImage = allowedImages.includes(file.type);
        const isVideo = allowedVideos.includes(file.type);
        if (!isImage && !isVideo) return toast.error('Only JPG, PNG, WebP images and MP4/MOV videos are allowed.');
        if (isImage && file.size > 8 * 1024 * 1024) return toast.error('Image too large. Max 8 MB.');
        if (isVideo && file.size > 100 * 1024 * 1024) return toast.error('Video too large. Max 100 MB.');

        setMediaType(isVideo ? 'VIDEO' : 'IMAGE');
        setUploadPreview(URL.createObjectURL(file));
        setMediaUrl('');
        setUploadProgress(0);
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        try {
            const endpoint = isVideo ? `${API_URL}/v1/upload/video` : `${API_URL}/v1/upload/image`;
            const res = await axios.post(endpoint, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => { if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total)); }
            });
            setMediaUrl(res.data.url);
            setUploadProgress(100);
            toast.success(`${isVideo ? 'Video' : 'Image'} uploaded ✅`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    }, []);

    const handleFileDrop = useCallback((e) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) validateAndPreview(file);
    }, [validateAndPreview]);

    const handleClearImage = () => {
        setUploadPreview(null); setMediaUrl(''); setUploadProgress(0); setManualUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Data fetching ────────────────────────────────────────────────────────
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('connected') === 'facebook') toast.success('Facebook account connected!');
        fetchAccounts();
        fetchPosts();
    }, [location]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/accounts`, config);
            const accs = res.data.data.accounts || [];
            setAccounts(accs);
            if (accs.length > 0 && !selectedAccount) setSelectedAccount(accs[0]._id);
        } catch (err) { console.error(err); }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/posts`, config);
            setPosts(res.data.data.posts || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/auth-url?serviceId=${serviceId}`, config);
            window.location.href = res.data.url;
        } catch { toast.error('Failed to get connection URL'); setConnecting(false); }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedAccount) return toast.error('Please select a Facebook account');
        if (!mediaUrl) return toast.error('Please upload or paste an image URL');
        if (!caption) return toast.error('Please write a caption');
        if (!scheduledAt) return toast.error('Please set a schedule date & time');
        const scheduledAtUTC = new Date(scheduledAt).toISOString();
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/v1/social/${platformPath}/schedule`,
                { facebookAccountId: selectedAccount, caption, mediaUrl, mediaType, scheduledAt: scheduledAtUTC }, config);
            toast.success('Post scheduled successfully!');
            setCaption(''); handleClearImage();
            fetchPosts();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule post'); }
        finally { setSubmitting(false); }
    };

    const handlePostNow = async () => {
        if (!selectedAccount) return toast.error('Please select a Facebook account');
        if (!mediaUrl) return toast.error('Please upload an image first');
        if (!caption) return toast.error('Please write a caption');
        setPostingNow(true);
        try {
            await axios.post(`${API_URL}/v1/social/${platformPath}/post-now`,
                { facebookAccountId: selectedAccount, caption, mediaUrl, mediaType }, config);
            toast.success('Posted to Facebook! 🎉');
            setCaption(''); handleClearImage();
            fetchPosts();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
        finally { setPostingNow(false); }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        setDeletingId(postId);
        try {
            await axios.delete(`${API_URL}/v1/social/${platformPath}/posts/${postId}`, config);
            toast.success('Post deleted');
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
        finally { setDeletingId(null); }
    };

    const accountOptions = accounts.map(acc => ({ value: acc._id, label: acc.username }));

    // ── Facebook brand colors ────────────────────────────────────────────────
    const fbGrad = 'from-blue-600 to-indigo-600';
    const fbShadow = 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]';

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <div className="mx-auto max-w-6xl">

                {/* ── Header ── */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="h-5 w-5 text-[var(--foreground)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black text-[var(--foreground)]">{platformName} Manager</h1>
                        </div>
                        <p className="text-[var(--foreground)]/40 ml-13">Connect your Facebook Pages and schedule your content.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                        <Link to="/social/calendar"
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[var(--foreground)] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                            📅 Calendar View
                        </Link>
                        <button onClick={handleConnect} disabled={connecting}
                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r ${fbGrad} text-[var(--foreground)] font-black uppercase tracking-widest text-sm ${fbShadow} transition-all disabled:opacity-50 active:scale-95`}>
                            {connecting ? (
                                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Redirecting...</>
                            ) : (
                                <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                {accounts.length > 0 ? 'Add Another Page' : 'Connect Facebook'}</>
                            )}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Scheduling Form ── */}
                    <div className="lg:col-span-1">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl sticky top-28">
                            <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">📘</span>
                                Schedule Post
                            </h2>

                            <form onSubmit={handleSchedule} className="space-y-5">
                                {/* Account */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Select Facebook Page</label>
                                    <CustomSelect value={selectedAccount} onChange={setSelectedAccount} options={accountOptions} placeholder="No pages connected"/>
                                </div>

                                {/* Content Type */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Content Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ type: 'IMAGE', icon: '🖼️' }, { type: 'VIDEO', icon: '🎬' }].map(({ type, icon }) => (
                                            <button key={type} type="button" onClick={() => setMediaType(type)}
                                                className={`py-2.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all ${mediaType === type
                                                    ? `bg-gradient-to-r ${fbGrad} border-transparent text-[var(--foreground)] shadow-md`
                                                    : 'bg-white/5 border-white/10 text-[var(--foreground)]/40 hover:bg-white/10'}`}>
                                                <span>{icon}</span> {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Media Upload Widget */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                                            {mediaType === 'VIDEO' ? 'Video' : 'Image'}
                                        </label>
                                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                                            {['upload','url'].map(mode => (
                                                <button key={mode} type="button"
                                                    onClick={() => { setImageInputMode(mode); if (mode === 'upload') { setManualUrl(''); if (!uploadPreview) setMediaUrl(''); } else { handleClearImage(); } }}
                                                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${imageInputMode === mode ? 'bg-blue-600 text-[var(--foreground)] shadow' : 'text-[var(--foreground)]/30 hover:text-[var(--foreground)]/50'}`}>
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {imageInputMode === 'upload' ? (
                                        <>
                                            {!uploadPreview ? (
                                                <div ref={dropRef}
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleFileDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/[0.03]'}`}>
                                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-[var(--foreground)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                    </div>
                                                    <p className="text-[var(--foreground)]/30 text-xs font-semibold text-center">Drag & drop or <span className="text-blue-400">click to browse</span></p>
                                                    <p className="text-[var(--foreground)]/20 text-[10px]">Images (Max 8MB) · MP4/MOV (Max 100MB)</p>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                                                    {mediaType === 'VIDEO'
                                                        ? <video src={uploadPreview} className="w-full h-40 object-cover bg-black" controls muted/>
                                                        : <img src={uploadPreview} alt="preview" className="w-full h-40 object-cover"/>}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={handleClearImage} className="px-3 py-1.5 rounded-lg bg-red-500/80 text-[var(--foreground)] text-xs font-bold">✕ Remove</button>
                                                    </div>
                                                    {mediaUrl && <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-[var(--foreground)] text-[10px] font-black px-2 py-1 rounded-full">✓ Uploaded</div>}
                                                </div>
                                            )}
                                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) validateAndPreview(f); }}/>
                                            {uploading && (
                                                <div className="mt-3">
                                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${fbGrad} rounded-full transition-all`} style={{ width: `${uploadProgress}%` }}/>
                                                    </div>
                                                    <p className="text-[10px] text-[var(--foreground)]/30 mt-1 text-center">Uploading {uploadProgress}%…</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input type="text" value={manualUrl}
                                                    onChange={e => { setManualUrl(e.target.value); if (e.target.value.match(/\.(jpeg|jpg|png|webp|mp4|mov)$/i)) setMediaUrl(e.target.value); else setMediaUrl(''); }}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-[var(--foreground)]/20"/>
                                                <button type="button" disabled={!manualUrl || uploading}
                                                    onClick={async () => {
                                                        if (!manualUrl) return;
                                                        setUploading(true);
                                                        try {
                                                            const res = await axios.post(`${API_URL}/v1/upload/fetch-url`, { url: manualUrl }, config);
                                                            setMediaUrl(res.data.url);
                                                            setMediaType(res.data.mediaType || 'VIDEO');
                                                            toast.success('Media fetched!');
                                                        } catch (err) { toast.error(err.response?.data?.message || 'Failed to fetch'); }
                                                        finally { setUploading(false); }
                                                    }}
                                                    className="bg-white/10 hover:bg-white/20 text-[var(--foreground)] px-4 py-3 rounded-xl disabled:opacity-50 font-semibold text-sm transition-all whitespace-nowrap">
                                                    {uploading ? 'Fetching...' : 'Fetch'}
                                                </button>
                                            </div>
                                            {mediaUrl && manualUrl && (
                                                <div className="relative rounded-xl overflow-hidden border border-white/10">
                                                    {mediaType === 'VIDEO'
                                                        ? <video src={mediaUrl} className="w-full h-32 object-cover bg-black" controls muted/>
                                                        : <img src={mediaUrl} alt="preview" className="w-full h-32 object-cover" onError={e => e.target.style.display='none'}/>}
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-[var(--foreground)] text-[10px] font-black px-2 py-1 rounded-full">✓ Ready</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Caption */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Caption</label>
                                    <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write something engaging..." rows="4"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all placeholder:text-[var(--foreground)]/20 resize-none"/>
                                    <p className="text-[10px] text-[var(--foreground)]/20 mt-1 text-right">{caption.length} chars</p>
                                </div>

                                {/* Schedule Date */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Schedule Date & Time</label>
                                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-blue-500 transition-all [color-scheme:dark]"/>
                                </div>

                                {/* Post Now */}
                                <button type="button" onClick={handlePostNow} disabled={postingNow || submitting || uploading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-[var(--foreground)] font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {postingNow ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Posting...</> : <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Post Now</>}
                                </button>

                                {/* Schedule */}
                                <button type="submit" disabled={submitting || postingNow || uploading}
                                    className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${fbGrad} text-[var(--foreground)] font-black uppercase tracking-widest text-xs ${fbShadow} transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2`}>
                                    {submitting ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Scheduling...</> : <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>Schedule Post</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Connected accounts strip */}
                        {accounts.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {accounts.map(acc => (
                                    <div key={acc._id} className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 shrink-0 transition-all ${selectedAccount === acc._id ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                                        <Avatar src={acc.profilePicture} name={acc.username} size="sm"/>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--foreground)] truncate max-w-[120px]">{acc.username}</p>
                                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Connected</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Posts List */}
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.01] p-8 backdrop-blur-3xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Scheduling Queue</h2>
                                    <p className="text-[var(--foreground)]/30 text-xs">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
                                </div>
                                <button onClick={fetchPosts} className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-blue-400 hover:bg-white/10 transition">Refresh</button>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"/></div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                                        <div className="text-5xl mb-4">📘</div>
                                        <h3 className="text-[var(--foreground)]/60 font-bold mb-2">No posts scheduled yet</h3>
                                        <p className="text-[var(--foreground)]/30 text-sm">Connect a Facebook Page and schedule your first post.</p>
                                    </div>
                                ) : posts.map((post, i) => (
                                    <div key={i} className="group flex items-start gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15">
                                        {/* Thumbnail */}
                                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 shrink-0 group-hover:scale-105 transition-transform bg-white/5">
                                            {post.mediaUrl ? (
                                                post.mediaType === 'VIDEO'
                                                    ? <div className="h-full w-full flex items-center justify-center text-2xl">🎬</div>
                                                    : <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" onError={e => e.target.style.display='none'}/>
                                            ) : <div className="h-full w-full flex items-center justify-center text-2xl">📷</div>}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Avatar src={post.facebookAccountId?.profilePicture} name={post.facebookAccountId?.username} size="sm"/>
                                                <span className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest truncate">{post.facebookAccountId?.username}</span>
                                                <StatusBadge status={post.status}/>
                                            </div>
                                            <p className="text-[var(--foreground)] font-semibold text-sm line-clamp-2 mb-2">{post.caption}</p>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                    📅 {new Date(post.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-[var(--foreground)]/20 uppercase tracking-widest">{post.mediaType}</span>
                                            </div>
                                            {post.errorMessage && <p className="text-[10px] text-red-400 mt-1 italic">⚠ {post.errorMessage}</p>}
                                        </div>
                                        {/* Delete */}
                                        {post.status !== 'posted' && (
                                            <button onClick={() => handleDelete(post._id)} disabled={deletingId === post._id}
                                                className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all shrink-0">
                                                {deletingId === post._id
                                                    ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>}
                                            </button>
                                        )}
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
