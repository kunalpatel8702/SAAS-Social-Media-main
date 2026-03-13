import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Search, Trash2, Edit3, Building, Mail, Phone, Globe, ChevronLeft, ChevronRight, Activity, Users, Target, Database, X, Save, Facebook, Linkedin, Instagram } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
    NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CONTACTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    QUALIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    NOT_INTERESTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    BOOKED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'NOT_INTERESTED', 'BOOKED'];

const EMPTY_FORM = { companyName: '', contactName: '', phone: '', email: '', website: '', facebook: '', linkedin: '', instagram: '', source: 'MANUAL' };

const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemV = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function LeadsDashboard() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Add form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // Edit modal state
    const [editLead, setEditLead] = useState(null); // null = closed, object = open
    const [editFormData, setEditFormData] = useState(EMPTY_FORM);
    const [editLoading, setEditLoading] = useState(false);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (statusFilter) params.status = statusFilter;
            const { data } = await axios.get(`${API_URL}/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setLeads(data.data.data);
            setTotal(data.data.total);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            toast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, token]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    // ── Create Lead ──────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/v1/leads`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            setShowAddForm(false);
            setFormData(EMPTY_FORM);
            toast.success('Lead acquired.');
            fetchLeads();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create lead');
        }
    };

    // ── Open Edit Modal ──────────────────────────────
    const openEdit = (lead) => {
        setEditLead(lead);
        setEditFormData({
            companyName: lead.companyName || '',
            contactName: lead.contactName || '',
            phone: lead.phone || '',
            email: lead.email || '',
            website: lead.website || '',
            linkedin: lead.linkedin || '',
            facebook: lead.facebook || '',
            instagram: lead.instagram || '',
            source: lead.source || 'MANUAL',
        });
    };

    // ── Save Edit ─────────────────────────────────────
    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editLead) return;
        setEditLoading(true);
        try {
            await axios.put(`${API_URL}/v1/leads/${editLead._id}`, editFormData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            toast.success('Lead updated.');
            setEditLead(null);
            fetchLeads();
        } catch (err) {
            // Fallback: try PATCH if PUT is not available
            try {
                await axios.patch(`${API_URL}/v1/leads/${editLead._id}`, editFormData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                toast.success('Lead updated.');
                setEditLead(null);
                fetchLeads();
            } catch (err2) {
                toast.error(err2.response?.data?.message || 'Failed to update lead');
            }
        } finally {
            setEditLoading(false);
        }
    };

    // ── Update Status ─────────────────────────────────
    const handleStatusUpdate = async (id, newStatus) => {
        // Optimistic UI update
        setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
        try {
            await axios.patch(`${API_URL}/v1/leads/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            // Re-fetch to keep in sync (important when a status filter is active)
            fetchLeads();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
            fetchLeads(); // revert on error
        }
    };

    // ── Delete Lead ───────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm('Delete this lead?')) return;
        try {
            await axios.delete(`${API_URL}/v1/leads/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Lead deleted');
            fetchLeads();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const totalPages = Math.ceil(total / 12);

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-10">
            <motion.div initial="hidden" animate="show" variants={containerV} className="mx-auto max-w-[1400px]">

                {/* Header */}
                <motion.header variants={itemV} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                            <Target className="h-4 w-4 text-cyan-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Prospect Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
                            Lead <span className="gradient-text bg-gradient-to-r from-cyan-400 to-blue-500">Database</span>
                        </h1>
                        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed font-light">
                            Assimilated targets, neural network scoring, and conversion trajectories for your outreach grid.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="gradient-btn px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 w-full md:w-auto text-white"
                        >
                            <Plus className="h-5 w-5" />
                            Assimilate Target
                        </motion.button>
                    </div>
                </motion.header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left Column */}
                    <motion.div variants={itemV} className="xl:col-span-9 flex flex-col gap-6 lg:gap-8">

                        <AnimatePresence>
                            {showAddForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.98 }}
                                    onSubmit={handleCreate}
                                    className="p-8 bg-[var(--surface-elevated)] backdrop-blur-sm border border-[var(--border-strong)] rounded-[2.5rem] shadow-xl overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 tracking-tight flex items-center gap-3">
                                        <Database className="h-6 w-6 text-cyan-400" />
                                        Manual Assimilation
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                                        {['companyName', 'contactName', 'phone', 'email', 'website', 'linkedin', 'facebook', 'instagram'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">
                                                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                                </label>
                                                <input
                                                    placeholder={`Enter ${field}...`}
                                                    value={formData[field]}
                                                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                                    className="w-full px-5 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-subtle)] focus:outline-none focus:border-cyan-500/50 shadow-inner transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Source</label>
                                            <select
                                                value={formData.source}
                                                onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                                                className="w-full px-5 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-cyan-500/50 shadow-inner appearance-none"
                                            >
                                                <option value="MANUAL">Manual Entry</option>
                                                <option value="IMPORT">Data Import</option>
                                                <option value="SCRAPER">Neural Scraper</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-8 pt-6 border-t border-[var(--border)] relative z-10">
                                        <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
                                            Commit to Database
                                        </button>
                                        <button type="button" onClick={() => setShowAddForm(false)} className="ghost-btn px-8 py-3.5 rounded-xl font-bold">
                                            Abort
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Database Table */}
                        <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-[var(--border-strong)] flex flex-col flex-grow relative overflow-hidden min-h-[600px]">
                            <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] opacity-40 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                            {/* Filters Row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Active Targets</h2>
                                    <p className="text-sm text-[var(--muted)] mt-1 font-medium">{total} entities identified</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => { setStatusFilter(''); setPage(1); }}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                                            !statusFilter
                                                ? "bg-[var(--surface-hover)] border-[var(--border-strong)] text-[var(--foreground)] shadow-sm"
                                                : "bg-transparent border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]"
                                        )}
                                    >
                                        All Classes
                                    </button>
                                    {STATUSES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setStatusFilter(s); setPage(1); }}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                                                statusFilter === s
                                                    ? STATUS_COLORS[s]
                                                    : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--muted-subtle)] hover:border-[var(--border-strong)]"
                                            )}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lead Rows */}
                            <div className="flex-grow relative z-10 flex flex-col">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--surface)]/50">
                                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
                                        <p className="text-[var(--muted)] text-sm font-medium tracking-wide uppercase animate-pulse">Querying Neural Grid...</p>
                                    </div>
                                ) : leads.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center py-24 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface)] to-transparent h-full">
                                        <div className="h-20 w-20 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-6">
                                            <Search className="h-10 w-10 text-[var(--muted-subtle)]" />
                                        </div>
                                        <h3 className="text-[var(--foreground)] text-xl font-bold mb-3 tracking-tight">Grid is empty</h3>
                                        <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto text-sm leading-relaxed">No targets matching these parameters. Assimilate new entities or deploy the scraper.</p>
                                    </div>
                                ) : (
                                    <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-3">
                                        {/* Column Headers */}
                                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-subtle)] border-b border-[var(--border)] bg-[var(--surface-hover)] rounded-2xl">
                                            <div className="col-span-3">Entity Identity</div>
                                            <div className="col-span-3">Comms Link</div>
                                            <div className="col-span-2">Vector</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-2 text-right">Actions</div>
                                        </div>

                                        {leads.map(lead => (
                                            <motion.div
                                                variants={itemV}
                                                key={lead._id}
                                                className="group flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 hover:border-cyan-500/40 transition-all shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-[var(--surface-elevated)]"
                                            >
                                                {/* Entity (col-span-3) */}
                                                <div className="lg:col-span-3 flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--background-alt)] border border-[var(--border)] flex items-center justify-center">
                                                        {lead.companyName ? <Building className="h-4 w-4 text-[var(--foreground)]" /> : <UserIcon className="h-4 w-4 text-[var(--muted)]" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[var(--foreground)] text-sm truncate group-hover:text-cyan-400 transition-colors">
                                                            {lead.companyName || 'Unknown Entity'}
                                                        </p>
                                                        <p className="text-[12px] text-[var(--muted)] truncate">
                                                            {lead.contactName || 'Unidentified'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Comms (col-span-3) */}
                                                <div className="lg:col-span-3 flex flex-col gap-1">
                                                    {lead.email && (
                                                        <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                                                            <Mail className="h-3 w-3 shrink-0 text-cyan-400/70" />
                                                            <span className="truncate">{lead.email}</span>
                                                        </div>
                                                    )}
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                                                            <Phone className="h-3 w-3 shrink-0 text-cyan-400/70" />
                                                            <span className="truncate">{lead.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        {lead.website && (
                                                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors text-[var(--muted)]" title={lead.website}>
                                                                <Globe className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {lead.linkedin && (
                                                            <a href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-[#0077b5]/10 border border-[#0077b5]/20 flex items-center justify-center hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 text-[#0077b5] transition-colors" title={lead.linkedin}>
                                                                <Linkedin className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {lead.facebook && (
                                                            <a href={lead.facebook.startsWith('http') ? lead.facebook : `https://${lead.facebook}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 text-[#1877F2] transition-colors" title={lead.facebook}>
                                                                <Facebook className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {lead.instagram && (
                                                            <a href={lead.instagram.startsWith('http') ? lead.instagram : `https://${lead.instagram}`} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center hover:bg-[#E1306C]/20 hover:border-[#E1306C]/40 text-[#E1306C] transition-colors" title={lead.instagram}>
                                                                <Instagram className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    {!lead.email && !lead.phone && !lead.website && !lead.linkedin && !lead.facebook && !lead.instagram && (
                                                        <span className="text-[10px] uppercase font-bold text-[var(--muted-subtle)] border border-[var(--border)] px-2 py-0.5 rounded w-fit">No Comms</span>
                                                    )}
                                                </div>

                                                {/* Vector (col-span-2) */}
                                                <div className="lg:col-span-2 flex items-center">
                                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]">
                                                        {lead.source}
                                                    </span>
                                                </div>

                                                {/* Status dropdown (col-span-2) */}
                                                <div className="lg:col-span-2 flex items-center">
                                                    <select
                                                        value={lead.status}
                                                        onChange={e => handleStatusUpdate(lead._id, e.target.value)}
                                                        className={cn(
                                                            "w-full max-w-[130px] px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none transition-all",
                                                            STATUS_COLORS[lead.status] || 'bg-[var(--surface-hover)] text-[var(--foreground)] border-[var(--border)]'
                                                        )}
                                                    >
                                                        {STATUSES.map(s => (
                                                            <option key={s} value={s} className="bg-[var(--background-alt)] text-[var(--foreground)] font-medium">
                                                                {s.replace('_', ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Actions (col-span-2) — wider to prevent collision */}
                                                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(lead)}
                                                        className="h-8 w-8 shrink-0 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--muted)] hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors border border-[var(--border)] shadow-sm"
                                                        title="Edit Lead"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead._id)}
                                                        className="h-8 w-8 shrink-0 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--danger)]/60 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors border border-[var(--border)] shadow-sm"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--border)] z-10">
                                    <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">
                                        Page {page} / {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:border-cyan-500/40 transition-all flex items-center gap-1 text-[var(--foreground)]"
                                        >
                                            <ChevronLeft className="h-3 w-3" /> Prev
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-30 hover:border-cyan-500/40 transition-all flex items-center gap-1 text-[var(--foreground)]"
                                        >
                                            Next <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Stats Panel */}
                    <div className="xl:col-span-3 flex flex-col gap-6 lg:gap-8">
                        <motion.div variants={itemV} className="bento-card p-8 flex flex-col gap-6 relative overflow-hidden bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] shadow-sm border border-[var(--border)] hover:border-[var(--border-strong)] min-h-[200px]">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[60px] opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-12 w-12 rounded-xl bg-[var(--background)] border border-[var(--border)] shadow-inner flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1">Total Payload</p>
                                    <h3 className="text-3xl font-black tracking-tighter text-[var(--foreground)]">{total}</h3>
                                </div>
                            </div>
                            <div className="mt-2 space-y-3 relative z-10 border-t border-[var(--border)] pt-5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--muted)] font-medium">Qualified</span>
                                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{leads.filter(l => l.status === 'QUALIFIED').length} / pg</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--muted)] font-medium">New Inputs</span>
                                    <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{leads.filter(l => l.status === 'NEW').length} / pg</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--muted)] font-medium">Contacted</span>
                                    <span className="font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">{leads.filter(l => l.status === 'CONTACTED').length} / pg</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* ── Edit Lead Modal ── */}
            <AnimatePresence>
                {editLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setEditLead(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <Edit3 className="h-5 w-5 text-cyan-400" />
                                    <h2 className="text-xl font-bold text-[var(--foreground)]">Edit Lead</h2>
                                </div>
                                <button
                                    onClick={() => setEditLead(null)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleEditSave} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {[
                                        { key: 'companyName', label: 'Company Name' },
                                        { key: 'contactName', label: 'Contact Name' },
                                        { key: 'phone', label: 'Phone' },
                                        { key: 'email', label: 'Email' },
                                        { key: 'website', label: 'Website' },
                                        { key: 'linkedin', label: 'LinkedIn' },
                                        { key: 'facebook', label: 'Facebook' },
                                        { key: 'instagram', label: 'Instagram' },
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">{label}</label>
                                            <input
                                                value={editFormData[key]}
                                                onChange={e => setEditFormData(p => ({ ...p, [key]: e.target.value }))}
                                                placeholder={`Enter ${label}...`}
                                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-subtle)] focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Source</label>
                                        <select
                                            value={editFormData.source}
                                            onChange={e => setEditFormData(p => ({ ...p, source: e.target.value }))}
                                            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-cyan-500/50 appearance-none"
                                        >
                                            <option value="MANUAL">Manual Entry</option>
                                            <option value="IMPORT">Data Import</option>
                                            <option value="SCRAPER">Neural Scraper</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8 pt-6 border-t border-[var(--border)]">
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                                    >
                                        {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditLead(null)}
                                        className="ghost-btn px-6 py-3 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function UserIcon(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
