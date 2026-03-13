import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, MapPin, SlidersHorizontal, Cpu, Fingerprint, Zap, ShieldCheck, Radar, Server, Activity, Database } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemV = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ScraperPanel() {
    // 1. EXACT ORIGINAL USESTATE HOOKS
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [limit, setLimit] = useState(10);
    const [quota, setQuota] = useState(null);
    const [scraping, setScraping] = useState(false);
    const [result, setResult] = useState(null);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    // 2. EXACT ORIGINAL AXIOS API CALLS & HANDLERS
    const fetchQuota = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/v1/scraper/quota`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQuota(data.data);
        } catch (err) {
            console.error('Failed to fetch quota:', err);
        }
    }, [token]);

    useEffect(() => { fetchQuota(); }, [fetchQuota]);

    const handleScrape = async (e) => {
        e.preventDefault();
        if (!query.trim()) return toast.error('Please enter a search query');

        setScraping(true);
        setResult(null);
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            const { data } = await axios.post(`${API_URL}/v1/scraper/jobs`, {
                query: query.trim(),
                location: location.trim() || undefined,
                limit,
            }, config);
            setResult(data.data);
            toast.success('Scraper job created! 🔍');
            fetchQuota();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create scraper job');
        } finally {
            setScraping(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10 flex items-center justify-center">
            {/* 6. MICR-INTERACTIONS: Framer motion entrance animations */}
            <motion.div initial="hidden" animate="show" variants={containerV} className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 4. BENTO GRID: col-span-8 for primary form area */}
                <motion.div variants={itemV} className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
                    
                    <div className="mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-inner">
                            <Radar className="h-4 w-4 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Target Extraction Suite</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-[var(--foreground)]">
                            Google Maps <span className="gradient-text bg-gradient-to-r from-emerald-400 to-cyan-500">Node</span>
                        </h1>
                        <p className="text-[var(--muted)] text-base max-w-2xl leading-relaxed">
                            Search for businesses and automatically extract their contact information using remote scraping clusters.
                        </p>
                    </div>

                    {/* 4. BENTO GRID: glass-strong container with heavy padding */}
                    <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 border border-[var(--border-strong)] relative overflow-hidden shadow-2xl">
                        
                        {/* 5. AI LOADING STATES: animate-shimmer */}
                        {scraping && (
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent w-[200%] animate-shimmer" />
                                <div className="absolute top-0 right-1/2 w-full h-full bg-cyan-500/5 blur-[120px] animate-pulse-glow" />
                            </div>
                        )}
                        
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />

                        <form onSubmit={handleScrape} className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-emerald-400" />
                                    Job Configuration
                                </h2>
                                
                                {/* 5. AI LOADING STATES: Loader2 inside a shiny pill */}
                                {scraping && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Extracting...</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Query Input */}
                                <div className="group">
                                    <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 ml-1 flex items-center justify-between">
                                        <span>Search Query *</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-[var(--muted-subtle)] group-focus-within:text-emerald-400 transition-colors" />
                                        </div>
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder="e.g. plumbers, dentists, web design agencies..."
                                            className={cn(
                                                "w-full pl-12 pr-6 py-4 bg-[var(--background)] border-2 rounded-2xl text-lg font-medium text-[var(--foreground)] placeholder-[var(--muted-subtle)] focus:outline-none transition-all shadow-inner",
                                                scraping ? "border-[var(--border)] opacity-70 cursor-not-allowed" : "border-[var(--border)] focus:border-emerald-500/50"
                                            )}
                                            required
                                            disabled={scraping}
                                        />
                                    </div>
                                </div>

                                {/* Geographic & Limit Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--surface-hover)] p-5 rounded-[1.5rem] border border-[var(--border)] shadow-inner">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.1em] mb-2 ml-1">Location (optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-4 w-4 text-[var(--muted-subtle)] group-focus-within:text-emerald-400 transition-colors" />
                                            </div>
                                            <input
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                placeholder="e.g. New York, London..."
                                                className="w-full pl-10 pr-4 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-subtle)] focus:outline-none focus:border-emerald-500/40 transition-shadow shadow-inner text-sm"
                                                disabled={scraping}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="group flex flex-col justify-end">
                                        <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.1em] mb-2 ml-1 flex justify-between items-center">
                                            <span>Max Results</span>
                                            <span className="text-emerald-400">{limit}</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <SlidersHorizontal className="h-4 w-4 text-[var(--muted-subtle)] group-focus-within:text-emerald-400 transition-colors" />
                                            </div>
                                            <input
                                                type="number"
                                                value={limit}
                                                onChange={e => setLimit(parseInt(e.target.value, 10) || 10)}
                                                min={1}
                                                max={100}
                                                className="w-full pl-10 pr-4 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-emerald-500/40 transition-shadow shadow-inner text-sm"
                                                disabled={scraping}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={scraping || (quota && !quota.isPro && quota.remaining <= 0)}
                                className={cn(
                                    "mt-8 w-full py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-3",
                                    scraping || (quota && !quota.isPro && quota.remaining <= 0)
                                        ? "bg-[var(--surface-hover)] border border-[var(--border-strong)] text-[var(--muted)] cursor-not-allowed"
                                        : "gradient-btn bg-gradient-to-r from-emerald-500 to-cyan-600 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 text-[#ffffff] !important"
                                )}
                            >
                                {scraping ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin text-emerald-400" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" /> Start Scraping
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* 3. RESTORED EXACT BUSINESS LOGIC MAPPING: Result Notification Panel */}
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="glass-strong p-8 md:p-10 border border-emerald-500/30 rounded-[2.5rem] relative overflow-hidden flex flex-col gap-6 shadow-xl"
                            >
                                <div className="absolute left-0 top-0 h-full w-2 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                                
                                <div className="flex items-center gap-4 border-b border-[var(--border-strong)] pb-6">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center glow-pulse">
                                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Job Created Successfully</h3>
                                        <p className="text-[var(--muted)] text-sm flex items-center gap-2 mt-0.5">
                                            Leads will appear in your dashboard once processing completes.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                     <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 shadow-inner">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-subtle)] flex items-center gap-1.5 mb-1.5"><Fingerprint className="h-3 w-3" /> Job ID</p>
                                          <p className="text-[var(--foreground)] font-mono text-sm truncate">{result.jobId}</p>
                                     </div>
                                     <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 shadow-inner">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-subtle)] flex items-center gap-1.5 mb-1.5"><Server className="h-3 w-3" /> Query</p>
                                          <p className="text-[var(--foreground)] font-medium text-sm truncate">{result.query}</p>
                                     </div>
                                     <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 shadow-inner">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-subtle)] flex items-center gap-1.5 mb-1.5"><Server className="h-3 w-3 text-cyan-400" /> Expected Leads</p>
                                          <p className="text-cyan-400 font-black text-lg">{result.expectedLeads}</p>
                                     </div>
                                     <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 shadow-inner flex flex-col justify-center items-center text-center">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 flex items-center gap-1.5 mb-1.5"><Activity className="h-3 w-3" /> Status</p>
                                          <p className="text-emerald-400 font-extrabold uppercase tracking-widest text-sm">{result.jobStatus}</p>
                                     </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 4. BENTO GRID: Quotas Secondary Panel (col-span-4) */}
                <motion.div variants={itemV} className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 lg:pt-[84px]">
                    <div className="bento-card p-8 md:p-10 border border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] min-h-[300px] flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hover)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        <div className="flex flex-col mb-8 relative z-10">
                            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-3">
                                <Database className="h-5 w-5 text-emerald-400" />
                                Lead Quota
                            </h2>
                            <p className="text-xs text-[var(--muted)] mt-1 ml-8">Your account extraction limits</p>
                        </div>

                        {quota ? (
                            <div className="flex-grow flex flex-col justify-center relative z-10 space-y-8">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted-subtle)] mb-1">Consumption</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{quota.isPro ? 'Γ£ª' : quota.used}</span>
                                            {!quota.isPro && <span className="text-[var(--muted)] font-bold text-sm">/ {quota.totalLimit} used</span>}
                                        </div>
                                    </div>
                                    
                                    {!quota.isPro && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Remaining</p>
                                            <span className={cn(
                                                "font-black text-xl flex items-center justify-end gap-1",
                                                quota.remaining > 0 ? "text-emerald-400" : "text-red-400"
                                            )}>
                                                {quota.remaining}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {!quota.isPro && (
                                    <div>
                                        <div className="bg-[var(--background)] rounded-full h-2.5 overflow-hidden border border-[var(--border)] shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000 relative"
                                                style={{ width: `${Math.min((quota.used / quota.totalLimit) * 100, 100)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full animate-progress-shine" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {quota.isPro && (
                                    <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-2 text-[var(--foreground)] shadow-sm">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse glow-pulse" />
                                        <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Pro ΓÇö Unlimited</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow flex items-center justify-center flex-col relative z-10">
                                <Loader2 className="h-6 w-6 text-[var(--muted-subtle)] animate-spin mb-3" />
                                <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">Connecting...</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
