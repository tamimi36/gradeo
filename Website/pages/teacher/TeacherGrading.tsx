import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ScanLine,
    CheckCircle2,
    Clock,
    ChevronRight,
    FileText,
    AlertCircle,
    Loader2,
    Wifi,
    Printer,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react';

const TeacherGrading: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const liveScans = [
        { id: 1, batch: 'Calculus 101 - Midterm', count: 24, progress: 100, status: 'completed', time: 'Just now' },
        { id: 2, batch: 'Physics Quiz 3 - Sec A', count: 18, progress: 65, status: 'scanning', time: 'Scanning...' },
    ];

    const reviewQueue = [
        { id: 1, title: 'Question 4 - Ambiguous', student: 'Alex M.', exam: 'Physics Midterm', confidence: 'Low' },
        { id: 2, title: 'Handwriting Unclear', student: 'Sarah J.', exam: 'Biology Final', confidence: 'Error' },
        { id: 3, title: 'Multiple Matches', student: 'David K.', exam: 'History Unit 2', confidence: 'Medium' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">

            {/* 1. Hardware Status Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                        <div className="relative">
                            <ScanLine size={20} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Scanner Online</span>
                            <span className="text-[10px] text-emerald-600/70 font-medium">Ready for batch #294</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="flex items-center gap-3">
                        <Printer size={18} className="text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Network Printer: <span className="text-zinc-900 dark:text-white font-bold">Sleep Mode</span></span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Wifi size={18} className="text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Signal: <span className="text-zinc-900 dark:text-white font-bold">Excellent</span></span>
                    </div>
                </div>

                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                    Start New Scan
                </button>
            </motion.div>

            <div className="grid grid-cols-12 gap-8">

                {/* 2. Live Feed (Left Column) */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Active Batches</h2>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All History</button>
                    </div>

                    <div className="space-y-4">
                        {liveScans.map((scan) => (
                            <motion.div
                                key={scan.id}
                                layout
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${scan.status === 'scanning' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                            {scan.status === 'scanning' ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{scan.batch}</h3>
                                            <p className="text-sm text-zinc-500 font-medium">{scan.count} papers • {scan.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">{scan.progress}%</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${scan.status === 'scanning' ? 'bg-blue-600' : 'bg-emerald-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scan.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    {scan.status === 'completed' && (
                                        <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                            View Results <ArrowUpRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent History Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm mt-8">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Grading History</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search past exams..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm font-medium"
                                />
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Exam Name</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Papers</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase">Avg Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">Biology Unit {i} Quiz</td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">Oct {20 - i}, 2024</td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">24</td>
                                        <td className="px-6 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300">8{i}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Published</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Review Queue (Right Sidebar) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Review Queue</h2>
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">3 Pending</span>
                        </div>

                        <div className="space-y-4 flex-1">
                            {reviewQueue.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full text-left p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500">
                                            {item.exam}
                                        </span>
                                        <AlertCircle size={16} className="text-orange-500" />
                                    </div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                    <p className="text-sm text-zinc-500 mb-2">Student: {item.student}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded w-fit">
                                        Confidence: {item.confidence}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/teacher/grading/review')}
                            className="w-full mt-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            Start Review Session
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherGrading;
