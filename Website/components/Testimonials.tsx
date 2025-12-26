import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-40 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 flex justify-center"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center shadow-inner">
            <Lock size={48} className="text-zinc-900 dark:text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-semibold tracking-tighter text-zinc-900 dark:text-white mb-8"
        >
          Your data. <br />
          <span className="text-zinc-400">And only yours.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-20"
        >
          All grading happens on-device. Student data never leaves your phone without your explicit permission.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "AES-256 Encryption", desc: "Military-grade protection for every file." },
            { icon: EyeOff, title: "Zero Tracking", desc: "We don't sell your data. Ever." },
            { icon: Lock, title: "Local Processing", desc: "AI runs locally on your Neural Engine." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex flex-col items-center gap-4"
            >
              <item.icon size={32} className="text-zinc-900 dark:text-white" strokeWidth={1.5} />
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;