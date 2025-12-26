import React from 'react';
import { motion } from 'framer-motion';
import { Users, Server, Activity, Globe } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Platform Analytics</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time system performance and usage statistics.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: '1.2M', trend: '+12%', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Response', value: '45ms', trend: '-5ms', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Active Sessions', value: '842', trend: '+24', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Server Load', value: '32%', trend: 'Stable', icon: Server, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="swiss-card p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Chart */}
                <div className="swiss-card p-8">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Traffic Overview</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                                className="w-full bg-blue-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                            />
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="swiss-card p-8">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">System Health</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'API Gateway', status: 'Operational', uptime: '99.99%', color: 'bg-emerald-500' },
                            { name: 'Database Cluster', status: 'Operational', uptime: '99.95%', color: 'bg-emerald-500' },
                            { name: 'Storage Service', status: 'Maintenance', uptime: '98.50%', color: 'bg-orange-500' },
                            { name: 'Auth Service', status: 'Operational', uptime: '99.99%', color: 'bg-emerald-500' },
                        ].map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${service.color}`} />
                                    <span className="font-bold text-zinc-900 dark:text-white">{service.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{service.status}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{service.uptime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
