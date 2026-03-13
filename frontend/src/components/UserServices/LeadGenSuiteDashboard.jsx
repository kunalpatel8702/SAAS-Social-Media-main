import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeadsDashboard from '../LeadGeneration/LeadsDashboard';
import ScraperPanel from '../LeadGeneration/ScraperPanel';
import CampaignsManager from '../LeadGeneration/CampaignsManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Database, ArrowLeft, Search, Users, Mail, PlayCircle, Zap, TrendingUp, CheckCircle2, Activity } from 'lucide-react';

export default function LeadGenSuiteDashboard({ service }) {
    if (!service) {
        return (
            <div className="min-h-[80vh] pt-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
            </div>
        );
    }

    const { id } = useParams();
    const navigate = useNavigate();
    const storageKey = `activeTab_leadgen_${id}`;

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem(storageKey) || 'overview';
    });

    useEffect(() => {
        localStorage.setItem(storageKey, activeTab);
    }, [activeTab, storageKey]);

    const tabs = [
        { id: 'overview', label: '🚀 Setup & Overview' },
        { id: 'scraper', label: '🕸️ Web Scraper' },
        { id: 'leads', label: '👥 CRM Database' },
        { id: 'campaigns', label: '📨 Auto-Campaigns' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'scraper': return <ScraperPanel />;
            case 'leads': return <LeadsDashboard />;
            case 'campaigns': return <CampaignsManager />;
            case 'overview':
            default:
                return (
                    <div className="pt-10 px-6 max-w-5xl mx-auto animation-fade-in pb-20">
                        {/* HERO SECTION */}
                        <div className="relative mb-16 flex flex-col items-center bg-[var(--surface-elevated)]/30 p-10 rounded-[2.5rem] border border-[var(--border)] shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
                                {/* Left Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                                        <Sparkles className="h-4 w-4" /> System Online & Ready
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6 tracking-tight leading-tight">
                                        Your Autonomous <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Lead Machine</span>
                                    </h2>
                                    <p className="text-[var(--foreground)]/60 text-lg leading-relaxed mb-8 max-w-lg">
                                        Pipeline intelligence initialized. Extract hyper-targeted B2B leads from Google Maps & Web, verify them, and launch AI-driven email and voice campaigns on autopilot.
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('scraper')}
                                        className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                                    >
                                        <PlayCircle className="h-5 w-5" /> Start First Extraction
                                    </button>
                                </div>

                                {/* Right Avatar (Made slightly smaller and pushed right) */}
                                <div className="relative w-full max-w-[280px] shrink-0 group perspective-1000">
                                    <div className="absolute inset-0 bg-orange-500/20 blur-[80px] rounded-full group-hover:bg-orange-500/30 transition-colors duration-700" />
                                    <motion.img 
                                        src="/Email Model.png" 
                                        alt="Elite LeadGen AI"
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative w-full h-full object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.5)] z-10"
                                    />
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full z-20 flex items-center gap-2 shadow-xl">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-white font-bold text-[10px] tracking-widest text-nowrap uppercase">Agent Elite Standing By</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STATS ROW (Mocked/Empty States for Onboarding) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                            {[
                                { label: 'Total Leads Found', val: '0', icon: Database, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                { label: 'Verified Contacts', val: '0', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                { label: 'Active Campaigns', val: '0', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                                { label: 'Hot Replies', val: '0', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                            ].map((s, i) => (
                                <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${s.bg}`}>
                                            <s.icon className={`h-4 w-4 ${s.color}`} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-subtle)]">{s.label}</h4>
                                    </div>
                                    <p className="text-3xl font-black text-[var(--foreground)]">{s.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* HOW IT WORKS PIPELINE */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-orange-400" /> Standard Operation Protocol
                            </h3>
                            
                            <div className="grid md:grid-cols-3 gap-6 relative">
                                {/* Connecting Line (hidden on mobile) */}
                                <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent z-0" />

                                {/* Step 1 */}
                                <div 
                                    onClick={() => setActiveTab('scraper')}
                                    className="group relative z-10 bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-3xl p-8 hover:bg-[var(--surface-elevated)] hover:border-blue-500/40 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-2"
                                >
                                    <div className="absolute -top-4 -right-4 text-6xl font-black text-white/[0.03] group-hover:text-blue-500/10 transition-colors pointer-events-none">01</div>
                                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Search className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Search & Extract</h3>
                                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                                        Input your niche (e.g., "Plumbers in Texas"). The AI sweeps Google Maps and company websites to extract emails, phones, and social profiles.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div 
                                    onClick={() => setActiveTab('leads')}
                                    className="group relative z-10 bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-3xl p-8 hover:bg-[var(--surface-elevated)] hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-2"
                                >
                                    <div className="absolute -top-4 -right-4 text-6xl font-black text-white/[0.03] group-hover:text-emerald-500/10 transition-colors pointer-events-none">02</div>
                                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Users className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Verify & Segment</h3>
                                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                                        Review your extracted CRM list. The system automatically cleans duplicates. Select your perfect prospects and push them to an outreach list.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div 
                                    onClick={() => setActiveTab('campaigns')}
                                    className="group relative z-10 bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-3xl p-8 hover:bg-[var(--surface-elevated)] hover:border-orange-500/40 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:-translate-y-2"
                                >
                                    <div className="absolute -top-4 -right-4 text-6xl font-black text-white/[0.03] group-hover:text-orange-500/10 transition-colors pointer-events-none">03</div>
                                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Mail className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Launch Protocols</h3>
                                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                                        Build a campaign, define your goal (e.g., "Book Meeting"), and let the AI instantly research each lead and write hyper-personalized outreach.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                );
        }
    };

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
            {/* Header for Dashboard */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/my-services')}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-all group"
                        title="Back to My Services"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--foreground)]">{service?.name}</h1>
                        <p className="text-[var(--foreground)]/50 text-sm mt-1 uppercase tracking-widest font-bold">Unified Workspace</p>
                    </div>
                </div>
                {/* Subscription Widget top right */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4">
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Active Suite</p>
                        <p className="text-xs text-[var(--foreground)]/50">Auto-renews in 30 days</p>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[var(--foreground)] text-xs font-bold transition">Billing</button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Navigational Sidebar - Sticky */}
                <aside className="w-full lg:w-64 shrink-0 bg-white/[0.03] border border-white/10 rounded-3xl p-5 flex flex-col sticky top-28 z-20 shadow-xl backdrop-blur-xl">
                    <nav className="flex-1 space-y-1.5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-orange-500 text-[var(--foreground)] shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-white/10 border border-transparent cursor-pointer'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <button onClick={() => setActiveTab('scraper')} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-sm hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2">
                            <span>+</span> New Scrape
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 w-full bg-[var(--background)] border border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl min-h-[70vh] [&>div]:min-h-0 [&>div]:pt-10 [&>div]:pb-10 [&>div]:px-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
