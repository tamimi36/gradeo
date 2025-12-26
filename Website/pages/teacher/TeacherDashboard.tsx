import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle2, MoreHorizontal, TrendingUp, Clock, Calendar, FileText, ChevronRight, ArrowRight } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const mockClasses = [
        { name: 'Advanced Biology', section: 'Sec 3', students: 24, nextClass: '10:00 AM', id: '1' },
        { name: 'Intro to Physics', section: 'Sec 1', students: 32, nextClass: '1:00 PM', id: '2' },
        { name: 'Chemistry Lab', section: 'Lab 2', students: 18, nextClass: 'Tomorrow', id: '3' },
        { name: 'Genetics Seminar', section: 'Sem 4', students: 12, nextClass: 'Fri, 2:00 PM', id: '4' },
    ];

    const recentActivity = [
        { student: 'Ahmed Ali', action: 'submitted', target: 'Biology Midterm', time: '2m ago' },
        { student: 'Sarah Johnson', action: 'asked', target: 'Physics Question', time: '15m ago' },
        { student: 'System', action: 'generated', target: 'Weekly Report', time: '1h ago' },
        { student: 'Mike Chen', action: 'completed', target: 'Lab Safety Quiz', time: '2h ago' },
    ];

    return (
        <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="swiss-card p-8 group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Users size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">124</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Total Students</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="swiss-card p-8 group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 size={24} />
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wide">
                            94%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">85%</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Class Average</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="swiss-card p-8 group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">12</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Pending Reviews</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="swiss-card p-8 group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">3</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Upcoming Exams</p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Classes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Active Classes</h2>
                        <button className="btn-ghost text-sm flex items-center gap-1 group">
                            See all
                            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockClasses.map((cls, i) => (
                            <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="swiss-card p-6 cursor-pointer group hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800"
                                onClick={() => navigate(`/teacher/class/${cls.id}`)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shadow-sm">
                                        <Users size={22} />
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg">
                                        {cls.students} Students
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                    {cls.name}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
                                    {cls.section}
                                </p>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                        <Clock size={14} />
                                        Next: {cls.nextClass}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Recent Activity</h2>
                    </div>

                    <div className="swiss-card p-0 overflow-hidden h-full flex flex-col bg-white dark:bg-zinc-900">
                        <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-6">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-zinc-900">
                                            <FileText size={18} />
                                        </div>
                                        {i !== recentActivity.length - 1 && (
                                            <div className="w-0.5 h-full bg-zinc-100 dark:bg-zinc-800 -my-2" />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <p className="text-sm text-zinc-900 dark:text-white leading-relaxed">
                                            <span className="font-bold">{activity.student}</span> {activity.action} <span className="font-bold">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-zinc-400 font-medium mt-1">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                            <button className="w-full btn-secondary text-sm">
                                View All Activity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
