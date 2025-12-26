import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import AITutor from '../../components/dashboard/AITutor';

const StudentDetail: React.FC = () => {
    const [isAIOpen, setIsAIOpen] = useState(false);

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-500 dark:text-zinc-400">
                        A
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Ahmed Ali</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Mail size={16} />
                                ahmed.ali@student.gradeo.com
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                Joined Sept 2024
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                            Message
                        </button>
                        <button
                            onClick={() => setIsAIOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Bot size={18} />
                            AI Insight
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Performance Overview</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500 mb-1">Overall Grade</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">92%</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500 mb-1">Assignments</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">12/12</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500 mb-1">Attendance</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">98%</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Advanced Biology Midterm', score: '92%', date: 'Oct 24', type: 'Exam' },
                                { title: 'Lab Report: Osmosis', score: '95%', date: 'Oct 20', type: 'Assignment' },
                                { title: 'Cell Structure Quiz', score: '88%', date: 'Oct 15', type: 'Quiz' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h4>
                                            <p className="text-xs text-zinc-500">{item.type} • {item.date}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-white">{item.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Analysis */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">AI Analysis</h2>
                    <div className="bg-gradient-to-b from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Bot size={24} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Teacher Assistant</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-indigo-100 text-sm uppercase tracking-wider mb-2">Strengths</h4>
                                <p className="text-sm leading-relaxed bg-white/10 p-3 rounded-xl border border-white/10">
                                    Ahmed shows exceptional understanding of biological systems and consistently performs well in practical lab work.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-indigo-100 text-sm uppercase tracking-wider mb-2">Areas for Growth</h4>
                                <p className="text-sm leading-relaxed bg-white/10 p-3 rounded-xl border border-white/10">
                                    Could improve participation in group discussions. Written responses tend to be brief.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsAIOpen(true)}
                                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                            >
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AITutor
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
                initialContext="Generate a detailed progress report for Ahmed Ali focusing on his recent Biology performance."
            />
        </div>
    );
};

export default StudentDetail;
