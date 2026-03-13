import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is an AI employee?",
    answer: "An AI employee is an autonomous software tool designed to handle repetitive tasks, data processing, and decision-making workflows within your operations. It works alongside your human team to boost productivity and reduce operational overhead."
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes, we offer a 14-day money-back guarantee on all our AI agent subscriptions. If you find the automation isn't meeting your business needs, you can cancel within the first two weeks for a full refund."
  },
  {
    question: "Can I invite my team to use the platform?",
    answer: "Absolutely. Our platform supports role-based access control (RBAC), allowing you to invite team members, assign specific permissions, and collaborate seamlessly on workflows and AI interactions."
  },
  {
    question: "What can I use these AI employees for?",
    answer: "Our AI agents are designed to boost productivity and simplify your business operations. You can use them for tasks like administrative work, lead generation, content creation, email outreach, social media management, project management, and much more. It's like having an always-on assistant that completes your day-to-day tasks."
  },
  {
    question: "How do I start using the AI employees?",
    answer: "Using our platform is very intuitive and simple. The AI agents run as conversational interfaces or background background automations. We provide a variety of templates, guides, and documentation to assist you in building and customizing AI agents to your specific use cases."
  },
  {
    question: "Can AI employees replace human employees?",
    answer: "No. AI employees are designed to support and extend your team, not replace it. They handle repetitive and operational work, so your human employees can focus on strategy, creativity, relationship building, and decision-making where humans add the most value."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 bg-[var(--background)]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column: Heading & Intro */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-6">
              AI Employee FAQs.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Let's clear things up.</span>
            </h2>
            <p className="text-[var(--muted)] text-lg mb-6 leading-relaxed">
              Yes, we understand - AI-powered solutions, business automation tools, AI workers, digital AI staff... a lot of big words can get confusing.
            </p>
            <p className="text-[var(--muted)] text-lg leading-relaxed">
              We're here to clear the air - and if you still feel the need to ask AI questions - our support team is ready to answer 24/7.
            </p>
            
            <div className="relative mt-12 w-full max-w-sm mx-auto lg:mx-0 group">
              {/* Ambient Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-purple-500/30 to-cyan-400/30 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 dark:opacity-40" />
              
              {/* Animated Border Container */}
              <div className="relative rounded-[2rem] p-[2px] overflow-hidden shadow-2xl group-hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-shadow duration-500">
                {/* Rotating Border Element */}
                <div 
                  className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: 'conic-gradient(from 90deg at 50% 50%, #a855f7 0%, transparent 20%, transparent 40%, #22d3ee 60%, transparent 80%, #a855f7 100%)' 
                  }} 
                />
                
                {/* Content Inner Area */}
                <div className="relative rounded-[calc(2rem-2px)] p-1.5 bg-[var(--background)] h-full w-full z-10 backdrop-blur-xl border border-[var(--border)] group-hover:border-transparent transition-colors duration-500">
                  {/* Image wrapper */}
                  <div className="rounded-[1.6rem] overflow-hidden bg-[var(--surface-hover)] relative flex items-center justify-center">
                    {/* Inner static frame */}
                    <div className="absolute inset-0 border border-white/5 rounded-[1.6rem] z-20 pointer-events-none group-hover:border-white/20 transition-colors duration-500" />
                    <img 
                      src="/Cinematic_hero_animation_of_a_cute_3d_astronaut_ai_delpmaspu.png" 
                      alt="AI Assistant Astronaut mascot" 
                      className="w-full h-auto relative z-10 brightness-110 contrast-125 dark:brightness-100 dark:contrast-100 drop-shadow-xl transform group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`border-b border-[var(--border)] transition-colors duration-300 ${isOpen ? '' : 'hover:border-[var(--foreground)]/20'}`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="text-xl font-semibold text-[var(--foreground)]/90 group-hover:text-cyan-300 transition-colors duration-300">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-6 h-6 text-[var(--muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-300' : 'group-hover:text-cyan-300'}`} 
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-base text-[var(--foreground)]/70 leading-relaxed pr-8">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
