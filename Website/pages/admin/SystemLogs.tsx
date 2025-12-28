import React, { useState } from 'react';
import {
    ScanLine,
    Cpu,
    AlertCircle,
    CheckCircle2,
    Clock,
    Activity,
    Search,
    Filter,
    ArrowDownCircle,
    HardDrive,
    Database,
    Zap,
    AlertTriangle,
    XCircle,
    MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

const SystemLogs = () => {
    const [timeRange, setTimeRange] = useState('Today');

    // APPLE MOTION
    const ANIM_EASE = [0.16, 1, 0.3, 1];
    const ANIM_DURATION = 0.4;

    const logs = [
        { id: 1023, severity: 'Error', service: 'OCR Engine', msg: 'Failed to process image: invalid format', time: '10:42:05 AM', user: 'System' },
        { id: 1022, severity: 'Info', service: 'Auth', msg: 'User login success (Dr. Ahmed)', time: '10:41:12 AM', user: 'ahmed.k' },
        { id: 1021, severity: 'Warning', service: 'API Gateway', msg: 'High latency detected on /submit', time: '10:38:55 AM', user: 'System' },
        { id: 1020, severity: 'Info', service: 'Database', msg: 'Daily backup completed successfully', time: '10:00:00 AM', user: 'System' },
        { id: 1019, severity: 'Info', service: 'AI Model', msg: 'Grading batch #402 finished', time: '09:55:23 AM', user: 'System' },
        { id: 1018, severity: 'Error', service: 'Storage', msg: 'S3 Upload timeout (Region: eu-west-1)', time: '09:42:10 AM', user: 'sara.m' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header - Premium Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">System Monitoring</h1>
                    <div className="flex items-center gap-3 text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
                        </div>
                        <span className="text-zinc-300">•</span>
                        <span className="text-sm">Uptime: 99.98%</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-200 flex items-center gap-2">
                        <ArrowDownCircle size={16} />
                        <span>Export Logs</span>
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-sm">
                        <Activity size={16} />
                        <span>Live View</span>
                    </button>
                </div>
            </div>

            {/* 3-Column Layout for Metrics/Queues/Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Col 1: Processing Queues (Grid of 4) */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Queues</h3>
                        <div className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-zinc-500">REALTIME</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'OCR', value: '23', icon: ScanLine, color: 'blue', bg: 'bg-blue-50' },
                            { label: 'AI', value: '12', icon: Cpu, color: 'indigo', bg: 'bg-indigo-50' },
                            { label: 'Stats', value: '8', icon: Activity, color: 'emerald', bg: 'bg-emerald-50' },
                            { label: 'Failed', value: '3', icon: AlertCircle, color: 'red', bg: 'bg-red-50' },
                        ].map((queue, i) => (
                            <div key={i} className={`p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center justify-center gap-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-300 cursor-default`}>
                                <div className={`text-${queue.color}-500 mb-1`}>
                                    <queue.icon size={18} />
                                </div>
                                <div className="font-bold text-2xl text-zinc-900 dark:text-white leading-none">{queue.value}</div>
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{queue.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Col 2: Active Processes (List) */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Active Jobs</h3>
                        <div className="text-xs font-medium text-emerald-500">3 Running</div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: 'Calculus Midterm OCR', time: '10m ago', progress: 68, color: 'blue' },
                            { title: 'Physics Quiz Grading', time: '25m ago', progress: 92, color: 'indigo' },
                            { title: 'Weakness Analysis', time: '5m ago', progress: 45, color: 'emerald' },
                        ].map((proc, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate pr-4">{proc.title}</span>
                                    <span className="text-[10px] font-mono text-zinc-400">{proc.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${proc.color}-500 rounded-full`} style={{ width: `${proc.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Col 3: Performance Metrics */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Performance</h3>
                        <MoreHorizontal size={16} className="text-zinc-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-zinc-500">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Latency</div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">45ms</div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">-12ms</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-zinc-500">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Errs</div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">0.02%</div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Stable</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Full Width Table (Bottom) */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">

                {/* Table Toolbar */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white pl-2">System Events</h3>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                            />
                        </div>
                        <button className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                {/* Dense Logs Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="py-2 px-6 w-24 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                                <th className="py-2 px-6 w-24 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Severity</th>
                                <th className="py-2 px-6 w-32 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Service</th>
                                <th className="py-2 px-6 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Message</th>
                                <th className="py-2 px-6 w-32 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group">
                                    <td className="py-2.5 px-6 text-xs text-zinc-500 font-mono tracking-tight">{log.time}</td>
                                    <td className="py-2.5 px-6">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${log.severity === 'Error' ? 'bg-red-50 text-red-700 border-red-100' :
                                            log.severity === 'Warning' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-6 text-xs font-medium text-zinc-700 dark:text-zinc-300">{log.service}</td>
                                    <td className="py-2.5 px-6 text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[400px] font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                        {log.msg}
                                    </td>
                                    <td className="py-2.5 px-6 text-right text-xs text-zinc-500">{log.user}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </motion.div>
    );
};

export default SystemLogs;
