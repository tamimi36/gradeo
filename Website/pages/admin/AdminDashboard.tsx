import React from 'react';
import {
    Users,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Server,
    Activity,
    Search,
    ArrowUpRight,
    TrendingUp,
    Cpu,
    Zap,
    UserPlus,
    List,
    HardDrive,
    Database,
    Settings,
    Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const navigate = useNavigate();
    // APPLE MOTION
    const ANIM_EASE = [0.16, 1, 0.3, 1];
    const ANIM_DURATION = 0.4;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-8 pb-12 max-w-[1600px] mx-auto"
        >
            {/* Header Section - Premium Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">
                        System Overview
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg tracking-body">
                        Welcome back, Admin. <span className="text-emerald-600 font-medium">All systems operational.</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        {['Today', 'Week', 'Month'].map((t, i) => (
                            <button
                                key={t}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${i === 0
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Grid - Premium Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                {[
                    { label: 'Total Users', value: '1,240', trend: '856 active', icon: Users, color: 'blue' },
                    { label: 'Exams Created', value: '342', trend: '+12 this week', icon: FileText, color: 'indigo' },
                    { label: 'System Uptime', value: '99.8%', trend: 'Stable', icon: Server, color: 'emerald' },
                    { label: 'Storage Usage', value: '67.3%', trend: '2.4TB / 5TB', icon: HardDrive, color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 md:p-8 flex flex-col gap-4 group hover:bg-zinc-50/80 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{stat.value}</span>
                            <p className="text-sm font-medium text-zinc-500 mt-1">{stat.trend}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (8 Cols) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Critical Alerts / Quick Status - New Structure Idea */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">System Status & Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* High API Alert */}
                            <div className="p-6 rounded-xl border border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10 flex items-start gap-4">
                                <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 shrink-0">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">High API Usage</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 mb-3 leading-relaxed">
                                        OCR service is reaching 85% of daily quota.
                                    </p>
                                    <button onClick={() => navigate('/admin/analytics')} className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:underline flex items-center gap-1 uppercase tracking-wide">
                                        View Analytics <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Pending Users Alert */}
                            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 flex items-start gap-4">
                                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 shrink-0">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">3 Pending Requests</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 mb-3 leading-relaxed">
                                        New teacher verification requests awaiting review.
                                    </p>
                                    <button onClick={() => navigate('/admin/users?filter=Pending')} className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 uppercase tracking-wide">
                                        Review Users <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Health Detailed Panel - Premium Style */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Health Metrics</h3>
                            <button onClick={() => navigate('/admin/system')} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">View System Logs</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* OCR Metric */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                                            <ScanLineIcon size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">OCR Accuracy</span>
                                    </div>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">98.4%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[98.4%] rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            {/* Uptime Metric */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                                            <Server size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">System Uptime</span>
                                    </div>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">99.8%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[99.8%] rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            {/* AI Metric */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-blue-50 text-blue-600">
                                            <Cpu size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">AI Processing</span>
                                    </div>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">12 active</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-sm"></div>
                                </div>
                            </div>

                            {/* Storage Metric */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-orange-50 text-orange-600">
                                            <Database size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Storage</span>
                                    </div>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">67.3%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[67.3%] rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 Cols) - Activity Feed & Quick Actions */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Quick Actions - New Structure Idea, Premium Style */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate('/admin/users')} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center gap-3 hover:border-blue-500/50 hover:shadow-sm transition-all group">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Analytics</span>
                            </button>
                            <button onClick={() => navigate('/admin/system')} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center gap-3 hover:border-blue-500/50 hover:shadow-sm transition-all group">
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                                    <List size={20} />
                                </div>
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">System Logs</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-fit flex flex-col shadow-sm">

                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex justify-between items-center">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Activity size={18} className="text-zinc-400" />
                                System Ledger
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <button
                                    onClick={() => navigate('/admin/system')}
                                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    View All
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Feed */}
                        <div className="p-6 space-y-8">
                            <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 pl-2">Today</h4>
                                <div className="space-y-0 relative border-l border-zinc-100 dark:border-zinc-800 ml-3">
                                    {[
                                        { icon: UserPlus, color: 'blue', title: 'New Faculty Account', desc: 'Dr. Ahmed Khalil joined via Invite Link', time: '5m ago' },
                                        { icon: AlertTriangle, color: 'orange', title: 'OCR Processing Spikes', desc: 'High latency detected in US-East region', time: '12m ago' },
                                        { icon: CheckCircle2, color: 'emerald', title: 'Exam Published', desc: 'Physics 101 Midterm is now live', time: '45m ago' },
                                        { icon: UploadCloud, color: 'zinc', title: 'Batch Upload', desc: '45 papers uploaded for "Calculus A"', time: '1h ago' },
                                    ].map((item, i) => (
                                        <div key={i} className="relative pl-8 py-3 group cursor-pointer">
                                            {/* Timeline Node */}
                                            <div className={`absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 bg-${item.color}-500 shadow-sm z-10 group-hover:scale-110 transition-transform`}></div>

                                            {/* Content */}
                                            <div className="flex flex-col gap-1 p-3 -ml-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-medium text-zinc-400 whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-snug">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

// Helper Components
const ScanLineIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 9h10v6H7z" />
    </svg>
);

const UploadCloud = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
    </svg>
);

export default AdminDashboard;
