import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const IMG_STYLES = [
    { id: 'Photorealistic', icon: '📷' }, { id: 'Digital Art', icon: '🎨' },
    { id: 'Cinematic', icon: '🎬' },     { id: 'Minimalist', icon: '✦' },
    { id: 'Anime', icon: '⛩️' },         { id: 'Fantasy', icon: '🔮' },
];
const IMG_RATIOS = [
    { id: '1:1', label: '1:1', icon: '⬛' }, { id: '16:9', label: '16:9', icon: '▬' },
    { id: '9:16', label: '9:16', icon: '▮' }, { id: '4:3', label: '4:3', icon: '▭' },
];

// ── Custom Dropdown ─────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className={`w-full flex items-center justify-between gap-3 bg-white/5 border rounded-xl px-4 py-3 text-left transition-all ${open ? 'border-pink-500 shadow-[0_0_0_3px_rgba(236,72,153,0.15)]' : 'border-white/10 hover:border-white/20'}`}
            >
                {selected ? (
                    <span className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full bg-pink-400 shrink-0"></span>
                        <span className="text-[var(--foreground)] text-sm font-semibold truncate">{selected.label}</span>
                    </span>
                ) : (
                    <span className="text-[var(--foreground)]/30 text-sm">{placeholder || 'Select an option'}</span>
                )}
                <svg
                    className={`h-4 w-4 text-[var(--foreground)]/40 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#12162A] shadow-2xl shadow-black/60 overflow-hidden">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-[var(--foreground)]/30 text-sm italic">No accounts connected</div>
                    ) : (
                        options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${value === opt.value ? 'bg-pink-500/10' : ''}`}
                            >
                                <span className={`h-2 w-2 rounded-full shrink-0 ${value === opt.value ? 'bg-pink-400' : 'bg-white/20'}`}></span>
                                <span className={`text-sm font-semibold truncate ${value === opt.value ? 'text-pink-300' : 'text-[var(--foreground)]'}`}>
                                    {opt.label}
                                </span>
                                {value === opt.value && (
                                    <svg className="h-3.5 w-3.5 text-pink-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ── Avatar Fallback ──────────────────────────────────────────────────────────
function Avatar({ src, name, size = 'md' }) {
    const [errored, setErrored] = useState(false);
    const sizeMap = { sm: 'h-4 w-4 text-[8px]', md: 'h-10 w-10 text-sm', lg: 'h-20 w-20 text-xl' };
    const initials = name ? name.slice(0, 2).toUpperCase() : '?';
    if (!src || errored) {
        return (
            <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-black text-[var(--foreground)]`}>
                {size === 'sm' ? '' : initials}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={name || ''}
            onError={() => setErrored(true)}
            className={`${sizeMap[size]} rounded-full object-cover`}
        />
    );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        posted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Posted' },
        failed: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400', label: 'Failed' },
        pending: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Pending' },
    };
    const s = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}></span>
            {s.label}
        </span>
    );
}

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

// ── Main Component ───────────────────────────────────────────────────────────
export default function InstagramServiceManager({ service }) {
    const location = useLocation();
    const serviceId = service?._id;
    const platformName = 'Instagram';
    const platformPath = 'instagram';

    const [accounts, setAccounts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Scheduling Form State
    const [selectedAccount, setSelectedAccount] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('IMAGE');

    const getDefaultDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };
    const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime());
    const [submitting, setSubmitting] = useState(false);
    const [postingNow, setPostingNow] = useState(false);

    // Image Upload State
    const [uploadFile, setUploadFile] = useState(null);      // File object
    const [uploadPreview, setUploadPreview] = useState(null); // local blob URL for thumbnail
    const [uploadProgress, setUploadProgress] = useState(0);  // 0-100
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const dropRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
    const [manualUrl, setManualUrl] = useState('');

    // ── Tab state ────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('schedule'); // 'image' | 'video' | 'schedule'
    const [aiLoadedBanner, setAiLoadedBanner] = useState(null); // { type: 'image'|'video' } | null

    // ── AI Image state ───────────────────────────────────────────────────────
    const [imgTopic, setImgTopic] = useState('');
    const [imgStyle, setImgStyle] = useState('Photorealistic');
    const [imgRatio, setImgRatio] = useState('1:1');
    const [imgGenerating, setImgGenerating] = useState(false);
    const [imgResult, setImgResult] = useState(null);
    const [imgHistory, setImgHistory] = useState([]);
    const [promptVisible, setPromptVisible] = useState(false);
    
    const EXAMPLE_TOPICS = [
        'Sunset over a futuristic Tokyo skyline',
        'A cozy coffee shop in a rainy autumn evening',
        'Deep ocean bioluminescent sea creatures',
        'Golden retriever puppy in a field of sunflowers',
    ];

    // ── AI Video state ───────────────────────────────────────────────────────
    const [vidPrompt, setVidPrompt] = useState('');
    const [vidDuration, setVidDuration] = useState(null);
    const [vidRatio, setVidRatio] = useState('9:16');
    const [vidGenerating, setVidGenerating] = useState(false);
    const [vidStatus, setVidStatus] = useState(null);
    const [vidUrl, setVidUrl] = useState(null);
    const [vidRenderId, setVidRenderId] = useState(null);
    const [currentVidId, setCurrentVidId] = useState(null);
    const vidPollRef = useRef(null);

    const [videoHistory, setVideoHistory] = useState([]);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('none');
    const [showAllVidHistory, setShowAllVidHistory] = useState(false);
    const [playingVoice, setPlayingVoice] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const audioRef = useRef(null);
    const vidPromptRef = useRef(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // ── AI Image handlers ────────────────────────────────────────────────────
    const handleGenerateImage = async () => {
        if (!imgTopic.trim()) return toast.error('Please enter a topic or idea first');
        setImgGenerating(true);
        setImgResult(null);
        setPromptVisible(false);
        try {
            const res = await axios.post(`${API_URL}/v1/ai/generate-image`,
                { topic: imgTopic.trim(), style: imgStyle, aspectRatio: imgRatio }, config);
            setImgResult(res.data.data);
            setImgHistory(prev => [res.data.data, ...prev].slice(0, 6)); // keep last 6
            toast.success('Image generated! ✨');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Image generation failed');
        } finally {
            setImgGenerating(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!imgResult?.imageUrl) return;
        try {
            const response = await fetch(imgResult.imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-image-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Image downloaded!');
        } catch {
            window.open(imgResult.imageUrl, '_blank');
        }
    };

    const handleCopyPrompt = () => {
        if (!imgResult?.prompt) return;
        navigator.clipboard.writeText(imgResult.prompt).then(() => {
            toast.success('Prompt copied to clipboard!');
        });
    };

    const handleUseImageForPost = async (imageUrl, aiCaption, aiHashtags) => {
        toast.loading('Uploading image to use for post…', { id: 'img-upload' });
        try {
            const blob = await (await fetch(imageUrl)).blob();
            const file = new File([blob], `ai-${Date.now()}.png`, { type: 'image/png' });
            const fd = new FormData(); fd.append('file', file);
            const res = await axios.post(`${API_URL}/v1/upload/image`, fd,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
            setMediaUrl(res.data.url);
            setMediaType('IMAGE');
            setUploadPreview(imageUrl);
            setImageInputMode('upload'); // ensure the preview shows, not the drop zone
            if (aiCaption) setCaption([aiCaption, aiHashtags].filter(Boolean).join('\n\n'));
            setAiLoadedBanner('image');
            setActiveTab('schedule');
            toast.success('Image ready — add your caption!', { id: 'img-upload' });
        } catch (err) {
            toast.error('Failed to upload AI image', { id: 'img-upload' });
        }
    };

    // ── AI Video handlers ────────────────────────────────────────────────────
    const playPreview = (voice) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (playingVoice === voice.id) {
            setPlayingVoice(null);
            return;
        }
        if (voice.previewUrl) {
            const audio = new Audio(voice.previewUrl);
            audioRef.current = audio;
            setPlayingVoice(voice.id);
            audio.play().catch(err => {
                toast.error('Preview not available');
                setPlayingVoice(null);
            });
            audio.onended = () => setPlayingVoice(null);
        }
    };

    const startVidPolling = (renderId) => {
        if (vidPollRef.current) clearInterval(vidPollRef.current);
        vidPollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API_URL}/v1/video/status/${renderId}`, config);
                const { status, url } = res.data.data;
                setVidStatus(status === 'done' ? 'Ready!' : status + '…');
                if (status === 'done' && url) {
                    setVidUrl(url);
                    setVidGenerating(false);
                    fetchVideos();
                    clearInterval(vidPollRef.current);
                    toast.success('Video ready! 🚀');
                } else if (status === 'failed') {
                    setVidGenerating(false);
                    clearInterval(vidPollRef.current);
                    toast.error('Video render failed.');
                }
            } catch { /* ignore poll errors */ }
        }, 3000);
    };

    const handleGenerateVideo = async () => {
        if (!vidPrompt.trim()) return toast.error('Please enter a video prompt first');
        if (!vidDuration) return toast.error('Please select a video duration');
        setVidGenerating(true); setVidUrl(null); setVidStatus('Initializing…'); setCurrentVidId(null);
        try {
            const res = await axios.post(`${API_URL}/v1/video/generate`,
                { prompt: vidPrompt.trim(), voiceId: selectedVoice, duration: vidDuration, aspectRatio: vidRatio }, config);
            const { renderId, videoId } = res.data.data;
            setVidRenderId(renderId);
            setCurrentVidId(videoId);
            startVidPolling(renderId);
            toast.success('Video generation started! ✨');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Video generation failed.');
            setVidGenerating(false);
        }
    };

    const handleDownloadVideo = async (videoId, url) => {
        try {
            setDownloading(true);
            if (videoId) {
                const response = await fetch(`${API_URL}/v1/video/download/${videoId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Download failed');
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `video-${videoId}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                toast.success('Download started!');
            } else {
                window.open(url, '_blank');
                toast.success('Opening video in new tab...');
            }
        } catch (err) {
            toast.error('Failed to download video. Opening in new tab...');
            window.open(url, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    const handleUseVideoForPost = async (url) => {
        toast.loading('Preparing video for post…', { id: 'vid-upload' });
        try {
            const res = await axios.post(`${API_URL}/v1/upload/fetch-url`, { url }, config);
            setMediaUrl(res.data.url || url);
            setMediaType('VIDEO');
            setUploadPreview(url);
            setImageInputMode('upload');
            setAiLoadedBanner('video');
            setActiveTab('schedule');
            toast.success('Video ready — add your caption!', { id: 'vid-upload' });
        } catch {
            setMediaUrl(url);
            setMediaType('VIDEO');
            setUploadPreview(url);
            setImageInputMode('upload');
            setAiLoadedBanner('video');
            setActiveTab('schedule');
            toast.success('Video loaded — add your caption!', { id: 'vid-upload' });
        }
    };

    // ── Image Upload handlers ────────────────────────────────────────────────
    const validateAndPreview = useCallback(async (file) => {
        if (!file) return;
        const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

        const isImage = allowedImages.includes(file.type);
        const isVideo = allowedVideos.includes(file.type);

        if (!isImage && !isVideo) {
            toast.error('Only JPG, PNG, WebP images, and MP4, MOV videos are allowed.');
            return;
        }
        if (isImage && file.size > 8 * 1024 * 1024) {
            toast.error('Image too large. Maximum size is 8 MB.');
            return;
        }
        if (isVideo && file.size > 100 * 1024 * 1024) {
            toast.error('Video too large. Maximum size is 100 MB.');
            return;
        }

        // Duration Check for Videos (Max 15 minutes)
        if (isVideo) {
            const isValidDuration = await new Promise((resolve) => {
                const videoUrl = URL.createObjectURL(file);
                const videoElement = document.createElement('video');
                videoElement.src = videoUrl;

                videoElement.onloadedmetadata = () => {
                    URL.revokeObjectURL(videoUrl);
                    if (videoElement.duration > 90) {
                        toast.error('Video is too long. Maximum duration for Reels is 90 seconds.');
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                };

                videoElement.onerror = () => {
                    URL.revokeObjectURL(videoUrl);
                    toast.error('Failed to read video file.');
                    resolve(false);
                };
            });

            if (!isValidDuration) return;
        }

        if (isVideo) {
            setMediaType('VIDEO');
        } else {
            setMediaType('IMAGE');
        }

        setUploadFile(file);
        setUploadPreview(URL.createObjectURL(file));
        setMediaUrl(''); // reset previous URL
        setUploadProgress(0);

        // Auto-upload immediately after picking
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const endpoint = isVideo ? `${API_URL}/v1/upload/video` : `${API_URL}/v1/upload/image`;
            const res = await axios.post(
                endpoint,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (evt) => {
                        if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
                    },
                }
            );
            setMediaUrl(res.data.url);
            setUploadProgress(100);
            toast.success(`${isVideo ? 'Video' : 'Image'} uploaded ✅`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed. Check R2 credentials.');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    }, [setMediaType]);

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) validateAndPreview(file);
    }, [validateAndPreview]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) validateAndPreview(file);
    };

    const handleUploadToR2 = async () => {
        if (!uploadFile) return toast.error('Please select an image first.');
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('file', uploadFile);
        try {
            const res = await axios.post(
                `${API_URL}/v1/upload/image`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (evt) => {
                        if (evt.total) {
                            setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
                        }
                    },
                }
            );
            setMediaUrl(res.data.url);
            setUploadProgress(100);
            toast.success('Image uploaded to R2 ✅');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed. Check R2 credentials.');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleClearImage = () => {
        setUploadFile(null);
        setUploadPreview(null);
        setMediaUrl('');
        setUploadProgress(0);
        setManualUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('connected') === 'instagram') {
            toast.success(`${platformName} account connected successfully!`);
        }
        fetchAccounts();
        fetchPosts();
        fetchVideos();
        fetchVoices();
    }, [location]);

    useEffect(() => {
        return () => { if (vidPollRef.current) clearInterval(vidPollRef.current); };
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/accounts`, config);
            const accs = res.data.data.accounts || [];
            setAccounts(accs);
            if (accs.length > 0 && !selectedAccount) {
                setSelectedAccount(accs[0]._id);
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/social/${platformPath}/posts`, config);
            setPosts(res.data.data.posts || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/video/my-videos`, config);
            setVideoHistory(res.data.data || []);
        } catch (err) {
            console.error('Error fetching video history:', err);
        }
    };

    const fetchVoices = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/video/voices`, config);
            setVoices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching voices:', err);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await axios.get(
                `${API_URL}/v1/social/${platformPath}/auth-url?serviceId=${serviceId}`,
                config
            );
            window.location.href = res.data.url;
        } catch {
            toast.error('Failed to get connection URL');
            setConnecting(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedAccount) return toast.error('Please select an Instagram account');
        if (!mediaUrl) {
            if (imageInputMode === 'upload') {
                if (uploadFile) return toast.error('Image selected — click the Upload button first to upload it.');
                return toast.error('Please select an image to upload.');
            }
            return toast.error('Please paste a valid image URL.');
        }
        if (!caption) return toast.error('Please write a caption');
        if (!scheduledAt) return toast.error('Please set a schedule date & time');

        // Convert the datetime-local string (local time, no tz) → proper UTC ISO string
        // so the backend stores the exact time the user intended.
        const scheduledAtUTC = new Date(scheduledAt).toISOString();

        setSubmitting(true);
        try {
            await axios.post(
                `${API_URL}/v1/social/${platformPath}/schedule`,
                { instagramAccountId: selectedAccount, caption, mediaUrl, mediaType, scheduledAt: scheduledAtUTC },
                config
            );
            toast.success('Post scheduled successfully!');
            setCaption('');
            setMediaUrl('');
            setScheduledAt('');
            handleClearImage();
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule post');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostNow = async () => {
        if (!selectedAccount) return toast.error('Please select an Instagram account');
        if (!mediaUrl) return toast.error('Please upload an image first.');
        if (!caption) return toast.error('Please write a caption');

        setPostingNow(true);
        try {
            await axios.post(
                `${API_URL}/v1/social/${platformPath}/post-now`,
                { instagramAccountId: selectedAccount, caption, mediaUrl, mediaType },
                config
            );
            toast.success('Posted to Instagram! 🎉');
            setCaption('');
            setMediaUrl('');
            setScheduledAt('');
            handleClearImage();
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post');
        } finally {
            setPostingNow(false);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this scheduled post?')) return;
        setDeletingId(postId);
        try {
            await axios.delete(`${API_URL}/v1/social/${platformPath}/posts/${postId}`, config);
            toast.success('Post deleted');
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete post');
        } finally {
            setDeletingId(null);
        }
    };

    const accountOptions = accounts.map(acc => ({ value: acc._id, label: acc.username }));

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
            <div className="mx-auto max-w-6xl">

                {/* ── Header ── */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {/* Instagram gradient icon */}
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                                <svg className="h-5 w-5 text-[var(--foreground)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black text-[var(--foreground)]">{platformName} Manager</h1>
                        </div>
                        <p className="text-[var(--foreground)]/40 text-sm mt-1 ml-[52px]">Connect your Instagram Business accounts and schedule your content.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-[var(--foreground)] font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.45)] transition-all disabled:opacity-50 active:scale-95"
                        >
                            {connecting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    {accounts.length > 0 ? 'Add Another Account' : `Connect ${platformName}`}
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* ── Tab Bar ── */}
                <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-full sm:w-auto">
                    {[
                        { id: 'image',    label: 'AI Image',       icon: '✨',  color: 'from-violet-500 to-pink-500' },
                        { id: 'video',    label: 'AI Video',       icon: '🎬',  color: 'from-indigo-500 to-purple-600' },
                        { id: 'schedule', label: 'Schedule & Post', icon: '📅',  color: 'from-pink-500 to-purple-600' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all flex-1 sm:flex-none justify-center sm:justify-start ${
                                activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                    : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-white/5'
                            }`}
                        >
                            <span className="text-base leading-none">{tab.icon}</span>
                            <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                            {tab.id === 'schedule' && aiLoadedBanner && activeTab !== 'schedule' && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.8)] animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Schedule & Post Tab ── */}
                {activeTab === 'schedule' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* AI Loaded Banner */}
                    {aiLoadedBanner && (
                        <div className="lg:col-span-3 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{aiLoadedBanner === 'image' ? '✨' : '🎬'}</span>
                                <p className="text-sm font-bold text-[var(--foreground)]">
                                    {aiLoadedBanner === 'image' ? 'AI-generated image loaded' : 'AI-generated video loaded'} — <span className="text-pink-400">caption pre-filled below</span>
                                </p>
                            </div>
                            <button onClick={() => setAiLoadedBanner(null)} className="text-[var(--foreground)]/30 hover:text-[var(--foreground)]/60 text-lg leading-none transition-colors">×</button>
                        </div>
                    )}

                    {/* ── Scheduling Form ── */}
                    <div className="lg:col-span-1">
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-3xl sticky top-28">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                                <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-base shadow-md shadow-pink-500/20">�</span>
                                <div>
                                    <h2 className="text-base font-bold text-[var(--foreground)] leading-none">Schedule Post</h2>
                                    <p className="text-[10px] text-[var(--foreground)]/30 mt-0.5">Fill in the details below</p>
                                </div>
                            </div>

                            <form onSubmit={handleSchedule} className="space-y-5">

                                {/* Account Dropdown */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                        Select Instagram Account
                                    </label>
                                    <CustomSelect
                                        value={selectedAccount}
                                        onChange={setSelectedAccount}
                                        options={accountOptions}
                                        placeholder="No accounts connected"
                                    />
                                </div>

                                {/* Content Type */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                        Content Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        {[
                                            { type: 'IMAGE', icon: '🖼️' },
                                            { type: 'VIDEO', icon: '🎬' },
                                        ].map(({ type, icon }) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMediaType(type)}
                                                className={`py-2.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all ${mediaType === type
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-[var(--foreground)] shadow-md shadow-pink-500/20'
                                                    : 'bg-white/5 border-white/10 text-[var(--foreground)]/40 hover:bg-white/10 hover:text-[var(--foreground)]/60'
                                                    }`}
                                            >
                                                <span>{icon}</span> {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Image / URL Widget ── */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                                            {mediaType === 'VIDEO' ? 'Video' : 'Image'}
                                        </label>
                                        {/* Toggle */}
                                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => { setImageInputMode('upload'); setManualUrl(''); if (!uploadPreview) setMediaUrl(''); }}
                                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'upload'
                                                    ? 'bg-pink-500 text-[var(--foreground)] shadow'
                                                    : 'text-[var(--foreground)]/30 hover:text-[var(--foreground)]/50'
                                                    }`}
                                            >
                                                Upload
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageInputMode('url');
                                                    // Clear upload state but keep any typed URL
                                                    setUploadFile(null);
                                                    setUploadPreview(null);
                                                    setUploadProgress(0);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                    setMediaUrl(manualUrl); // restore from manualUrl if already typed
                                                }}
                                                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${imageInputMode === 'url'
                                                    ? 'bg-pink-500 text-[var(--foreground)] shadow'
                                                    : 'text-[var(--foreground)]/30 hover:text-[var(--foreground)]/50'
                                                    }`}
                                            >
                                                URL
                                            </button>
                                        </div>
                                    </div>

                                    {imageInputMode === 'upload' ? (
                                        <>
                                            {/* Drop zone / preview */}
                                            {!uploadPreview ? (
                                                <div
                                                    ref={dropRef}
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleFileDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 cursor-pointer transition-all select-none ${
                                                        dragOver
                                                            ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_0_3px_rgba(236,72,153,0.15)]'
                                                            : 'border-white/[0.12] hover:border-pink-500/50 hover:bg-white/[0.02]'
                                                    }`}
                                                >
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${ dragOver ? 'bg-pink-500/20' : 'bg-white/[0.06]'}`}>
                                                        <svg className={`h-6 w-6 transition-colors ${ dragOver ? 'text-pink-400' : 'text-[var(--foreground)]/25'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <p className="text-[var(--foreground)]/50 text-xs font-semibold">
                                                            Drag &amp; drop or <span className="text-pink-400 font-bold">click to browse</span>
                                                        </p>
                                                        <p className="text-[var(--foreground)]/20 text-[10px]">JPG, PNG, WebP up to 8 MB &bull; MP4/MOV up to 100 MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                                                    {mediaType === 'VIDEO' ? (
                                                        <video src={uploadPreview} className="w-full h-40 object-cover bg-black" controls muted />
                                                    ) : (
                                                        <img src={uploadPreview} alt="preview" className="w-full h-40 object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={handleClearImage}
                                                            className="px-3 py-1.5 rounded-lg bg-red-500/80 text-[var(--foreground)] text-xs font-bold hover:bg-red-500 transition-colors"
                                                        >
                                                            ✕ Remove
                                                        </button>
                                                    </div>
                                                    {mediaUrl && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-[var(--foreground)] text-[10px] font-black px-2 py-1 rounded-full">
                                                            <span>✓</span> Uploaded
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Hidden file input */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-m4v"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            {/* Auto-upload progress bar */}
                                            {uploading && (
                                                <div className="mt-3">
                                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-[var(--foreground)]/30 mt-1 text-center">Uploading {uploadProgress}%…</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* ── URL mode ── */
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                                                        <svg className="h-4 w-4 text-[var(--foreground)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={manualUrl}
                                                        onChange={(e) => {
                                                            setManualUrl(e.target.value);
                                                            // Only auto-set if it's a direct file link (cheap heuristic)
                                                            if (e.target.value.match(/\.(jpeg|jpg|png|webp|mp4|mov)$/i)) {
                                                                setMediaUrl(e.target.value);
                                                            } else {
                                                                // Clear it so they don't accidentally post an IG webpage URL to IG
                                                                setMediaUrl('');
                                                            }
                                                        }}
                                                        placeholder={mediaType === 'VIDEO' ? "https://instagram.com/reel/xyz or .mp4" : "https://example.com/image.jpg"}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] transition-all placeholder:text-[var(--foreground)]/20"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={!manualUrl || uploading}
                                                    onClick={async () => {
                                                        if (!manualUrl) return;
                                                        setUploading(true);
                                                        try {
                                                            const res = await axios.post(
                                                                `${API_URL}/v1/upload/fetch-url`,
                                                                { url: manualUrl },
                                                                config
                                                            );
                                                            setMediaUrl(res.data.url);
                                                            setMediaType(res.data.mediaType || 'VIDEO'); // Usually videos
                                                            toast.success('Media fetched successfully!');
                                                        } catch (err) {
                                                            toast.error(err.response?.data?.message || 'Failed to fetch media from URL');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }}
                                                    className="bg-white/10 hover:bg-white/20 text-[var(--foreground)] px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all whitespace-nowrap"
                                                >
                                                    {uploading ? 'Fetching...' : 'Fetch'}
                                                </button>
                                            </div>
                                            {/* URL preview */}
                                            {mediaUrl && manualUrl && (
                                                <div className="relative rounded-xl overflow-hidden border border-white/10 mt-2">
                                                    {mediaType === 'VIDEO' ? (
                                                        <video src={mediaUrl} className="w-full h-32 object-cover bg-black" controls muted />
                                                    ) : (
                                                        <img
                                                            src={mediaUrl}
                                                            alt="URL preview"
                                                            className="w-full h-32 object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-[var(--foreground)] text-[10px] font-black px-2 py-1 rounded-full">
                                                        <span>✓</span> Ready
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Caption */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                        Caption
                                    </label>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Write something engaging..."
                                        rows="4"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] transition-all placeholder:text-[var(--foreground)]/20 resize-none"
                                    />
                                    <p className="text-[10px] text-[var(--foreground)]/20 mt-1 text-right">{caption.length} chars</p>
                                </div>

                                {/* Schedule Date & Time */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">
                                        Schedule Date &amp; Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-pink-500 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Post Now */}
                                <button
                                    type="button"
                                    onClick={handlePostNow}
                                    disabled={postingNow || submitting || uploading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-[var(--foreground)] font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {postingNow ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Post Now
                                        </>
                                    )}
                                </button>

                                {/* Schedule */}
                                <button
                                    type="submit"
                                    disabled={submitting || postingNow || uploading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-[var(--foreground)] font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Schedule Post
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Right Panel ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Connected Accounts Strip */}
                        {accounts.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/25 mb-2 ml-1">Connected Accounts</p>
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {accounts.map(acc => (
                                        <div
                                            key={acc._id}
                                            onClick={() => setSelectedAccount(acc._id)}
                                            className={`flex items-center gap-3 border rounded-2xl px-4 py-3 shrink-0 cursor-pointer transition-all ${
                                                selectedAccount === acc._id
                                                    ? 'bg-pink-500/10 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                                            }`}
                                        >
                                            <div className="relative">
                                                <Avatar src={acc.profilePicture || acc.picture} name={acc.username} size="md" />
                                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[var(--background)]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--foreground)] leading-none">@{acc.username}</p>
                                                <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Connected</p>
                                            </div>
                                            {selectedAccount === acc._id && (
                                                <div className="ml-auto">
                                                    <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {accounts.length === 0 && (
                            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <svg className="h-5 w-5 text-[var(--foreground)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[var(--foreground)]/50 text-sm font-semibold">No accounts connected</p>
                                    <p className="text-[var(--foreground)]/20 text-xs mt-0.5">Click "Connect Instagram" above to link your account.</p>
                                </div>
                            </div>
                        )}

                        {/* Live Post Preview */}
                        {(mediaUrl || uploadPreview || caption) && (
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
                                    <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs">👁</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--foreground)] leading-none">Post Preview</h3>
                                        <p className="text-[10px] text-[var(--foreground)]/30 mt-0.5">How it will look on Instagram</p>
                                    </div>
                                </div>
                                {/* Instagram card mock */}
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
                                    {/* Header row */}
                                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                                        <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                            {accounts.find(a => a._id === selectedAccount)?.profilePicture ? (
                                                <img src={accounts.find(a => a._id === selectedAccount)?.profilePicture} alt="" className="h-full w-full object-cover" onError={e => e.target.style.display='none'} />
                                            ) : (
                                                <span className="text-[10px] font-black text-white">
                                                    {(accounts.find(a => a._id === selectedAccount)?.username || 'IG').slice(0,2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[var(--foreground)] leading-none truncate">
                                                {accounts.find(a => a._id === selectedAccount)?.username ? `@${accounts.find(a => a._id === selectedAccount).username}` : 'Your Account'}
                                            </p>
                                            <p className="text-[9px] text-[var(--foreground)]/30 mt-0.5">Just now</p>
                                        </div>
                                        <svg className="h-4 w-4 text-[var(--foreground)]/20 shrink-0" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                                    </div>
                                    {/* Media */}
                                    {(uploadPreview || mediaUrl) && (
                                        <div className="aspect-square overflow-hidden bg-white/[0.04]">
                                            {mediaType === 'VIDEO' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
                                                    <svg className="h-12 w-12 text-purple-400/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                                                </div>
                                            ) : (
                                                <img src={uploadPreview || mediaUrl} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                            )}
                                        </div>
                                    )}
                                    {/* Actions row */}
                                    <div className="flex items-center gap-3 px-3 pt-2.5">
                                        <svg className="h-5 w-5 text-[var(--foreground)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        <svg className="h-5 w-5 text-[var(--foreground)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        <svg className="h-5 w-5 text-[var(--foreground)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    </div>
                                    {/* Caption */}
                                    {caption && (
                                        <div className="px-3 pb-3 pt-1.5">
                                            <p className="text-xs text-[var(--foreground)]/70 leading-relaxed line-clamp-3">
                                                <span className="font-bold text-[var(--foreground)]">{accounts.find(a => a._id === selectedAccount)?.username || 'username'}</span>{' '}{caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Scheduling Queue */}
                        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-3">
                                    <span className="h-9 w-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-base">📥</span>
                                    <div>
                                        <h2 className="text-base font-bold text-[var(--foreground)] leading-none">Scheduling Queue</h2>
                                        <p className="text-[10px] text-[var(--foreground)]/30 mt-0.5">Posts waiting to go live</p>
                                    </div>
                                </div>
                                {posts.length > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-black tracking-wide">
                                        {posts.length} post{posts.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            <div 
                                className="h-[520px] overflow-y-auto overscroll-contain custom-scrollbar pr-2"
                                onWheel={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col gap-3 pb-2">


                                        {loading && (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-pink-500"></div>
                                            <p className="text-[var(--foreground)]/20 text-sm">Loading queue...</p>
                                        </div>
                                    )}

                                    {!loading && posts.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-14 gap-4 rounded-2xl border border-dashed border-white/[0.07]">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/5 border border-pink-500/10 flex items-center justify-center">
                                                <svg className="h-7 w-7 text-[var(--foreground)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[var(--foreground)]/40 font-semibold text-sm">Nothing scheduled yet</p>
                                                <p className="text-[var(--foreground)]/20 text-xs mt-1">Use the form on the left to schedule your first post.</p>
                                            </div>
                                        </div>
                                    )}


                                    {posts.map(post => (
                                        <div
                                            key={post._id}
                                            className="group flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.05] hover:border-white/10"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                {/* Thumbnail */}
                                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/[0.06] group-hover:scale-105 transition-transform">
                                                    {post.mediaType === 'VIDEO' ? (
                                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
                                                            <svg className="h-6 w-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={post.mediaUrl}
                                                            alt=""
                                                            referrerPolicy="no-referrer"
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    {/* Account row */}
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Avatar
                                                            src={post.instagramAccountId?.profilePicture}
                                                            name={post.instagramAccountId?.username}
                                                            size="sm"
                                                        />
                                                        <span className="text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest truncate">
                                                            {post.instagramAccountId?.username}
                                                        </span>
                                                    </div>

                                                    {/* Caption */}
                                                    <p className="text-[var(--foreground)] font-semibold text-sm line-clamp-1 max-w-xs mb-2">
                                                        {post.caption || <span className="text-[var(--foreground)]/20 italic">No caption</span>}
                                                    </p>

                                                    {/* Meta row */}
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {new Date(post.scheduledAt).toLocaleString()}
                                                        </span>
                                                        <StatusBadge status={post.status} />
                                                    </div>

                                                    {/* Error message */}
                                                    {post.errorMessage && (
                                                        <p className="text-[10px] text-red-400 mt-1.5 font-medium flex items-center gap-1">
                                                            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {post.errorMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                disabled={deletingId === post._id}
                                                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 text-[var(--foreground)]/30 transition-all disabled:opacity-40 ml-3"
                                                title="Delete post"
                                            >
                                                {deletingId === post._id ? (
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                )}

                {/* ── AI Image Tab ── */}
                {activeTab === 'image' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-2">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl sticky top-28 space-y-5">
                                <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-base shadow-md shadow-purple-500/20">✨</span>
                                    AI Image Generator
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Topic / Idea</label>
                                    <textarea
                                        value={imgTopic}
                                        onChange={e => setImgTopic(e.target.value)}
                                        placeholder="e.g. A majestic dragon over mountains at sunset..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all placeholder:text-[var(--foreground)]/20 resize-none"
                                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerateImage(); }}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[10px] text-[var(--foreground)]/30">Suggestions:</p>
                                        <p className="text-[10px] text-[var(--foreground)]/20">{imgTopic.length} chars</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {EXAMPLE_TOPICS.map((topic, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setImgTopic(topic)}
                                                className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[var(--foreground)]/60 hover:text-purple-400 hover:border-purple-500/30 transition-colors text-left"
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Image Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {IMG_STYLES.map(s => (
                                            <button key={s.id} type="button" onClick={() => setImgStyle(s.id)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                                    imgStyle === s.id
                                                        ? 'bg-gradient-to-br from-violet-500/20 to-pink-500/10 border-purple-500/50 text-purple-300'
                                                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-[var(--foreground)]/60'
                                                }`}>
                                                <span className="text-base shrink-0">{s.icon}</span>
                                                <span>{s.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Aspect Ratio</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {IMG_RATIOS.map(r => (
                                            <button key={r.id} type="button" onClick={() => setImgRatio(r.id)}
                                                className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border text-center transition-all ${
                                                    imgRatio === r.id
                                                        ? 'bg-gradient-to-b from-violet-500/20 to-pink-500/10 border-purple-500/50'
                                                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                                }`}>
                                                <span className="text-base leading-none">{r.icon}</span>
                                                <span className={`text-[9px] font-black ${ imgRatio === r.id ? 'text-purple-300' : 'text-[var(--foreground)]/50'}`}>{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={handleGenerateImage} disabled={imgGenerating || !imgTopic.trim()}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                    {imgGenerating ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</>) : (<><span className="text-xl">✨</span>Generate Image</>)}
                                </button>
                            </div>
                        </div>
                        {/* Output */}
                        <div className="lg:col-span-3">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl mb-6">
                                {imgGenerating ? (
                                    <ImageSkeleton aspectRatio={imgRatio} />
                                ) : imgResult ? (
                                    <div className="space-y-5">
                                        <div className="relative rounded-2xl overflow-hidden group">
                                            <img src={imgResult.imageUrl} alt={imgResult.topic} className="w-full object-cover rounded-2xl" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                                                <button onClick={() => window.open(imgResult.imageUrl, '_blank')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold hover:bg-white/30 transition-all">↗ Open Full</button>
                                                <button onClick={handleDownloadImage} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold hover:bg-white/30 transition-all">⬇ Download</button>
                                            </div>
                                            <div className="absolute top-3 left-3"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white text-[10px] font-black">{imgResult.style} · {imgResult.aspectRatio}</span></div>
                                        </div>
                                        
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">Mistral-Enhanced Prompt</h3>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={handleCopyPrompt} className="text-[10px] uppercase font-bold text-[var(--foreground)]/40 hover:text-purple-400 transition-colors">Copy</button>
                                                    <button onClick={() => setPromptVisible(!promptVisible)} className="text-[10px] uppercase font-bold text-[var(--foreground)]/40 hover:text-purple-400 transition-colors">{promptVisible ? 'Hide' : 'Show'}</button>
                                                </div>
                                            </div>
                                            {promptVisible && (
                                                <p className="text-sm text-[var(--foreground)]/80 leading-relaxed italic">{imgResult.prompt}</p>
                                            )}
                                        </div>

                                        {/* AI Caption */}
                                        {imgResult.caption && (
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">AI Generated Caption</label>
                                                <p className="text-[var(--foreground)]/70 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 leading-relaxed">{imgResult.caption}</p>
                                            </div>
                                        )}
                                        {/* Use for Post CTA */}
                                        <button onClick={() => handleUseImageForPost(imgResult.imageUrl, imgResult.caption, imgResult.hashtags)}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.45)] transition-all active:scale-95 flex items-center justify-center gap-3">
                                            <span>→</span> Use this Image for Post
                                        </button>
                                        <button onClick={() => { setImgResult(null); setImgTopic(''); setPromptVisible(false); }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--foreground)]/50 font-bold text-sm hover:bg-white/10 transition-all">↺ Generate Another</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="relative mb-6">
                                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center">
                                                <span className="text-5xl">🎨</span>
                                            </div>
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-[10px]">✨</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Your Canvas Awaits</h3>
                                        <p className="text-[var(--foreground)]/40 text-sm max-w-[260px] leading-relaxed">Enter a topic on the left, choose your style &amp; ratio, then hit <span className="text-purple-400 font-bold">Generate Image</span>.</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] text-[var(--foreground)]/20 font-bold uppercase tracking-widest">
                                            <span>Powered by Mistral AI</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {imgHistory.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]/40 pl-2">Session History</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {imgHistory.map((item, idx) => (
                                            <HistoryCard
                                                key={idx}
                                                item={item}
                                                onSelect={(selectedItem) => {
                                                    setImgResult(selectedItem);
                                                    setImgTopic(selectedItem.topic);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── AI Video Tab ── */}
                {activeTab === 'video' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-2">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl sticky top-28 space-y-5">
                                <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-3">
                                    <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base shadow-md shadow-purple-500/20">🎬</span>
                                    AI Video Generator
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">Video Prompt</label>
                                    <textarea
                                        value={vidPrompt}
                                        onChange={e => setVidPrompt(e.target.value)}
                                        placeholder="e.g. A 30-second promo for a luxury skincare brand with elegant visuals..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[var(--foreground)] text-sm focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all placeholder:text-[var(--foreground)]/20 resize-none"
                                    />
                                    <p className="text-[10px] text-[var(--foreground)]/20 mt-1 text-right">{vidPrompt.length} chars</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">⏱️ Duration</label>
                                        {!vidDuration && <span className="text-[10px] text-amber-400/70 font-bold">Pick one ↓</span>}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[15, 20, 30, 40].map(sec => (
                                            <button key={sec} type="button" onClick={() => setVidDuration(sec)}
                                                className={`py-3 rounded-xl border transition-all font-black text-xs tracking-widest ${
                                                    vidDuration === sec
                                                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                                                        : 'border-white/10 bg-white/[0.03] text-[var(--foreground)]/40 hover:border-purple-500/30 hover:text-[var(--foreground)]/70'
                                                }`}>{sec}s</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">🗣️ Narrator Voice</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedVoice('none')}
                                            className={`py-3 px-2 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${
                                                selectedVoice === 'none'
                                                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                                                    : 'border-white/10 bg-white/[0.03] text-[var(--foreground)]/40 hover:border-purple-500/30 hover:text-[var(--foreground)]/70'
                                            }`}
                                        >
                                            No Voice
                                        </button>
                                        {voices.map(v => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setSelectedVoice(v.id)}
                                                className={`w-full py-3 px-2 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-between gap-1.5 ${
                                                    selectedVoice === v.id
                                                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                                                        : 'border-white/10 bg-white/[0.03] text-[var(--foreground)]/60 hover:border-purple-500/30 hover:text-[var(--foreground)]/90'
                                                }`}
                                            >
                                                <span className="truncate">{v.name}</span>
                                                {v.previewUrl && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playPreview(v);
                                                        }}
                                                        className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                                            playingVoice === v.id
                                                                ? 'bg-purple-500 text-white shadow-md'
                                                                : 'bg-white/10 text-[var(--foreground)]/50 hover:bg-white/20 hover:text-[var(--foreground)]/80'
                                                        }`}
                                                        title="Preview Voice"
                                                    >
                                                        {playingVoice === v.id ? '⏸' : '▶'}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-2">🖼️ Frame</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[{ id:'9:16', label:'Vertical 📱' }, { id:'16:9', label:'Landscape 💻' }].map(r => (
                                            <button key={r.id} type="button" onClick={() => setVidRatio(r.id)}
                                                className={`py-3 rounded-xl border transition-all font-black text-xs tracking-widest ${
                                                    vidRatio === r.id
                                                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                                        : 'border-white/10 bg-white/[0.03] text-[var(--foreground)]/40 hover:border-white/20'
                                                }`}>{r.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={handleGenerateVideo} disabled={vidGenerating || !vidPrompt.trim() || !vidDuration}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                    {vidGenerating ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{vidStatus || 'Generating...'}</>) : (<><span>✨</span>Generate Video</>)}
                                </button>
                            </div>
                        </div>
                        {/* Output */}
                        <div className="lg:col-span-3">
                            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-3xl mb-6">
                                {vidGenerating && !vidUrl ? (
                                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"/>
                                            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">⚡</div>
                                        </div>
                                        <p className="text-[var(--foreground)]/60 text-sm font-semibold">Rendering your video...</p>
                                        <p className="text-[var(--foreground)]/30 text-xs">{vidStatus}</p>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{animationDelay:'0s'}}/>
                                            <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{animationDelay:'0.2s'}}/>
                                            <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{animationDelay:'0.4s'}}/>
                                        </div>
                                    </div>
                                ) : vidUrl ? (
                                    <div className="space-y-5">
                                        <div className={`relative ${vidRatio === '9:16' ? 'aspect-[9/16] max-w-[320px]' : 'aspect-[16/9] w-full'} mx-auto rounded-2xl overflow-hidden border-4 border-white/5 shadow-2xl`}>
                                            <video key={vidUrl} src={vidUrl} controls autoPlay className="w-full h-full object-cover" />
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                                                <div className="flex items-center gap-2 pointer-events-auto">
                                                    <button 
                                                        onClick={() => handleDownloadVideo(currentVidId, vidUrl)} 
                                                        disabled={downloading}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all disabled:opacity-50"
                                                    >
                                                        {downloading ? 'Downloading...' : '⬇ Download'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Use for Post CTA */}
                                        <button onClick={() => handleUseVideoForPost(vidUrl)}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.45)] transition-all active:scale-95 flex items-center justify-center gap-3">
                                            <span>→</span> Use this Video as a Reel
                                        </button>
                                        <button onClick={() => { setVidUrl(null); setVidPrompt(''); setVidDuration(null); }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--foreground)]/50 font-bold text-sm hover:bg-white/10 transition-all">↺ Generate Another</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="relative mb-6">
                                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                <span className="text-5xl">🎬</span>
                                            </div>
                                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-[10px]">⚡</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Create a Reel</h3>
                                        <p className="text-[var(--foreground)]/40 text-sm max-w-[260px] leading-relaxed">Describe your video, pick a duration &amp; frame, then hit <span className="text-purple-400 font-bold">Generate Video</span>.</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] text-[var(--foreground)]/20 font-bold uppercase tracking-widest">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/40" />
                                            <span>AI-Powered Video Generation</span>
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/40" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {videoHistory.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pl-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]/40">Recent Creations</h3>
                                        {videoHistory.length > 3 && (
                                            <button 
                                                onClick={() => setShowAllVidHistory(!showAllVidHistory)}
                                                className="text-[10px] uppercase font-bold text-purple-400 hover:text-pink-400 transition-colors"
                                            >
                                                {showAllVidHistory ? 'Show Less' : 'View All'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {(showAllVidHistory ? videoHistory : videoHistory.slice(0, 3)).map((video) => (
                                            <div key={video._id} className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/40 transition-all bg-white/[0.02]">
                                                {video.status === 'done' ? (
                                                    <div className="aspect-[9/16] relative bg-black">
                                                        <video src={video.videoUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                                                            <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight drop-shadow-md mb-2">{video.prompt}</p>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => handleDownloadVideo(video._id, video.videoUrl)}
                                                                    disabled={downloading}
                                                                    className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white transition-all disabled:opacity-50"
                                                                    title="Download Video"
                                                                >⬇</button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setVidUrl(video.videoUrl);
                                                                        setCurrentVidId(video._id);
                                                                        setVidPrompt(video.prompt);
                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                    }}
                                                                    className="flex-1 h-7 rounded-lg bg-purple-500/80 hover:bg-purple-500 text-[10px] font-bold text-white transition-colors"
                                                                >View</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-[9/16] flex flex-col items-center justify-center gap-3 bg-white/5">
                                                        <div className="h-8 w-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                                                        <span className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest">{video.status}…</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
