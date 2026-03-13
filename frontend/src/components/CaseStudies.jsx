const studies = [
  {
    title: 'Order operations automation',
    points: ['42% faster cycle time', '18 hours/week recovered', 'Lower exception backlog'],
    detail:
      'Automated triage, enrichment, and routing across ticketing, CRM, and notifications with agent-assisted classification and deterministic workflow controls.',
  },
  {
    title: 'Finance workflow standardization',
    points: ['31% fewer manual touches', 'Audit trail coverage improved', 'Month-end variance reduced'],
    detail:
      'Built a controlled workflow for approvals, document handling, and reconciliation. Added policy checks and visibility across teams.',
  },
  {
    title: 'Infrastructure runbook execution',
    points: ['55% reduction in incident toil', 'Faster mean recovery', 'Repeatability increased'],
    detail:
      'Automated routine remediation and verification steps. Integrated monitoring signals with gated actions and clear escalation paths.',
  },
]

export default function CaseStudies() {
  return (
    <section id="case-studies" className="py-20" aria-label="Case studies">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50">Case studies</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
              Results that hold under scrutiny.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--foreground)]/65">
            Metrics come from operational baselines.
            Improvements are tracked.
            Changes are controlled.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {studies.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]/90">
                {s.title}
              </h3>
              <div className="mt-4 grid gap-2">
                {s.points.map((p) => (
                  <div
                    key={p}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[var(--foreground)]/80"
                  >
                    {p}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]/70">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
