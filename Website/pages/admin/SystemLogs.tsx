import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, Search, Filter, Download, Server, RefreshCw } from 'lucide-react';

const SystemLogs: React.FC = () => {
    const logs = [
        { id: '1', level: 'error', message: 'Database connection timeout', service: 'Auth Service', time: '2 mins ago' },
        { id: '2', level: 'warning', message: 'High memory usage detected', service: 'API Gateway', time: '15 mins ago' },
        { id: '3', level: 'info', message: 'Scheduled backup completed', service: 'Backup Service', time: '1 hour ago' },
        { id: '4', level: 'info', message: 'User batch import started', service: 'User Service', time: '2 hours ago' },
        { id: '5', level: 'error', message: 'Failed to process payment webhook', service: 'Payment Service', time: '3 hours ago' },
        { id: '6', level: 'info', message: 'System update applied successfully', service: 'System', time: '5 hours ago' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">System Logs</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Monitor system activities and alerts</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <Download size={16} />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">Critical Errors</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">12</div>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Last 24 hours</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <Info size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">Warnings</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">45</div>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Last 24 hours</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Server size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">Total Events</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">1.2k</div>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Last 24 hours</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 w-full sm:w-64"
                            />
                        </div>
                        <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-3xl">Level</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4 rounded-tr-3xl">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {logs.map((log, i) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${log.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                log.level === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {log.level === 'error' && <AlertCircle size={14} />}
                                            {log.level === 'warning' && <Info size={14} />}
                                            {log.level === 'info' && <CheckCircle2 size={14} />}
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{log.message}</td>
                                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{log.service}</td>
                                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{log.time}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
