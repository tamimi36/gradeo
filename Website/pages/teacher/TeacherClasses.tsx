import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, MoreHorizontal, BookOpen, ChevronRight } from 'lucide-react';

const TeacherClasses: React.FC = () => {
    const navigate = useNavigate();

    const classes = [
        { id: '1', name: 'Advanced Biology', section: 'Sec 3', students: 24, nextClass: '10:00 AM', color: 'bg-blue-500' },
        { id: '2', name: 'Intro to Physics', section: 'Sec 1', students: 32, nextClass: '1:00 PM', color: 'bg-purple-500' },
        { id: '3', name: 'Chemistry Lab', section: 'Lab 2', students: 18, nextClass: 'Tomorrow', color: 'bg-emerald-500' },
        { id: '4', name: 'Genetics Seminar', section: 'Sem 4', students: 12, nextClass: 'Fri, 2:00 PM', color: 'bg-orange-500' },
        { id: '5', name: 'Bio-Ethics', section: 'Sec 2', students: 28, nextClass: 'Mon, 9:00 AM', color: 'bg-pink-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">My Classes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your active courses and students.</p>
                </div>
                <button className="btn-primary">
                    Create New Class
                </button>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls, index) => (
                    <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(`/teacher/class/${cls.id}`)}
                        className="swiss-card p-6 group cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${cls.color} opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                    <BookOpen size={24} />
                                </div>
                                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                                {cls.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
                                {cls.section} • {cls.students} Students
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 py-2.5 px-3.5 rounded-xl w-fit mb-6">
                                <Clock size={14} />
                                Next: {cls.nextClass}
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                            S{i}
                                        </div>
                                    ))}
                                </div>
                                <button className="flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-white group-hover:gap-2 transition-all">
                                    Manage
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TeacherClasses;
