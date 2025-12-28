import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Clock,
    MoreHorizontal,
    BookOpen,
    ChevronRight,
    Grid,
    List,
    Plus,
    Search,
    GraduationCap,
    ArrowUpRight
} from 'lucide-react';

const TeacherClasses: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const classes = [
        { id: '1', name: 'Advanced Biology', section: 'Sec 3', students: 24, nextClass: '10:00 AM', room: 'Lab 3B', avgGrade: '88%', nextTopic: 'Cellular Respiration', color: 'bg-blue-500' },
        { id: '2', name: 'Intro to Physics', section: 'Sec 1', students: 32, nextClass: '1:00 PM', room: 'Hall A', avgGrade: '76%', nextTopic: 'Newtonian Mechanics', color: 'bg-purple-500' },
        { id: '3', name: 'Chemistry Lab', section: 'Lab 2', students: 18, nextClass: 'Tomorrow', room: 'Lab 1A', avgGrade: '92%', nextTopic: 'Titration', color: 'bg-emerald-500' },
        { id: '4', name: 'Genetics Seminar', section: 'Sem 4', students: 12, nextClass: 'Fri, 2:00 PM', room: 'Conf 2', avgGrade: '95%', nextTopic: 'CRISPR Cas-9', color: 'bg-orange-500' },
        { id: '5', name: 'Bio-Ethics', section: 'Sec 2', students: 28, nextClass: 'Mon, 9:00 AM', room: 'Room 404', avgGrade: '84%', nextTopic: 'Medical Engineering', color: 'bg-pink-500' },
    ];

    const ToggleButton = ({ mode, icon: Icon }: { mode: 'grid' | 'list', icon: any }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`p-2 rounded-lg transition-colors ${viewMode === mode
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">My Classes</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-normal text-base">
                        Manage your active courses, rosters, and curriculum.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                        <ToggleButton mode="grid" icon={Grid} />
                        <ToggleButton mode="list" icon={List} />
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Class</span>
                    </button>
                </div>
            </div>

            {/* Classes Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {classes.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/teacher/class/${cls.id}`)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 group cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between h-[280px]"
                        >
                            <div className="absolute top-0 right-0 p-24 opacity-[0.03] bg-gradient-to-bl from-black to-transparent rounded-bl-full pointer-events-none" />

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${cls.color} bg-opacity-10 flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                                        <BookOpen size={20} className={cls.color.replace('bg-', 'text-')} />
                                    </div>
                                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {cls.name}
                                </h3>
                                <p className="text-sm text-zinc-500 font-medium mb-4">{cls.section}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        <Users size={14} className="text-zinc-400" />
                                        {cls.students} Students
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                        <Clock size={14} className="text-zinc-400" />
                                        Next: {cls.nextClass}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg: {cls.avgGrade}</span>
                                <button className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Class Name</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Students</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Current Topic</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Performance</th>
                                <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {classes.map((cls) => (
                                <tr key={cls.id} className="group hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/teacher/class/${cls.id}`)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${cls.color} bg-opacity-20 flex items-center justify-center`}>
                                                <BookOpen size={14} className={cls.color.replace('bg-', 'text-')} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white text-sm">{cls.name}</div>
                                                <div className="text-xs text-zinc-500">{cls.section} • {cls.room}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        {cls.nextClass}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                                    S{i}
                                                </div>
                                            ))}
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                                                +{cls.students - 3}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        {cls.nextTopic}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div style={{ width: cls.avgGrade }} className={`h-full ${cls.color.replace('bg-', 'bg-')}`} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{cls.avgGrade}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default TeacherClasses;
