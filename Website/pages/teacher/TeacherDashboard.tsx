import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    ChevronRight,
    TrendingUp,
    FileCheck,
    AlertCircle,
    Calendar,
    ArrowUpRight,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();

    // APPLE MOTION CONSTANTS
    const transitionEase = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };
    const stagger = 0.08;

    return (
        <div className="max-w-[1600px] mx-auto pb-12 space-y-8">
            {/* Header / Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
                className="flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6"
            >
                <div className="space-y-1">
                    <span className="text-zinc-500 font-medium text-sm uppercase tracking-wide">Overview</span>
                    <h1 className="text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight">Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                        Winter Semester 2024
                    </span>
                    <button className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-zinc-900/10 hover:scale-105 transition-transform">
                        <Calendar size={16} />
                        Schedule
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Active Students', value: '142', icon: Users, color: 'text-blue-500', trend: '+12%' },
                            { label: 'Pending Reviews', value: '8', icon: FileText, color: 'text-orange-500', trend: '-2' },
                            { label: 'Class Average', value: '84%', icon: TrendingUp, color: 'text-emerald-500', trend: '+1.4%' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...transitionEase, delay: i * stagger }}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 ${stat.color} bg-opacity-10`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-500 bg-zinc-100'}`}>
                                        {stat.trend}
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
                                    {stat.value}
                                </h3>
                                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pending Reviews Section (Expanded) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...transitionEase, delay: 0.2 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Needs Review</h2>
                                <p className="text-zinc-500 text-sm">You have 8 pending items to grade.</p>
                            </div>
                            <button
                                onClick={() => navigate('/teacher/grading')}
                                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                Go to Grading <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { title: 'Physics Midterm - Section 3', count: 5, time: '2h ago', bg: 'bg-orange-50 text-orange-600' },
                                { title: 'Biology Lab Report', count: 3, time: '5h ago', bg: 'bg-blue-50 text-blue-600' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${item.bg}`}>
                                            {item.count}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                            <p className="text-xs text-zinc-500">Submitted {item.time}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full text-zinc-300 group-hover:text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-all">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chart/Analysis Placeholder */}
                    <div className="grid grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...transitionEase, delay: 0.3 }}
                            className="bg-zinc-900 text-white rounded-2xl p-8 relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-zinc-400 mb-6">
                                    <Sparkles size={16} className="text-yellow-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">AI Insights</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Class Performance is up 12%</h3>
                                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                    Students in <strong>Advanced Biology</strong> are showing significant improvement in genetics topics compared to last year.
                                </p>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                    View Analysis
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...transitionEase, delay: 0.4 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Upcoming Events</h3>
                                <p className="text-zinc-500 text-xs">Next 24 Hours</p>
                            </div>

                            <div className="space-y-4 mt-6">
                                <div className="flex gap-4 items-start">
                                    <div className="text-center w-12 pt-1">
                                        <div className="text-xs font-bold text-zinc-400">10:00</div>
                                        <div className="text-[10px] text-zinc-300">AM</div>
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-l-4 border-blue-500">
                                        <div className="font-bold text-zinc-900 dark:text-white text-sm">Advanced Biology</div>
                                        <div className="text-xs text-zinc-500">Lecture: DNA Replication</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="text-center w-12 pt-1">
                                        <div className="text-xs font-bold text-zinc-400">1:00</div>
                                        <div className="text-[10px] text-zinc-300">PM</div>
                                    </div>
                                    <div className="flex-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-l-4 border-purple-500">
                                        <div className="font-bold text-zinc-900 dark:text-white text-sm">Intro to Physics</div>
                                        <div className="text-xs text-zinc-500">Lab: Motion & Forces</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Sidebar - Activity Feed */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...transitionEase, delay: 0.5 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Recent Activity</h3>
                        <div className="relative space-y-8 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-800">
                            {[
                                { title: 'New Grade Published', desc: 'Midterm Physics', time: '10m ago', icon: CheckCircle2, bg: 'bg-emerald-500' },
                                { title: 'Exam Scheduled', desc: 'Biology Final', time: '2h ago', icon: Calendar, bg: 'bg-blue-500' },
                                { title: 'Submission', desc: 'John D. - Late', time: '4h ago', icon: FileText, bg: 'bg-orange-500' },
                                { title: 'System Alert', desc: 'Maintenance tonight', time: '1d ago', icon: AlertCircle, bg: 'bg-zinc-500' },
                            ].map((item, i) => (
                                <div key={i} className="relative flex items-start gap-4">
                                    <div className={`relative z-10 w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-sm ${item.bg} text-white`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{item.title}</h4>
                                        <p className="text-xs text-zinc-500">{item.desc}</p>
                                        <span className="text-[10px] text-zinc-400 font-medium mt-1 block">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            View Full History
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
