import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    ArrowUpRight,
    BookOpen,
    Calculator,
    Atom,
    Globe,
    Palette,
    Dumbbell
} from 'lucide-react';

const StudentProgress: React.FC = () => {

    // Motion Constants
    const transitionEase = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

    const subjects = [
        { name: 'Mathematics', score: 92, trendUp: true, trend: '4%', color: 'blue', icon: Calculator },
        { name: 'Science', score: 78, trendUp: true, trend: '2%', color: 'emerald', icon: Atom },
        { name: 'English', score: 85, trendUp: false, trend: '1%', color: 'purple', icon: BookOpen },
        { name: 'History', score: 94, trendUp: true, trend: '5%', color: 'orange', icon: Globe },
        { name: 'Arts', score: 88, trendUp: true, trend: '0%', color: 'pink', icon: Palette },
        { name: 'Phys Ed', score: 96, trendUp: true, trend: '1%', color: 'indigo', icon: Dumbbell },
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
            >
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Subject Mastery</h1>
                <p className="text-zinc-500 font-medium text-lg tracking-tight">Your academic performance across all domains.</p>
            </motion.div>

            {/* Mastery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {subjects.map((subject, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.05, ...transitionEase }}
                        whileHover={{
                            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all duration-150 ease-[0.16,1,0.3,1] flex flex-col items-center text-center gap-6 group cursor-default"
                    >
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-${subject.color}-500/10 text-${subject.color}-600 dark:text-${subject.color}-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm border border-${subject.color}-100 dark:border-${subject.color}-900/20`}>
                            <subject.icon size={26} strokeWidth={2} />
                        </div>

                        {/* Circular Progress */}
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                <circle
                                    cx="56" cy="56" r="48"
                                    stroke="currentColor"
                                    fill="transparent"
                                    strokeWidth="8"
                                    className="text-zinc-100 dark:text-zinc-800"
                                />
                                <motion.circle
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: subject.score / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                    cx="56" cy="56" r="48"
                                    stroke="currentColor"
                                    fill="transparent"
                                    strokeWidth="8"
                                    className={`text-${subject.color}-500`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight"
                                >
                                    {subject.score}%
                                </motion.span>
                            </div>
                        </div>

                        {/* Title & Trend */}
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-1.5">{subject.name}</h3>
                            <div className={`text-[10px] font-bold flex items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-800 rounded-full px-2 py-1 border border-zinc-100 dark:border-zinc-800 ${subject.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                {subject.trendUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <TrendingUp size={10} className="rotate-90" strokeWidth={3} />}
                                {subject.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Efficiency Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, ...transitionEase }}
                    className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-10 text-white dark:text-black relative overflow-hidden shadow-2xl shadow-zinc-900/20 dark:shadow-none bg-gradient-to-br from-black to-zinc-900 dark:from-white dark:to-zinc-100"
                >
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                        <TrendingUp size={240} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-white/60 dark:text-black/60 text-xs font-bold uppercase tracking-widest">
                            <TrendingUp size={14} /> Efficiency
                        </div>
                        <h3 className="text-3xl font-black tracking-tight mb-4">Learning Consistency</h3>
                        <p className="text-zinc-400 dark:text-zinc-600 font-medium mb-10 max-w-sm text-lg leading-relaxed">
                            You've maintained a <span className="text-white dark:text-black font-bold border-b-2 border-green-500">14-day study streak</span>. Keep it up to earn the "Resilient Scholar" badge.
                        </p>
                        <div className="flex gap-2.5">
                            {[1, 1, 1, 1, 0, 1, 1].map((active, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 4, opacity: 0 }}
                                    animate={{ height: 8, opacity: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.05) }}
                                    className={`flex-1 rounded-full transition-all duration-500 ${active ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'bg-white/10 dark:bg-black/10'}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            <span>Mon</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, ...transitionEase }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-10 shadow-sm"
                >
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-8">Achievement Progress</h3>
                    <div className="space-y-8">
                        {[
                            { title: 'Goal Crusher', progress: 85, color: 'blue', sub: 'Complete 5 more quizzes' },
                            { title: 'Peer Mentor', progress: 40, color: 'purple', sub: 'Help 3 students in forum' },
                            { title: 'Top 1% Club', progress: 92, color: 'orange', sub: 'Maintain >90% avg' },
                        ].map((ach, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">{ach.title}</h4>
                                        <p className="text-xs text-zinc-500 font-medium">{ach.sub}</p>
                                    </div>
                                    <span className="text-2xl font-black text-zinc-900 dark:text-white">{ach.progress}%</span>
                                </div>
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ach.progress}%` }}
                                        transition={{ delay: 0.4 + (i * 0.1), duration: 1.2, ease: "circOut" }}
                                        className={`h-full bg-${ach.color}-500 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)]`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentProgress;
