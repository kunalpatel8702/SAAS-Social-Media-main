import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Zap,
    ShieldCheck,
    Activity,
    Clock,
    Lock,
    Settings2,
    Users,
    Sparkles,
    CreditCard,
    Globe,
    Smartphone,
    Terminal,
    Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL;

const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$';

export default function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get currency from URL or default to INR
    const queryParams = new URLSearchParams(location.search);
    const initialCurrency = queryParams.get('currency') || 'INR';

    const [service, setService] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
    const [subscribedIds, setSubscribedIds] = useState(new Set());

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const checkSubscription = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/automation/my/subscriptions`, config);
            const subs = res.data.data.subscriptions || [];
            const active = subs.some(s => (s.service?._id === id || s.service === id) && s.isActive);
            setIsSubscribed(active);
            
            const ids = new Set(subs.filter(s => s.isActive).map(s => s.service?._id || s.service));
            setSubscribedIds(ids);
        } catch (err) {
            // silent
        }
    };

    const fetchRelatedServices = async (currentService) => {
        try {
            const res = await axios.get(`${API_URL}/v1/automation`);
            const allServices = res.data.data.services;
            
            // Filter out current service
            let filtered = allServices.filter(s => s._id !== id);
            
            // Prioritize same category
            const sameCategory = filtered.filter(s => s.category === currentService.category);
            const otherCategories = filtered.filter(s => s.category !== currentService.category);
            
            setRelatedServices([...sameCategory, ...otherCategories].slice(0, 3));
        } catch (err) {
            console.error("Failed to fetch related services", err);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/v1/automation/${id}`);
                const s = res.data.data.service;
                setService(s);
                fetchRelatedServices(s);
                if (token) checkSubscription();
            } catch (err) {
                toast.error('Failed to load service details');
                navigate('/all-services');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSubscribe = async () => {
        if (!token) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        setSubscribing(true);
        try {
            await axios.post(`${API_URL}/v1/automation/subscribe/${id}`, { currency: selectedCurrency }, config);
            toast.success('Successfully initialized system upgrade!');
            setIsSubscribed(true);
            setTimeout(() => navigate('/my-services'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Activation failed');
        } finally {
            setSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <Loader2 className="h-12 w-12 text-[var(--accent-from)] animate-spin" />
            </div>
        );
    }

    if (!service) return null;

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 bg-[var(--background)] selection:bg-[var(--accent-from)] selection:text-white">
            <div className="mx-auto max-w-7xl">
                {/* Back Link */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/all-services')}
                    className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-12 group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Marketplace</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Visual & Header Area (Left) */}
                    <div className="lg:col-span-7 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20">
                                    <Sparkles className="h-3 w-3 text-[var(--accent-from)] animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-from)]">Premium Intelligence</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border)]">
                                    <Users className="h-3 w-3 text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Active Operatives: <span className="text-emerald-400">4,208+</span></span>
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter leading-none mb-8">
                                {service.name}
                            </h1>

                            <p className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-2xl italic">
                                "{service.description}"
                            </p>
                        </motion.div>

                        {/* Interactive Terminal / Demo Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full bg-[#0D0D12] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative"
                        >
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                                </div>
                                <span className="ml-4 text-[10px] uppercase font-black tracking-widest text-[#52525B] flex items-center gap-2">
                                    <Terminal className="h-3 w-3" /> Live Protocol Stream
                                </span>
                            </div>
                            <div className="p-6 font-mono text-[11px] leading-relaxed text-[#A1A1AA] h-[160px] flex flex-col justify-end overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-transparent z-10 top-1/2 pointer-events-none" />
                                <motion.div
                                    animate={{ y: [0, -20, -40, -60, -80] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="space-y-4"
                                >
                                    <p><span className="text-emerald-400">[{new Date(Date.now() - 50000).toLocaleTimeString()}]</span> SYS: Initializing proxy rotation protocol...</p>
                                    <p><span className="text-emerald-400">[{new Date(Date.now() - 40000).toLocaleTimeString()}]</span> NET: Establishing encrypted connection to targets.</p>
                                    <p><span className="text-blue-400">[{new Date(Date.now() - 30000).toLocaleTimeString()}]</span> AI_CORE: Analyzing prospect profile parameters...</p>
                                    <p><span className="text-amber-400">[{new Date(Date.now() - 20000).toLocaleTimeString()}]</span> EXTRACT: 47 data points identified and secured.</p>
                                    <p><span className="text-emerald-400">[{new Date(Date.now() - 10000).toLocaleTimeString()}]</span> SYS: Awaiting command sequence deployment.</p>
                                    <p><span className="text-purple-400">[{new Date().toLocaleTimeString()}]</span> ACTION: Ready for user input.</p>
                                    <p><span className="text-[#A1A1AA] animate-pulse">_</span></p>
                                </motion.div>
                            </div>
                        </motion.div>


                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl overflow-hidden relative group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-from)] to-transparent opacity-30" />

                            <h2 className="text-2xl font-black text-[var(--foreground)] mb-10 flex items-center gap-3">
                                <Code className="h-6 w-6 text-[var(--accent-from)]" />
                                Protocol Capabilities
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.features?.map((feature, i) => (
                                    <div key={i} className="flex gap-4 group/feat bg-[var(--surface-hover)] border border-[var(--border)] p-5 rounded-2xl hover:bg-[var(--surface-elevated)] hover:border-[var(--accent-from)]/40 transition-all cursor-crosshair">
                                        <div className="h-8 w-8 rounded-xl bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20 flex items-center justify-center shrink-0 group-hover/feat:bg-[var(--accent-from)] group-hover/feat:text-white transition-all duration-300">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--foreground)] group-hover/feat:text-[var(--accent-from)] transition-colors">{feature}</p>
                                            <p className="text-[10px] text-[var(--muted)] mt-1 font-black uppercase tracking-widest opacity-60">Sub-routine Integrated</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {service.detailedDescription && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Technical Breakdown</h2>
                                <p className="text-[var(--muted)] leading-relaxed font-medium whitespace-pre-wrap">
                                    {service.detailedDescription}
                                </p>
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-10">
                            {service.howItWorks && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                                        <Settings2 className="h-5 w-5 text-[var(--accent-from)]" />
                                        Protocol Workflow
                                    </h3>
                                    <p className="text-[var(--muted)] text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-[var(--accent-from)]/20 pl-6">
                                        {service.howItWorks}
                                    </p>
                                </div>
                            )}
                            {service.targetAudience && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-400" />
                                        Ideal Operatives
                                    </h3>
                                    <p className="text-[var(--muted)] text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-purple-500/20 pl-6">
                                        {service.targetAudience}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard icon={<ShieldCheck className="text-emerald-400" />} label="Security" value="Enterprise" />
                            <StatsCard icon={<Activity className="text-purple-400" />} label="Uptime" value="99.9%" />
                            <StatsCard icon={<Clock className="text-cyan-400" />} label="Latency" value="< 50ms" />
                        </div>
                    </div>

                    {/* Subscription & Action Area (Right) */}
                    <div className="lg:col-span-5 sticky top-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bento-card p-10 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--background)] border-[var(--border-strong)] shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="h-16 w-16 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-all">
                                    {service.icon?.startsWith('http') ? (
                                        <img src={service.icon} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{service.icon}</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Access Tier</p>
                                    <span className="px-3 py-1 rounded-full bg-[var(--accent-from)]/10 text-[var(--accent-from)] font-bold text-xs border border-[var(--accent-from)]/20 uppercase tracking-tighter">Unlimited Alpha</span>
                                </div>
                            </div>

                            <div className="space-y-1 mb-10">
                                <p className="text-[var(--muted)] text-sm font-bold uppercase tracking-widest mb-4">Pricing Structure</p>

                                <div className="flex flex-col gap-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-[var(--foreground)] tracking-tighter">
                                            {getCurrencySymbol(selectedCurrency)} {selectedCurrency === 'INR' ? (service.priceINR || service.price) : (service.priceUSD || service.price)}
                                        </span>
                                        <span className="text-[var(--muted)] font-black text-xl uppercase italic">/ {service.billingCycle === 'monthly' ? 'MO' : 'YR'}</span>
                                    </div>

                                    {/* Currency Switcher */}
                                    {service.priceINR > 0 && service.priceUSD > 0 && (
                                        <div className="flex p-1.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] w-fit">
                                            <button
                                                onClick={() => setSelectedCurrency('INR')}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectedCurrency === 'INR' ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                                )}
                                            >
                                                INR (₹)
                                            </button>
                                            <button
                                                onClick={() => setSelectedCurrency('USD')}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectedCurrency === 'USD' ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                                )}
                                            >
                                                USD ($)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                {service.benefits && service.benefits.length > 0 ? (
                                    service.benefits.map((benefit, i) => (
                                        <Benefit key={i} icon={<CheckCircle2 className="h-4 w-4" />} text={benefit} />
                                    ))
                                ) : (
                                    <>
                                        <Benefit icon={<Globe className="h-4 w-4" />} text="Global Network Distribution" />
                                        <Benefit icon={<Smartphone className="h-4 w-4" />} text="Mobile & Desktop Synchronized" />
                                        <Benefit icon={<Lock className="h-4 w-4" />} text="End-to-End Encryption Enabled" />
                                    </>
                                )}
                            </div>

                            <button
                                onClick={isSubscribed ? () => navigate(`/service-manager/${id}`) : handleSubscribe}
                                disabled={subscribing}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                                    isSubscribed
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                        : "gradient-btn text-white shadow-xl shadow-[var(--accent-from)]/20 hover:shadow-[var(--accent-from)]/40 hover:-translate-y-1 active:translate-y-0"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                {subscribing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : isSubscribed ? (
                                    <>
                                        <ShieldCheck className="h-5 w-5" />
                                        Open Dashboard
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        Initialize Protocol
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-6 opacity-60">
                                Encrypted checkout secured by elite workforce
                            </p>
                        </motion.div>
                    </div>

                </div>

                {/* Related Services Section */}
                {relatedServices.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-32"
                    >
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight mb-2">Related <span className="gradient-text">Intelligence</span></h2>
                                <p className="text-[var(--muted)] text-sm font-medium">Complementary modules to further scale your operations.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/all-services')}
                                className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-from)] hover:text-[var(--foreground)] transition-colors"
                            >
                                View All Modules →
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedServices.map((rel) => (
                                <RelatedServiceCard 
                                    key={rel._id} 
                                    service={rel} 
                                    navigate={navigate} 
                                    isOwned={subscribedIds.has(rel._id)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function RelatedServiceCard({ service, navigate, isOwned }) {
    // Determine display price/currency (default to INR if available, else first found)
    const displayCurrency = service.priceINR > 0 ? 'INR' : (service.priceUSD > 0 ? 'USD' : 'INR');
    const displayPrice = displayCurrency === 'INR' ? (service.priceINR || service.price) : (service.priceUSD || service.price);

    return (
        <motion.div
            whileHover={{ y: -10 }}
            onClick={() => {
                navigate(`/service/${service._id}?currency=${displayCurrency}`);
                window.scrollTo(0, 0);
            }}
            className="group relative overflow-hidden bento-card p-0 flex flex-col h-full transition-all duration-500 cursor-pointer border-[var(--border-strong)] hover:shadow-2xl hover:shadow-[var(--accent-from)]/10"
        >
            {/* Media Section */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--surface-hover)] to-[var(--background)]">
                <div className="absolute inset-0 bg-[var(--accent-from)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-[var(--accent-from)]/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />

                {/* Models */}
                {service.name.toLowerCase().includes('social') && (
                    <img src="/Social Model.png" alt="" className="absolute -right-4 -bottom-4 w-40 h-40 object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-xl" />
                )}
                {service.name.toLowerCase().includes('lead') && (
                    <img src="/Email Model.png" alt="" className="absolute -right-4 -bottom-4 w-40 h-40 object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-xl" />
                )}

                {/* Icon overlap */}
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--background)] border-2 border-white/10 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-all">
                        {service.icon?.startsWith('http') ? (
                            <img src={service.icon} alt="" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                            <span>{service.icon || '🤖'}</span>
                        )}
                    </div>
                </div>
                
                {isOwned && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">Active</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-[var(--surface-elevated)]/30">
                <h3 className="text-xl font-black text-[var(--foreground)] mb-2 group-hover:text-[var(--accent-from)] transition-colors truncate tracking-tight">
                    {service.name}
                </h3>
                <p className="text-[var(--muted)] text-xs leading-relaxed line-clamp-2 mb-4 italic font-light">
                    {service.description}
                </p>

                {/* Mini features */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {service.features?.slice(0, 2).map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--accent-from)]/5 border border-[var(--accent-from)]/10 text-[7px] font-bold text-[var(--accent-from)] uppercase tracking-tighter">
                            {f}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Price protocol</p>
                        <p className="text-xl font-black text-[var(--foreground)] tracking-tighter">
                            {getCurrencySymbol(displayCurrency)} {displayPrice}
                            <span className="text-[10px] text-[var(--muted)] font-bold ml-1 italic">/ MO</span>
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatsCard({ icon, label, value }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all">
            <div className="mb-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all border border-white/5">
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">{label}</p>
            <p className="text-lg font-black text-[var(--foreground)] tracking-tight">{value}</p>
        </div>
    );
}

function Benefit({ icon, text }) {
    return (
        <div className="flex items-center gap-4 text-sm font-bold text-[var(--muted)] group">
            <div className="h-8 w-8 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-from)] transition-all group-hover:scale-110 group-hover:bg-[var(--accent-from)] group-hover:text-white">
                {icon}
            </div>
            <span className="group-hover:text-[var(--foreground)] transition-colors tracking-tight">{text}</span>
        </div>
    );
}
