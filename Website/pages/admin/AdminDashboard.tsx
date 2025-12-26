import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Server, AlertCircle, CheckCircle2, Database, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-10">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'System Status', value: 'Healthy', sub: 'All systems operational', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Users', value: '2,845', sub: '+124 this week', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'API Latency', value: '45ms', sub: '-12ms improvement', icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Active Alerts', value: '3', sub: '1 Critical', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => stat.label === 'Active Alerts' && navigate('/admin/system')}
                        className={`swiss-card p-8 hover:scale-[1.02] cursor-default transition-all ${stat.label === 'Active Alerts' ? 'cursor-pointer hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            {stat.label === 'System Status' && (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>
                        <h3 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{stat.value}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Server Metrics */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white px-1">Server Metrics</h2>
                    <div className="swiss-card p-8">
                        <div className="space-y-8">
                            {[
                                { label: 'CPU Usage', value: 45, color: 'bg-blue-500' },
                                { label: 'Memory Usage', value: 62, color: 'bg-purple-500' },
                                { label: 'Storage', value: 28, color: 'bg-emerald-500' },
                            ].map((metric, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-3">
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{metric.label}</span>
                                        <span className="font-bold text-zinc-900 dark:text-white tabular-nums">{metric.value}%</span>
                                    </div>
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                            className={`h-full rounded-full ${metric.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 dark:bg-white p-8 rounded-[2rem] text-white dark:text-black relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                            <div className="relative z-10">
                                <Database size={32} className="mb-6 opacity-80" />
                                <h3 className="text-xl font-bold mb-2">Database Backup</h3>
                                <p className="text-sm opacity-60 mb-8 font-medium">Last backup: 2 hours ago</p>
                                <button className="px-5 py-2.5 bg-white/10 dark:bg-black/5 rounded-xl text-sm font-bold hover:bg-white/20 dark:hover:bg-black/10 transition-colors backdrop-blur-sm">
                                    Manage Backups
                                </button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 rounded-[2rem] text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                            <div className="relative z-10">
                                <Shield size={32} className="mb-6 opacity-80" />
                                <h3 className="text-xl font-bold mb-2">Security Audit</h3>
                                <p className="text-sm opacity-60 mb-8 font-medium">System is secure</p>
                                <button className="px-5 py-2.5 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    View Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Alerts */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">System Alerts</h2>
                        <button
                            onClick={() => navigate('/admin/system')}
                            className="btn-ghost text-sm"
                        >
                            View All
                        </button>
                    </div>

                    <div className="swiss-card p-8 h-full flex flex-col">
                        <div className="space-y-4 flex-1">
                            {[
                                { title: 'High Latency Detected', desc: 'API Gateway response time > 200ms', type: 'warning', time: '10m ago' },
                                { title: 'Database Backup Success', desc: 'Daily backup completed', type: 'success', time: '2h ago' },
                                { title: 'Failed Login Attempts', desc: 'Multiple failed attempts from IP 192...', type: 'error', time: '4h ago' },
                            ].map((alert, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {alert.type === 'warning' && <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />}
                                        {alert.type === 'success' && <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />}
                                        {alert.type === 'error' && <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />}
                                        <div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">{alert.title}</h4>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{alert.desc}</p>
                                            <p className="text-[10px] text-zinc-400 mt-2 font-semibold uppercase tracking-wide">{alert.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
