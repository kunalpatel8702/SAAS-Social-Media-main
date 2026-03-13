const services = [
  {
    title: 'AI Agents',
    desc: 'Role-based agents that execute tasks with defined inputs, constraints, and auditability. Built for operational use, not demos.',
  },
  {
    title: 'Workflow Automation (n8n)',
    desc: 'Deterministic orchestration for cross-system processes. Triggers, approvals, retries, and observability baked in.',
  },
  {
    title: 'LLM Integration',
    desc: 'Structured LLM use with policy, routing, evaluation, and fallback behavior. Designed to reduce variance in production.',
  },
  {
    title: 'Intelligent Data Pipelines',
    desc: 'Pipelines that move, normalize, and enrich data across systems. Built for traceability and downstream reliability.',
  },
  {
    title: 'Custom AI Systems',
    desc: 'Autonomous systems tailored to your environment. Integrated with identity, access controls, and your operating model.',
  },
]

function Card({ title, desc }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]/90 transition-colors group-hover:text-cyan-300">
          {title}
        </h3>
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 opacity-70 shadow-[0_0_18px_rgba(34,211,238,0.22)] transition group-hover:opacity-100" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/70">{desc}</p>
    </div>
  )
}

export default function Solutions() {
  return (
    <section id="solutions" className="py-20" aria-label="Solutions">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50 uppercase">Solutions</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl">
              Intelligent systems, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">built to operate.</span>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-[var(--foreground)]/60">
            We design automation as infrastructure.
            Clear contracts between systems.
            Measurable performance.
            Controlled change.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
