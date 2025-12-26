import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Analytics</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of student performance and engagement.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Export Report</button>
                    <button className="btn-primary text-sm">Last 30 Days</button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Attendance', value: '94%', trend: '+2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Class Average', value: '82%', trend: '+1.5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'At Risk', value: '3', trend: '-1', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Tasks Completed', value: '98%', trend: 'High', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="swiss-card p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution */}
                <div className="swiss-card p-8">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Grade Distribution</h3>
                    <div className="flex items-end justify-between gap-4 h-64">
                        {[
                            { grade: 'A', count: 12, height: 80 },
                            { grade: 'B', count: 18, height: 100 },
                            { grade: 'C', count: 8, height: 40 },
                            { grade: 'D', count: 4, height: 20 },
                            { grade: 'F', count: 1, height: 10 },
                        ].map((item, i) => (
                            <div key={item.grade} className="w-full flex flex-col items-center gap-2 group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${item.height}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-xl relative overflow-hidden"
                                >
                                    <div className="absolute bottom-0 w-full bg-blue-600 h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.grade}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Assessments */}
                <div className="swiss-card p-8">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent Assessments</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Midterm Exam', date: 'Oct 20', avg: 85, color: 'bg-emerald-500' },
                            { name: 'Lab Report 3', date: 'Oct 15', avg: 78, color: 'bg-blue-500' },
                            { name: 'Quiz 4', date: 'Oct 10', avg: 92, color: 'bg-purple-500' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2">
                                    <div>
                                        <span className="font-bold text-zinc-900 dark:text-white block">{item.name}</span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.date}</span>
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-white text-lg">{item.avg}%</span>
                                </div>
                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.avg}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className={`h-full rounded-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAnalytics;
