import React, { useState } from 'react';
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    TrendingUp,
    UserPlus,
    Activity,
    Server,
    Zap,
    Database,
    ScanLine,
    ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState('Month');
    const ANIM_EASE = [0.16, 1, 0.3, 1];
    const ANIM_DURATION = 0.4;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-8 pb-12 max-w-[1600px] mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Analytics Overview</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg tracking-body">
                        Operational metrics and platform growth.
                    </p>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    {['Week', 'Month', 'Quarter', 'Year'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === t
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. KPI Summary Cards (Measured Tint) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: '1,240', sub: '+12% growth', icon: Users, color: 'blue', bg: 'bg-blue-50/40 dark:bg-blue-900/10' },
                    { label: 'Total Exams', value: '342', sub: '87 active', icon: FileText, color: 'indigo', bg: 'bg-indigo-50/40 dark:bg-indigo-900/10' },
                    { label: 'Total Submissions', value: '8,923', sub: '+1.2k this mo', icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50/40 dark:bg-emerald-900/10' },
                    { label: 'Avg Grading Time', value: '2.4min', sub: '-15% faster', icon: Clock, color: 'amber', bg: 'bg-amber-50/40 dark:bg-amber-900/10' },
                ].map((stat, i) => (
                    <div key={i} className={`border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ${stat.bg}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</span>

                            <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">{stat.value}</div>
                            <div className={`text-xs font-bold ${stat.sub.includes('-') && !stat.sub.includes('faster') ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'} flex items-center gap-1`}>
                                {stat.sub.includes('growth') || stat.sub.includes('faster') || stat.sub.includes('+') ? <ArrowUpRight size={12} /> : null}
                                {stat.sub}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. User Growth & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Growth Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">User Growth</h3>
                            <p className="text-sm text-zinc-500">This month's progress</p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                            Strong Growth
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-blue-50/30 dark:bg-blue-900/5 rounded-xl flex flex-col items-center justify-center text-center gap-3 border border-blue-100/50 dark:border-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-300">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">+25</div>
                                <div className="text-xs font-medium text-zinc-500">New Teachers</div>
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+20.8%</div>
                        </div>

                        <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl flex flex-col items-center justify-center text-center gap-3 border border-emerald-100/50 dark:border-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors duration-300">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">+175</div>
                                <div className="text-xs font-medium text-zinc-500">New Students</div>
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+19.0%</div>
                        </div>

                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl flex flex-col items-center justify-center text-center gap-3 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">89%</div>
                                <div className="text-xs font-medium text-zinc-500">Retention</div>
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+5.2%</div>
                        </div>

                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl flex flex-col items-center justify-center text-center gap-3 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-300">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-white">92%</div>
                                <div className="text-xs font-medium text-zinc-500">Active Users</div>
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+8.3%</div>
                        </div>
                    </div>
                </div>

                {/* User Distribution & Activity */}
                <div className="space-y-6">
                    {/* Distribution */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">User Distribution</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Teachers</span>
                                </div>
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">12% (145)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Students</span>
                                </div>
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">88% (1,095)</span>
                            </div>
                            <div className="h-2 flex w-full rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-blue-500 w-[12%]"></div>
                                <div className="h-full bg-emerald-500 w-[88%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Overview (Accent Strip) */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6 pt-2">Activity Overview</h3>
                        <div className="grid grid-cols-2 gap-4 divide-x divide-zinc-100 dark:divide-zinc-800">
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 mb-1">Daily Active</div>
                                <div className="text-3xl font-bold text-zinc-900 dark:text-white">856</div>
                                <div className="text-xs font-bold text-emerald-500 mt-1">+8.2%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-zinc-500 mb-1">Engagement</div>
                                <div className="text-3xl font-bold text-zinc-900 dark:text-white">69.0%</div>
                                <div className="text-xs font-bold text-emerald-500 mt-1">+3.5%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. System Health & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* System Health Box (4 Cols) */}
                <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-8">System Health</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {[
                            { label: 'UPTIME', value: '99.8%', icon: Server, color: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'API CALLS', value: '145K', icon: Zap, color: 'text-zinc-900 dark:text-white', iconBg: 'bg-zinc-100 dark:bg-zinc-800' },
                            { label: 'OCR ACCURACY', value: '98.4%', icon: ScanLine, color: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'STORAGE', value: '67.3%', icon: Database, color: 'text-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-3">
                                <div className={`${item.color} ${item.iconBg} p-3 rounded-xl`}>
                                    <item.icon size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold ${item.color.includes('emerald') ? 'text-emerald-500' : item.color.includes('amber') ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>{item.value}</div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">{item.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Performance Table (8 Cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">System Performance</h3>
                        <p className="text-sm text-zinc-500">Technical performance metrics</p>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {[
                                    { label: 'System Response Time', value: '250ms', status: 'GOOD', color: 'emerald' },
                                    { label: 'OCR Processing Speed', value: '3.2s/page', status: 'GOOD', color: 'emerald' },
                                    { label: 'AI Grading Accuracy', value: '96.8%', status: 'EXCELLENT', color: 'emerald' },
                                    { label: 'API Success Rate', value: '99.2%', status: 'EXCELLENT', color: 'emerald' },
                                    { label: 'Storage Usage', value: '67.3%', status: 'WARNING', color: 'amber' },
                                    { label: 'Database Query Time', value: '45ms', status: 'GOOD', color: 'emerald' },
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-zinc-900 dark:text-white">{row.label}</td>
                                        <td className={`py-4 px-6 text-sm font-bold text-${row.color}-600 dark:text-${row.color}-400`}>{row.value}</td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${row.color}-50 dark:bg-${row.color}-900/20 text-${row.color}-600 dark:text-${row.color}-400 border border-${row.color}-100 dark:border-${row.color}-900/30`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. Top Performing Classes (Rank Accent) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Top Performing Classes</h3>
                        <p className="text-sm text-zinc-500">Classes with highest average scores</p>
                    </div>
                    <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {[
                                { rank: 1, name: 'Class 12-A', sub: 'Dr. Ahmed', students: 35, score: '92%' },
                                { rank: 2, name: 'Class 11-B', sub: 'Prof. Sarah', students: 38, score: '89%' },
                                { rank: 3, name: 'Class 12-C', sub: 'Dr. Mohamed', students: 33, score: '87%' },
                                { rank: 4, name: 'Class 10-A', sub: 'Ms. Fatima', students: 42, score: '86%' },
                                { rank: 5, name: 'Class 11-A', sub: 'Dr. Omar', students: 36, score: '84%' },
                            ].map((cls, i) => (
                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-4 px-6 w-16">
                                        {i < 3 ? (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                i === 1 ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300' :
                                                    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                #{cls.rank}
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-zinc-400 ml-2">#{cls.rank}</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-zinc-900 dark:text-white">{cls.name}</div>
                                        <div className="text-xs text-zinc-500">{cls.sub}</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-500">
                                        {cls.students} students
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`text-lg font-bold ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-300'}`}>{cls.score}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </motion.div>
    );
};

export default AdminAnalytics;
