import React from 'react';
import { motion } from 'framer-motion';
import { Printer, ScanLine, FileBarChart, ArrowRight, Zap } from 'lucide-react';

const steps = [
  {
    icon: Printer,
    title: "Print",
    desc: "Generate optimized answer sheets from your dashboard.",
    color: "bg-zinc-100 dark:bg-zinc-900"
  },
  {
    icon: ScanLine,
    title: "Scan",
    desc: "Hover to grade instantly using our AI optical engine.",
    color: "bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 text-white",
    highlight: true
  },
  {
    icon: FileBarChart,
    title: "Analyze",
    desc: "Review detailed class analytics and export grades.",
    color: "bg-zinc-100 dark:bg-zinc-900"
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-32 bg-white dark:bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-semibold tracking-tighter text-zinc-900 dark:text-white mb-6"
            >
              Effortless by design.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-500 dark:text-zinc-400"
            >
              Three simple steps to reclaim your weekends.
            </motion.p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              className={`relative h-[400px] rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden group ${step.color}`}
            >
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-3xl ${step.highlight ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm'}`}>
                  <step.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className={`text-3xl font-bold mb-4 ${step.highlight ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                  {step.title}
                </h3>
                <p className={`text-lg leading-relaxed max-w-[80%] ${step.highlight ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {step.desc}
                </p>
              </div>

              {/* Decorative Elements */}
              {step.highlight && (
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-colors" />
              )}
              <div className="flex justify-between items-end">
                <span className={`text-6xl font-bold opacity-10 ${step.highlight ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                  0{idx + 1}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:-rotate-45 ${step.highlight ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;