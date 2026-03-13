import { motion } from 'framer-motion'
import { Users, Layers, Shield, Zap } from 'lucide-react'

export default function WorkspaceSection() {
    return (
        <section className="relative overflow-hidden py-32 bg-[var(--background)] transition-colors duration-300">
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="mx-auto max-w-[1400px] px-6">
                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">

                    {/* Left Content */}
                    <div className="lg:col-span-12 xl:col-span-5 order-2 xl:order-1">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="max-w-xl mx-auto xl:mx-0"
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] leading-[1.15] mb-10">
                                Multiple workspaces.
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                                    One team with different AI agents as employees.
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-16">
                                {/* Feature 1 */}
                                <div className="space-y-5 group">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300 shadow-sm">
                                        <Layers className="text-indigo-600 dark:text-indigo-400" size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)]">Up to 5 profiles</h3>
                                    <p className="text-base leading-relaxed text-[var(--muted)] font-light">
                                        Create up to 5 business profiles, each customized to your unique needs and powered by AI employees ready to deliver results.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div className="space-y-5 group">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-sm">
                                        <Users className="text-purple-600 dark:text-purple-400" size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)]">Share with the team</h3>
                                    <p className="text-base leading-relaxed text-[var(--muted)] font-light">
                                        Collaborate in real-time. Share your workspace to make business insights securely accessible to everyone involved.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Image (Laptop Mockup) */}
                    <div className="lg:col-span-12 xl:col-span-7 order-1 xl:order-2 flex justify-center xl:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 30 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.9, type: 'spring', stiffness: 100, damping: 20 }}
                            className="relative w-full max-w-[800px]"
                        >
                            {/* Floating Element Accents */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] -z-10 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen" />

                            <img
                                src="/contantimg.png"
                                alt="AI Platform Workflow"
                                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_60px_rgba(255,255,255,0.05)] hover:-translate-y-2 transition-transform duration-700"
                            />

                            {/* Decorative Indicators */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-[15%] right-[5%] p-4 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 hidden md:flex shadow-xl"
                            >
                                <Zap className="text-amber-500 dark:text-yellow-400" size={24} />
                            </motion.div>
                            
                            <motion.div 
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute bottom-[20%] left-[5%] p-4 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 hidden md:flex shadow-xl"
                            >
                                <Shield className="text-indigo-600 dark:text-indigo-400" size={24} />
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}
