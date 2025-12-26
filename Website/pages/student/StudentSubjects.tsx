import React from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    Zap,
    FlaskConical,
    Dna,
    BookOpen,
    Clock,
    TrendingUp,
    TrendingDown,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentSubjects: React.FC = () => {
    const navigate = useNavigate();

    // Motion Constants
    const transitionEase = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

    const subjects = [
        { id: 'math', name: 'Mathematics', score: 85, trend: '+3%', trendUp: true, color: 'blue', icon: Calculator },
        { id: 'physics', name: 'Physics', score: 78, trend: '+3%', trendUp: true, color: 'purple', icon: Zap },
        { id: 'chem', name: 'Chemistry', score: 92, trend: '+3%', trendUp: true, color: 'emerald', icon: FlaskConical },
        { id: 'bio', name: 'Biology', score: 88, trend: '-2%', trendUp: false, color: 'orange', icon: Dna },
        { id: 'eng', name: 'English', score: 75, trend: '+3%', trendUp: true, color: 'pink', icon: BookOpen },
        { id: 'hist', name: 'History', score: 81, trend: '+3%', trendUp: true, color: 'indigo', icon: Clock },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
            >
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">My Subjects</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg tracking-tight">Overview of your performance.</p>
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                    <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, ...transitionEase }}
                        whileHover={{
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/student/subject/${subject.id}`)}
                        className="group bg-white dark:bg-zinc-900 rounded-[1.5rem] p-8 border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all duration-150 ease-[0.16,1,0.3,1] cursor-pointer relative overflow-hidden"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${subject.color}-500/0 to-${subject.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="relative z-10 flex flex-col items-center">
                            {/* Icon Box */}
                            <div className={`w-20 h-20 rounded-3xl bg-${subject.color}-500/10 text-${subject.color}-600 dark:text-${subject.color}-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-${subject.color}-100 dark:border-${subject.color}-900/20`}>
                                <subject.icon size={36} strokeWidth={1.5} />
                            </div>

                            {/* Circular Progress */}
                            <div className="relative w-40 h-40 mb-6">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth="8"
                                        className="text-zinc-100 dark:text-zinc-800"
                                    />
                                    <motion.circle
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: subject.score / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth="8"
                                        className={`text-${subject.color}-500`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (index * 0.1) }}
                                        className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter"
                                    >
                                        {subject.score}%
                                    </motion.span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Average</span>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="text-center w-full">
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                                    {subject.name}
                                </h3>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700`}>
                                    {subject.trendUp ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                                    <span className={subject.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{subject.trend}</span>
                                </div>
                            </div>

                            {/* Hover CTA */}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StudentSubjects;
