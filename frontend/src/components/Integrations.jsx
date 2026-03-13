import { motion } from 'framer-motion'
import {
    Facebook,
    Instagram,
    Mail,
    Calendar,
    Linkedin,
    MessageSquare,
    Chrome,
    Layout
} from 'lucide-react'

const tools = [
    { icon: <Facebook className="w-6 h-6 text-[#1877F2]" />, name: 'Facebook' },
    { icon: <Instagram className="w-6 h-6 text-[#E4405F]" />, name: 'Instagram' },
    { icon: <Mail className="w-6 h-6 text-[#EA4335]" />, name: 'Gmail' },
    { icon: <Calendar className="w-6 h-6 text-[#4285F4]" />, name: 'Calendar' },
    { icon: <Linkedin className="w-6 h-6 text-[#0A66C2]" />, name: 'LinkedIn' },
    { icon: <MessageSquare className="w-6 h-6 text-[#0088CC]" />, name: 'Telegram' },
    { icon: <Chrome className="w-6 h-6 text-[#4285F4]" />, name: 'Browser' },
    { icon: <Layout className="w-6 h-6 text-[#FF3366]" />, name: 'Notion' },
]

export default function Integrations() {
    return (
        <section id="integrations" className="py-24 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] -z-10" />

            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                                Integrates with your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                                    favorite tools.
                                </span>
                            </h2>
                            <p className="text-lg leading-relaxed text-[var(--foreground)]/70 max-w-xl">
                                Your AI employees don’t live in a silo. They work directly inside the tools your business already relies on - from email and calendars to social platforms, CRMs, to personal apps.
                            </p>
                            <p className="text-lg leading-relaxed text-[var(--foreground)]/70 max-w-xl">
                                By connecting your existing stack, AutomationOwl gives your digital staff the context they need to follow your workflows, act at the right moment, and keep work moving without manual handoffs. No new processes to learn. No disruption. Just smarter execution across your tools.
                            </p>
                        </div>

                        {/* Icons Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 max-w-md pt-4">
                            {tools.map((tool, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.1, translateY: -5 }}
                                    className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-purple-500/50 transition-colors shadow-lg shadow-black/5"
                                    title={tool.name}
                                >
                                    {tool.icon}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side: Mobile Preview Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        <div className="relative group">
                            <img
                                src="/mobile.png"
                                alt="Mobile App Preview"
                                className="relative w-full max-w-[550px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_50px_rgba(34,211,238,0.1)] transition-transform hover:scale-[1.02] duration-500"
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
