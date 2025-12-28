import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, Image, Video, Download, MoreHorizontal, Search, Upload, Plus, ChevronRight, Home } from 'lucide-react';

const TeacherLibrary: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                        <Home size={14} />
                        <ChevronRight size={12} />
                        <span className="text-zinc-900 dark:text-white font-medium">Resource Library</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">My Files</h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                        <Upload size={16} />
                        <span className="hidden sm:inline">Upload</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Folder</span>
                    </button>
                </div>
            </div>

            {/* Folders Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { name: 'Biology 101', count: '128 files', size: '2.4 GB', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { name: 'Physics Labs', count: '45 files', size: '900 MB', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                    { name: 'History Maps', count: '12 files', size: '150 MB', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
                    { name: 'Exam Archives', count: '344 files', size: '4.1 GB', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                ].map((folder, i) => (
                    <motion.div
                        key={folder.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${folder.bg} ${folder.color}`}>
                                <Folder size={24} />
                            </div>
                            <button className="text-zinc-300 group-hover:text-zinc-500 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">{folder.name}</h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                            <span>{folder.count}</span>
                            <span>•</span>
                            <span>{folder.size}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Files Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Files</h2>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider w-1/3">Name</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Size</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider">Modified</th>
                            <th className="px-6 py-4 font-bold text-zinc-500 text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                            { name: 'Cell_Structure_Diagram.png', type: 'Image', size: '2.4 MB', date: 'Today at 10:23 AM', icon: Image, color: 'text-purple-500', bg: 'bg-purple-100' },
                            { name: 'Lecture_Notes_Week4.pdf', type: 'PDF Document', size: '1.2 MB', date: 'Yesterday at 4:00 PM', icon: FileText, color: 'text-red-500', bg: 'bg-red-100' },
                            { name: 'Lab_Safety_Video.mp4', type: 'Video', size: '45 MB', date: 'Oct 22, 2024', icon: Video, color: 'text-blue-500', bg: 'bg-blue-100' },
                            { name: 'Midterm_Review_Sheet.docx', type: 'Word Document', size: '850 KB', date: 'Oct 20, 2024', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
                        ].map((file, i) => (
                            <tr key={i} className="group hover:bg-zinc-50/50 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${file.bg} ${file.color} bg-opacity-20`}>
                                            <file.icon size={18} />
                                        </div>
                                        <span className="font-semibold text-zinc-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{file.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-zinc-500">
                                    {file.type}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-zinc-500 font-mono">
                                    {file.size}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-zinc-500">
                                    {file.date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default TeacherLibrary;
