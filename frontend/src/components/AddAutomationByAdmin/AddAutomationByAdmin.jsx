import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Shield, ChevronRight, Info, Plus, Check, Settings2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const getCurrencySymbol = (code) => code === 'INR' ? '₹' : '$';

export default function AddAutomationByAdmin() {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        detailedDescription: '',
        category: 'Social Media',
        priceINR: '',
        priceUSD: '',
        price: '', // legacy
        currency: 'INR', // legacy
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            detailedDescription: '',
            category: 'Social Media',
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
                benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== ''),
                price: formData.currency === 'INR' ? formData.priceINR : formData.priceUSD
            };

            await axios.post(`${API_URL}/v1/automation`, payload, config);
            toast.success('New service deployed successfully!');
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deployment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 bg-[var(--background)]">
            <div className="mx-auto max-w-5xl">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-from)]/10 border border-[var(--accent-from)]/20 mb-6 transition-all hover:bg-[var(--accent-from)]/20">
                        <Sparkles className="h-4 w-4 text-[var(--accent-from)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-from)]">System Expansion</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-[var(--foreground)] mb-6 tracking-tight leading-none">
                        Deploy <span className="gradient-text">New Intelligence</span>
                    </h1>
                    <p className="text-[var(--muted)] text-xl max-w-2xl mx-auto font-light">
                        Inject new capabilities into the Automation Suite. Control pricing, lifecycle, and feature sets in real-time.
                    </p>
                </motion.header>

                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* Main Form Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bento-card p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent-from)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[var(--accent-from)]/10 transition-colors duration-700" />

                            <div className="grid gap-8">
                                <FormGroup label="Service Name" icon={<Rocket className="h-4 w-4" />}>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="premium-input text-lg font-bold"
                                        placeholder="e.g. Lead Gen Matrix"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="mt-8">
                                <FormGroup label="Service Description" icon={<Info className="h-4 w-4" />}>
                                    <textarea
                                        name="description"
                                        required
                                        rows={5}
                                        className="premium-input resize-none leading-relaxed"
                                        placeholder="Describe the neural capabilities of this service..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="mt-8">
                                <FormGroup label="Core Features (Comma Splitted)" icon={<Plus className="h-4 w-4" />}>
                                    <textarea
                                        name="features"
                                        rows={3}
                                        className="premium-input resize-none"
                                        placeholder="Precision Targeting, Multi-channel Sync..."
                                        value={formData.features}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="mt-8">
                                <FormGroup label="Key Benefits (Comma Splitted)" icon={<Check className="h-4 w-4" />}>
                                    <textarea
                                        name="benefits"
                                        rows={3}
                                        className="premium-input resize-none"
                                        placeholder="Reduce Costs by 40%, 24/7 Automation, Scale Effortlessly..."
                                        value={formData.benefits}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="mt-8 grid md:grid-cols-2 gap-8">
                                <FormGroup label="How it Works" icon={<Settings2 className="h-4 w-4" />}>
                                    <textarea
                                        name="howItWorks"
                                        rows={4}
                                        className="premium-input resize-none"
                                        placeholder="1. Connect Account, 2. Set Parameters, 3. Go Live..."
                                        value={formData.howItWorks}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                                <FormGroup label="Target Audience" icon={<Users className="h-4 w-4" />}>
                                    <textarea
                                        name="targetAudience"
                                        rows={4}
                                        className="premium-input resize-none"
                                        placeholder="Agencies, Solopreneurs, E-commerce Brands..."
                                        value={formData.targetAudience}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>

                            <div className="mt-8">
                                <FormGroup label="Detailed breakdown (Hidden initially)" icon={<Info className="h-4 w-4" />}>
                                    <textarea
                                        name="detailedDescription"
                                        rows={6}
                                        className="premium-input resize-none leading-relaxed"
                                        placeholder="Full technical specification or use cases..."
                                        value={formData.detailedDescription}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area: Pricing & Deployment */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bento-card p-8">
                            <h3 className="text-lg font-black text-[var(--foreground)] uppercase tracking-widest mb-8 flex items-center gap-3">
                                <Shield className="h-5 w-5 text-[var(--accent-from)]" />
                                Economics
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormGroup label="Price (INR)">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="priceINR"
                                                className="premium-input pl-10 text-xl font-black"
                                                placeholder="0"
                                                value={formData.priceINR}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold">₹</span>
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Price (USD)">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="priceUSD"
                                                className="premium-input pl-10 text-xl font-black"
                                                placeholder="0"
                                                value={formData.priceUSD}
                                                onChange={handleInputChange}
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-bold">$</span>
                                        </div>
                                    </FormGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormGroup label="Currency">
                                        <select
                                            name="currency"
                                            className="premium-input text-sm font-bold"
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Cycle">
                                        <select
                                            name="billingCycle"
                                            className="premium-input text-sm font-bold"
                                            value={formData.billingCycle}
                                            onChange={handleInputChange}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </FormGroup>
                                </div>
                            </div>
                        </div>

                        <div className="bento-card p-8 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--background)]">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => handleInputChange({ target: { name: 'isFeatured', type: 'checkbox', checked: !formData.isFeatured } })}>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--foreground)]">Feature on Home</p>
                                        <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">{formData.isFeatured ? 'Selected for Top 3' : 'Standard Product page'}</p>
                                    </div>
                                    <div className={`h-6 w-11 rounded-full transition-all relative ${formData.isFeatured ? 'bg-amber-500' : 'bg-[var(--surface-hover)]'}`}>
                                        <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-[var(--foreground)] transition-all ${formData.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] group hover:border-[var(--accent-from)]/30 transition-all cursor-pointer" onClick={() => handleInputChange({ target: { name: 'isActive', type: 'checkbox', checked: !formData.isActive } })}>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--foreground)]">Grid Visibility</p>
                                        <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">{formData.isActive ? 'Publicly Searchable' : 'Hidden from Marketplace'}</p>
                                    </div>
                                    <div className={`h-6 w-11 rounded-full transition-all relative ${formData.isActive ? 'bg-[var(--accent-from)]' : 'bg-[var(--surface-hover)]'}`}>
                                        <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-[var(--foreground)] transition-all ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                <FormGroup label="System Icon">
                                    <input
                                        type="text"
                                        name="icon"
                                        className="premium-input text-center text-3xl"
                                        placeholder="🚀"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-btn py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[var(--accent-from)]/10"
                                >
                                    {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : (
                                        <>
                                            Initialize Deployment
                                            <ChevronRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

function FormGroup({ label, icon, children }) {
    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-[var(--muted-subtle)] uppercase tracking-[0.2em] pl-1">
                {icon}{label}
            </label>
            {children}
        </div>
    );
}
