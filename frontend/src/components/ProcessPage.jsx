import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { Code2, Cpu, Rocket, ShieldCheck, Zap, BarChart3, Layers } from 'lucide-react'
import searchData from '../assets/lottie/search.json'
import computerData from '../assets/lottie/computer.json'
import chipData from '../assets/lottie/chip.json'

const steps = [
  {
    phase: "Phase 01",
    title: "Intelligence & Audit",
    subtitle: "Mapping the Automation Surface",
    desc: "We perform a deep-dive audit of your existing manual workflows, identifying constraints, data bottlenecks, and high-ROI automation opportunities.",
    animationData: searchData,
    color: "from-indigo-500 to-blue-400",
    details: [
      "Process bottleneck analysis",
      "Data structure mapping",
      "ROI projection models",
      "Security & compliance audit"
    ]
  },
  {
    phase: "Phase 02",
    title: "Neural Architecture",
    subtitle: "Logic Meets Intelligence",
    desc: "Designing the blueprint for your autonomous system. We define where deterministic logic holds and where AI agents handle complex decision-making.",
    animationData: computerData,
    color: "from-purple-500 to-pink-500",
    details: [
      "LLM agent orchestration",
      "Deterministic guardrails",
      "State management design",
      "Integration roadmap"
    ]
  },
  {
    phase: "Phase 03",
    title: "Execution & Safeguards",
    subtitle: "Engineering the Engine",
    desc: "Building the core automation engine using n8n and custom agent services. We layer in multi-step verification and human-in-the-loop approvals.",
    animationData: chipData,
    color: "from-orange-500 to-yellow-500",
    details: [
      "n8n workflow development",
      "Error handling & retries",
      "Human-in-the-loop controls",
      "Real-time logging systems"
    ]
  },
  {
    phase: "Phase 04",
    title: "Scale & Optimize",
    subtitle: "Production-Grade Deployment",
    desc: "Seamlessly shifting into production. We monitor every execution, iterating on cost, throughput, and accuracy with measured refinements.",
    icon: Rocket,
    color: "from-emerald-500 to-teal-500",
    details: [
      "Load balancing & scale",
      "Cloud-native deployment",
      "Continuous performance tuning",
      "Cost-efficiency monitoring"
    ]
  }
]

const features = [
  {
    title: "Deterministic Precision",
    desc: "AI is powerful, but logic must be absolute. We build systems that guarantee results.",
    icon: ShieldCheck
  },
  {
    title: "Real-time Intelligence",
    desc: "Autonomous agents that react to data changes instantly across your entire stack.",
    icon: Zap
  },
  {
    title: "Measured Outcomes",
    desc: "Clear dashboards showing cost-per-execution and total time saved.",
    icon: BarChart3
  },
  {
    title: "Modular Integration",
    desc: "Plug-and-play architecture that scales with your evolving business needs.",
    icon: Layers
  }
]

export default function ProcessPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Decorative */}
      <div className="fixed inset-0 -z-10 bg-[var(--background)]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-bold tracking-widest text-indigo-400 uppercase mb-8 shadow-2xl backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Reliability Engineering
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-[var(--foreground)] mb-8"
          >
            Our Delivery <br />
            <span className="gradient-text">Lifecycle.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed font-light"
          >
            A high-precision engineering process designed to take complex manual workflows and transform them into autonomous, scalable production systems.
          </motion.p>
        </div>

        {/* Process Roadmap */}
        <div className="relative mb-40">
          {/* Vertical Line for Desktop */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent hidden lg:block" />

          <div className="space-y-32">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className={`inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r ${step.color} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
                    {step.phase}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
                    {step.title}
                  </h2>
                  <p className="text-lg font-medium text-indigo-400 uppercase tracking-widest">
                    {step.subtitle}
                  </p>
                  <p className="text-lg text-[var(--muted)] leading-relaxed">
                    {step.desc}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[var(--foreground)]/80">
                        <div className="h-1 w-1 rounded-full bg-indigo-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual / Icon Side */}
                <div className="w-full lg:w-1/2 flex justify-center py-10">
                  <div className="relative group">
                    {/* Hover Glow */}
                    <div className={`absolute -inset-10 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`} />
                    
                    {step.animationData ? (
                      <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-gradient-to-br ${step.color} p-0.5 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3`}>
                        <div className="w-full h-full rounded-[2.3rem] bg-[#0A0A0B] flex items-center justify-center overflow-hidden p-4">
                          <Lottie
                            animationData={step.animationData}
                            loop={true}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-gradient-to-br ${step.color} p-0.5 shadow-2xl relative z-10 rotate-3 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6`}>
                        <div className="w-full h-full rounded-[2.3rem] bg-[#0A0A0B] flex items-center justify-center">
                          <step.icon className="w-16 h-16 md:w-24 md:h-24 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
          {features.map((feature, idx) => (
            <div key={idx} className="bento-card p-10 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -z-10" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--foreground)] mb-8">
            Ready to engineer <br />
            <span className="gradient-text">your future?</span>
          </h2>
          <p className="text-xl text-[var(--muted)] max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Let's discuss how we can build autonomous systems that solve your most complex operational challenges.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="gradient-btn px-10 py-4 rounded-2xl text-lg w-full sm:w-auto">
              Talk to Engineering
            </button>
            <button className="ghost-btn px-10 py-4 rounded-2xl text-lg w-full sm:w-auto">
              View Case Studies
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
