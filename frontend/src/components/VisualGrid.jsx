export default function VisualGrid() {
    const imagesA = [
        { src: '/a (1).jpg', title: 'Intelligent Analysis', category: 'Analytics' },
        { src: '/a (2).jpg', title: 'Automated Workflows', category: 'Automation' },
        { src: '/a (3).jpg', title: 'Custom AI Agents', category: 'AI' }
    ];

    const imagesB = [
        { src: '/b (1).jpg', title: 'Data Orchestration', category: 'Infrastructure' },
        { src: '/b (2).jpg', title: 'Real-time Monitoring', category: 'Control' },
        { src: '/b (3).jpg', title: 'Seamless Integration', category: 'Connectivity' }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px] -z-10" />

            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                        Witness the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Future of Automation</span>
                    </h2>
                    <p className="text-[var(--foreground)]/60 max-w-2xl mx-auto text-lg">
                        Our platform combines cutting-edge AI with deterministic execution to deliver results that matter.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...imagesA, ...imagesB].map((img, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 aspect-[4/5] hover:border-white/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                        >
                            <img
                                src={img.src}
                                alt={img.title}
                                className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                                    {img.category}
                                </span>
                                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                    {img.title}
                                </h3>
                                <div className="h-1 w-0 bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500 group-hover:w-24 mt-4" />
                            </div>

                            {/* Glassmorphism Effect on Hover */}
                            <div className="absolute top-4 right-4 h-12 w-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
