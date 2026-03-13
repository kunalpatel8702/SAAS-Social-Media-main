export default function Problem() {
  return (
    <section className="py-20" aria-label="Problem">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
              Operations slow down when systems don’t align.
            </h2>
          </div>
          <div className="md:col-span-7">
            <div className="space-y-4 text-sm leading-relaxed text-[var(--foreground)]/70 md:text-base">
              <p>
                Enterprise environments accumulate tools, handoffs, and exceptions.
                Work moves through spreadsheets, tickets, inboxes, and dashboards.
              </p>
              <p>
                Automation exists, but it is fragmented.
                Critical steps remain manual.
                Visibility is incomplete.
              </p>
              <p>
                The result is predictable.
                Higher cycle time.
                Inconsistent execution.
                Risk concentrated in people, not systems.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50">Impact</div>
                <div className="mt-2 text-sm font-semibold text-[var(--foreground)]/85">Cycle time grows</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50">Impact</div>
                <div className="mt-2 text-sm font-semibold text-[var(--foreground)]/85">Errors repeat</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50">Impact</div>
                <div className="mt-2 text-sm font-semibold text-[var(--foreground)]/85">Controls weaken</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
