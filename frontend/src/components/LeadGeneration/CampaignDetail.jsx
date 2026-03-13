import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Target, Activity, CheckCircle2, XCircle, Rocket, Layers, Clock, X, PhoneCall, AlignLeft, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CAMPAIGN_STATUS_COLORS = {
    DRAFT: 'bg-[var(--surface-hover)] border-[var(--border-strong)] text-[var(--muted)]',
    READY: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.15)]',
    RUNNING: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)] glow-pulse',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    FAILED: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
    PENDING: 'bg-[var(--surface-hover)] border-[var(--border-strong)] text-[var(--muted)]',
    PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20 glow-pulse flex items-center gap-2',
    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemV = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    const fetchCampaign = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/v1/campaigns/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCampaign(data.data);
        } catch (err) {
            console.error('Failed to fetch campaign:', err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

    // Auto-refresh for running campaigns
    useEffect(() => {
        if (campaign?.status === 'RUNNING' || campaign?.status === 'READY') {
            const interval = setInterval(fetchCampaign, 5000);
            return () => clearInterval(interval);
        }
    }, [campaign?.status, fetchCampaign]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-6 md:px-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
                    <p className="text-[var(--muted)] text-sm font-bold uppercase tracking-widest animate-pulse">Decrypting Sequence Data...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-6 md:px-10 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">Sequence Not Found</h2>
                    <p className="text-[var(--muted)] mb-6">The requested campaign protocol does not exist in the neural grid.</p>
                    <button onClick={() => navigate('/campaigns')} className="ghost-btn px-6 py-3 rounded-xl font-bold">
                        Return to Command Center
                    </button>
                </div>
            </div>
        );
    }

    const progressPct = campaign.totalItems > 0
        ? Math.round((campaign.processedItems / campaign.totalItems) * 100)
        : 0;

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div initial="hidden" animate="show" variants={containerV} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* Back Button Area & Page Header (col-span-12) */}
                <motion.div variants={itemV} className="lg:col-span-12 mb-2">
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="group text-[11px] font-bold text-[var(--muted)] hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2 transition-all mb-8 border border-transparent hover:border-emerald-500/30 bg-[var(--surface)] hover:bg-emerald-500/10 px-4 py-2 rounded-xl w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Abort Observation
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] border border-[var(--border)] shadow-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                <Rocket className={cn("h-8 w-8 text-emerald-400", campaign.status === 'RUNNING' && "animate-pulse")} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter mb-2">
                                    {campaign.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border",
                                        CAMPAIGN_STATUS_COLORS[campaign.status]
                                    )}>
                                        {campaign.status}
                                    </span>
                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--muted)]">
                                        Type: {campaign.moduleType?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {campaign.status === 'RUNNING' && (
                            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-pulse glow-pulse">
                                <Activity className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Telemetry Active</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* LEFT MAIN DATA COLUMN (col-span-8) */}
                <motion.div variants={itemV} className="lg:col-span-8 flex flex-col gap-6 lg:gap-8 min-h-[500px]">

                    {/* Primary Tracking Bento */}
                    <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight mb-8 flex items-center gap-3">
                                <Target className="h-5 w-5 text-emerald-400" /> Array Progress
                            </h2>

                            {/* Massive Progress Track */}
                            <div className="mb-12">
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-[14px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Completion Trajectory</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black tracking-tighter text-[var(--foreground)]">{progressPct}</span>
                                            <span className="text-2xl font-bold text-emerald-400">%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[14px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Vectors Fired</p>
                                        <span className="text-3xl font-black text-[var(--foreground)] tracking-tight">{campaign.processedItems} / <span className="text-[var(--muted-subtle)]">{campaign.totalItems}</span></span>
                                    </div>
                                </div>
                                <div className="bg-[var(--background-alt)] rounded-full h-4 overflow-hidden border border-[var(--border)] shadow-inner relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${progressPct}%` }}
                                    >
                                        {campaign.status === 'RUNNING' && <div className="absolute inset-0 bg-white/20 w-full animate-progress-shine" />}
                                    </div>
                                </div>
                            </div>

                            {/* Stat Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-emerald-500/30">
                                    <Layers className="h-6 w-6 text-[var(--muted-subtle)] mb-3 group-hover:text-emerald-400 transition-colors" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Load</p>
                                    <p className="text-2xl font-black text-[var(--foreground)]">{campaign.totalItems}</p>
                                </div>
                                <div className="bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-blue-500/30">
                                    <Activity className="h-6 w-6 text-[var(--muted-subtle)] mb-3 group-hover:text-blue-400 transition-colors" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Fired</p>
                                    <p className="text-2xl font-black text-blue-400">{campaign.processedItems}</p>
                                </div>
                                <div className="bg-emerald-500/5 border border-[var(--border-strong)] rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-emerald-500/50">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400/50 mb-3 group-hover:text-emerald-400 transition-colors" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500/70 mb-1">Hits</p>
                                    <p className="text-2xl font-black text-emerald-400">{campaign.successCount}</p>
                                </div>
                                <div className="bg-red-500/5 border border-[var(--border-strong)] rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-inner group transition-colors hover:border-red-500/50">
                                    <XCircle className="h-6 w-6 text-red-500/50 mb-3 group-hover:text-red-500 transition-colors" />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-red-500/70 mb-1">Fails</p>
                                    <p className="text-2xl font-black text-red-500">{campaign.failureCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT CONTEXT COLUMN (col-span-4) */}
                <motion.div variants={itemV} className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">

                    {/* Prompt Directives Bento */}
                    <div className="bento-card bg-[var(--surface-elevated)] p-8 md:p-10 border border-[var(--border-strong)] flex flex-col flex-grow relative overflow-hidden shadow-lg">
                        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight mb-8">Protocol Directives</h2>

                        <div className="flex-grow flex flex-col gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] mb-2">Custom Input Prompt</label>
                                <div className="bg-[var(--background)] border border-[var(--border-strong)] rounded-2xl p-6 min-h-[150px] shadow-inner text-sm text-[var(--muted)] leading-relaxed italic font-medium">
                                    {campaign.customPrompt
                                        ? `"${campaign.customPrompt}"`
                                        : "No custom algorithms provided. System is utilizing default operational matrices."}
                                </div>
                            </div>

                            <div className="mt-auto border-t border-[var(--border)] pt-6">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] mb-3">Timeline Events</label>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-xs font-bold text-[var(--foreground)] tracking-wide">Initialization Date</span>
                                        </div>
                                        <p className="text-xs text-[var(--muted)] font-mono ml-5.5 py-1 px-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-md w-fit">
                                            {new Date(campaign.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* LEADS LIST ROW (col-span-12) */}
                <motion.div variants={itemV} className="lg:col-span-12 mt-4">
                    <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 border border-[var(--border-strong)] shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-400" /> Campaign Targets
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                                        <th className="py-4 px-4 font-black">Lead</th>
                                        <th className="py-4 px-4 font-black">Company</th>
                                        <th className="py-4 px-4 font-black">Status</th>
                                        <th className="py-4 px-4 font-black text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaign.items?.map(item => (
                                        <tr
                                            key={item._id}
                                            onClick={() => setSelectedItem(item)}
                                            className="border-b border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition-colors group"
                                        >
                                            <td className="py-4 px-4">
                                                <p className="text-sm font-bold text-[var(--foreground)]">{item.leadId?.firstName} {item.leadId?.lastName}</p>
                                                <p className="text-xs text-[var(--muted)]">{item.leadId?.email || item.leadId?.phone}</p>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                                                {item.leadId?.companyName || '-'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    "px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg border",
                                                    CAMPAIGN_STATUS_COLORS[item.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                                )}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {item.result && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-400/20 flex items-center gap-2 ml-auto"
                                                    >
                                                        <AlignLeft className="h-3.5 w-3.5" /> View Log
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {campaign.items?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-sm text-[var(--muted)] italic">
                                                No targets loaded for this campaign.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* CALL INTELLIGENCE DRAWER */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
                            exit={{ x: '100%', transition: { bounce: 0, duration: 0.2 } }}
                            className="w-full max-w-2xl bg-[var(--background)] border-l border-[var(--border)] h-full shadow-2xl overflow-y-auto flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--border)] sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                                        <Target className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Intelligence Log</h3>
                                        <p className="text-sm text-[var(--muted)]">{selectedItem.leadId?.firstName} {selectedItem.leadId?.lastName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="p-6 md:p-8 flex-grow space-y-8">

                                {/* Status Overview */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-[var(--muted-subtle)] mb-1">Final Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                selectedItem.status === 'COMPLETED' ? "bg-emerald-400" : selectedItem.status === 'FAILED' ? "bg-red-400" : "bg-yellow-400"
                                            )} />
                                            <p className="text-sm font-bold text-[var(--foreground)]">{selectedItem.status}</p>
                                        </div>
                                    </div>
                                    {selectedItem.result?.durationSecs !== undefined && (
                                        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--muted-subtle)] mb-1">Call Duration</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-400" />
                                                <p className="text-sm font-bold text-[var(--foreground)]">{selectedItem.result.durationSecs}s</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI Summary */}
                                {selectedItem.result?.summary ? (
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-3 flex items-center gap-2">
                                            <AlignLeft className="h-4 w-4" /> AI Summary
                                        </h4>
                                        <div className="bg-[var(--surface-elevated)] border border-[var(--border-strong)] p-5 rounded-2xl text-sm text-[var(--foreground)] leading-relaxed italic shadow-inner">
                                            "{selectedItem.result.summary}"
                                        </div>
                                    </div>
                                ) : (
                                    !selectedItem.result && (
                                        <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl bg-[var(--surface)]">
                                            <p className="text-sm text-[var(--muted)] italic">No intelligence data recorded yet. Payload pending or task incomplete.</p>
                                        </div>
                                    )
                                )}

                                {/* Full Transcript */}
                                {selectedItem.result?.transcript && (
                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                                            <PhoneCall className="h-4 w-4" /> Full Transcript
                                        </h4>
                                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 md:p-6 overflow-hidden">
                                            <div className="prose prose-sm prose-invert max-w-none text-[var(--muted)] font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                                                {selectedItem.result.transcript}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
