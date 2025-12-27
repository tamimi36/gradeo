import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    ArrowRight,
    FileText,
    Search,
    ChevronRight,
    Calendar,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentExams: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Strict Motion
    const transitionEase = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

    const filters = ['All', 'Exams', 'Quizzes', 'Assignments'];

    const exams = [
        { id: 1, title: 'Calculus I Midterm', date: 'Oct 24, 2024', time: '09:00 AM', duration: '90 min', type: 'Exam', status: 'upcoming', category: 'Math' },
        { id: 2, title: 'Physics Quiz: Kinematics', date: 'Oct 26, 2024', time: '02:00 PM', duration: '45 min', type: 'Quiz', status: 'upcoming', category: 'Science' },
        { id: 3, title: 'Chemistry Lab Safety', date: 'Oct 20, 2024', time: '10:00 AM', duration: '30 min', type: 'Quiz', status: 'missed', category: 'Science' },
        { id: 4, title: 'English Literature Final', date: 'Oct 15, 2024', time: '01:00 PM', duration: '120 min', type: 'Exam', status: 'completed', score: 92, category: 'English' },
    ];

    const filteredExams = exams.filter(exam => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Exams') return exam.type === 'Exam';
        if (activeFilter === 'Quizzes') return exam.type === 'Quiz';
        return true;
    }).filter(exam => {
        if (activeTab === 'upcoming') return exam.status === 'upcoming' || exam.status === 'missed';
        return exam.status === 'completed';
    });

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header & Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800"
            >
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-editorial mb-2">Exams & Quizzes</h1>
                    <p className="text-zinc-500 font-normal text-lg tracking-body">Manage your schedule and track your results.</p>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:bg-white focus:border-zinc-200 dark:focus:border-zinc-700 focus:outline-none transition-colors duration-200 font-medium text-sm placeholder:text-zinc-400"
                    />
                </div>
            </motion.div>

            {/* Filter Chips & Tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...transitionEase, delay: 0.1 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeFilter === filter
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black'
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg flex items-center w-full md:w-auto">
                    {['upcoming', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 md:flex-none px-4 py-1.5 rounded-md font-medium text-xs transition-all capitalize ${activeTab === tab
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            {tab === 'past' ? 'Past' : tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Exam List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredExams.map((exam, index) => (
                        <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: index * 0.05, ...transitionEase }}
                            className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col md:flex-row items-center justify-between gap-6 group"
                        >
                            <div className="flex items-center gap-6 w-full">
                                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border shrink-0 
                                    ${exam.status === 'upcoming' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : ''}
                                    ${exam.status === 'completed' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : ''}
                                    ${exam.status === 'missed' ? 'bg-red-50 border-red-100 text-red-600' : ''}
                                `}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 leading-none mb-1">{exam.date.split(' ')[0]}</span>
                                    <span className="text-2xl font-semibold leading-none tracking-tight">{exam.date.split(' ')[1].replace(',', '')}</span>
                                </div>

                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                            {exam.category} • {exam.type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                                        {exam.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                                        <div className="flex items-center gap-1.5"><Clock size={14} className="text-zinc-400" /> {exam.time}</div>
                                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-1.5"><FileText size={14} className="text-zinc-400" /> {exam.duration}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex items-center justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                                {exam.status === 'upcoming' ? (
                                    <button
                                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                                        className="w-full md:w-auto px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <span>Check</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-6 w-full justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-white leading-none mb-1">{exam.score}%</div>
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Score</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredExams.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">No exams found</h3>
                        <p className="text-zinc-500 font-medium">Try adjusting your filters.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudentExams;
