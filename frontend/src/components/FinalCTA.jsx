export default function FinalCTA() {
  return (
    <section className="py-20" aria-label="Final call to action">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-400/12 blur-3xl" />
          </div>

          <div className="relative grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
                Build automation you can run.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/70 md:text-base">
                If you need agents and workflows that operate inside production constraints,
                we should talk.
              </p>
            </div>
            <div className="md:col-span-4 md:flex md:justify-end">
              <a
                href="#contact"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500/90 to-cyan-400/90 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:from-purple-400/90 hover:to-cyan-300/90 md:w-auto"
              >
                Schedule a call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
