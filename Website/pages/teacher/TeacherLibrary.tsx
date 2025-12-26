import React from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, Image, Video, Download, MoreHorizontal } from 'lucide-react';

const TeacherLibrary: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Resource Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and share your teaching materials.</p>
                </div>
                <button className="btn-primary">
                    Upload New
                </button>
            </div>

            {/* Folders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Biology 101', 'Physics Labs', 'History Maps', 'Exam Archives'].map((folder, i) => (
                    <motion.div
                        key={folder}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                    >
                        <Folder size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-zinc-900 dark:text-white">{folder}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">12 files</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Files */}
            <div className="swiss-card p-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent Files</h2>
                <div className="space-y-2">
                    {[
                        { name: 'Cell_Structure_Diagram.png', type: 'image', size: '2.4 MB', date: 'Today', icon: Image, color: 'text-purple-500' },
                        { name: 'Lecture_Notes_Week4.pdf', type: 'doc', size: '1.2 MB', date: 'Yesterday', icon: FileText, color: 'text-blue-500' },
                        { name: 'Lab_Safety_Video.mp4', type: 'video', size: '45 MB', date: 'Oct 22', icon: Video, color: 'text-red-500' },
                        { name: 'Midterm_Review_Sheet.docx', type: 'doc', size: '850 KB', date: 'Oct 20', icon: FileText, color: 'text-blue-500' },
                    ].map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${file.color}`}>
                                    <file.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{file.name}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{file.size} • {file.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500">
                                    <Download size={18} />
                                </button>
                                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherLibrary;
