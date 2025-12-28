import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    BarChart3,
    CheckCircle2,
    Trophy,
    AlertCircle,
    ChevronDown,
    Maximize2,
    TrendingUp,
    HelpCircle,
    Filter
} from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'questions' | 'insights'>('overview');

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'performance', label: 'Performance' },
        { id: 'questions', label: 'Questions' },
        { id: 'insights', label: 'Insights' },
    ];

    const stats = [
        { label: 'Class Average', value: '78%', trend: '+2.4%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Highest Score', value: '98%', trend: 'Sarah Miller', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Completion Rate', value: '92%', trend: '3 Pending', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'At Risk', value: '5', trend: 'students < 60%', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    // Animation Variants
    const tabContentVariant = {
        hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
        exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Analytics</h1>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <span className="font-medium text-zinc-900 dark:text-white">Mathematics Midterm</span>
                        <span>•</span>
                        <span>Oct 24, 2024</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                        <Filter size={16} className="text-zinc-500" />
                        Filter Data
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Apple-style Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative pb-3 px-4 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        variants={tabContentVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-8"
                    >
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32">
                                    <div className="flex justify-between items-start">
                                        <span className="text-zinc-500 text-sm font-medium">{stat.label}</span>
                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stat.value}</div>
                                        <div className="text-xs font-medium text-zinc-500 mt-1">{stat.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Charts Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Score Distribution (2 Col) */}
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Score Distribution</h3>
                                    <select className="bg-zinc-50 dark:bg-zinc-800 border-none text-sm font-medium rounded-lg px-3 py-1.5 cursor-pointer outline-none">
                                        <option>Bell Curve</option>
                                        <option>Bar Chart</option>
                                    </select>
                                </div>
                                <div className="space-y-5">
                                    {[
                                        { range: '90-100 (A)', count: 5, color: 'bg-emerald-500', w: '30%' },
                                        { range: '80-89 (B)', count: 8, color: 'bg-emerald-400', w: '55%' },
                                        { range: '70-79 (C)', count: 7, color: 'bg-yellow-400', w: '45%' },
                                        { range: '60-69 (D)', count: 3, color: 'bg-orange-400', w: '20%' },
                                        { range: '<60 (F)', count: 2, color: 'bg-red-500', w: '12%' },
                                    ].map((item) => (
                                        <div key={item.range} className="flex items-center gap-4 group">
                                            <div className="w-24 text-sm font-medium text-zinc-500 group-hover:text-zinc-900 transition-colors">{item.range}</div>
                                            <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: item.w }}
                                                    className={`h-full ${item.color} rounded-full`}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                            <div className="w-8 text-right text-sm font-bold text-zinc-900 dark:text-white">{item.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Secondary Stats (1 Col) */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Quick Stats</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                            <span className="text-sm text-zinc-500">Median Score</span>
                                            <span className="text-xl font-bold text-zinc-900 dark:text-white">82%</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                            <span className="text-sm text-zinc-500">Standard Dev.</span>
                                            <span className="text-xl font-bold text-zinc-900 dark:text-white">4.2</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2">
                                            <span className="text-sm text-zinc-500">Avg Time</span>
                                            <span className="text-xl font-bold text-zinc-900 dark:text-white">45m</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/10 rounded-lg">
                                            <Users size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm uppercase tracking-wide opacity-80 mb-1">Students to Watch</h4>
                                            <div className="text-2xl font-bold mb-1">5 Students</div>
                                            <p className="text-xs text-blue-100">Scored significantly below their average.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}

                {activeTab === 'questions' && (
                    <motion.div
                        key="questions"
                        variants={tabContentVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-16">No.</th>
                                    <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-1/3">Success Rate</th>
                                    <th className="px-6 py-4 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {[
                                    { q: '1', topic: 'Algebra: Linear Equations', diff: 'Easy', rate: 85, col: 'bg-emerald-500' },
                                    { q: '2', topic: 'Calculus: Derivatives', diff: 'Hard', rate: 62, col: 'bg-orange-500' },
                                    { q: '3', topic: 'Geometry: Triangles', diff: 'Medium', rate: 78, col: 'bg-emerald-500' },
                                    { q: '4', topic: 'Trigonometry: Sine Rule', diff: 'Medium', rate: 71, col: 'bg-yellow-500' },
                                    { q: '5', topic: 'Statistics: Mean/Mode', diff: 'Easy', rate: 92, col: 'bg-emerald-500' },
                                ].map((item) => (
                                    <tr key={item.q} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Q{item.q}</td>
                                        <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">{item.topic}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${item.diff === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                                ${item.diff === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ''}
                                                ${item.diff === 'Hard' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                            `}>
                                                {item.diff}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div style={{ width: `${item.rate}%` }} className={`h-full rounded-full ${item.col}`} />
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-900 dark:text-white w-8">{item.rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Analyze</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeacherAnalytics;
