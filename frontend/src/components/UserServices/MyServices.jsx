import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Zap, ArrowRight, ServerCrash } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemV = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function MyServices() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/automation/my/subscriptions`, config);
            setSubscriptions(res.data.data.subscriptions);
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-6">
            <motion.div 
                initial="hidden"
                animate="show"
                variants={containerV}
                className="mx-auto max-w-6xl"
            >
                <motion.header variants={itemV} className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">My Subscriptions</h1>
                    <p className="text-[var(--muted)] text-lg max-w-2xl">Manage and monitor all your active automation services in one place.</p>
                </motion.header>

                <motion.section variants={itemV} className="glass-strong rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Active Automations</h2>
                            <p className="text-[var(--muted)] text-sm">Deployment status of your subscribed workflows</p>
                        </div>
                        <button
                            onClick={fetchSubscriptions}
                            className="ghost-btn px-4 py-2 rounded-xl text-sm font-semibold w-full sm:w-auto"
                        >
                            Refresh List
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="h-8 w-8 text-[var(--accent-from)] animate-spin" />
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-hover)]">
                                <ServerCrash className="h-16 w-16 text-[var(--muted-subtle)] mb-6" />
                                <p className="text-[var(--foreground)] text-xl font-bold mb-4 tracking-tight">You haven't subscribed to any services yet.</p>
                                <p className="text-[var(--muted)] text-sm max-w-sm text-center mb-8">Deploy your first AI agent or workflow orchestration system to get started.</p>
                                <Link to="/all-services" className="gradient-btn px-8 py-3 rounded-xl shadow-sm">
                                    Explore Marketplace
                                </Link>
                            </div>
                        ) : (
                            <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-4">
                                {subscriptions.map((sub, i) => (
                                    <motion.div variants={itemV} key={i} className="bento-card group relative flex flex-col md:flex-row items-center justify-between p-6 lg:p-8 hover:!border-[var(--accent-from)]/40 hover:-translate-y-0.5">
                                        
                                        <div className="flex flex-col md:flex-row items-center gap-6 w-full text-center md:text-left">
                                            {/* Icon Container */}
                                            <div className="h-20 w-20 shrink-0 rounded-[1.5rem] bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative">
                                                {sub.service?.serviceIcon?.startsWith('http') || sub.service?.icon?.startsWith('http') ? (
                                                    <img src={sub.service.serviceIcon || sub.service.icon} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="relative z-10">{sub.service?.serviceIcon || sub.service?.icon || <Zap className="h-8 w-8 text-[var(--accent-from)]" />}</span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow">
                                                <h4 className="font-extrabold text-[var(--foreground)] text-2xl group-hover:text-[var(--accent-from)] transition-colors mb-2.5 truncate">
                                                    {sub.service?.serviceName || sub.service?.name}
                                                </h4>
                                                
                                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                                    {(sub.service?.serviceFeatures || sub.service?.features || []).slice(0, 4).map((f, idx) => (
                                                        <span key={idx} className="text-[9px] uppercase tracking-[0.1em] font-bold text-[var(--muted)] bg-[var(--background)] px-2.5 py-1 rounded-md border border-[var(--border)]">{f}</span>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex items-center justify-center md:justify-start gap-6 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-subtle)]">
                                                    <span>Subscribed: <span className="text-[var(--muted)] font-bold">{new Date(sub.startDate).toLocaleDateString()}</span></span>
                                                    <span>Renewal: <span className="text-[var(--foreground)] font-black">{new Date(sub.endDate).toLocaleDateString()}</span></span>
                                                </div>
                                            </div>

                                            {/* Right Side Info & Action */}
                                            <div className="flex flex-col md:flex-row items-center gap-6 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--border)] md:pl-6 w-full md:w-auto">
                                                <div className="text-center md:text-right">
                                                    <p className="text-2xl font-black text-[var(--foreground)] tracking-tight">{sub.amountPaid} {sub.currency}</p>
                                                    <p className="text-[10px] text-[var(--muted-subtle)] font-bold uppercase tracking-[0.2em] leading-tight mt-0.5">Investment</p>
                                                </div>
                                                
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm whitespace-nowrap",
                                                    sub.isActive 
                                                        ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20" 
                                                        : "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20"
                                                )}>
                                                    {sub.isActive ? 'Active' : 'Expired'}
                                                </div>

                                                <Link
                                                    to={`/service-manager/${sub.service?._id}`}
                                                    className="h-12 w-12 shrink-0 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
