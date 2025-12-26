import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    ArrowRight,
    FileText,
    Search,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentExams: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Motion Constants
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
        <div className="space-y-8 pb-10">
            {/* Header & Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Exams & Quizzes</h1>
                    <p className="text-zinc-500 font-medium text-lg tracking-tight">Manage your schedule and track your results.</p>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search exams..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 transition-all font-medium text-sm shadow-sm group-hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] placeholder:text-zinc-400"
                    />
                </div>
            </motion.div>

            {/* Filter Chips & Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transitionEase, delay: 0.1 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2"
            >
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {filters.map(filter => (
                        <motion.button
                            key={filter}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeFilter === filter
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black shadow-lg shadow-zinc-900/10 dark:shadow-none'
                                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            {filter}
                        </motion.button>
                    ))}
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl flex items-center w-full md:w-auto ring-1 ring-inset ring-zinc-200/50 dark:ring-zinc-800">
                    {['upcoming', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-xs transition-all capitalize ${activeTab === tab
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            {tab === 'past' ? 'Past Results' : tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Exam List */}
            <div className="grid gap-5">
                <AnimatePresence mode="popLayout">
                    {filteredExams.map((exam, index) => (
                        <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ delay: index * 0.05, ...transitionEase }}
                            whileHover={{
                                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
                            }}
                            whileTap={{ scale: 0.99 }}
                            className="bg-white dark:bg-zinc-900 rounded-[1.25rem] p-6 border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all duration-150 ease-[0.16,1,0.3,1] flex flex-col md:flex-row items-center justify-between gap-6 group cursor-default"
                        >
                            <div className="flex items-center gap-6 w-full">
                                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300
                                    ${exam.status === 'upcoming' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-600' : ''}
                                    ${exam.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' : ''}
                                    ${exam.status === 'missed' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600' : ''}
                                `}>
                                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{exam.date.split(' ')[0]}</span>
                                    <span className="text-3xl font-black leading-none tracking-tighter">{exam.date.split(' ')[1].replace(',', '')}</span>
                                </div>

                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wide border border-zinc-200/50 dark:border-zinc-700">
                                            {exam.category} • {exam.type}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                        {exam.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
                                        <div className="flex items-center gap-1.5"><Clock size={15} className="text-zinc-400" /> {exam.time}</div>
                                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-1.5"><FileText size={15} className="text-zinc-400" /> {exam.duration}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex items-center justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                                {exam.status === 'upcoming' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                                        className="w-full md:w-auto px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl shadow-zinc-900/10 dark:shadow-none hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Now <ArrowRight size={18} />
                                    </motion.button>
                                ) : (
                                    <div className="flex items-center gap-6 w-full justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-zinc-900 dark:text-white leading-none mb-1">{exam.score}%</div>
                                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Score</div>
                                        </div>
                                        <button className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95">
                                            <ChevronRight size={22} strokeWidth={2.5} />
                                        </button>
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
                        className="py-20 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[1.5rem] border border-dashed border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <Calendar size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No exams found</h3>
                        <p className="text-zinc-500 font-medium tracking-tight">Try adjusting your filters or search terms.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudentExams;
