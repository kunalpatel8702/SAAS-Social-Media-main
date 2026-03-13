import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2,
    Zap,
    CheckCircle2,
    BadgeCheck,
    ArrowRight,
    Star,
    Shield,
    Cpu,
    Trophy,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$';

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemV = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AllServices({ featuredOnly = false, isHomePage = false }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(null);
    const [subscribedIds, setSubscribedIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        fetchServices();
        if (token) fetchMySubscriptions();
    }, []);

    const fetchMySubscriptions = async () => {
        try {
            const res = await axios.get(`${API_URL}/v1/automation/my/subscriptions`, config);
            const subs = res.data.data.subscriptions || [];
            const ids = new Set(subs.filter(s => s.isActive).map(s => s.service?._id || s.service));
            setSubscribedIds(ids);
        } catch (err) {
            // silently ignore
        }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/automation`);
            setServices(res.data.data.services);
        } catch (err) {
            toast.error('Failed to load marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async (e, serviceId, currency) => {
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to subscribe');
            navigate('/login');
            return;
        }

        if (subscribedIds.has(serviceId)) {
            toast('Already active in your suite', { icon: '✅' });
            return;
        }

        setSubscribing(`${serviceId}_${currency}`);
        try {
            await axios.post(`${API_URL}/v1/automation/subscribe/${serviceId}`, { currency }, config);
            toast.success('System upgrade successful!');
            setSubscribedIds(prev => new Set([...prev, serviceId]));
            setTimeout(() => navigate('/my-services'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upgrade failed');
        } finally {
            setSubscribing(null);
        }
    };

    // Generate variants for each service (INR and USD)
    const serviceVariants = [];
    services.forEach(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchesSearch) {
            // If featuredOnly is true, only include featured services
            if (featuredOnly && !s.isFeatured) return;

            // Add INR variant if price exists
            if (s.priceINR > 0 || (s.currency === 'INR' && s.price > 0)) {
                serviceVariants.push({ ...s, displayCurrency: 'INR', displayPrice: s.priceINR || s.price });
            }
            // Add USD variant if price exists
            if (s.priceUSD > 0 || (s.currency === 'USD' && s.price > 0)) {
                serviceVariants.push({ ...s, displayCurrency: 'USD', displayPrice: s.priceUSD || s.price });
            }
        }
    });

    // If featuredOnly, limit to top 3 variants
    const finalVariants = featuredOnly ? serviceVariants.slice(0, 3) : serviceVariants;

    return (
        <div id="all-services" className={cn("pb-32 px-6 bg-[var(--background)]", isHomePage ? "pt-10" : "pt-32")}>
            <div className="mx-auto max-w-7xl">

                {/* Header Section - Only show if not on home page or specifically requested */}
                {!isHomePage && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20 mb-8">
                            <Star className="h-4 w-4 text-[var(--accent-from)] fill-[var(--accent-from)]" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-from)]">The Alpha Marketplace</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-[var(--foreground)] mb-6 tracking-tighter leading-none">
                            Scale with <span className="gradient-text">AutomationOwl Intelligence</span>
                        </h2>
                        <p className="text-[var(--muted)] max-w-3xl mx-auto text-xl font-light leading-relaxed">
                            Precision-engineered automation modules for the modern enterprise. Optimized for performance and scale.
                        </p>
                    </motion.div>
                )}

                {isHomePage && (
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4 tracking-tighter">
                            Featured <span className="gradient-text">Intelligence</span>
                        </h2>
                        <p className="text-[var(--muted)] text-lg">Our top-performing automation modules for high-growth enterprises.</p>
                    </div>
                )}

                {/* Search Bar */}
                {!featuredOnly && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
                        <div className="relative w-full md:w-[500px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--accent-from)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search intelligence modules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] focus:border-[var(--accent-from)]/50 focus:outline-none focus:ring-4 focus:ring-[var(--accent-from)]/5 transition-all text-sm font-medium shadow-xl"
                            />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 space-y-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-4 border-[var(--accent-from)]/10 border-t-[var(--accent-from)] animate-spin" />
                            <Cpu className="h-8 w-8 text-[var(--accent-from)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-[var(--muted)] font-black uppercase tracking-widest text-xs animate-pulse text-center">Synchronizing Marketplace Protocol...</p>
                    </div>
                ) : finalVariants.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bento-card border-dashed border-2 border-[var(--border)]"
                    >
                        <Search className="h-16 w-16 text-[var(--muted-subtle)] mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">No Modules Found</h3>
                        <p className="text-[var(--muted)]">Try adjusting your filters or search query.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerV}
                        initial="hidden"
                        animate="show"
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch"
                    >
                        {finalVariants.map((variant, idx) => (
                            <ServiceCard
                                key={`${variant._id}_${variant.displayCurrency}_${idx}`}
                                service={variant}
                                subscribing={subscribing}
                                handleBuyNow={handleBuyNow}
                                subscribedIds={subscribedIds}
                                navigate={navigate}
                                isHomePage={isHomePage}
                            />
                        ))}
                    </motion.div>
                )}
                
                {featuredOnly && serviceVariants.length > 0 && (
                    <div className="mt-16 text-center">
                        <button 
                            onClick={() => navigate('/all-services')}
                            className="group flex items-center gap-3 mx-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--accent-from)]/50 transition-all font-bold text-[var(--foreground)]"
                        >
                            Explore Comprehensive Marketplace
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

function ServiceCard({ service, subscribing, handleBuyNow, subscribedIds, navigate, isHomePage }) {
    const isOwned = subscribedIds.has(service._id);

    const handleClick = () => {
        // Even on home page, we want to go to the specific service details
        navigate(`/service/${service._id}?currency=${service.displayCurrency}`);
    };

    return (
        <motion.div
            variants={itemV}
            whileHover={{ y: -10 }}
            onClick={handleClick}
            className={cn(
                "group relative overflow-hidden bento-card p-0 flex flex-col h-full transition-all duration-500 cursor-pointer border-[var(--border-strong)] hover:shadow-2xl hover:shadow-[var(--accent-from)]/10",
                !service.isActive && "opacity-60 pointer-events-none"
            )}
        >
            {/* Header / Media Section */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[var(--surface-hover)] to-[var(--background)]">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[var(--accent-from)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--accent-from)]/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />

                {/* Models (Legacy Images) */}
                {service.name.toLowerCase().includes('social') && (
                    <img
                        src="/Social Model.png"
                        alt="Social AI"
                        className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-2xl"
                    />
                )}
                {service.name.toLowerCase().includes('lead') && (
                    <img
                        src="/Email Model.png"
                        alt="Lead Gen AI"
                        className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-2xl"
                    />
                )}

                {/* Floating Category Badge */}
                <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--background)]/80 backdrop-blur-md border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] shadow-xl">
                        {service.category}
                    </span>
                </div>

                {/* Icon Container */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 z-20">
                    <div className="h-20 w-20 rounded-[2rem] bg-[var(--background)] border-2 border-white/10 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden">
                        {service.icon?.startsWith('http') ? (
                            <img src={service.icon} alt={service.name} className="h-full w-full object-cover" />
                        ) : (
                            <span>{service.icon || '🤖'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col flex-grow relative z-10 bg-gradient-to-b from-transparent to-[var(--surface-elevated)]/50">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-[var(--foreground)] mb-3 group-hover:text-[var(--accent-from)] transition-colors tracking-tight">
                        {service.name}
                    </h3>
                    <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2 italic font-light">
                        {service.description}
                    </p>
                </div>

                {/* Capability Matrix (Features) */}
                <div className="space-y-3 mb-8">
                    {(service.features && service.features.length > 0) ? (
                        service.features.slice(0, 3).map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted-subtle)] uppercase tracking-wider">
                                <CheckCircle2 className="h-3 w-3 text-[var(--accent-from)]" />
                                {feat}
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] text-[var(--muted-subtle)] italic">Standard features included</p>
                    )}
                    {service.features?.length > 3 && (
                        <p className="text-[9px] font-black text-[var(--accent-from)] uppercase tracking-widest pl-5">+ {service.features.length - 3} More Intelligence Vectors</p>
                    )}
                </div>

                {/* Benefits Section */}
                {service.benefits && service.benefits.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Core Benefits</p>
                        <div className="flex flex-wrap gap-2">
                            {service.benefits.slice(0, 2).map((benefit, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--accent-from)]/5 border border-[var(--accent-from)]/10 text-[8px] font-bold text-[var(--accent-from)] uppercase">
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto border-t border-[var(--border)] pt-8 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Market Price ({service.displayCurrency})</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-[var(--foreground)] tracking-tighter">
                                {getCurrencySymbol(service.displayCurrency)} {service.displayPrice}
                            </span>
                            <span className="text-[var(--muted)] font-black text-xl uppercase italic">/ {service.billingCycle === 'monthly' ? 'MO' : 'YR'}</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => handleBuyNow(e, service._id, service.displayCurrency)}
                        disabled={subscribing === `${service._id}_${service.displayCurrency}` || !service.isActive || isOwned}
                        className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-xl group/btn",
                            isOwned
                                ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
                                : "gradient-btn text-white group-hover/btn:scale-110 active:scale-95"
                        )}
                    >
                        {subscribing === `${service._id}_${service.displayCurrency}` ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isOwned ? (
                            <BadgeCheck className="h-6 w-6" />
                        ) : (
                            <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
