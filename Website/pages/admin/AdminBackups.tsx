import React from 'react';
import { motion } from 'framer-motion';
import { Database, Download, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

const AdminBackups: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Backups</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage system backups and restoration points.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <RefreshCw size={18} />
                    Trigger Backup
                </button>
            </div>

            {/* Status Card */}
            <div className="swiss-card p-8 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Database size={20} />
                            <span className="font-medium">Primary Database</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">Healthy</h2>
                        <p className="text-zinc-400">Last backup completed successfully 2 hours ago.</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={32} />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex gap-8">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Total Size</p>
                        <p className="text-xl font-bold">48.2 GB</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Retention</p>
                        <p className="text-xl font-bold">30 Days</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Next Run</p>
                        <p className="text-xl font-bold">02:00 AM</p>
                    </div>
                </div>
            </div>

            {/* Backup History */}
            <div className="swiss-card overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-white">Backup History</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[
                        { id: 'bk_1234', date: 'Today, 02:00 AM', size: '1.2 GB', type: 'Automated', status: 'Success' },
                        { id: 'bk_1233', date: 'Yesterday, 02:00 AM', size: '1.2 GB', type: 'Automated', status: 'Success' },
                        { id: 'bk_1232', date: 'Oct 24, 02:00 AM', size: '1.1 GB', type: 'Automated', status: 'Success' },
                        { id: 'bk_1231', date: 'Oct 23, 04:30 PM', size: '1.1 GB', type: 'Manual', status: 'Success' },
                    ].map((backup, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{backup.date}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{backup.type} • {backup.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                    {backup.status}
                                </span>
                                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminBackups;
