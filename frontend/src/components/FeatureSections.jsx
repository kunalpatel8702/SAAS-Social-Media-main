import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
    {
        title: 'Intelligent Analysis',
        subtitle: 'Extracting Value from Chaos',
        desc: 'Our advanced neural networks process unstructured data in real-time, identifying patterns that human analysts might miss. We turn raw information into actionable strategic assets.',
        image: '/a (1).jpg',
        category: 'Analytics',
        color: 'from-purple-500/20'
    },
    {
        title: 'Automated Workflows',
        subtitle: 'Precision Execution',
        desc: 'Deterministic orchestration for complex cross-system processes. We build workflows that handle exceptions gracefully, ensuring that your business never skips a beat.',
        image: '/a (2).jpg',
        category: 'Automation',
        color: 'from-cyan-500/20'
    },
    {
        title: 'Custom AI Agents',
        subtitle: 'Your Digital Workforce',
        desc: 'Role-based agents designed for production, not just demos. These agents operate within strict ethical and operational boundaries to achieve specific business outcomes.',
        image: '/a (3).jpg',
        category: 'AI',
        color: 'from-purple-500/20'
    },
    {
        title: 'Data Orchestration',
        subtitle: 'System Harmony',
        desc: 'Bridges the gap between legacy systems and modern AI. We move, normalize, and enrich data across your entire stack with full traceability and audit logs.',
        image: '/b (1).jpg',
        category: 'Infrastructure',
        color: 'from-cyan-500/20'
    }
]

export default function FeatureSections() {
    const containerRef = useRef(null)

    useEffect(() => {
        const sections = containerRef.current.querySelectorAll('.feature-section')

        sections.forEach((section, index) => {
            const isEven = index % 2 === 0
            const content = section.querySelector('.feature-content')
            const image = section.querySelector('.feature-image')
            const icon = section.querySelector('.feature-icon')

            // Content animation
            gsap.fromTo(content,
                {
                    x: isEven ? -100 : 100,
                    opacity: 0
                },
                {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        end: 'top 20%',
                        scrub: 1,
                    },
                    x: 0,
                    opacity: 1,
                    ease: 'power2.out'
                }
            )

            // Image animation
            gsap.fromTo(image,
                {
                    scale: 0.8,
                    opacity: 0,
                    rotate: isEven ? 5 : -5
                },
                {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 70%',
                        end: 'top 30%',
                        scrub: 1,
                    },
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                    ease: 'power2.out'
                }
            )

            // Icon animation
            if (icon) {
                gsap.to(icon, {
                    y: -20,
                    repeat: -1,
                    yoyo: true,
                    duration: 2,
                    ease: "power1.inOut"
                })
            }
        })
    }, [])

    return (
        <div ref={containerRef} className="space-y-32 py-20 overflow-hidden">
            {features.map((f, idx) => {
                const isEven = idx % 2 === 0
                return (
                    <section key={idx} className="feature-section relative px-6 md:px-12">
                        <div className={`mx-auto max-w-7xl grid gap-12 lg:grid-cols-2 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>

                            {/* Image Side */}
                            <div className={`feature-image relative group ${isEven ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}`}>
                                <div className={`absolute -inset-4 bg-gradient-to-br ${f.color} to-transparent rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-700`} />
                                <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] border border-white/10 bg-white/5">
                                    <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                {/* Floating Icon/Tag */}
                                <div className="feature-icon absolute -top-6 -right-6 h-16 w-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl z-20">
                                    <span className="text-2xl">
                                        {idx === 0 && '📊'}
                                        {idx === 1 && '⚙️'}
                                        {idx === 2 && '🤖'}
                                        {idx === 3 && '🌐'}
                                    </span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className={`feature-content space-y-6 ${isEven ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}>
                                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    {f.category}
                                </div>

                                <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] leading-tight">
                                    {f.title} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                                        {f.subtitle}
                                    </span>
                                </h2>

                                <p className="text-lg text-[var(--foreground)]/70 leading-relaxed max-w-xl">
                                    {f.desc}
                                </p>

                                <div className="pt-4 flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-[var(--foreground)]">99.9%</span>
                                        <span className="text-xs text-[var(--foreground)]/40 uppercase tracking-tighter">Accuracy</span>
                                    </div>
                                    <div className="h-10 w-px bg-white/10 mt-2" />
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-[var(--foreground)]">24/7</span>
                                        <span className="text-xs text-[var(--foreground)]/40 uppercase tracking-tighter">Monitoring</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                )
            })}
        </div>
    )
}
