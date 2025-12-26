import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Sparkles,
    BookOpen,
    GraduationCap,
    BarChart3,
    ChevronRight,
    Users,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();

    // APPLE MOTION CONSTANTS
    const ANIM_EASE = [0.16, 1, 0.3, 1]; // Apple ease-out
    const ANIM_DURATION = 0.4;
    const HOVER_SCALE = 1.02;
    const TAP_SCALE = 0.98;

    const mainStats = [
        { label: 'Overall Grade', value: '92%', trend: '+3% this month', icon: GraduationCap, color: 'blue' },
        { label: 'Attendance', value: '98%', trend: 'Maintained', icon: Users, color: 'emerald' },
        { label: 'Total Credits', value: '45/60', trend: 'On track', icon: BookOpen, color: 'purple' },
        { label: 'Cumulative GPA', value: '3.92', trend: 'Distinction', icon: BarChart3, color: 'orange' },
    ];

    const availableExams = [
        { id: 1, title: 'Calculus I Midterm', time: '90 min', questions: 25, type: 'Exam', category: 'Math' },
        { id: 2, title: 'Physics Quiz: Kinematics', time: '45 min', questions: 15, type: 'Quiz', category: 'Science' },
    ];

    const recentResults = [
        { id: 1, title: 'English Lit Final', score: '95%', date: '2 days ago', grade: 'A' },
        { id: 2, title: 'Chemistry Lab', score: '88%', date: '5 days ago', grade: 'B+' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-10 pb-10"
        >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
                        Hello, Ahmed
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg leading-tight tracking-tight">
                        You have <span className="text-zinc-900 dark:text-zinc-200 font-bold underline decoration-blue-500/50 decoration-2 underline-offset-2">2 exams</span> available for attempt today.
                    </p>
                </div>
                <motion.button
                    whileHover={{
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/ai-tutor')}
                    className="flex items-center gap-2.5 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl shadow-zinc-900/10 dark:shadow-none transition-all duration-150 ease-[0.16,1,0.3,1] group"
                >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 flex items-center justify-center">
                        <Sparkles size={14} className="text-blue-500" fill="currentColor" />
                    </div>
                    <span className="tracking-tight">Ask AI Tutor</span>
                    <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
            </header>

            {/* Performance Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: ANIM_DURATION, ease: ANIM_EASE }}
                        whileHover={{
                            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
                        }}
                        className="bg-white dark:bg-zinc-900 p-8 rounded-[1.5rem] border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all duration-150 ease-[0.16,1,0.3,1] group flex flex-col gap-4 cursor-default"
                    >
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 ease-out`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none mb-2.5">
                                {stat.value}
                            </div>
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest leading-none mb-3">
                                {stat.label}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-full">
                                <TrendingUp size={12} strokeWidth={2.5} /> {stat.trend}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Available Exams (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Available Exams</h3>
                        <motion.button
                            whileHover={{ x: 2 }}
                            onClick={() => navigate('/student/exams')}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center gap-1"
                        >
                            View Schedule <ChevronRight size={14} />
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {availableExams.map((exam, i) => (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (i * 0.05), duration: ANIM_DURATION, ease: ANIM_EASE }}
                                whileHover={{
                                    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
                                }}
                                whileTap={{ scale: TAP_SCALE }}
                                className="bg-white dark:bg-zinc-900 p-7 rounded-[1.25rem] border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all duration-150 ease-[0.16,1,0.3,1] flex flex-col justify-between h-full group cursor-pointer"
                            >
                                <div>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wide mb-4 border border-blue-100 dark:border-blue-900/30">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                        {exam.category}
                                    </div>
                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                                        {exam.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 mb-8 uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {exam.time}</span>
                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                        <span>{exam.questions} Questions</span>
                                    </div>
                                </div>
                                <button className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/10 dark:shadow-none flex items-center justify-center gap-2 group-hover:gap-3">
                                    Attempt Now <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Insights Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[1.5rem] p-10 text-white relative overflow-hidden group shadow-xl shadow-blue-900/20 transition-all duration-500">
                        <div className="absolute -top-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-700 ease-out">
                            <Sparkles size={240} />
                        </div>
                        <div className="relative z-10 max-w-lg">
                            <div className="flex items-center gap-2 mb-4 text-blue-200 text-xs font-bold uppercase tracking-widest">
                                <Sparkles size={14} className="text-blue-300" />
                                AI Recommendation
                            </div>
                            <h3 className="text-3xl font-bold mb-4 tracking-tighter">Focus on Inorganic Chemistry</h3>
                            <p className="text-blue-100 font-medium mb-8 text-lg leading-relaxed">
                                Based on your recent quiz results, studying this topic could boost your predicted score by <span className="text-white font-bold decoration-blue-300 underline underline-offset-4 decoration-2">12%</span>.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-50 hover:shadow-xl transition-all"
                            >
                                View Study Plan
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Recent Results (4 Cols) */}
                <div className="lg:col-span-4 space-y-8">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight px-2">Recent Results</h3>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: ANIM_DURATION, ease: ANIM_EASE }}
                        className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-200/50 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="flex-1">
                            {recentResults.map((result, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: "rgba(244, 244, 245, 0.5)" }}
                                    className={`p-6 flex items-center justify-between ${i !== recentResults.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''} cursor-pointer group transition-colors`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-900 dark:text-white text-xl shadow-inner group-hover:scale-105 transition-transform">
                                            {result.grade}
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-zinc-900 dark:text-white text-[15px] mb-1 group-hover:text-blue-600 transition-colors">{result.title}</h5>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{result.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-extrabold text-zinc-900 dark:text-white">{result.score}</div>
                                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full py-5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            See All Grades
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
