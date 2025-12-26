import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-32 bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            show: {
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.5,
                staggerChildren: 0.1
              }
            }
          }}
          className="relative bg-zinc-900 dark:bg-zinc-100 rounded-[2.5rem] p-12 md:p-24 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[100px]" />
          </div>

          <div className="relative z-10">
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              className="text-4xl md:text-6xl font-bold text-white dark:text-black mb-8 tracking-tight"
            >
              Ready to grade at lightspeed?
            </motion.h2>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              className="text-xl text-zinc-400 dark:text-zinc-600 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of teachers who have reclaimed their weekends. Try Gradeo for free today.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="h-14 px-8 rounded-full bg-white dark:bg-black text-black dark:text-white font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
                Download Now <ArrowRight size={20} />
              </button>
              <button className="h-14 px-8 rounded-full bg-transparent border border-zinc-700 dark:border-zinc-300 text-white dark:text-black font-semibold text-lg hover:bg-white/10 dark:hover:bg-black/5 transition-colors">
                View Pricing
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;