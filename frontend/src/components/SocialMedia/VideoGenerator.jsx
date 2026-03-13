import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VideoGenerator() {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [renderId, setRenderId] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('none');
    const [duration, setDuration] = useState(null);
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [showAllHistory, setShowAllHistory] = useState(false);

    const [playingVoice, setPlayingVoice] = useState(null);
    const audioRef = useRef(null);

    const promptRef = useRef(null);
    const pollInterval = useRef(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchVideos();
        fetchVoices();
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/video/my-videos`, config);
            setHistory(res.data.data);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const fetchVoices = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/video/voices`, config);
            setVoices(res.data.data);
        } catch (err) {
            console.error('Error fetching voices:', err);
        }
    };

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
                console.error('Audio play failed:', err);
                toast.error('Preview not available');
                setPlayingVoice(null);
            });
            audio.onended = () => setPlayingVoice(null);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a video prompt first');
            promptRef.current?.focus();
            return;
        }

        if (!duration) {
            toast.error('Please select a video duration (15s, 20s, 30s, or 40s)');
            return;
        }

        setGenerating(true);
        setVideoUrl(null);
        setRenderId(null);
        setCurrentVideoId(null);
        setStatus('Initializing...');

        try {
            const res = await axios.post(`${API_URL}/v1/video/generate`, {
                prompt: prompt.trim(),
                voiceId: selectedVoice,
                duration: duration,
                aspectRatio: aspectRatio
            }, config);
            const { renderId, videoId } = res.data.data;
            setRenderId(renderId);
            setCurrentVideoId(videoId);
            startPolling(renderId);
            toast.success('Video generation started! ✨');
        } catch (err) {
            const msg = err.response?.data?.message || 'Video generation failed.';
            toast.error(msg);
            setGenerating(false);
        }
    };

    const startPolling = (id) => {
        if (pollInterval.current) clearInterval(pollInterval.current);

        pollInterval.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API_URL}/v1/video/status/${id}`, config);
                const { status, url } = res.data.data;

                setStatus(status === 'done' ? 'Ready!' : status.charAt(0).toUpperCase() + status.slice(1) + '...');

                if (status === 'done' && url) {
                    setVideoUrl(url);
                    setGenerating(false);
                    fetchVideos();
                    clearInterval(pollInterval.current);
                    toast.success('Video ready! 🚀');
                } else if (status === 'failed') {
                    setGenerating(false);
                    clearInterval(pollInterval.current);
                    toast.error('Shotstack failed to render the video.');
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);
    };

    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (videoId, url, filename = 'ai-video.mp4') => {
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
                link.download = filename;
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
            console.error('Download error:', err);
            toast.error('Failed to download video. Opening in new tab...');
            window.open(url, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6 transition-colors duration-300">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center shadow-lg shadow-purple-500/30 text-2xl mb-6">
                        🎬
                    </div>
                    <h1 className="text-5xl font-black text-[var(--foreground)] mb-4">AI Video Generator</h1>
                    <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
                        Turn your ideas into high-converting {duration || '30'}-second promotional videos automatically.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* Input Section */}
                    <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] p-10 backdrop-blur-3xl shadow-2xl">
                        <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-4">
                            What should your video be about?
                        </label>
                        <textarea
                            ref={promptRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Create a 30 second promotional video for a luxury watch brand featuring elegant movements and high-end feel..."
                            className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl px-6 py-5 text-[var(--foreground)] text-lg focus:outline-none focus:border-purple-500 focus:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all placeholder:text-[var(--muted-subtle)] resize-none mb-8 h-32"
                        />

                        {/* Duration Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-4">
                                    ⏱️ Video Duration
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[15, 20, 30, 40].map((sec) => (
                                        <button
                                            key={sec}
                                            onClick={() => setDuration(sec)}
                                            className={`py-4 rounded-2xl border transition-all duration-300 font-black text-xs tracking-widest ${duration === sec
                                                ? 'border-purple-500 bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                                : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)] hover:border-[var(--border-strong)]'
                                                }`}
                                        >
                                            {sec}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-4">
                                    🖼️ Aspect Ratio (Frame)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: '9:16', label: 'Vertical', icon: '📱' },
                                        { id: '16:9', label: 'Landscape', icon: '💻' }
                                    ].map((ratio) => (
                                        <button
                                            key={ratio.id}
                                            onClick={() => setAspectRatio(ratio.id)}
                                            className={`py-4 rounded-2xl border transition-all duration-300 font-black text-xs tracking-widest flex items-center justify-center gap-2 ${aspectRatio === ratio.id
                                                ? 'border-purple-500 bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                                : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)] hover:border-[var(--border-strong)]'
                                                }`}
                                        >
                                            <span>{ratio.icon}</span>
                                            <span>{ratio.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Voice Selection */}
                        <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-4">
                            🎙️ Select Narrator Voice
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                            {/* No Voice Option */}
                            <button
                                onClick={() => setSelectedVoice('none')}
                                className={`group relative p-4 rounded-2xl border transition-all duration-300 text-left ${selectedVoice === 'none'
                                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="text-2xl mb-2">🔇</div>
                                <p className="text-[var(--foreground)] text-sm font-bold">Music Only</p>
                                <p className="text-[var(--muted-subtle)] text-[10px] mt-1">No voiceover</p>
                                {selectedVoice === 'none' && (
                                    <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                )}
                            </button>

                            {/* Voice Options */}
                            {voices.map(voice => (
                                <div
                                    key={voice.id}
                                    onClick={() => setSelectedVoice(voice.id)}
                                    className={`group relative p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${selectedVoice === voice.id
                                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-2xl">{voice.icon}</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); playPreview(voice); }}
                                            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${playingVoice === voice.id ? 'bg-purple-500 text-white animate-pulse' : 'bg-[var(--surface-hover)] text-[var(--muted)] hover:text-purple-500 hover:scale-110'}`}
                                            title="Play Sample"
                                        >
                                            {playingVoice === voice.id ? (
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                            ) : (
                                                <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[var(--foreground)] text-sm font-bold leading-tight">{voice.name}</p>
                                    <p className="text-[var(--muted-subtle)] text-[10px] mt-1 leading-tight">{voice.description}</p>
                                    {selectedVoice === voice.id && (
                                        <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                        >
                            {generating ? (
                                <>
                                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>{status}</span>
                                </>
                            ) : (
                                <>
                                    <span>✨ {generating ? status : `Generate ${selectedVoice !== 'none' ? 'Narrated ' : ''}Promotional Video`}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    {(generating || videoUrl) && (
                        <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] p-10 backdrop-blur-3xl overflow-hidden text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {videoUrl ? (
                                <div className="space-y-8">
                                    <div className={`relative ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[320px]' : 'aspect-[16/9] w-full max-w-[650px]'} mx-auto rounded-[2rem] overflow-hidden border-8 border-white/5 shadow-2xl`}>
                                        <video
                                            key={videoUrl}
                                            src={videoUrl}
                                            controls
                                            autoPlay
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => handleDownload(currentVideoId, videoUrl)}
                                            disabled={downloading}
                                            className="px-8 py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {downloading ? 'Downloading...' : 'Download Video'}
                                        </button>

                                        <button
                                            onClick={() => { setVideoUrl(null); setCurrentVideoId(null); setPrompt(''); }}
                                            className="px-8 py-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)] font-black uppercase tracking-widest text-xs hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-all"
                                        >
                                            Generate Another
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 space-y-6">
                                    <div className="relative flex justify-center">
                                        <div className="h-24 w-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
                                            ⚡
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-[var(--foreground)]">Rendering Magic...</h3>
                                        <p className="text-[var(--muted)] font-medium">
                                            {selectedVoice !== 'none'
                                                ? 'Generating voiceover narration & compiling your scenes...'
                                                : 'Shotstack is compiling your scenes into a vertical masterpiece.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
                                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* History Section */}
                    <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] p-10 backdrop-blur-3xl shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
                                Recent Creations {history.length > 0 && <span className="ml-1 text-purple-500/60">({history.length})</span>}
                            </h3>
                            {history.length > 3 && (
                                <button
                                    onClick={() => setShowAllHistory(!showAllHistory)}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-2 group"
                                >
                                    {showAllHistory ? 'Show Less' : `View All (${history.length})`}
                                    <svg className={`h-3 w-3 transition-transform duration-300 ${showAllHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                                {(showAllHistory ? history : history.slice(0, 3)).map((video, index) => (
                                    <div
                                        key={video._id}
                                        className="group relative rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--surface-hover)] hover:border-purple-500/40 transition-all duration-500 shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Fixed-height video preview area */}
                                        <div className="relative w-full h-[280px] bg-black overflow-hidden flex-shrink-0">
                                            {video.videoUrl ? (
                                                <video
                                                    key={video.videoUrl}
                                                    src={video.videoUrl}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onMouseOver={e => e.target.play()}
                                                    onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                                    muted
                                                    loop
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--surface-hover)]">
                                                    <div className="h-10 w-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                                                    <span className="text-[var(--muted-subtle)] text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                                        {video.status}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Top Row: Status + Aspect Ratio */}
                                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                                                <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${video.status === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">
                                                        {video.status === 'done' ? 'Ready' : 'Progress'}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                                                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                                                        {(video.metadata?.aspectRatio || '9:16') === '9:16' ? '📱 9:16' : '💻 16:9'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Duration Badge */}
                                            {video.duration && (
                                                <div className="absolute bottom-3 right-3 z-10">
                                                    <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                                                        <span className="text-[9px] font-black text-white/80 tracking-wider">{video.duration}s</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Overlay on Hover */}
                                            {video.videoUrl && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                                                    <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                        <button
                                                            onClick={() => handleDownload(video._id, video.videoUrl, `video-${video._id}.mp4`)}
                                                            className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-2xl"
                                                            title="Download"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setVideoUrl(video.videoUrl);
                                                                setCurrentVideoId(video._id);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className="h-12 w-12 rounded-2xl bg-purple-600 border border-purple-400/30 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-purple-900/40"
                                                            title="Watch Now"
                                                        >
                                                            <svg className="h-5 w-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="p-5 flex flex-col gap-2.5 flex-grow bg-gradient-to-b from-[var(--surface-hover)] to-[var(--surface)]">
                                            <div className="flex items-center gap-2">
                                                {video.voiceId && video.voiceId !== 'none' && (
                                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-[8px] font-black text-purple-400 uppercase tracking-widest border border-purple-500/20">
                                                        🎙️ Narrated
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-[var(--muted-subtle)] font-bold ml-auto leading-none">
                                                    {new Date(video.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed font-medium italic group-hover:text-[var(--foreground)] transition-colors">
                                                "{video.prompt}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-[var(--border)] rounded-[2rem] bg-[var(--surface-hover)]/30">
                                <div className="text-4xl mb-4 opacity-20 filter grayscale">📭</div>
                                <p className="text-[var(--muted-subtle)] font-black uppercase tracking-[0.2em] text-[10px]">No videos generated yet</p>
                                <p className="text-[var(--muted-subtle)]/50 text-[10px] mt-2 font-medium">Start by entering a prompt above</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
