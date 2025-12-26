import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Scan, Brain, BarChart3, Cloud, Shield, Zap, ArrowRight, Lock, Activity } from 'lucide-react';

const Features: React.FC = () => {
   return (
      <section id="features" className="py-32 bg-zinc-50 dark:bg-black">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-20 max-w-2xl">
               <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-3">
                  System Capabilities
               </h2>
               <p className="text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight leading-[0.95] mb-6">
                  Packed with power.
               </p>
               <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  An entire suite of pro-grade tools, completely reimagined for the modern classroom workflow.
               </p>
            </div>

            {/* Premium Bento Grid */}
            <motion.div
               initial="hidden"
               whileInView="show"
               viewport={{ once: true, margin: "-100px" }}
               variants={{
                  hidden: { opacity: 0 },
                  show: {
                     opacity: 1,
                     transition: {
                        staggerChildren: 0.1
                     }
                  }
               }}
               className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[340px]"
            >

               {/* Card 1: Large Span - Instant Scan */}
               <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="md:col-span-2">
                  <BentoCard className="h-full">
                     <div className="h-full flex flex-col justify-between relative z-10">
                        <div className="flex items-start justify-between">
                           <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Scan size={24} />
                           </div>
                           <span className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                              0.2s Latency
                           </span>
                        </div>

                        {/* Internal Graphic */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 dark:opacity-20">
                           <div className="w-64 h-40 border-2 border-dashed border-zinc-400 rounded-lg relative overflow-hidden">
                              <motion.div
                                 className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                 animate={{ top: ["0%", "100%", "0%"] }}
                                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                           </div>
                        </div>

                        <div>
                           <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Instant OCR Scanning</h3>
                           <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                              Our proprietary optical engine recognizes handwriting and bubble sheets instantly. No shutter button needed.
                           </p>
                        </div>
                     </div>
                  </BentoCard>
               </motion.div>

               {/* Card 2: AI Analytics */}
               <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <BentoCard className="h-full">
                     <div className="h-full flex flex-col justify-between relative z-10">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                           <Brain size={24} />
                        </div>

                        {/* Internal Graphic */}
                        <div className="flex gap-1 items-end h-16 w-full opacity-50 mb-4">
                           {[40, 70, 50, 90, 60, 80].map((h, i) => (
                              <motion.div
                                 key={i}
                                 className="flex-1 bg-purple-500 rounded-t-sm"
                                 initial={{ height: 0 }}
                                 whileInView={{ height: `${h}%` }}
                                 transition={{ duration: 1, delay: i * 0.1 }}
                              />
                           ))}
                        </div>

                        <div>
                           <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Deep Insights</h3>
                           <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Identify learning gaps automatically with per-question breakdown.
                           </p>
                        </div>
                     </div>
                  </BentoCard>
               </motion.div>

               {/* Card 3: Real-time Stats */}
               <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <BentoCard className="h-full">
                     <div className="h-full flex flex-col justify-between relative z-10">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                           <Activity size={24} />
                        </div>

                        <div className="space-y-2 my-4">
                           <div className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-zinc-600 dark:text-zinc-300 font-medium">Server Sync Active</span>
                           </div>
                           <div className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75" />
                              <span className="text-zinc-600 dark:text-zinc-300 font-medium">Database Connected</span>
                           </div>
                        </div>

                        <div>
                           <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Live Sync</h3>
                           <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Changes reflect instantly across all your devices in real-time.
                           </p>
                        </div>
                     </div>
                  </BentoCard>
               </motion.div>

               {/* Card 4: Wide - Security */}
               <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="md:col-span-2">
                  <BentoCard className="h-full">
                     <div className="h-full flex flex-col justify-between relative z-10">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                              <Shield size={24} />
                           </div>
                           <Lock size={20} className="text-zinc-400" />
                        </div>

                        <div className="flex items-center gap-4 my-6">
                           <div className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500">
                              AES-256 ENCRYPTED
                           </div>
                           <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                           <div className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500">
                              GDPR READY
                           </div>
                        </div>

                        <div>
                           <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Enterprise Security</h3>
                           <p className="text-zinc-500 dark:text-zinc-400 max-w-lg">
                              Your student data is sacred. We protect it with military-grade encryption and strict privacy compliance.
                           </p>
                        </div>
                     </div>
                  </BentoCard>
               </motion.div>

            </motion.div>
         </div>
      </section>
   );
};

// Spotlight Card Component
const BentoCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
   const mouseX = useMotionValue(0);
   const mouseY = useMotionValue(0);

   function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
   }

   return (
      <div
         className={`group relative border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden rounded-3xl p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300 ${className}`}
         onMouseMove={handleMouseMove}
      >
         <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
               background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.1),
              transparent 80%
            )
          `,
            }}
         />
         {children}
      </div>
   );
};

export default Features;