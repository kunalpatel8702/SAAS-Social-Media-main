import { Search, Code2, Cpu, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Discover',
    desc: 'Map processes, systems, constraints, and failure modes. Define the automation surface with clear ownership.',
    icon: Search,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    title: 'Architect',
    desc: 'Design contracts, data flow, controls, and observability. Decide where agents belong and where deterministic logic must hold.',
    icon: Code2,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Automate',
    desc: 'Build n8n workflows, integrations, and agent services. Add safeguards, retries, approvals, and metrics.',
    icon: Cpu,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    title: 'Deploy & Optimize',
    desc: 'Ship with runbooks and monitoring. Iterate on throughput, accuracy, and cost with measured changes.',
    icon: Rocket,
    color: 'from-emerald-500 to-teal-500'
  },
]

export default function Process() {
  return (
    <section id="process" className="py-24 relative overflow-hidden" aria-label="Process">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-start">

          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Our Methodology
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] leading-tight mb-8">
              A delivery model <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                designed for production.
              </span>
            </h2>
            <p className="text-lg text-[var(--foreground)]/60 leading-relaxed max-w-md">
              We don't just build scripts; we engineer robust, scalable systems that power your business workflows with deterministic precision.
            </p>
          </div>

          <div className="lg:w-2/3 grid gap-6 md:grid-cols-2">
            {steps.map((s, idx) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2"
              >
                {/* Number Badge */}
                <div className="absolute top-8 right-8 text-4xl font-black text-white/[0.03] select-none group-hover:text-white/[0.05] transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} p-0.5`}>
                  <div className="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-[#0A0A0B]">
                    <s.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                  {s.title}
                </h3>
                <p className="text-[var(--foreground)]/70 leading-relaxed">
                  {s.desc}
                </p>

                {/* Hover Glow */}
                <div className={`absolute -inset-px rounded-[2rem] bg-gradient-to-br ${s.color} opacity-0 blur-xl group-hover:opacity-10 transition-opacity -z-10`} />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

