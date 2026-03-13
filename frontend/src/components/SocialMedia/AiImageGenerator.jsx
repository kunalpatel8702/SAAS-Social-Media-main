import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Style Options ─────────────────────────────────────────────────────────────
const STYLES = [
    { id: 'Photorealistic', label: 'Photorealistic', icon: '📷', desc: 'True-to-life quality' },
    { id: 'Digital Art', label: 'Digital Art', icon: '🎨', desc: 'Vibrant digital painting' },
    { id: 'Cinematic', label: 'Cinematic', icon: '🎬', desc: 'Movie-grade drama' },
    { id: 'Minimalist', label: 'Minimalist', icon: '✦', desc: 'Clean & elegant' },
    { id: 'Anime', label: 'Anime', icon: '⛩️', desc: 'Japanese animation style' },
    { id: 'Fantasy', label: 'Fantasy', icon: '🔮', desc: 'Magical & surreal' },
];

const ASPECT_RATIOS = [
    { id: '1:1', label: '1 : 1', desc: 'Square', icon: '⬛' },
    { id: '16:9', label: '16 : 9', desc: 'Landscape', icon: '▬' },
    { id: '9:16', label: '9 : 16', desc: 'Portrait', icon: '▮' },
    { id: '4:3', label: '4 : 3', desc: 'Standard', icon: '▭' },
];

// ── Shimmer Skeleton ──────────────────────────────────────────────────────────
function ImageSkeleton({ aspectRatio }) {
    const ratioClass = {
        '1:1': 'aspect-square',
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
        '4:3': 'aspect-[4/3]',
    }[aspectRatio] || 'aspect-square';

    return (
        <div className={`w-full ${ratioClass} rounded-2xl overflow-hidden relative bg-white/5`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl animate-pulse">✨</span>
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[var(--foreground)]/60 text-sm font-semibold">Generating your image...</p>
                    <p className="text-[var(--foreground)]/30 text-xs">Mistral is crafting the perfect prompt</p>
                </div>
            </div>
        </div>
    );
}

// ── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({ item, onSelect }) {
    return (
        <button
            onClick={() => onSelect(item)}
            className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all"
        >
            <img src={item.imageUrl} alt={item.topic} className="w-full h-24 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[var(--foreground)] text-xs font-bold">View</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                <p className="text-[var(--foreground)]/70 text-[10px] truncate">{item.topic}</p>
            </div>
        </button>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AiImageGenerator({ service }) {
    const [topic, setTopic] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null); // { imageUrl, prompt, caption, hashtags, topic, style, aspectRatio }
    const [history, setHistory] = useState([]); // last 6 generated images
    const [promptVisible, setPromptVisible] = useState(false);
    
    // Posting states
    const [posting, setPosting] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [editableCaption, setEditableCaption] = useState('');
    const [editableHashtags, setEditableHashtags] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');

    // Scheduling state
    const getDefaultDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };
    const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime);
    const [showScheduler, setShowScheduler] = useState(false);

    const topicRef = useRef(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch Instagram accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await axios.get(`${API_URL}/v1/social/instagram/accounts`, config);
                const accs = res.data.data.accounts || [];
                setAccounts(accs);
                if (accs.length > 0) {
                    setSelectedAccount(accs[0]._id);
                }
            } catch (err) {
                console.error('Error fetching Instagram accounts:', err);
            }
        };
        fetchAccounts();
    }, []);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic or idea first');
            topicRef.current?.focus();
            return;
        }
        setGenerating(true);
        setResult(null);
        setPromptVisible(false);

        try {
            const res = await axios.post(
                `${API_URL}/v1/ai/generate-image`,
                { topic: topic.trim(), style: selectedStyle, aspectRatio },
                config
            );
            const data = res.data.data;
            setResult(data);
            setEditableCaption(data.caption || '');
            setEditableHashtags(data.hashtags || '');
            setHistory(prev => [data, ...prev].slice(0, 6)); // keep last 6
            toast.success('Image generated! ✨');
        } catch (err) {
            const msg = err.response?.data?.message || 'Generation failed. Please try again.';
            toast.error(msg);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!result?.imageUrl) return;
        try {
            const response = await fetch(result.imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-image-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Image downloaded!');
        } catch {
            // Fallback: open in new tab
            window.open(result.imageUrl, '_blank');
        }
    };

    const handleCopyPrompt = () => {
        if (!result?.prompt) return;
        navigator.clipboard.writeText(result.prompt).then(() => {
            toast.success('Prompt copied to clipboard!');
        });
    };

    const handlePostToInstagram = async () => {
        if (!result?.imageUrl) {
            return toast.error("No image to post");
        }
        if (!selectedAccount) {
            return toast.error("Please connect an Instagram account first");
        }

        setPosting(true);
        const finalCaption = `${editableCaption}\n\n${editableHashtags}`;

        try {
            // Reusing the general upload function pattern:
            // 1. Upload the generated image to our R2 bucket to get a public mediaUrl
            const response = await fetch(result.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `ai-image-${Date.now()}.png`, { type: 'image/png' });

            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await axios.post(`${API_URL}/v1/upload/image`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            
            const uploadedMediaUrl = uploadRes.data.url;

            // 2. Trigger the Instagram post-now endpoint
            await axios.post(
                `${API_URL}/v1/social/instagram/post-now`,
                {
                    instagramAccountId: selectedAccount,
                    caption: finalCaption,
                    mediaUrl: uploadedMediaUrl,
                    mediaType: 'IMAGE'
                },
                config
            );

            toast.success('Successfully posted to Instagram! 🚀');
        } catch (err) {
            console.error('Error posting to IG:', err);
            const msg = err.response?.data?.message || 'Failed to post to Instagram.';
            toast.error(msg);
        } finally {
            setPosting(false);
        }
    };

    const handleScheduleToInstagram = async () => {
        if (!result?.imageUrl) return toast.error('No image to schedule');
        if (!selectedAccount) return toast.error('Please connect an Instagram account first');
        if (!scheduledAt) return toast.error('Please select a date and time to schedule');

        const chosenTime = new Date(scheduledAt);
        if (chosenTime <= new Date()) return toast.error('Schedule time must be in the future');

        setScheduling(true);
        const finalCaption = `${editableCaption}\n\n${editableHashtags}`;

        try {
            // Upload image to R2 first
            const response = await fetch(result.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `ai-image-${Date.now()}.png`, { type: 'image/png' });
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await axios.post(`${API_URL}/v1/upload/image`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            const uploadedMediaUrl = uploadRes.data.url;

            // Schedule the post
            await axios.post(
                `${API_URL}/v1/social/instagram/schedule`,
                {
                    instagramAccountId: selectedAccount,
                    caption: finalCaption,
                    mediaUrl: uploadedMediaUrl,
                    mediaType: 'IMAGE',
                    scheduledAt: chosenTime.toISOString(),
                },
                config
            );

            toast.success(`📅 Post scheduled for ${chosenTime.toLocaleString()}!`);
            setShowScheduler(false);
        } catch (err) {
            console.error('Error scheduling IG post:', err);
            const msg = err.response?.data?.message || 'Failed to schedule post.';
            toast.error(msg);
        } finally {
            setScheduling(false);
        }
    };

    const EXAMPLE_TOPICS = [
        'Sunset over a futuristic Tokyo skyline',
        'A cozy coffee shop in a rainy autumn evening',
        'Deep ocean bioluminescent sea creatures',
        'Golden retriever puppy in a field of sunflowers',
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
            <div className="mx-auto max-w-6xl">

                {/* ── Header ── */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-xl">
                            ✨
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-[var(--foreground)]">AI Image Generator</h1>
                            <p className="text-[var(--foreground)]/40 text-sm mt-0.5">
                                Powered by <span className="text-purple-400 font-semibold">Mistral AI</span> + <span className="text-pink-400 font-semibold">fal-ai/z-image</span>
                            </p>
                        </div>
                    </div>
                    {/* Subscription badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                        Premium Feature · {service?.name || 'AI Image Generation'}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Left Panel: Controls ── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl sticky top-28 space-y-6">

                            {/* Topic Input */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                    Your Topic / Idea
                                </label>
                                <textarea
                                    ref={topicRef}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. A majestic dragon flying over ancient mountains at dawn..."
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all placeholder:text-[var(--foreground)]/20 resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
                                    }}
                                />
                                <p className="text-[10px] text-[var(--foreground)]/20 mt-1 text-right">{topic.length} chars · Ctrl+Enter to generate</p>
                            </div>

                            {/* Example Topics */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                    Try an example
                                </label>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {EXAMPLE_TOPICS.map(ex => (
                                        <button
                                            key={ex}
                                            type="button"
                                            onClick={() => setTopic(ex)}
                                            className="text-left text-xs text-[var(--foreground)]/40 hover:text-purple-400 hover:bg-purple-500/5 px-3 py-2 rounded-lg border border-transparent hover:border-purple-500/20 transition-all truncate"
                                        >
                                            ↗ {ex}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style Selector */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-3">
                                    Image Style
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLES.map(style => (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all ${selectedStyle === style.id
                                                ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-base">{style.icon}</span>
                                            <span className={`text-[11px] font-black ${selectedStyle === style.id ? 'text-purple-300' : 'text-[var(--foreground)]/70'}`}>
                                                {style.label}
                                            </span>
                                            <span className="text-[9px] text-[var(--foreground)]/30">{style.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Aspect Ratio */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-3">
                                    Aspect Ratio
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {ASPECT_RATIOS.map(ratio => (
                                        <button
                                            key={ratio.id}
                                            type="button"
                                            onClick={() => setAspectRatio(ratio.id)}
                                            className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-all ${aspectRatio === ratio.id
                                                ? 'bg-gradient-to-b from-violet-500/20 to-pink-500/10 border-purple-500/50'
                                                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-lg leading-none">{ratio.icon}</span>
                                            <span className={`text-[9px] font-black ${aspectRatio === ratio.id ? 'text-purple-300' : 'text-[var(--foreground)]/50'}`}>
                                                {ratio.label}
                                            </span>
                                            <span className="text-[8px] text-[var(--foreground)]/20">{ratio.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={generating || !topic.trim()}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-[var(--foreground)] font-black uppercase tracking-widest text-sm hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {generating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl">✨</span>
                                        Generate Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Right Panel: Output ── */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Image Display / Empty State / Skeleton */}
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl">
                            {generating ? (
                                <ImageSkeleton aspectRatio={aspectRatio} />
                            ) : result ? (
                                <div className="space-y-5">
                                    {/* The generated image */}
                                    <div className="relative rounded-2xl overflow-hidden group">
                                        <img
                                            src={result.imageUrl}
                                            alt={result.topic}
                                            className="w-full object-cover rounded-2xl"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-[var(--foreground)] text-sm font-bold hover:bg-white/30 transition-all"
                                            >
                                                ⬇ Download
                                            </button>
                                            <button
                                                onClick={() => window.open(result.imageUrl, '_blank')}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-[var(--foreground)] text-sm font-bold hover:bg-white/30 transition-all"
                                            >
                                                ↗ Open Full
                                            </button>
                                        </div>
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 text-[var(--foreground)] text-[10px] font-black">
                                                {STYLES.find(s => s.id === result.style)?.icon} {result.style}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 text-[var(--foreground)] text-[10px] font-black">
                                                {result.aspectRatio}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur text-[var(--foreground)] text-[10px] font-black">
                                                ✓ Generated
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                        {/* Account Selector */}
                                        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500 transition-all">
                                            <select
                                                value={selectedAccount}
                                                onChange={(e) => setSelectedAccount(e.target.value)}
                                                className="w-full bg-transparent px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled className="bg-[var(--background)] text-[var(--foreground)]/50">Select Instagram Account</option>
                                                {accounts.map(acc => (
                                                    <option key={acc._id} value={acc._id} className="bg-[var(--background)] text-[var(--foreground)]">
                                                        @{acc.username}
                                                    </option>
                                                ))}
                                            </select>
                                            {accounts.length === 0 && (
                                                <div className="px-3 flex items-center bg-red-500/10 text-red-400 text-xs font-bold shrink-0">
                                                    No Accounts
                                                </div>
                                            )}
                                        </div>

                                        {/* Post Now + Schedule Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={handlePostToInstagram}
                                                disabled={posting || scheduling || !selectedAccount}
                                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-[var(--foreground)] font-black text-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {posting ? (
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : '🚀'} Post Now
                                            </button>
                                            <button
                                                onClick={() => setShowScheduler(s => !s)}
                                                disabled={posting || scheduling || !selectedAccount}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-black text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    showScheduler
                                                        ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                                                        : 'bg-white/5 border-white/10 text-[var(--foreground)]/70 hover:bg-white/10 hover:text-[var(--foreground)]'
                                                }`}
                                            >
                                                📅 Schedule
                                            </button>
                                        </div>

                                        {/* Schedule Date/Time Picker — expands when active */}
                                        {showScheduler && (
                                            <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-violet-400/70">
                                                    📅 Pick Date &amp; Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduledAt}
                                                    onChange={(e) => setScheduledAt(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[var(--foreground)] text-sm focus:outline-none focus:border-violet-500 transition-all"
                                                />
                                                <button
                                                    onClick={handleScheduleToInstagram}
                                                    disabled={scheduling || !scheduledAt}
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-[var(--foreground)] font-black text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {scheduling ? (
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                    ) : '📅'} Confirm Schedule
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDownload}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-[var(--foreground)] font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
                                            >
                                                ⬇ Download
                                            </button>
                                            <button
                                                onClick={() => { setResult(null); setTopic(''); }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--foreground)]/50 font-bold text-sm hover:bg-white/10 hover:text-[var(--foreground)] transition-all"
                                            >
                                                ↺ New Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* Caption & Hashtags Editor */}
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                                AI Generated Caption
                                            </label>
                                            <textarea
                                                value={editableCaption}
                                                onChange={(e) => setEditableCaption(e.target.value)}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-[var(--foreground)]/20 resize-y"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                                Hashtags
                                            </label>
                                            <textarea
                                                value={editableHashtags}
                                                onChange={(e) => setEditableHashtags(e.target.value)}
                                                rows={2}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-purple-300 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-[var(--foreground)]/20 resize-y"
                                            />
                                        </div>
                                    </div>

                                    {/* AI Prompt Display (collapsible) */}
                                    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                                        <button
                                            onClick={() => setPromptVisible(p => !p)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                                                🤖 Mistral-Enhanced Prompt
                                            </span>
                                            <svg
                                                className={`h-4 w-4 text-[var(--foreground)]/30 transition-transform ${promptVisible ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {promptVisible && (
                                            <div className="px-4 pb-4 pt-1">
                                                <p className="text-[var(--foreground)]/60 text-xs leading-relaxed font-mono bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                                    {result.prompt}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* ── Empty State ── */
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="relative mb-6">
                                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center text-5xl">
                                            🎨
                                        </div>
                                        <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/30">
                                            ✨
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Your Canvas Awaits</h3>
                                    <p className="text-[var(--foreground)]/40 text-sm max-w-xs leading-relaxed">
                                        Enter a topic on the left, choose your style, and let Mistral AI + fal-ai craft something extraordinary.
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-[10px] text-[var(--foreground)]/25 uppercase tracking-widest font-bold">
                                        <span className="text-purple-400/60">Mistral</span>
                                        <span>→</span>
                                        <span className="text-pink-400/60">fal-ai/z-image/turbo</span>
                                        <span>→</span>
                                        <span className="text-emerald-400/60">Your Image</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Generation History ── */}
                        {history.length > 0 && (
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-4">
                                    Session History ({history.length})
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {history.map((item, idx) => (
                                        <HistoryCard
                                            key={idx}
                                            item={item}
                                            onSelect={(item) => {
                                                setResult(item);
                                                setTopic(item.topic);
                                                setSelectedStyle(item.style);
                                                setAspectRatio(item.aspectRatio);
                                                setEditableCaption(item.caption || '');
                                                setEditableHashtags(item.hashtags || '');
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
