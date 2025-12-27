import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    BookOpen,
    GraduationCap,
    BarChart3,
    ChevronRight,
    Users,
    Clock,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();

    // APPLE MOTION - STRICT
    const ANIM_EASE = [0.16, 1, 0.3, 1]; // Apple ease-out
    const ANIM_DURATION = 0.4;
    // No spring animations allowed

    const mainStats = [
        { label: 'Overall Grade', value: '92%', trend: '+3%', icon: GraduationCap, color: 'zinc' },
        { label: 'Attendance', value: '98%', trend: 'Stable', icon: Users, color: 'zinc' },
        { label: 'Total Credits', value: '45/60', trend: 'On track', icon: BookOpen, color: 'zinc' },
        { label: 'GPA', value: '3.92', trend: 'High', icon: BarChart3, color: 'zinc' },
    ];

    const availableExams = [
        { id: 1, title: 'Calculus I Midterm', time: '90 min', questions: 25, type: 'Exam', category: 'Math' },
        { id: 2, title: 'Physics Quiz: Kinematics', time: '45 min', questions: 15, type: 'Quiz', category: 'Science' },
    ];

    const recentResults = [
        { id: 1, title: 'English Lit Final', score: '95%', date: '2d ago', grade: 'A' },
        { id: 2, title: 'Chemistry Lab', score: '88%', date: '5d ago', grade: 'B+' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-12 pb-12 max-w-[1600px] mx-auto"
        >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white tracking-editorial mb-3">
                        Hello, Ahmed
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-normal text-lg tracking-body">
                        You have <span className="text-zinc-900 dark:text-white font-medium">2 exams</span> available today.
                    </p>
                </div>

                {/* AI Tutor Button - REDESIGNED */}
                <motion.button
                    whileHover={{ opacity: 0.8 }}
                    whileTap={{ scale: 0.99, y: 1 }}
                    onClick={() => navigate('/student/ai-tutor')}
                    className="flex items-center gap-3 px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium text-[15px] bg-transparent transition-all duration-200"
                >
                    <span>Open AI Workspace</span>
                </motion.button>
            </header>

            {/* Performance Grid - Editorial Style */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {mainStats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05, duration: ANIM_DURATION }}
                        className="bg-white dark:bg-zinc-900 p-8 flex flex-col gap-3 group hover:bg-zinc-50/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon size={16} className="text-zinc-300" />
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                {stat.value}
                            </span>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column (8 Cols) */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Available Exams - Premium Animation */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">Up Next</h3>
                            <button onClick={() => navigate('/student/exams')} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">View All</button>
                        </div>

                        <div className="space-y-4">
                            {availableExams.map((exam, i) => (
                                <motion.div
                                    key={exam.id}
                                    initial={{ opacity: 0, y: 6 }} // Specific start Y
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.08), duration: 0.24, ease: ANIM_EASE }}
                                    whileHover={{ y: -2 }}
                                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                            <span className="text-blue-600 font-semibold">{exam.category}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                            <span>{exam.type}</span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                                            {exam.title}
                                        </h4>
                                        <div className="text-sm text-zinc-500 flex items-center gap-3 pt-1">
                                            <span>{exam.time}</span>
                                            <span className="text-zinc-300">|</span>
                                            <span>{exam.questions} Questions</span>
                                        </div>
                                    </div>
                                    <button className="mt-4 sm:mt-0 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 group">
                                        <span>Check</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Empty Area - AI Recommendation Blue Box (Refined) */}
                    <div>
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl space-y-4">
                                    <div className="flex items-center gap-2 text-blue-100/80 text-xs font-bold uppercase tracking-widest">
                                        <Sparkles size={14} />
                                        <span>AI Recommendation</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold tracking-tight">
                                        Inorganic Chemistry Review
                                    </h3>
                                    <p className="text-blue-50/90 text-[15px] leading-relaxed max-w-lg font-medium">
                                        Based on your recent quiz results, dedicating time to this topic could significantly improve your predicted score.
                                    </p>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors group/btn">
                                        <span>Start Session</span>
                                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                                    </button>
                                </div>

                                {/* Right Side Companion Element */}
                                <div className="hidden md:block bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 w-64 shrink-0">
                                    <div className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-2">Impact</div>
                                    <div className="text-3xl font-bold mb-1">+5%</div>
                                    <div className="text-sm text-blue-100/80">Predicted score boost</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 Cols) - Recent Results */}
                <div className="lg:col-span-4 pl-0 lg:pl-8 border-l border-zinc-100 dark:border-zinc-800 hidden lg:block">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-6">Recent Activity</h3>

                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-6 hidden">Recent Activity</h3>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Activity</h3>
                            <span className="text-xs text-zinc-500 font-medium">Last 7 Days</span>
                        </div>
                        <div className="p-2">
                            {recentResults.map((result, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {result.grade}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-sm font-medium text-zinc-900 dark:text-white mb-0.5">{result.title}</h5>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span>{result.score}</span>
                                            <span className="text-zinc-300">•</span>
                                            <span>{result.date}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
                            <button className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-center">
                                View Full History
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default StudentDashboard;
