import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Loader2, Video, Activity, AlertCircle, PlayCircle, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}
const itemV = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function AdminAllVideos() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/v1/admin/videos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.data.status === 'success') {
                    setVideos(response.data.data.videos)
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch videos')
            } finally {
                setLoading(false)
            }
        }

        fetchVideos()
    }, [])

    const handleTogglePublish = async (videoId) => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/v1/admin/videos/${videoId}/toggle-publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data.status === 'success') {
                setVideos(videos.map(v => v._id === videoId ? { ...v, isActive: response.data.data.video.isActive } : v))
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle publish status')
        }
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div initial="hidden" animate="show" variants={containerV} className="mx-auto max-w-7xl">

                {/* Header Section */}
                <motion.header variants={itemV} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] mb-6">
                            <Activity className="h-4 w-4 text-[var(--success)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Video Generations</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
                            User <span className="gradient-text">Videos</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed font-light">
                            Monitor and manage all AI video generations requested by users.
                        </p>
                    </div>

                    <div className="glass-strong px-8 py-5 rounded-3xl flex items-center justify-between gap-8 min-w-[240px] border border-[var(--border-strong)] shadow-sm">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Total Generated</p>
                            <p className="text-4xl font-black text-[var(--foreground)]">{videos.length}</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-from)]/10 flex items-center justify-center border border-[var(--accent-from)]/20 shadow-inner">
                            <Video className="h-7 w-7 text-[var(--accent-from)]" />
                        </div>
                    </div>
                </motion.header>

                <motion.div variants={itemV} className="glass-strong rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-[var(--border-strong)] relative overflow-hidden min-h-[500px]">
                    <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] opacity-40 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 relative z-10 w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Render Registry</h2>
                            <p className="text-sm text-[var(--muted)] mt-1 font-medium">Categorized view of system renders</p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--surface)]/50">
                                <div className="p-4 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] mb-4">
                                    <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
                                </div>
                                <p className="text-[var(--muted)] text-sm font-medium tracking-wide uppercase animate-pulse">Loading models...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 p-12 text-center shadow-inner">
                                <AlertCircle className="h-12 w-12 text-[var(--danger)] mb-4" />
                                <h3 className="text-[var(--danger)] text-xl font-bold mb-2">Access Error</h3>
                                <p className="text-[var(--danger)]/80 text-sm">{error}</p>
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-20 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface)] to-transparent">
                                <Video className="h-16 w-16 text-[var(--muted-subtle)] mb-6" />
                                <h3 className="text-[var(--foreground)] text-xl font-bold mb-2 tracking-tight">No Videos Found</h3>
                                <p className="text-[var(--muted)] max-w-sm mx-auto text-sm leading-relaxed">System has no recorded video renders.</p>
                            </div>
                        ) : (
                            <motion.div variants={containerV} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((video) => (
                                    <motion.div
                                        variants={itemV}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        key={video._id}
                                        className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--accent-from)]/40 transition-all shadow-sm hover:shadow-lg hover:shadow-[var(--accent-glow)]/10 flex flex-col justify-between"
                                    >
                                        <div>
                                            {video.videoUrl && video.status === 'done' ? (
                                                <video
                                                    src={video.videoUrl}
                                                    controls
                                                    className="w-full h-40 object-cover rounded-xl border border-[var(--border-strong)] mb-4 bg-black"
                                                />
                                            ) : (
                                                <div className="w-full h-40 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] mb-4 flex items-center justify-center">
                                                    <PlayCircle className="h-8 w-8 text-[var(--muted)]" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mb-2 text-[12px] font-bold text-[var(--accent-from)] uppercase tracking-wider">
                                                <Users className="h-4 w-4" /> {video.user?.name || 'Unknown'} ({video.user?.email || 'N/A'})
                                            </div>
                                            <p className="text-[14px] leading-relaxed text-[var(--foreground)] line-clamp-3 mb-4 italic">
                                                "{video.prompt}"
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-auto">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm",
                                                    video.status === 'done' ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20" :
                                                        video.status === 'failed' ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20" :
                                                            "bg-[var(--accent-from)]/10 text-[var(--accent-from)] border-[var(--accent-from)]/20"
                                                )}>
                                                    {video.status}
                                                </span>
                                                {video.status === 'done' && (
                                                    <button
                                                        onClick={() => handleTogglePublish(video._id)}
                                                        className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-colors cursor-pointer",
                                                            video.isActive ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" : "bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)] hover:bg-[var(--surface-elevated)]"
                                                        )}
                                                    >
                                                        {video.isActive ? 'Published' : 'Hidden'}
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-[12px] font-bold text-[var(--muted-subtle)] uppercase tracking-wider">
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
