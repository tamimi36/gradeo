import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, FileText, Sparkles } from 'lucide-react';

const TeacherExamBuilder: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Exam Builder</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Create new assessments or upload existing ones.</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="swiss-card p-8 flex flex-col items-center text-center cursor-pointer group border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Create from Scratch</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Build an exam question by question using our editor.</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="swiss-card p-8 flex flex-col items-center text-center cursor-pointer group border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                >
                    <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Upload PDF</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload an existing exam paper for auto-digitization.</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="swiss-card p-8 flex flex-col items-center text-center cursor-pointer group border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Generate with AI</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Let AI create questions based on your topic or notes.</p>
                </motion.div>
            </div>

            {/* Recent Drafts */}
            <div className="swiss-card p-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent Drafts</h2>
                <div className="space-y-4">
                    {[
                        { title: 'Biology Unit 3 Quiz', date: 'Edited 2 hours ago', questions: 15 },
                        { title: 'Physics Midterm Draft', date: 'Edited yesterday', questions: 24 },
                        { title: 'History Pop Quiz', date: 'Edited 2 days ago', questions: 5 },
                    ].map((draft, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-white dark:bg-zinc-700 text-zinc-500 shadow-sm">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{draft.title}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{draft.date} • {draft.questions} Questions</p>
                                </div>
                            </div>
                            <button className="btn-secondary text-xs">Edit</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherExamBuilder;
