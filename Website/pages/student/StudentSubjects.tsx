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
    ArrowRight,
    Globe
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
        { id: 'geo', name: 'Geography', score: 84, trend: '+5%', trendUp: true, color: 'teal', icon: Globe },
        { id: 'cs', name: 'Comp Science', score: 95, trend: '+8%', trendUp: true, color: 'cyan', icon: Calculator },
        { id: 'art', name: 'Art History', score: 90, trend: '+1%', trendUp: true, color: 'rose', icon: BookOpen },
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, ...transitionEase }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/student/subject/${subject.id}`)}
                        className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className={`w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white group-hover:bg-${subject.color}-50 dark:group-hover:bg-${subject.color}-900/20 group-hover:text-${subject.color}-600 transition-colors duration-300`}>
                                <subject.icon size={22} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{subject.score}%</span>
                                <div className="flex items-center gap-1 text-xs font-medium mt-0.5">
                                    <span className={subject.trendUp ? 'text-emerald-600' : 'text-red-500'}>{subject.trend}</span>
                                    <span className="text-zinc-400">vs last term</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{subject.name}</h3>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.score}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full rounded-full bg-${subject.color}-500`}
                                />
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <ArrowRight size={20} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StudentSubjects;
