import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/v1/auth/reset-password/${token}`, {
                password
            });

            if (response.status === 200) {
                toast.success('Password reset successfully!');
                const responseData = response.data;
                localStorage.setItem('token', responseData.token);
                
                // Allow user a moment to see success toast before redirecting
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error resetting password. The link might be expired.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 px-6 flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-from)]/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                    'relative w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl z-10',
                    'glass-strong border border-[var(--border-strong)]'
                )}
            >
                {/* Accent glow line inside card */}
                <div
                    className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--accent-from), var(--accent-to), transparent)' }}
                />

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] shadow-inner">
                        <Lock className="h-6 w-6 text-[var(--accent-from)]" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
                        Reset Password
                    </h2>
                    <p className="text-sm text-[var(--muted)] px-4">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] p-1">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-subtle)]" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="field w-full rounded-2xl py-3 pl-11 pr-4 text-sm bg-[var(--surface)] border-[var(--border)] focus:ring-[var(--accent-from)] focus:border-[var(--accent-from)]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] p-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-subtle)]" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="field w-full rounded-2xl py-3 pl-11 pr-4 text-sm bg-[var(--surface)] border-[var(--border)] focus:ring-[var(--accent-from)] focus:border-[var(--accent-from)]"
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="gradient-btn w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold mt-6 shadow-lg shadow-[var(--accent-from)]/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Resetting...
                            </>
                        ) : 'Change Password'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
