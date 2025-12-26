import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Globe, Mail, Bell, Database, Server } from 'lucide-react';

const AdminSettings: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">System Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure global platform settings and security policies.</p>
            </div>

            {/* Settings Groups */}
            <div className="space-y-6">
                <div className="swiss-card overflow-hidden">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Shield size={18} className="text-blue-500" />
                            Security & Access
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                            { label: 'Two-Factor Authentication', desc: 'Enforce 2FA for all admin accounts', active: true },
                            { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', active: true },
                            { label: 'IP Whitelisting', desc: 'Restrict admin access to specific IP ranges', active: false },
                        ].map((item, i) => (
                            <div key={i} className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{item.label}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.active ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="swiss-card overflow-hidden">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Server size={18} className="text-purple-500" />
                            Infrastructure
                        </h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {[
                            { label: 'Maintenance Mode', desc: 'Disable user access for system updates', active: false },
                            { label: 'Debug Logging', desc: 'Enable verbose logging for troubleshooting', active: false },
                        ].map((item, i) => (
                            <div key={i} className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{item.label}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.active ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
