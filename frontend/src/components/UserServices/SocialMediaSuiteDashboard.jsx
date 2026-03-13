import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InstagramServiceManager from '../SocialMedia/InstagramServiceManager';
import FacebookManager from '../SocialMedia/FacebookManager';
import LinkedinManager from '../SocialMedia/LinkedinManager';
import TwitterManager from '../SocialMedia/TwitterManager';
import AiImageGenerator from '../SocialMedia/AiImageGenerator';
import VideoGenerator from '../SocialMedia/VideoGenerator';
import ContentCalendar from '../SocialMedia/ContentCalendar';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import QueueManager from '../SocialMedia/QueueManager';

export default function SocialMediaSuiteDashboard({ service }) {
    if (!service) {
        return (
            <div className="min-h-[80vh] pt-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    const { id } = useParams();
    const navigate = useNavigate();
    const storageKey = `activeTab_social_${id}`;

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem(storageKey) || 'overview';
    });

    useEffect(() => {
        localStorage.setItem(storageKey, activeTab);
    }, [activeTab, storageKey]);

    const tabs = [
        { id: 'overview', label: '🚀 Setup & Overview' },
        { id: 'instagram', label: '📸 Instagram' },
        { id: 'facebook', label: '📘 Facebook' },
        { id: 'twitter', label: '🐦 X (Twitter)' },
        { id: 'linkedin', label: '💼 LinkedIn' },
        { id: 'ai', label: '✨ AI Image Creator' },
        { id: 'video', label: '🎬 AI Video Creator' },
        { id: 'calendar', label: '📅 Calendar' },

        { id: 'queue', label: '⚡ Smart Queue' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'instagram': return <InstagramServiceManager service={service} />;
            case 'facebook': return <FacebookManager service={service} />;
            case 'twitter': return <TwitterManager service={service} />;
            case 'linkedin': return <LinkedinManager service={service} />;
            case 'ai': return <AiImageGenerator service={service} />;
            case 'video': return <VideoGenerator service={service} />;
            case 'calendar': return <ContentCalendar />;

            case 'queue': return <QueueManager />;
            case 'overview':
            default:
                return (
                    <div className="pt-20 px-6 max-w-4xl mx-auto animation-fade-in">
                        <div className="relative mb-16 flex flex-col items-center">
                            {/* Elite AI Model Display */}
                            <div className="relative w-full max-w-md aspect-square mb-6 group">
                                <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-colors duration-700" />
                                <motion.img 
                                    src="/Social Model.png" 
                                    alt="Elite Social AI"
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative w-full h-full object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] z-10"
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full z-20 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                                    <span className="text-white font-black text-sm tracking-tight">OPERATIONAL: <span className="text-purple-400">ELITE SOCIAL AI</span></span>
                                </div>
                            </div>

                            <div className="text-center relative z-20">
                                <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4 tracking-tight">
                                    Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Social Media Suite</span>
                                </h2>
                                <p className="text-[var(--foreground)]/60 text-lg max-w-2xl mx-auto leading-relaxed">
                                    Your environment is specialized for multi-platform intelligence. Connect your accounts to begin automated cycles.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Getting Started Cards */}
                            <div
                                onClick={() => setActiveTab('instagram')}
                                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition-all"
                            >
                                <div className="text-4xl mb-4">📸</div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-purple-400">1. Connect Instagram</h3>
                                <p className="text-sm text-[var(--foreground)]/50">Link your IG business account for auto-posting.</p>
                            </div>

                            <div
                                onClick={() => setActiveTab('facebook')}
                                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition-all"
                            >
                                <div className="text-4xl mb-4">📘</div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-purple-400">2. Connect Facebook</h3>
                                <p className="text-sm text-[var(--foreground)]/50">Link your FB pages and groups.</p>
                            </div>

                            <div
                                onClick={() => setActiveTab('ai')}
                                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition-all"
                            >
                                <div className="text-4xl mb-4">✨</div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-purple-400">3. Generate AI Content</h3>
                                <p className="text-sm text-[var(--foreground)]/50">Once connected, use our AI to generate engaging posts and images in seconds.</p>
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
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4 hidden sm:flex">
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-purple-500 text-[var(--foreground)] shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-white/10 border border-transparent cursor-pointer'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <button onClick={() => setActiveTab('ai')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black text-sm hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2">
                            <span>+</span> New Post
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
