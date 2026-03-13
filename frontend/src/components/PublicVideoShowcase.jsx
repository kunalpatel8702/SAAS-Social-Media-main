import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Video, User, Star, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const itemV = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function PublicVideoShowcase() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicVideos = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/v1/video/public`);
                if (response.data.success) {
                    setVideos(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch public videos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicVideos();
    }, []);

    if (loading || videos.length === 0) return null;

    return (
        <section className="relative py-32 overflow-hidden bg-[var(--background)]">
            {/* Dynamic Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerV}
                    className="flex flex-col items-center mb-20"
                >
                    <motion.div variants={itemV} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] backdrop-blur-md">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Creator Hall of Fame</span>
                    </motion.div>

                    <motion.h2 variants={itemV} className="text-5xl md:text-6xl lg:text-7xl font-black text-center tracking-tighter mb-8 text-[var(--foreground)]">
                        Visionary <span className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Creations</span>
                    </motion.h2>
                    <motion.p variants={itemV} className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl text-center leading-relaxed font-light">
                        Discover the impossible. A curated gallery of mind-bending cinematic experiences, forged by our community using breakthrough AI.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerV}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {videos.map((video) => (
                        <motion.div
                            key={video._id}
                            variants={itemV}
                            className="group relative flex flex-col rounded-3xl overflow-hidden glass border border-white/10 dark:border-white/5 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20 hover:-translate-y-2 bg-[var(--surface-elevated)]"
                        >
                            {/* Video Wrap */}
                            <div className="relative aspect-[16/9] bg-black overflow-hidden flex-shrink-0">
                                {video.videoUrl ? (
                                    <video
                                        src={`${video.videoUrl}#t=1.0`}
                                        controls
                                        controlsList="nodownload"
                                        poster={video.thumbnailUrl || ''}
                                        preload="auto"
                                        playsInline
                                        className="w-full h-full object-cover"
                                        style={{ backgroundColor: 'transparent' }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 border-b border-white/5">
                                        <Wand2 className="w-12 h-12 text-[var(--muted)] opacity-50" />
                                    </div>
                                )}
                                
                                {/* Top Floating Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                    <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                                        <span className="text-indigo-400">{video.aspectRatio}</span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                                        {video.duration}s
                                    </div>
                                </div>
                            </div>

                            {/* Content Lower Half */}
                            <div className="p-6 md:p-8 flex flex-col flex-grow relative bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                                {/* Prompt */}
                                <p className="text-base sm:text-lg font-medium text-[var(--foreground)] leading-relaxed italic line-clamp-3 mb-6 relative pl-4 opacity-90">
                                    <span className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                    "{video.prompt}"
                                </p>

                                {/* Spacing */}
                                <div className="flex-grow"></div>

                                {/* Creator Info */}
                                <div className="flex items-center gap-4 pt-4 mt-2 border-t border-[var(--border)]">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[1.5px] shrink-0">
                                        <div className="w-full h-full rounded-full bg-[var(--surface-elevated)] flex items-center justify-center overflow-hidden">
                                            <User className="w-5 h-5 text-[var(--muted)]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest truncate max-w-[200px]">
                                            {video.userName}
                                        </span>
                                        <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">
                                            {new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
                
                {/* Decorative bottom fade */}
                <div className="w-full h-24 bg-gradient-to-t from-[var(--background)] to-transparent mt-[-48px] relative z-20 pointer-events-none" />
            </div>
        </section>
    );
}
