import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Construction, ArrowLeft } from 'lucide-react';
import SocialMediaSuiteDashboard from './SocialMediaSuiteDashboard';
import LeadGenSuiteDashboard from './LeadGenSuiteDashboard';
import InstagramServiceManager from '../SocialMedia/InstagramServiceManager';
import FacebookManager from '../SocialMedia/FacebookManager';
import LinkedinManager from '../SocialMedia/LinkedinManager';
import TwitterManager from '../SocialMedia/TwitterManager';
import AiImageGenerator from '../SocialMedia/AiImageGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ServiceManager() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchServiceDetails();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            // We fetch the subscription/service details
            const res = await axios.get(`${API_URL}/v1/automation/my/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const subscription = res.data.data.subscriptions.find(sub => sub.service?._id === id);

            if (!subscription) {
                // If not found in subscriptions, maybe it's just a service ID
                // we should check if they are subscribed
                // For now, let's assume they are if they got here
                setService({ _id: id, name: 'Service' });
            } else {
                setService(subscription.service);
            }
        } catch (err) {
            console.error('Error fetching service:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] pt-32 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[var(--accent-from)] animate-spin" />
            </div>
        );
    }

    // Filter which manager to show based on service name or ID
    // You can also use a "slug" field from your database if you have one
    const serviceName = service?.name?.toLowerCase() || '';
    // Priority 1: Full Suites
    if (serviceName.includes('social media')) {
        return <SocialMediaSuiteDashboard service={service} />;
    }

    if (serviceName.includes('lead generation') || serviceName.includes('lead') || serviceName.includes('extraction')) {
        return <LeadGenSuiteDashboard service={service} />;
    }

    // Priority 2: Individual Legacy Managers (if name matches specifically)
    if (serviceName.includes('insta')) {
        return <InstagramServiceManager service={service} />;
    }

    if (serviceName.includes('face') || serviceName.includes('fb')) {
        return <FacebookManager service={service} />;
    }

    if (serviceName.includes('link') || serviceName.includes('linkedin')) {
        return <LinkedinManager service={service} />;
    }

    if (serviceName.includes('twitter') || serviceName.includes('tweet') || (serviceName === 'x')) {
        return <TwitterManager service={service} />;
    }

    if (serviceName.includes('image') || serviceName.includes('caption') || serviceName.includes('generat')) {
        return <AiImageGenerator service={service} />;
    }

    // Default Fallback
    return (
        <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="glass-strong rounded-[2.5rem] p-10 md:p-14 max-w-xl mx-auto flex flex-col items-center shadow-lg"
            >
                <div className="h-20 w-20 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-inner">
                    <Construction className="h-10 w-10 text-[var(--warning)]" />
                </div>

                <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight">
                    {service?.name || 'Automation Service'}
                </h1>

                <p className="text-[var(--muted)] text-base md:text-lg mb-10 leading-relaxed max-w-sm">
                    We are currently building the dedicated operations panel for this automation flow.
                    Please check back soon.
                </p>

                <button
                    onClick={() => navigate('/my-services')}
                    className="ghost-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Services
                </button>
            </motion.div>
        </div>
    );
}
