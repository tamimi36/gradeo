import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const AppShowcase: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <section className="relative pb-32 bg-white dark:bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ scale }}
          className="relative mx-auto border-zinc-800 dark:border-zinc-800 bg-zinc-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl md:w-[600px] md:h-[400px] md:rounded-[2rem] lg:w-[900px] lg:h-[600px]"
        >
          <div className="h-[32px] w-[3px] bg-zinc-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-zinc-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
          <div className="h-[46px] w-[3px] bg-zinc-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
          <div className="h-[64px] w-[3px] bg-zinc-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
          <div className="rounded-[2rem] overflow-hidden w-full h-full bg-zinc-200 dark:bg-zinc-800 relative group">
            {/* Mockup Screen Content */}
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
              alt="Dashboard Mockup"
              className="object-cover w-full h-full opacity-80"
            />

            {/* Premium Widget Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="absolute bottom-12 left-0 right-0 mx-auto w-max"
            >
              <div className="flex items-center gap-4 p-4 pr-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-700/50 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={24} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">Status</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Analysis Complete</h3>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">98% Match</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-6">
            Your classroom <span className="text-zinc-400">command center.</span>
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Manage your classes on the big screen. The Gradeo web dashboard syncs instantly with your mobile device for detailed analysis and printing.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AppShowcase;