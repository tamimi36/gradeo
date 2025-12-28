import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    ArrowRight,
    TrendingUp,
    AlertCircle,
    Calendar,
    Clock,
    BookOpen,
    Download
} from 'lucide-react';

const ClassDetail: React.FC = () => {
    const navigate = useNavigate();

    const students = [
        { id: '1', name: 'Ahmed Ali', score: 92, status: 'Top Performer', trend: '+4%', lastActive: '2m ago' },
        { id: '2', name: 'Sarah Johnson', score: 88, status: 'On Track', trend: '+1%', lastActive: '1h ago' },
        { id: '3', name: 'Mike Chen', score: 74, status: 'At Risk', trend: '-5%', lastActive: 'Yesterday' },
        { id: '4', name: 'Emily Davis', score: 95, status: 'Top Performer', trend: '+2%', lastActive: '3h ago' },
        { id: '5', name: 'James Wilson', score: 81, status: 'On Track', trend: '0%', lastActive: '5h ago' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">

            {/* 1. Sharp Hero Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none group-hover:rotate-12 transition-transform duration-700 ease-out">
                    <BookOpen size={200} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100 dark:border-blue-800">
                            Section 301
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                            <Clock size={12} />
                            Mon/Wed • 10:00 AM
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Advanced Biology</h1>
                    <p className="text-zinc-500 max-w-xl text-lg">Comprehensive study of cellular processes, genetics, and evolutionary theory.</p>
                </div>

                <div className="flex gap-3 relative z-10 mt-6 md:mt-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
                        <Download size={18} />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-zinc-900/10 dark:shadow-white/10">
                        <Users size={18} />
                        Manage Roster
                    </button>
                </div>
            </div>

            {/* 2. Key Metrics Grid - Sharper & Polished */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Class Average', value: '86%', trend: '+2.4%', sub: 'vs last month', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Students At Risk', value: '3', trend: '-1', sub: 'needs attention', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Attendance Rate', value: '98%', trend: 'Stable', sub: 'last 30 days', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Upcoming Exam', value: '4 Days', trend: 'Unit 4', sub: 'Oct 24th', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} dark:bg-zinc-800 ${stat.color} bg-opacity-50 group-hover:scale-105 transition-transform duration-300`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 ${stat.trend.startsWith('-') ? 'text-red-500' : 'text-zinc-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* 3. Detailed Student Table - Sharper Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Student Roster</h2>
                        <p className="text-sm text-zinc-500">Manage performance and view individual reports.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 outline-none w-64 transition-all shadow-sm"
                            />
                        </div>
                        <button className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-sm">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Avg. Score</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Recent Activity</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {students.map((student, i) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-white text-sm">{student.name}</div>
                                                <div className="text-xs text-zinc-500">ID: 8821{i}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm
                                            ${student.status === 'Top Performer' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : ''}
                                            ${student.status === 'On Track' ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : ''}
                                            ${student.status === 'At Risk' ? 'bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' : ''}
                                        `}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white">{student.score}%</span>
                                            <span className={`text-xs font-bold ${student.trend.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {student.trend}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                                        Active {student.lastActive}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-3 py-1.5 hover:bg-white border border-transparent hover:border-zinc-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-600 rounded-md hover:text-zinc-900 transition-all shadow-sm text-xs font-bold">
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20 text-center">
                    <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Load More Students</button>
                </div>
            </div>
        </div>
    );
};

export default ClassDetail;
