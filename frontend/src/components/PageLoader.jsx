import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Sparkles } from 'lucide-react';

const PageLoader = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090b]/80 backdrop-blur-xl"
        >
            <div className="relative">
                {/* Outer Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
                />

                {/* Neural Network Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="relative w-32 h-32 flex items-center justify-center"
                >
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-indigo-500 rounded-full"
                            style={{
                                transform: `rotate(${i * 45}deg) translateY(-50px)`,
                                boxShadow: '0 0 15px #6366f1',
                            }}
                        />
                    ))}

                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="none"
                            stroke="rgba(99, 102, 241, 0.1)"
                            strokeWidth="1"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            strokeDasharray="100 200"
                            animate={{
                                strokeDashoffset: [0, -300],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>

                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl animate-neural-pulse"
                    >
                        <Cpu className="w-10 h-10 text-indigo-400" />
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="w-5 h-5 text-violet-400" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Loading Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium tracking-[0.2em] uppercase text-indigo-300/80">
                            Initializing AI
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PageLoader;
