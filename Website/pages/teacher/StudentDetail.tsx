import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Mail,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    X,
    MessageSquare,
    FileText,
    MoreHorizontal,
    Sparkles,
    ArrowRight
} from 'lucide-react';

const StudentDetail: React.FC = () => {
    const [isAIActive, setIsAIActive] = useState(false);

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 max-w-[1800px] mx-auto pb-6">

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">

                {/* 1. Premium Profile Header */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden group shrink-0">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-start gap-8">
                            <div className="w-32 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-400 shadow-inner border border-zinc-200/50 dark:border-zinc-700">
                                AA
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Ahmed Ali</h1>
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                        Top Performer
                                    </span>
                                </div>
                                <p className="text-zinc-500 text-lg mb-6 max-w-lg">Consistently demonstrates strong analytical skills in biology and chemistry. Active participant in lab sessions.</p>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                                        <Mail size={16} className="text-zinc-400" />
                                        ahmed.ali@student.gradeo.com
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                                        <Calendar size={16} className="text-zinc-400" />
                                        Joined Sept 2024
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Console */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setIsAIActive(!isAIActive)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm border ${isAIActive
                                    ? 'bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-500/20'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                                    }`}
                            >
                                <Sparkles size={18} className={isAIActive ? 'text-indigo-200' : 'text-indigo-500'} />
                                {isAIActive ? 'Close AI Insight' : 'Open AI Insight'}
                            </button>
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                                    <MessageSquare size={18} /> Message
                                </button>
                                <button className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Stats & Analytics Row - Sharper */}
                <div className="grid grid-cols-3 gap-6 shrink-0 h-40">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-blue-500/30 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">+4.2%</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">92%</h3>
                            <p className="text-zinc-500 font-medium text-sm">Overall Average</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-orange-500/30 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
                                <AlertCircle size={24} />
                            </div>
                            <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">2 Pending</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">96%</h3>
                            <p className="text-zinc-500 font-medium text-sm">Submission Rate</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-purple-500/30 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
                                <Bot size={24} />
                            </div>
                            <span className="text-xs font-bold text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md border border-purple-100 dark:border-purple-800">Active</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">32</h3>
                            <p className="text-zinc-500 font-medium text-sm">AI Tutor Sessions</p>
                        </div>
                    </div>
                </div>

                {/* 3. Recent Activity List - Sharper */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900 backdrop-blur-sm">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Academic History</h3>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All History</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {[
                            { title: 'Advanced Biology Midterm', score: '92%', date: 'Oct 24', type: 'Exam', status: 'Graded' },
                            { title: 'Lab Report: Osmosis', score: '95%', date: 'Oct 20', type: 'Assignment', status: 'Graded' },
                            { title: 'Cell Structure Quiz', score: '88%', date: 'Oct 15', type: 'Quiz', status: 'Graded' },
                            { title: 'Genetics Project', score: '--', date: 'Due Tomorrow', type: 'Project', status: 'Pending' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-all group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 mb-2 hover:shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-lg ${item.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-600'} dark:bg-zinc-800 dark:text-zinc-400`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-base mb-1">{item.title}</h4>
                                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{item.type} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${item.score === '--' ? 'text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>{item.score}</div>
                                    <span className={`text-xs font-bold ${item.status === 'Pending' ? 'text-orange-500' : 'text-emerald-500'}`}>{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Dedicated AI Insight Panel - Sharper */}
            <AnimatePresence>
                {isAIActive && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 400, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative shrink-0"
                    >
                        {/* AI Header */}
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <Sparkles size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">Gradeo Intelligence</h2>
                                        <p className="text-zinc-400 text-xs font-medium"> analyzing student data...</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAIActive(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* AI Content Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Insight Card 1 */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700/50"
                            >
                                <div className="flex gap-3 mb-3">
                                    <TrendingUp size={18} className="text-emerald-400" />
                                    <h3 className="text-zinc-200 font-bold text-sm">Performance Surge</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Ahmed has shown a <span className="text-emerald-400 font-bold">12% improvement</span> in lab-based assessments over the last month. Using more visual learning aids seems to be effective.
                                </p>
                            </motion.div>

                            {/* Insight Card 2 */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-700/50"
                            >
                                <div className="flex gap-3 mb-3">
                                    <AlertCircle size={18} className="text-orange-400" />
                                    <h3 className="text-zinc-200 font-bold text-sm">Focus Area Detected</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                    Brief responses in essay questions suggest a need for more practice in structured writing.
                                </p>
                                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-900/20">
                                    Generate Practice Assignment
                                </button>
                            </motion.div>

                            {/* Chat Interface Placeholder */}
                            <div className="border-t border-zinc-800 pt-6 mt-6">
                                <p className="text-zinc-500 text-xs font-bold uppercase mb-4">Ask Gradeo AI</p>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg text-zinc-300 text-sm transition-colors border border-zinc-800 hover:border-zinc-700 truncate">
                                        "Draft a progress email to parents..."
                                    </button>
                                    <button className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg text-zinc-300 text-sm transition-colors border border-zinc-800 hover:border-zinc-700 truncate">
                                        "Compare performance with class average..."
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask anything about Ahmed..."
                                    className="w-full bg-zinc-800 border-none rounded-lg py-3 pl-4 pr-10 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default StudentDetail;
