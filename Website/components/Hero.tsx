import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Check, Plus, MoreHorizontal, Zap, Star, BarChart3, Clock, User, FileText, Sparkles, Cloud, Bell } from 'lucide-react';

const Hero: React.FC = () => {
   const containerRef = useRef<HTMLElement>(null);
   const { scrollY } = useScroll();

   // Parallax transforms
   const yPhone = useTransform(scrollY, [0, 1000], [0, -150]);
   const yText = useTransform(scrollY, [0, 500], [0, 50]);
   const opacityText = useTransform(scrollY, [0, 300], [1, 0]);
   const rotateX = useTransform(scrollY, [0, 400], [25, 0]);

   // Floating elements parallax
   const yFloat1 = useTransform(scrollY, [0, 1000], [0, -200]);
   const yFloat2 = useTransform(scrollY, [0, 1000], [0, -50]);
   const yFloat3 = useTransform(scrollY, [0, 1000], [0, -300]);
   const yFloat4 = useTransform(scrollY, [0, 1000], [0, -100]);
   const yFloat5 = useTransform(scrollY, [0, 1000], [0, -250]);
   const yFloat6 = useTransform(scrollY, [0, 1000], [0, -150]);
   const yFloat7 = useTransform(scrollY, [0, 1000], [0, -350]);
   const yFloat8 = useTransform(scrollY, [0, 1000], [0, -400]);
   const yFloat9 = useTransform(scrollY, [0, 1000], [0, -150]);

   return (
      <section
         ref={containerRef}
         className="relative pt-32 pb-0 lg:pt-48 overflow-hidden bg-white dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800"
      >
         {/* 1. Subtle ambient lighting */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-zinc-100/50 via-zinc-50/20 to-transparent dark:from-zinc-800/20 dark:via-zinc-900/10 dark:to-transparent blur-[120px] pointer-events-none" />

         {/* 2. Grid Texture */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

         <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center [perspective:2000px]">

            {/* TEXT CONTENT */}
            <motion.div
               style={{ y: yText, opacity: opacityText }}
               className="text-center max-w-4xl mx-auto flex flex-col items-center"
            >
               {/* Badge */}
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm"
               >
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500 dark:bg-zinc-400"></span>
                  </span>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide uppercase">
                     Gradeo 2.0 Available Now
                  </span>
               </motion.div>

               {/* Headline */}
               <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-8xl lg:text-[7rem] font-semibold tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-8"
               >
                  Grade at the <br />
                  <span className="text-zinc-400 dark:text-zinc-600">speed of light.</span>
               </motion.h1>

               {/* Subtext */}
               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed mb-10 font-medium"
               >
                  Recover 10+ hours a week with the intelligent assistant designed for modern educators.
                  Precision scanning, instant analytics, and zero clutter.
               </motion.p>

               {/* Buttons */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row items-center gap-5"
               >
                  <button className="group h-14 px-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-[17px] transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-500/20 dark:hover:shadow-white/20 flex items-center gap-2.5">
                     Download for iOS
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                  </button>
                  <button className="h-14 px-8 rounded-full bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium text-[17px] transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 flex items-center gap-2.5">
                     <Play size={16} fill="currentColor" />
                     Watch the Film
                  </button>
               </motion.div>
            </motion.div>


            {/* VISUAL CENTERPIECE (Phone + Floating Elements) */}
            <motion.div
               style={{ y: yPhone, rotateX }}
               initial={{ opacity: 0, y: 100, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="relative mt-20 md:mt-32 w-full max-w-[1200px] flex justify-center"
            >
               {/* FLOATING ELEMENT 1: Status Notification (Top Left) */}
               <motion.div
                  style={{ y: yFloat1 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute left-4 top-10 md:left-0 md:top-24 hidden lg:flex items-center gap-4 p-4 pr-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] z-20"
               >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                     <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                     <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">System</div>
                     <div className="text-sm font-bold text-zinc-900 dark:text-white">Grading Complete</div>
                  </div>
               </motion.div>

               {/* FLOATING ELEMENT 2: Stats Card (Top Right) */}
               <motion.div
                  style={{ y: yFloat2 }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="absolute right-4 top-20 md:right-0 md:top-32 hidden lg:flex flex-col p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] z-20 min-w-[160px]"
               >
                  <div className="flex items-center gap-2 mb-2">
                     <BarChart3 size={16} className="text-zinc-500 dark:text-zinc-400" />
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Average</span>
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">92%</div>
                  <div className="text-xs text-green-500 font-bold">+4.5% vs last week</div>
               </motion.div>

               {/* FLOATING ELEMENT 3: Time Saved (Bottom Left) */}
               <motion.div
                  style={{ y: yFloat3 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1.0 }}
                  className="absolute left-8 bottom-40 md:left-10 md:bottom-60 hidden lg:flex items-center gap-3 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl z-20"
               >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                     <Clock size={18} fill="currentColor" />
                  </div>
                  <div className="pr-4">
                     <div className="text-xs text-zinc-500 font-medium">Time Saved</div>
                     <div className="text-sm font-bold text-zinc-900 dark:text-white">2h 15m today</div>
                  </div>
               </motion.div>

               {/* FLOATING ELEMENT 4: Active Users/Class (Bottom Right) */}
               <motion.div
                  style={{ y: yFloat4 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                  className="absolute right-12 bottom-52 md:right-20 md:bottom-80 hidden lg:flex flex-col gap-2 z-0"
               >
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 rotate-6 transform hover:rotate-0 transition-transform duration-300">
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                 {i === 3 ? '+4' : ''}
                              </div>
                           ))}
                        </div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">Processing...</div>
                     </div>
                  </div>
               </motion.div>

               {/* FLOATING ELEMENT 5: File Icon (Far Left Center) */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 hidden xl:flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-lg -rotate-12"
               >
                  <FileText className="text-zinc-400" size={32} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</div>
               </motion.div>

               {/* FLOATING ELEMENT 6: AI Analysis (Far Right Center) */}
               <motion.div
                  style={{ y: yFloat5 }}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1.3 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-3 p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg z-20 rotate-6"
               >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                     <Sparkles size={20} />
                  </div>
                  <div>
                     <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Analysis</div>
                     <div className="text-sm font-bold text-zinc-900 dark:text-white">99.8% Accuracy</div>
                  </div>
               </motion.div>

               {/* FLOATING ELEMENT 7: Upload Progress (Top Left Offset) */}
               <motion.div
                  style={{ y: yFloat6 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.4 }}
                  className="absolute left-20 top-40 hidden 2xl:flex items-center gap-3 p-3 pr-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-2xl z-30 -rotate-3"
               >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-100 flex items-center justify-center">
                     <Cloud size={14} className="text-white dark:text-black" />
                  </div>
                  <span className="text-xs font-bold">Syncing...</span>
               </motion.div>

               {/* FLOATING ELEMENT 8: Notification (Bottom Right Offset) */}
               <motion.div
                  style={{ y: yFloat7 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="absolute right-32 bottom-32 hidden 2xl:flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white shadow-lg z-30 animate-bounce"
               >
                  <Bell size={20} fill="currentColor" />
               </motion.div>

               {/* FLOATING ELEMENT 9: Rainbow Pill (Top Right Offset) */}
               <motion.div
                  style={{ y: yFloat8 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1.6 }}
                  className="absolute right-10 top-60 hidden 2xl:flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl z-10 rotate-12"
               >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse" />
                  <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
                     Magic Mode
                  </span>
               </motion.div>

               {/* FLOATING ELEMENT 10: Glass Card (Bottom Left Far) */}
               <motion.div
                  style={{ y: yFloat9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 1.7 }}
                  className="absolute left-10 bottom-80 hidden 2xl:flex flex-col gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl z-0 -rotate-6 w-32"
               >
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                     <div className="w-2/3 h-full bg-zinc-900 dark:bg-white rounded-full" />
                  </div>
                  <div className="w-1/2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
               </motion.div>

               {/* THE PHONE FRAME */}
               <div className="relative w-[360px] md:w-[400px] h-[750px] md:h-[800px] bg-[#222] rounded-[55px] p-[6px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_30px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 z-10">

                  {/* Hardware Buttons */}
                  <div className="absolute top-32 -left-1 w-1 h-8 bg-zinc-700 rounded-l-md"></div>
                  <div className="absolute top-44 -left-1 w-1 h-16 bg-zinc-700 rounded-l-md"></div>
                  <div className="absolute top-32 -right-1 w-1 h-24 bg-zinc-700 rounded-r-md"></div>

                  {/* Bezel */}
                  <div className="h-full w-full bg-black rounded-[50px] overflow-hidden border-[6px] border-black relative">

                     {/* Status Bar */}
                     <div className="absolute top-0 w-full px-7 py-3 flex justify-between items-center z-30 text-white mix-blend-difference">
                        <span className="text-xs font-semibold">9:41</span>
                        <div className="flex gap-1.5">
                           <div className="w-4 h-2.5 border border-white rounded-[2px]" />
                           <div className="w-3 h-2.5 bg-white rounded-[2px]" />
                        </div>
                     </div>

                     {/* Dynamic Island */}
                     <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ml-20 ring-1 ring-white/10"></div>
                     </div>

                     {/* SCREEN CONTENT */}
                     <div className="w-full h-full bg-[#F5F5F7] dark:bg-black pt-14 pb-8 px-5 flex flex-col font-sans">

                        {/* Header Area */}
                        <div className="flex justify-between items-start mb-6 mt-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/20">
                                 <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
                                    className="w-full h-full object-cover"
                                    alt="User"
                                 />
                              </div>
                              <div className="flex flex-col">
                                 <h2 className="text-lg font-bold text-black dark:text-white leading-tight">Mr. Anderson</h2>
                                 <div className="text-sm font-semibold text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Active Session
                                 </div>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm">
                              <Plus size={20} />
                           </div>
                        </div>

                        <div className="mb-4">
                           <h3 className="text-xl font-bold text-black dark:text-white mb-4">Quick Grading</h3>
                        </div>

                        {/* THE BIG BOX (Students Card) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm mb-6 w-full">
                           <div className="flex justify-between items-center mb-6">
                              <span className="text-lg font-bold text-zinc-900 dark:text-white">Students</span>
                              <button className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors">
                                 See All
                              </button>
                           </div>

                           <div className="flex justify-between items-center gap-2">
                              {[
                                 { name: "Alex", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" },
                                 { name: "Sam", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" },
                                 { name: "Jordan", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100" },
                                 { name: "Taylor", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100" }
                              ].map((student, i) => (
                                 <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-100 dark:border-zinc-800">
                                       <img src={student.img} className="w-full h-full rounded-full object-cover" alt={student.name} />
                                    </div>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{student.name}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Secondary Box (Stats) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm flex-1">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-lg font-bold text-zinc-900 dark:text-white">Class Average</span>
                              <MoreHorizontal className="text-zinc-400" />
                           </div>
                           <div className="mt-4">
                              <div className="flex items-end gap-2">
                                 <span className="text-4xl font-bold text-zinc-900 dark:text-white">92%</span>
                                 <span className="text-sm font-bold text-zinc-400 mb-1.5">Physics 101</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                 <div className="w-[92%] h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>
   );
};

export default Hero;