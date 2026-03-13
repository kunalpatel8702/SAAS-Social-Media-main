import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Volume2, VolumeX } from 'lucide-react'

// Animation variants for smooth entrance
const containerV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
}

const itemV = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)

  return (
    <section id="top" className="relative h-screen min-h-[700px] w-full overflow-hidden flex items-center">

      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/glf1.mp4" type="video/mp4" />
        </video>
        {/* Overlays for depth and readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Sound Toggle Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-10 right-10 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white/60 hover:text-white hover:bg-black/40 transition-all duration-300 shadow-2xl"
        title={isMuted ? "Enable Sound" : "Disable Sound"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
        <motion.div
          variants={containerV}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemV} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Empowering the Future
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemV}
            className="mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Enterprise AI.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Automated execution.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemV}
            className="mt-8 max-w-xl text-lg leading-relaxed text-gray-200/90 md:text-xl"
          >
            We build agents and automation systems that run critical workflows end to end.
            Designed for reliability, control, and measurable outcomes for the modern enterprise.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemV} className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#contact" className="gradient-btn inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-4 text-base font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
              Talk to Engineering
              <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#solutions" className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-10 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/40">
              View Capabilities
            </a>
          </motion.div>

          {/* Trust indicators / bottom row info */}
          <motion.div variants={itemV} className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">24/7</span>
              <span className="text-xs uppercase tracking-widest text-gray-400">Availability</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-xs uppercase tracking-widest text-gray-400">Scalable</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">SOC2</span>
              <span className="text-xs uppercase tracking-widest text-gray-400">Compliant</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  )
}

