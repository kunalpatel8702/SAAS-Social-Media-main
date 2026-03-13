export default function Contact() {
  return (
    <section id="contact" className="py-20" aria-label="Contact">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <div className="text-xs font-medium tracking-wide text-[var(--foreground)]/50">Contact</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
              Start with the system.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--foreground)]/70 md:text-base">
              Share the workflow, the constraints, and the outcome you need.
              We will respond with a technical plan.
            </p>

            <div className="mt-8 space-y-3 text-sm text-[var(--foreground)]/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Enterprise engagements only
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Security and access controls supported
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                Clear delivery milestones
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
              <form className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm text-[var(--foreground)]/70">
                    Name
                    <input
                      className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none transition focus:border-white/25"
                      placeholder="Your name"
                      type="text"
                      name="name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-[var(--foreground)]/70">
                    Work email
                    <input
                      className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none transition focus:border-white/25"
                      placeholder="name@company.com"
                      type="email"
                      name="email"
                      autoComplete="email"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm text-[var(--foreground)]/70">
                  Company
                  <input
                    className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none transition focus:border-white/25"
                    placeholder="Company"
                    type="text"
                    name="company"
                    autoComplete="organization"
                  />
                </label>

                <label className="grid gap-2 text-sm text-[var(--foreground)]/70">
                  What should the system do?
                  <textarea
                    className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/35 outline-none transition focus:border-white/25"
                    placeholder="Describe the workflow, systems involved, and constraints."
                    name="message"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-[var(--foreground)]/45">
                    This form is for initial routing. No attachments.
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500/90 to-cyan-400/90 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:from-purple-400/90 hover:to-cyan-300/90"
                  >
                    Send request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
