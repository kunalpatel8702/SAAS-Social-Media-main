import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Edit3, 
    Trash2, 
    Settings2, 
    Plus, 
    ShieldAlert, 
    Layers, 
    RefreshCw,
    CheckCircle2,
    Users,
    Search,
    LayoutGrid,
    Check,
    X,
    Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$';

export default function ManageAutomations() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // For editing
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        detailedDescription: '',
        priceINR: '',
        priceUSD: '',
        price: '',
        currency: 'INR',
        billingCycle: 'monthly',
        durationInDays: 30,
        isActive: true,
        features: '',
        benefits: '',
        howItWorks: '',
        targetAudience: '',
        icon: '🚀',
        isFeatured: false
    });

    const token = localStorage.getItem('adminToken');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/v1/automation`, config);
            setServices(res.data.data.services);
        } catch (err) {
            toast.error('Neural grid connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('PROTOCOL WARNING: Destructive action. Confirm deletion of this module?')) return;

        try {
            await axios.delete(`${API_URL}/v1/automation/${id}`, config);
            toast.success('Module purged successfully');
            fetchServices();
        } catch (err) {
            toast.error('Purge failed');
        }
    };

    const startEdit = (service) => {
        setEditMode(true);
        setCurrentId(service._id);
        setFormData({
            name: service.name,
            description: service.description || '',
            detailedDescription: service.detailedDescription || '',
            priceINR: service.priceINR || service.price || 0,
            priceUSD: service.priceUSD || 0,
            price: service.price,
            currency: service.currency || 'INR',
            billingCycle: service.billingCycle || 'monthly',
            durationInDays: service.durationInDays || 30,
            isActive: service.isActive,
            features: service.features ? service.features.join(', ') : '',
            benefits: service.benefits ? service.benefits.join(', ') : '',
            howItWorks: service.howItWorks || '',
            targetAudience: service.targetAudience || '',
            icon: service.icon || '🚀',
            isFeatured: service.isFeatured || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
                benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== ''),
                price: formData.currency === 'INR' ? formData.priceINR : formData.priceUSD
            };
            await axios.patch(`${API_URL}/v1/automation/${currentId}`, payload, config);
            toast.success('Module re-coordinated successfully');
            setEditMode(false);
            fetchServices();
        } catch (err) {
            toast.error('Coordination failed');
        }
    };

    const toggleFeatured = async (service) => {
        try {
            const newStatus = !service.isFeatured;
            await axios.patch(`${API_URL}/v1/automation/${service._id}`, { isFeatured: newStatus }, config);
            toast.success(newStatus ? 'Module promoted to homepage' : 'Module removed from homepage');
            fetchServices();
        } catch (err) {
            toast.error('Promotion adjustment failed');
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (searchQuery.toLowerCase() === 'featured') return s.isFeatured && matchesSearch;
        return matchesSearch;
    });

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 bg-[var(--background)]">
            <div className="mx-auto max-w-7xl">
                
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20 shadow-inner">
                            <Settings2 className="h-3.5 w-3.5 text-[var(--accent-from)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-from)]">Core Module Management</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tighter">
                            Manage <span className="gradient-text">Grid</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-xl font-light italic">
                            Monitor, re-coordinate, or purge existing intelligence modules from the global marketplace.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                                <input 
                                    type="text" 
                                    placeholder="Locate module or type 'featured'..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="premium-input pl-11 py-2.5 text-sm w-full md:w-64"
                                />
                        </div>
                        <button onClick={fetchServices} className="ghost-btn p-3 rounded-xl border-[var(--border)]">
                            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                        </button>
                    </div>
                </motion.header>

                <AnimatePresence mode="wait">
                    {editMode ? (
                        <motion.div 
                            key="edit-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bento-card p-10 mb-16 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-from)] opacity-50" />
                            <h2 className="text-3xl font-black text-[var(--foreground)] mb-10 flex items-center gap-4 tracking-tight">
                                <Edit3 className="h-7 w-7 text-[var(--accent-from)]" />
                                Re-Coordinating Module: <span className="text-[var(--accent-from)]">{formData.name}</span>
                            </h2>
                            
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-8 space-y-8">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <AdminFormGroup label="Service Name">
                                            <input type="text" name="name" required className="premium-input font-bold" value={formData.name} onChange={handleInputChange} />
                                        </AdminFormGroup>
                                        <AdminFormGroup label="Icon / Visual Identity">
                                            <div className="flex gap-4">
                                                <input type="text" name="icon" className="premium-input flex-1" value={formData.icon} onChange={handleInputChange} />
                                                <div className="h-12 w-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-2xl shadow-inner shrink-0">
                                                    {formData.icon?.startsWith('http') ? <img src={formData.icon} className="h-full w-full object-cover" /> : formData.icon}
                                                </div>
                                            </div>
                                        </AdminFormGroup>
                                    </div>

                                    <AdminFormGroup label="Capability Matrix (Features)">
                                        <textarea 
                                            name="features" 
                                            rows={2} 
                                            className="premium-input resize-none h-20" 
                                            placeholder="Feature 1, Feature 2..."
                                            value={formData.features} 
                                            onChange={handleInputChange} 
                                        />
                                    </AdminFormGroup>

                                    <AdminFormGroup label="Core Benefits (Comma Splitted)">
                                        <textarea 
                                            name="benefits" 
                                            rows={2} 
                                            className="premium-input resize-none h-20" 
                                            placeholder="Benefit 1, Benefit 2..."
                                            value={formData.benefits} 
                                            onChange={handleInputChange} 
                                        />
                                    </AdminFormGroup>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <AdminFormGroup label="Workflow (How it works)">
                                            <textarea 
                                                name="howItWorks" 
                                                rows={4} 
                                                className="premium-input resize-none h-32" 
                                                placeholder="Step by step flow..."
                                                value={formData.howItWorks} 
                                                onChange={handleInputChange} 
                                            />
                                        </AdminFormGroup>
                                        <AdminFormGroup label="Target Audience">
                                            <textarea 
                                                name="targetAudience" 
                                                rows={4} 
                                                className="premium-input resize-none h-32" 
                                                placeholder="Ideal user profiles..."
                                                value={formData.targetAudience} 
                                                onChange={handleInputChange} 
                                            />
                                        </AdminFormGroup>
                                    </div>

                                    <AdminFormGroup label="Short Description">
                                        <textarea 
                                            name="description" 
                                            rows={3} 
                                            required 
                                            className="premium-input resize-none h-24 leading-relaxed" 
                                            placeholder="Catchy summary..."
                                            value={formData.description} 
                                            onChange={handleInputChange} 
                                        />
                                    </AdminFormGroup>

                                    <AdminFormGroup label="Detailed Specification">
                                        <textarea 
                                            name="detailedDescription" 
                                            rows={6} 
                                            className="premium-input resize-none h-44 leading-relaxed" 
                                            placeholder="Full details for the details page..."
                                            value={formData.detailedDescription} 
                                            onChange={handleInputChange} 
                                        />
                                    </AdminFormGroup>
                                </div>

                                <div className="md:col-span-4 space-y-8">
                                    <div className="bento-card p-8 bg-[var(--background)] border-[var(--border)]">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] mb-6">Economics & Access</h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <AdminFormGroup label="Price (INR)">
                                                    <div className="relative group/price">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--muted-subtle)]">₹</span>
                                                        <input 
                                                            type="number" 
                                                            name="priceINR" 
                                                            className="premium-input pl-10 text-xl font-black" 
                                                            value={formData.priceINR} 
                                                            onChange={handleInputChange} 
                                                        />
                                                    </div>
                                                </AdminFormGroup>
                                                <AdminFormGroup label="Price (USD)">
                                                    <div className="relative group/price">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--muted-subtle)]">$</span>
                                                        <input 
                                                            type="number" 
                                                            name="priceUSD" 
                                                            className="premium-input pl-10 text-xl font-black" 
                                                            value={formData.priceUSD} 
                                                            onChange={handleInputChange} 
                                                        />
                                                    </div>
                                                </AdminFormGroup>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-4">
                                                <AdminFormGroup label="Billing Strategy">
                                                    <select name="billingCycle" className="premium-input text-xs font-bold" value={formData.billingCycle} onChange={handleInputChange}>
                                                        <option value="monthly">Monthly</option>
                                                        <option value="yearly">Yearly</option>
                                                    </select>
                                                </AdminFormGroup>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer" onClick={() => handleInputChange({ target: { name: 'isActive', type: 'checkbox', checked: !formData.isActive } })}>
                                                <span className="text-xs font-bold text-[var(--foreground)] uppercase">Market Visibility</span>
                                                <div className={cn("h-5 w-10 rounded-full relative transition-all", formData.isActive ? "bg-emerald-500" : "bg-red-500/20")}>
                                                    <div className={cn("absolute top-1 h-3 w-3 rounded-full bg-white transition-all", formData.isActive ? "left-6" : "left-1")} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer" onClick={() => handleInputChange({ target: { name: 'isFeatured', type: 'checkbox', checked: !formData.isFeatured } })}>
                                                <span className="text-xs font-bold text-[var(--foreground)] uppercase">Feature on Home</span>
                                                <div className={cn("h-5 w-10 rounded-full relative transition-all", formData.isFeatured ? "bg-amber-500" : "bg-gray-500/20")}>
                                                    <div className={cn("absolute top-1 h-3 w-3 rounded-full bg-white transition-all", formData.isFeatured ? "left-6" : "left-1")} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <button type="submit" className="gradient-btn py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2">
                                            <Check className="h-4 w-4" /> Finalize Changes
                                        </button>
                                        <button type="button" onClick={() => setEditMode(false)} className="ghost-btn py-4 rounded-2xl font-black uppercase text-sm border-[var(--border)] flex items-center justify-center gap-2 text-[var(--muted)]">
                                            <X className="h-4 w-4" /> Abort Re-Coordination
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {loading && services.length === 0 ? (
                                <div className="col-span-full py-32 text-center space-y-4">
                                    <RefreshCw className="h-12 w-12 text-[var(--accent-from)] animate-spin mx-auto" />
                                    <p className="font-black text-xs uppercase tracking-[0.3em] text-[var(--muted)] animate-pulse">Accessing Core Databases...</p>
                                </div>
                            ) : filteredServices.length === 0 ? (
                                <div className="col-span-full py-32 text-center opacity-40">
                                    <LayoutGrid className="h-16 w-16 mx-auto mb-6" />
                                    <p className="text-xl font-bold">No modules matching your coordinates</p>
                                </div>
                            ) : (
                                filteredServices.map((service) => (
                                    <motion.div 
                                        layout
                                        key={service._id} 
                                        className="bento-card p-8 flex flex-col justify-between group overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="h-14 w-14 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                                    {service.icon?.startsWith('http') ? <img src={service.icon} className="h-full w-full object-cover" /> : service.icon}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleFeatured(service); }}
                                                        className={cn(
                                                            "p-2 rounded-xl border transition-all hover:scale-110",
                                                            service.isFeatured 
                                                                ? "bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                                                                : "bg-[var(--background)] text-[var(--muted-subtle)] border-[var(--border)] hover:border-amber-500/30 hover:text-amber-500"
                                                        )}
                                                        title={service.isFeatured ? "Remove from Home" : "Feature on Home"}
                                                    >
                                                        <Star className={cn("h-4 w-4", service.isFeatured && "fill-amber-500")} />
                                                    </button>
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                        service.isActive 
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    )}>
                                                        {service.isActive ? 'Active Grid' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight group-hover:text-[var(--accent-from)] transition-colors line-clamp-1">{service.name}</h3>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-from)] mb-4 flex items-center gap-2">
                                                <Layers className="h-3 w-3" />
                                                SYSTEM CORE
                                            </div>
                                            
                                            <p className="text-[var(--muted)] text-sm mb-6 line-clamp-2 h-10 italic">{service.description}</p>
                                            
                                            <div className="flex items-baseline gap-2 mb-8 bg-[var(--background)] w-fit px-4 py-2 rounded-xl border border-[var(--border)] shadow-inner">
                                                <span className="text-2xl font-black text-[var(--foreground)] tracking-tighter">
                                                    {getCurrencySymbol(service.currency)} {service.price}
                                                </span>
                                                <span className="text-[var(--muted)] text-[10px] font-bold uppercase italic">/ {service.billingCycle}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-auto">
                                            <button
                                                onClick={() => startEdit(service)}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--surface-hover)] py-3 text-xs font-black uppercase tracking-widest text-[var(--foreground)] hover:bg-[var(--accent-from)]/20 transition-all border border-[var(--border)] group-hover:border-[var(--accent-from)]/40"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" /> Re-Coord
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service._id)}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/5 py-3 text-xs font-black uppercase tracking-widest text-red-500/60 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Purge
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function AdminFormGroup({ label, children }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] pl-1">{label}</label>
            {children}
        </div>
    );
}
