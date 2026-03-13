import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: 'Control',
    subtitle: 'Policy Gates',
    description: 'Advanced approvals and automated policy enforcement for every action.',
    icon: '🛡️',
    color: 'purple'
  },
  {
    title: 'Reliability',
    subtitle: 'Self-Healing',
    description: 'Smart retries and fallback mechanisms that ensure 99.9% workflow success.',
    icon: '🔄',
    color: 'blue'
  },
  {
    title: 'Visibility',
    subtitle: 'Deep Tracing',
    description: 'Full audit logs and real-time metrics for every step in your pipeline.',
    icon: '👁️',
    color: 'cyan'
  }
];

function Node({ label, tone, icon }) {
  const toneClass =
    tone === 'primary'
      ? 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-200 shadow-sm'
      : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 text-[var(--foreground)]/80 shadow-sm'

  return (
    <div className={`relative group flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] ${toneClass}`}>
      <span className="text-lg">{icon}</span>
      {label}
      {tone === 'primary' && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/50 to-blue-500/50 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      )}
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center">
      {/* Vertical Arrow (Mobile only) */}
      <div className="flex flex-col items-center py-2 md:hidden">
        <div className="w-px h-8 bg-gradient-to-b from-purple-500/40 via-blue-500/40 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse -mt-1" />
      </div>

      {/* Horizontal Arrow (Desktop only) */}
      <div className="hidden items-center justify-center md:flex">
        <div className="group flex items-center">
          <div className="h-px w-6 lg:w-10 bg-gradient-to-r from-purple-500/40 to-blue-500/40" />
          <div className="w-1 h-1 rounded-full bg-blue-500/80 -ml-1 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ feature, className = "" }) {
  const colorClasses = {
    purple: 'hover:border-purple-500/30 bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400/80',
    blue: 'hover:border-blue-500/30 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400/80',
    cyan: 'hover:border-cyan-500/30 bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400/80'
  };

  return (
    <div className={`showcase-card group rounded-3xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] p-8 transition-all duration-500 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-none ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform ${colorClasses[feature.color].split(' ').slice(1, 3).join(' ')}`}>
        {feature.icon}
      </div>
      <div className={`text-xs font-black uppercase tracking-widest mb-2 ${colorClasses[feature.color].split(' ').slice(-1)}`}>
        {feature.title}
      </div>
      <div className="text-lg font-bold text-[var(--foreground)] mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{feature.subtitle}</div>
      <p className="text-sm text-[var(--foreground)]/60 dark:text-[var(--foreground)]/50 leading-relaxed font-medium">{feature.description}</p>
    </div>
  );
}

export default function Showcase() {
  const sectionRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Small reveal animation for cards on desktop
      gsap.from('.showcase-card-desktop', {
        scrollTrigger: {
          trigger: '.showcase-card-container',
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    });
    return () => ctx.revert();
  }, []);

  // Auto-slide logic for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-white/50 dark:bg-transparent" aria-label="Automation showcase">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/[0.08] dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/[0.08] dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="relative rounded-[2.5rem] border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] p-8 backdrop-blur-3xl md:p-16 overflow-hidden shadow-2xl shadow-black/[0.03] dark:shadow-none">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Automation showcase
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)] mb-6 leading-[1.1]">
              Connected systems, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:to-blue-400">
                operated as one.
              </span>
            </h2>

            <p className="max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/60 mb-12 font-medium">
              We connect people, agents, and workflows into a single operating path.
              <span className="block mt-2 text-[var(--foreground)]/40 text-base">Every step is logged. Every handoff is explicit. Every outcome is visible.</span>
            </p>

            <div className="mt-12 flex flex-col items-center md:flex-row md:justify-between md:items-center gap-0">
              <Node label="User" icon="👤" />
              <Arrow />
              <Node label="AI Agent" tone="primary" icon="🤖" />
              <Arrow />
              <Node label="Flows" tone="primary" icon="⚡" />
              <Arrow />
              <Node label="CRM" icon="📊" />
              <Arrow />
              <Node label="Email" icon="📧" />
              <Arrow />
              <Node label="Dashboard" icon="📈" />
            </div>

            <div className="flex flex-col items-center mt-8">
              <div className="w-px h-16 bg-gradient-to-b from-purple-500/40 via-blue-500/40 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-blue-500/40 -mt-1 blur-[2px]" />
            </div>

            {/* Desktop Grid */}
            <div className="showcase-card-container hidden md:grid mt-8 gap-6 md:grid-cols-3">
              {FEATURES.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} className="showcase-card-desktop" />
              ))}
            </div>

            {/* Mobile Auto-sliding Carousel */}
            <div className="md:hidden mt-8 relative">
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {FEATURES.map((feature, idx) => (
                    <div key={idx} className="w-full flex-shrink-0">
                      <FeatureCard feature={feature} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {FEATURES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1 transition-all duration-300 rounded-full ${activeSlide === idx ? 'w-8 bg-purple-500' : 'w-2 bg-white/20'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
