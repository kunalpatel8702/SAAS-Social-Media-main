import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Plus, Rocket, Trash2, ChevronLeft, ChevronRight,
    Activity, Zap, Play, Target, Megaphone, Eye,
    Building2, Goal, Sparkles, ChevronDown, Phone, Mail,
    Globe, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
    DRAFT: 'bg-zinc-700/50 border-zinc-600 text-zinc-400',
    READY: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    RUNNING: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    FAILED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const CAMPAIGN_GOALS = [
    { value: 'BOOK_CALL', emoji: '📞', label: 'Book a Call', desc: 'Get them on a 15-min call' },
    { value: 'GET_REPLY', emoji: '💬', label: 'Get a Reply', desc: 'Start a conversation' },
    { value: 'DRIVE_WEBSITE', emoji: '🌐', label: 'Drive to Website', desc: 'Send them to your link' },
    { value: 'FREE_TRIAL', emoji: '🎁', label: 'Free Trial', desc: 'Let them try first' },
];

const TONES = [
    { value: 'PROFESSIONAL', emoji: '💼', label: 'Professional', desc: 'Formal & warm' },
    { value: 'FRIENDLY', emoji: '😊', label: 'Friendly', desc: 'Conversational' },
    { value: 'CASUAL', emoji: '⚡', label: 'Direct & Bold', desc: 'Straight to the point' },
];

const EMAIL_LENGTHS = [
    { value: 'SHORT', emoji: '✂️', label: 'Short', desc: '3–4 lines' },
    { value: 'MEDIUM', emoji: '📝', label: 'Medium', desc: '1 paragraph' },
    { value: 'DETAILED', emoji: '📄', label: 'Detailed', desc: 'Full deep-dive' },
];

const CALL_GOALS = [
    { value: 'BOOK_MEETING', emoji: '📅', label: 'Book a Meeting', desc: 'Get a calendar slot' },
    { value: 'QUALIFY_LEAD', emoji: '🎯', label: 'Qualify Lead', desc: 'See if they are a fit' },
    { value: 'INTRODUCE', emoji: '👋', label: 'Just Introduce', desc: 'Build awareness' },
];

const EMPTY_FORM = {
    name: '', moduleType: 'EMAIL',
    // Email fields
    senderCompany: '', senderName: '', senderRole: '',
    offering: '', targetIndustry: '', uniqueAdvantage: '',
    campaignGoal: 'BOOK_CALL', tone: 'PROFESSIONAL', emailLength: 'MEDIUM',
    specialOffer: '', ctaLink: '',
    // AI Call fields
    callSenderCompany: '', callSenderName: '', callOffering: '',
    callGoal: 'BOOK_MEETING', callPainPoint: '', callSpecialOffer: '',
};

const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemV = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };

// ── Helpers ──────────────────────────────────────────────────────────────────
const Lbl = ({ children, optional }) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-1.5">
        {children}{optional && <span className="ml-1.5 font-normal normal-case text-[9px] opacity-50">optional</span>}
    </label>
);

const Input = ({ value, onChange, placeholder, type = 'text', required }) => (
    <input
        type={type}
        value={value}
        onChange={typeof onChange === 'function' && onChange.length > 0 ? onChange : e => onChange(e)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted-subtle)] focus:outline-none focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all"
    />
);

// ── Big clickable chips for Goal / Tone / Length ─────────────────────────────
const ChipGrid = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(opt => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "relative flex-1 min-w-[110px] flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border transition-all text-left",
                        active
                            ? "bg-orange-500/15 border-orange-500/50 shadow-[0_0_0_1px_rgba(249,115,22,0.3)]"
                            : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                    )}
                >
                    {active && (
                        <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                    )}
                    <span className="text-base">{opt.emoji}</span>
                    <span className={cn("font-bold text-sm leading-tight", active ? "text-orange-400" : "text-[var(--foreground)]")}>{opt.label}</span>
                    <span className="text-[11px] text-[var(--muted)] leading-tight">{opt.desc}</span>
                </button>
            );
        })}
    </div>
);

// ── Section card wrapper ─────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, iconColor = 'text-orange-400', iconBg = 'bg-orange-500/10 border-orange-500/20', children }) => (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className={cn("h-7 w-7 rounded-lg border flex items-center justify-center shrink-0", iconBg)}>
                <Icon className={cn("h-3.5 w-3.5", iconColor)} />
            </div>
            <div>
                <p className="font-black text-sm text-[var(--foreground)]">{title}</p>
                {subtitle && <p className="text-[11px] text-[var(--muted)]">{subtitle}</p>}
            </div>
        </div>
        <div className="p-5 space-y-4">{children}</div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function CampaignsManager() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selected, setSelected] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const authH = { Authorization: `Bearer ${token}` };

    const set = key => e => setForm(p => ({ ...p, [key]: typeof e === 'string' ? e : e.target.value }));
    const pick = key => v => setForm(p => ({ ...p, [key]: v }));

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/v1/campaigns`, { headers: authH, params: { page, limit: 12 } });
            setCampaigns(data.data.data);
            setTotal(data.data.total);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [page, token]);

    const fetchLeads = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/v1/leads`, { headers: authH, params: { limit: 100 } });
            setLeads(data.data.data);
        } catch { /* silent */ }
    }, [token]);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const openCreate = () => { fetchLeads(); setShowCreate(true); };
    const closeCreate = () => { setShowCreate(false); setForm(EMPTY_FORM); setSelected([]); };

    const goalCta = {
        BOOK_CALL: "Let's hop on a quick 15-minute call this week.",
        GET_REPLY: "Would love to hear your thoughts — just hit reply.",
        DRIVE_WEBSITE: `Check out what we've built: ${form.ctaLink || 'our website'}`,
        FREE_TRIAL: "Start your free trial — no credit card needed.",
    };

    const handleCreate = async e => {
        e.preventDefault();
        if (selected.length === 0) return toast.error('Select at least one lead.');
        try {
            await axios.post(`${API_URL}/v1/campaigns`, {
                name: form.name,
                moduleType: form.moduleType,
                emailConfig: form.moduleType === 'EMAIL' ? {
                    senderName: form.senderName,
                    senderRole: form.senderRole,
                    senderCompany: form.senderCompany,
                    offering: form.offering,
                    painPoint: [
                        form.targetIndustry && `Target market: ${form.targetIndustry}.`,
                        form.uniqueAdvantage && `Our edge: ${form.uniqueAdvantage}.`,
                        form.specialOffer && `Special offer: ${form.specialOffer}.`,
                    ].filter(Boolean).join(' ') || 'scaling efficiently',
                    ctaText: goalCta[form.campaignGoal],
                    ctaLink: form.ctaLink || undefined,
                    tone: form.tone,
                    emailLength: form.emailLength,
                    campaignGoal: form.campaignGoal,
                    targetIndustry: form.targetIndustry,
                    uniqueAdvantage: form.uniqueAdvantage,
                    specialOffer: form.specialOffer,
                } : undefined,
                aiCallConfig: form.moduleType === 'AI_CALL' ? {
                    senderName: form.callSenderName,
                    senderCompany: form.callSenderCompany,
                    offering: form.callOffering,
                    callGoal: form.callGoal,
                    painPoint: form.callPainPoint,
                    specialOffer: form.callSpecialOffer,
                } : undefined,
                leadIds: selected,
            }, { headers: { ...authH, 'Content-Type': 'application/json' } });

            closeCreate();
            fetchCampaigns();
            toast.success('Campaign created! 🚀');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create campaign');
        }
    };

    const handleStart = async id => {
        try { await axios.post(`${API_URL}/v1/campaigns/${id}/start`, {}, { headers: authH }); toast.success('Campaign fired! 🚀'); fetchCampaigns(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to start'); }
    };
    const handleDelete = async id => {
        if (!confirm('Delete this campaign?')) return;
        try { await axios.delete(`${API_URL}/v1/campaigns/${id}`, { headers: authH }); toast.success('Deleted'); fetchCampaigns(); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };
    const toggleLead = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const totalPages = Math.ceil(total / 12);

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div initial="hidden" animate="show" variants={containerV} className="mx-auto max-w-7xl">

                {/* ── Header ── */}
                <motion.header variants={itemV} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-5">
                            <Megaphone className="h-3.5 w-3.5 text-orange-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Outreach Sequences</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
                            Campaign <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Center</span>
                        </h1>
                        <p className="text-[var(--muted)] text-base max-w-xl leading-relaxed">
                            Each lead gets a unique AI-written email after the system researches their website.
                        </p>
                    </div>
                    {!showCreate && (
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={openCreate}
                            className="px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/25 whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" /> New Campaign
                        </motion.button>
                    )}
                </motion.header>

                {/* ── Create Form (FULL WIDTH) ── */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.form
                            key="create-form"
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            onSubmit={handleCreate}
                            className="mb-8 bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-[2rem] overflow-hidden shadow-2xl"
                        >
                            {/* Form header bar */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                                        <Zap className="h-4 w-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-[var(--foreground)] text-lg">New Campaign</h2>
                                        <p className="text-xs text-[var(--muted)]">Fill in your details — AI handles the rest for each lead individually</p>
                                    </div>
                                </div>
                                <button type="button" onClick={closeCreate} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl font-light transition-colors px-2">✕</button>
                            </div>

                            {/* Main 3-column grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">

                                {/* ── COL 1: Business Info ── */}
                                <div className="p-6 space-y-5">
                                    {/* Campaign meta */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Lbl>Campaign Name *</Lbl>
                                            <Input value={form.name} onChange={set('name')} placeholder="e.g. Web Agency Outreach" required />
                                        </div>
                                        <div className="col-span-2">
                                            <Lbl>Payload Type</Lbl>
                                            <div className="relative">
                                                <select value={form.moduleType} onChange={set('moduleType')}
                                                    className="w-full px-3.5 py-2.5 pr-10 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-orange-500/50 appearance-none">
                                                    <option value="EMAIL">📧 Email Campaign</option>
                                                    <option value="AI_CALL">📞 AI Voice Call</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {form.moduleType === 'EMAIL' && (
                                        <>
                                            <Section icon={Building2} title="About Your Business" subtitle="AI uses this to introduce you naturally" iconColor="text-orange-400" iconBg="bg-orange-500/10 border-orange-500/20">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Lbl>Your Name</Lbl>
                                                        <Input value={form.senderName} onChange={set('senderName')} placeholder="e.g. Sapan" />
                                                    </div>
                                                    <div>
                                                        <Lbl>Business Name</Lbl>
                                                        <Input value={form.senderCompany} onChange={set('senderCompany')} placeholder="e.g. AutomationOwl" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Lbl>What You Offer</Lbl>
                                                    <Input value={form.offering} onChange={set('offering')} placeholder="e.g. AI-powered lead automation" />
                                                </div>
                                                <div>
                                                    <Lbl>Target Industry</Lbl>
                                                    <Input value={form.targetIndustry} onChange={set('targetIndustry')} placeholder="e.g. Web design agencies" />
                                                </div>
                                                <div>
                                                    <Lbl>Unique Advantage</Lbl>
                                                    <Input value={form.uniqueAdvantage} onChange={set('uniqueAdvantage')} placeholder="e.g. Done-for-you, no tech skills needed" />
                                                </div>
                                            </Section>

                                            <Section icon={Sparkles} title="Optional Extras" subtitle="Boost reply rates" iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20">
                                                <div>
                                                    <Lbl optional>Special Offer</Lbl>
                                                    <Input value={form.specialOffer} onChange={set('specialOffer')} placeholder="e.g. Free 7-day trial" />
                                                </div>
                                                <div>
                                                    <Lbl optional>Your Role / Title</Lbl>
                                                    <Input value={form.senderRole} onChange={set('senderRole')} placeholder="e.g. Co-founder" />
                                                </div>
                                                {(form.campaignGoal === 'DRIVE_WEBSITE' || form.campaignGoal === 'FREE_TRIAL') && (
                                                    <div>
                                                        <Lbl>CTA Link</Lbl>
                                                        <Input value={form.ctaLink} onChange={set('ctaLink')} placeholder="https://yoursite.com/trial" type="url" />
                                                    </div>
                                                )}
                                            </Section>
                                        </>
                                    )}

                                    {form.moduleType === 'AI_CALL' && (
                                        <>
                                            <Section icon={Phone} title="Caller Identity" subtitle="The AI will introduce itself using these details" iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Lbl>AI Caller Name</Lbl>
                                                        <Input value={form.callSenderName} onChange={set('callSenderName')} placeholder="e.g. Sarah" />
                                                    </div>
                                                    <div>
                                                        <Lbl>Your Company</Lbl>
                                                        <Input value={form.callSenderCompany} onChange={set('callSenderCompany')} placeholder="e.g. AutomationOwl" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Lbl>What You Pitch</Lbl>
                                                    <Input value={form.callOffering} onChange={set('callOffering')} placeholder="e.g. AI-powered outreach automation" />
                                                </div>
                                                <div>
                                                    <Lbl>Pain Point to Address</Lbl>
                                                    <Input value={form.callPainPoint} onChange={set('callPainPoint')} placeholder="e.g. manual follow-ups wasting too much time" />
                                                </div>
                                            </Section>

                                            <Section icon={Sparkles} title="Optional Extras" subtitle="Boost engagement" iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20">
                                                <div>
                                                    <Lbl optional>Special Offer to Mention</Lbl>
                                                    <Input value={form.callSpecialOffer} onChange={set('callSpecialOffer')} placeholder="e.g. Free 30-day trial, no credit card" />
                                                </div>
                                            </Section>
                                        </>
                                    )}
                                </div>

                                {/* ── COL 2: Campaign Goal (Email) OR Call Goal (AI_CALL) ── */}
                                {form.moduleType === 'EMAIL' && (
                                    <div className="p-6 space-y-6">
                                        <Section icon={Goal} title="Campaign Goal" subtitle="What should each email make them do?" iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20">
                                            <div>
                                                <Lbl>What do you want?</Lbl>
                                                <ChipGrid options={CAMPAIGN_GOALS} value={form.campaignGoal} onChange={pick('campaignGoal')} />
                                            </div>
                                            <div>
                                                <Lbl>Tone of Email</Lbl>
                                                <ChipGrid options={TONES} value={form.tone} onChange={pick('tone')} />
                                            </div>
                                            <div>
                                                <Lbl>Email Length</Lbl>
                                                <ChipGrid options={EMAIL_LENGTHS} value={form.emailLength} onChange={pick('emailLength')} />
                                            </div>
                                        </Section>

                                        {/* Email pipeline preview */}
                                        <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                                            <div className="px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
                                                <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">What happens per lead</p>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                {[
                                                    { emoji: '🔬', label: 'Research Agent', desc: 'Reads their website' },
                                                    { emoji: '✍️', label: 'AI Copywriter', desc: 'Writes a unique email' },
                                                    { emoji: '📧', label: 'Auto Sender', desc: 'Sends & marks Contacted' },
                                                ].map((step, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                                                        <span className="text-lg">{step.emoji}</span>
                                                        <div>
                                                            <p className="text-xs font-bold text-[var(--foreground)]">{step.label}</p>
                                                            <p className="text-[11px] text-[var(--muted)]">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {form.moduleType === 'AI_CALL' && (
                                    <div className="p-6 space-y-6">
                                        <Section icon={Goal} title="Call Goal" subtitle="What should the AI try to achieve on the call?" iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20">
                                            <div>
                                                <Lbl>Primary Goal</Lbl>
                                                <ChipGrid options={CALL_GOALS} value={form.callGoal} onChange={pick('callGoal')} />
                                            </div>
                                        </Section>

                                        {/* Call pipeline preview */}
                                        <div className="rounded-2xl border border-[var(--border)] bg-blue-500/5 overflow-hidden">
                                            <div className="px-5 py-3 bg-blue-500/10 border-b border-blue-500/20">
                                                <p className="text-xs font-black uppercase tracking-widest text-blue-400">What happens per lead</p>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                {[
                                                    { emoji: '🔬', label: 'Research Agent', desc: "Reads the lead's website" },
                                                    { emoji: '🤖', label: 'VAPI AI Agent', desc: 'Calls using personalized script' },
                                                    { emoji: '📝', label: 'Transcript Saved', desc: 'Full call log stored per lead' },
                                                    { emoji: '✅', label: 'CRM Updated', desc: 'Lead marked Contacted automatically' },
                                                ].map((step, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                                                        <span className="text-lg">{step.emoji}</span>
                                                        <div>
                                                            <p className="text-xs font-bold text-[var(--foreground)]">{step.label}</p>
                                                            <p className="text-[11px] text-[var(--muted)]">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25">
                                            <p className="text-xs font-bold text-amber-400 mb-1">⚠️ Leads must have a phone number</p>
                                            <p className="text-[11px] text-[var(--muted)] leading-relaxed">Leads without a phone will be skipped. Make sure your leads have phone numbers in the CRM.</p>
                                        </div>
                                    </div>
                                )}

                                {/* ── COL 3: Lead Picker ── */}
                                <div className="p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Lbl>Select Target Leads</Lbl>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors",
                                            selected.length > 0
                                                ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                                                : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]"
                                        )}>
                                            {selected.length} / {leads.length} selected
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden">
                                        {/* Select all row */}
                                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={leads.length > 0 && selected.length === leads.length}
                                                onChange={() => setSelected(selected.length === leads.length ? [] : leads.map(l => l._id))}
                                                className="accent-orange-500 w-4 h-4"
                                            />
                                            <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
                                                Select all ({leads.length})
                                            </span>
                                        </label>

                                        {/* Lead list */}
                                        <div className="flex-1 overflow-y-auto max-h-[480px]">
                                            {leads.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                                    <Target className="h-8 w-8 text-[var(--muted-subtle)] mb-2" />
                                                    <p className="text-xs text-[var(--muted)] font-bold">No leads found</p>
                                                    <p className="text-[11px] text-[var(--muted-subtle)] mt-0.5">Scrape some leads first</p>
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-1">
                                                    {leads.map(lead => {
                                                        const isSelected = selected.includes(lead._id);
                                                        return (
                                                            <label key={lead._id} className={cn(
                                                                "flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all",
                                                                isSelected
                                                                    ? "bg-orange-500/8 border-orange-500/30"
                                                                    : "border-transparent hover:bg-[var(--surface-hover)]"
                                                            )}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleLead(lead._id)}
                                                                    className="accent-orange-500 w-4 h-4 mt-0.5 shrink-0"
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                                                        <span className="font-bold text-sm text-[var(--foreground)] truncate max-w-[120px]">
                                                                            {lead.companyName || 'Unknown'}
                                                                        </span>
                                                                        {lead.website && (
                                                                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md">AI ✓</span>
                                                                        )}
                                                                        {!lead.email && (
                                                                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md">No Email</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted-subtle)]">
                                                                        {lead.email
                                                                            ? <><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{lead.email}</span></>
                                                                            : lead.phone
                                                                                ? <><Phone className="h-3 w-3 shrink-0" /><span>{lead.phone}</span></>
                                                                                : <span>—</span>
                                                                        }
                                                                    </div>
                                                                    {lead.website && (
                                                                        <div className="flex items-center gap-1 text-[11px] text-[var(--muted-subtle)] mt-0.5">
                                                                            <Globe className="h-3 w-3 shrink-0" />
                                                                            <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={closeCreate}
                                            className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-40"
                                            disabled={selected.length === 0}
                                        >
                                            <Rocket className="h-4 w-4" />
                                            Build Campaign ({selected.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* ── Main content grid (Campaign List + Info Panel) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">

                        {/* Campaign List */}
                        <motion.div variants={itemV} className="glass-strong rounded-[2.5rem] p-8 border border-[var(--border-strong)] flex flex-col flex-grow relative overflow-hidden">
                            <div className="flex items-center justify-between gap-6 mb-8 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Active Campaigns</h2>
                                    <p className="text-sm text-[var(--muted)] mt-1">{total} campaigns</p>
                                </div>
                            </div>

                            <div className="flex-grow relative z-10">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center min-h-[250px] border border-dashed border-[var(--border-strong)] rounded-3xl">
                                        <Loader2 className="h-7 w-7 text-orange-400 animate-spin mb-3" />
                                        <p className="text-sm text-[var(--muted)] animate-pulse">Loading...</p>
                                    </div>
                                ) : campaigns.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center min-h-[250px] rounded-[2rem] border border-dashed border-[var(--border-strong)]">
                                        <div className="h-16 w-16 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-5">
                                            <Rocket className="h-8 w-8 text-[var(--muted-subtle)]" />
                                        </div>
                                        <h3 className="font-bold text-[var(--foreground)] text-lg mb-2">No Campaigns Yet</h3>
                                        <p className="text-sm text-[var(--muted)] max-w-xs">Create your first campaign to start sending AI-personalized emails.</p>
                                        <button onClick={openCreate} className="mt-5 px-5 py-2.5 text-sm font-bold rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 transition-all">
                                            + New Campaign
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-4">
                                        {campaigns.map(c => (
                                            <motion.div key={c._id} variants={itemV}
                                                className="group p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] hover:border-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={cn(
                                                                "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center border",
                                                                c.status === 'RUNNING' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                                                                    c.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                                                        c.status === 'READY' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                                                                            "bg-[var(--surface-hover)] border-[var(--border-strong)] text-[var(--muted-subtle)]"
                                                            )}>
                                                                {c.moduleType === 'EMAIL' ? <Megaphone className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-[var(--foreground)] text-base truncate group-hover:text-orange-400 transition-colors">{c.name}</h3>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border", STATUS_COLORS[c.status])}>{c.status}</span>
                                                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded bg-[var(--background-alt)] border border-[var(--border)] text-[var(--muted)]">{c.moduleType.replace('_', ' ')}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 max-w-sm">
                                                            <div className="flex flex-col bg-[var(--surface-hover)] p-3 rounded-xl border border-[var(--border)] text-center">
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Queue</span>
                                                                <span className="font-extrabold text-sm text-[var(--foreground)]">{c.processedItems}/{c.totalItems}</span>
                                                            </div>
                                                            <div className="flex flex-col bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-center">
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">Sent</span>
                                                                <span className="font-extrabold text-sm text-emerald-400">{c.successCount}</span>
                                                            </div>
                                                            <div className="flex flex-col bg-red-500/5 p-3 rounded-xl border border-red-500/20 text-center">
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-red-400/80 mb-1">Failed</span>
                                                                <span className="font-extrabold text-sm text-red-400">{c.failureCount}</span>
                                                            </div>
                                                        </div>

                                                        {c.totalItems > 0 && (
                                                            <div className="mt-3 max-w-sm bg-[var(--background-alt)] rounded-full h-1.5 overflow-hidden border border-[var(--border)]">
                                                                <div className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-700"
                                                                    style={{ width: `${Math.min((c.processedItems / c.totalItems) * 100, 100)}%` }} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex sm:flex-col gap-2 sm:w-28">
                                                        {c.status === 'DRAFT' && (
                                                            <button onClick={() => handleStart(c._id)}
                                                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-green-500 hover:text-white transition-all">
                                                                <Play className="h-3.5 w-3.5" /> Fire
                                                            </button>
                                                        )}
                                                        <button onClick={() => navigate(`/campaigns/${c._id}`)}
                                                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-xl text-xs font-bold uppercase tracking-wide hover:border-cyan-500/40 hover:text-cyan-400 transition-all text-[var(--foreground)]">
                                                            <Eye className="h-3.5 w-3.5" /> Inspect
                                                        </button>
                                                        <button onClick={() => handleDelete(c._id)}
                                                            className="sm:self-end p-2.5 text-[var(--danger)]/50 hover:text-[var(--danger)] rounded-xl hover:bg-[var(--danger)]/10 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
                                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">Page {page} / {totalPages}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                            className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-bold disabled:opacity-30 hover:border-orange-500/40 transition-all flex items-center gap-1 text-[var(--foreground)]">
                                            <ChevronLeft className="h-3 w-3" /> Prev
                                        </button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                            className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-bold disabled:opacity-30 hover:border-orange-500/40 transition-all flex items-center gap-1 text-[var(--foreground)]">
                                            Next <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Info Panel */}
                    <motion.div variants={itemV} className="hidden xl:flex xl:col-span-4 flex-col gap-5">
                        <div className="bento-card p-8 border border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] hover:border-orange-500/30 transition-colors shadow-lg flex-grow relative overflow-hidden flex flex-col items-center justify-center text-center rounded-[2rem]">
                            <div className="absolute top-0 left-0 w-full h-1/3 bg-orange-500/5 blur-[60px] pointer-events-none" />
                            <div className="h-24 w-24 rounded-3xl bg-[var(--background)] border border-[var(--border)] shadow-xl flex items-center justify-center mb-6 relative z-10 rotate-3 glow-pulse">
                                <Rocket className="h-12 w-12 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight mb-2 relative z-10">AI Personalization</h3>
                            <p className="text-[var(--muted)] text-sm leading-relaxed max-w-[220px] mx-auto relative z-10">
                                Each lead gets a <span className="text-orange-400 font-bold">unique email</span> written by AI after researching their website.
                            </p>
                            <div className="mt-8 w-full space-y-2.5 relative z-10">
                                {[
                                    { emoji: '🔬', label: 'Research Agent', desc: "Reads each lead's website" },
                                    { emoji: '✍️', label: 'AI Copywriter', desc: 'Writes a personalized email' },
                                    { emoji: '📧', label: 'Auto Sender', desc: 'Sends & marks lead Contacted' },
                                ].map(item => (
                                    <div key={item.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 text-left shadow-inner flex items-center gap-3">
                                        <span className="text-lg">{item.emoji}</span>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--foreground)]">{item.label}</p>
                                            <p className="text-[11px] text-[var(--muted)]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-inner relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Total Campaigns</p>
                                <p className="font-extrabold text-3xl text-[var(--foreground)]">{total}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
