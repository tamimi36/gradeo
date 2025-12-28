import React from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Upload,
    Sparkles,
    FileText,
    MoreHorizontal,
    Search,
    Filter,
    ArrowRight
} from 'lucide-react';

const TeacherExamBuilder: React.FC = () => {

    // Standard Admin Motion
    const transitionEase = { duration: 0.2, ease: "easeOut" };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">

            {/* Standard Header */}
            <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Exam Builder</h1>
                    <p className="text-zinc-500 mt-1">Create, manage, and digitize assessments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                        <Filter size={16} />
                        Filter
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search drafts..."
                            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium w-64 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* 1. Standard 3-Box Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: 'Create from Scratch',
                        desc: 'Build a new exam using the question editor.',
                        icon: Plus,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        title: 'Upload PDF',
                        desc: 'Digitize an existing paper document.',
                        icon: Upload,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50 dark:bg-purple-900/20'
                    },
                    {
                        title: 'Generate with AI',
                        desc: 'Create questions from your course material.',
                        icon: Sparkles,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
                    }
                ].map((action, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        transition={transitionEase}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md cursor-pointer group transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${action.bg} ${action.color}`}>
                                <action.icon size={24} />
                            </div>
                            <div className="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {action.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* 2. Recent Drafts Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="font-bold text-zinc-900 dark:text-white">Recent Drafts</h2>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Exam Name</th>
                            <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Edited</th>
                            <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                            { name: 'Biology Unit 4 Final', subject: 'Biology 101', edited: '2 hours ago', status: 'Draft' },
                            { name: 'Physics Midterm Scans', subject: 'Physics A', edited: 'Yesterday', status: 'Processing' },
                            { name: 'History Pop Quiz', subject: 'World History', edited: '2 days ago', status: 'Ready' },
                            { name: 'Calculus Review Sheet', subject: 'Calculus AB', edited: 'Oct 24', status: 'Draft' },
                        ].map((row, i) => (
                            <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                            <FileText size={16} />
                                        </div>
                                        <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            {row.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-500 font-medium">{row.subject}</td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{row.edited}</td>
                                <td className="px-6 py-4">
                                    <span className={`
                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                        ${row.status === 'Draft' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' : ''}
                                        ${row.status === 'Processing' ? 'bg-orange-100 text-orange-600' : ''}
                                        ${row.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : ''}
                                    `}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20 text-center">
                    <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">View All Drafts</button>
                </div>
            </div>
        </div>
    );
};

export default TeacherExamBuilder;
