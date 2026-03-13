import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: 'Social Media Suite', href: '#' },
      { name: 'Lead Gen Engine', href: '#' },
      { name: 'Workflow Automations', href: '#' },
      { name: 'AI Image Generator', href: '#' },
    ],
    company: [
      { name: 'About Elite', href: '#' },
      { name: 'Case Studies', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    support: [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Contact Sales', href: '#' },
      { name: 'Status', href: '#' },
    ]
  }

  return (
    <footer className="relative mt-32 bg-[var(--background)] transition-colors duration-300" aria-label="Footer">
      {/* 1. Pre-footer Video Banner */}
      <div className="mx-auto max-w-7xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-[40px] border border-black/5 dark:border-white/10 shadow-2xl">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/glf2.mp4" type="video/mp4" />
          </video>

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 px-8 py-20 md:py-24 md:px-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl text-left"
            >
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-7xl leading-[1.1]">
                Scale your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
                  Company.
                </span>
              </h2>
              <p className="mt-6 text-base font-medium text-white/70 md:text-xl max-w-md">
                Don't just automate tasks—build an autonomous infrastructure that runs your entire operation.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-white/10">
                  Book a Strategy Call
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Agency Bio */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 dark:bg-purple-500/20">
                <div className="h-4 w-4 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
              </div>
              <div>
                <span className="block text-2xl font-black tracking-tight text-[var(--foreground)]">
                  AutomationOwl
                </span>
                <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
                  Elite AI Agency
                </span>
              </div>
            </div>
            <p className="mt-6 text-sm font-medium leading-relaxed text-[var(--foreground)]/50 max-w-xs">
              Building the next generation of autonomous infrastructure. We help enterprises deploy AI employees that think, scale, and deliver.
            </p>

            {/* Social Links */}
            <div className="mt-8 flex gap-4">
              {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 text-[var(--foreground)]/40 hover:text-purple-500 hover:border-purple-500/30 transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:ml-auto">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">Platform</h3>
              <ul className="mt-6 space-y-4">
                {footerLinks.platform.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm font-medium text-[var(--foreground)]/50 hover:text-purple-500 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">Agency</h3>
              <ul className="mt-6 space-y-4">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm font-medium text-[var(--foreground)]/50 hover:text-purple-500 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">Connect</h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]/50">
                  <Mail size={16} className="text-purple-500" />
                  hello@automationowl.ai
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]/50">
                  <MapPin size={16} className="text-purple-500" />
                  San Francisco, CA
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]/50">
                  <Phone size={16} className="text-purple-500" />
                  +1 (555) AI-ONLY
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-black/5 dark:border-white/5 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-xs font-medium text-[var(--foreground)]/40">
              © {new Date().getFullYear()} AutomationOwl. All rights reserved. Built with precision for the autonomous era.
            </p>
            <div className="flex gap-8 text-xs font-medium text-[var(--foreground)]/40">
              <a href="#" className="hover:text-[var(--foreground)]">Privacy</a>
              <a href="#" className="hover:text-[var(--foreground)]">Terms</a>
              <a href="#" className="hover:text-[var(--foreground)]">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
