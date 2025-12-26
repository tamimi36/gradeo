import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    Moon,
    LogOut,
    ChevronRight,
    Smartphone,
    Mail,
    Lock,
    Globe,
    HelpCircle
} from 'lucide-react';

const StudentSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('General');

    // Apple Motion Constants
    const transitionEase = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

    const menuSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Profile Information', value: 'Ahmed Ali', color: 'bg-blue-500' },
                { icon: Mail, label: 'Email Address', value: 'ahmed@gradeo.com', color: 'bg-blue-500' },
                { icon: Lock, label: 'Password & Security', value: '', color: 'bg-blue-500' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: Bell, label: 'Notifications', value: 'On', color: 'bg-red-500' },
                { icon: Moon, label: 'Appearance', value: 'Auto', color: 'bg-indigo-500' },
                { icon: Globe, label: 'Language', value: 'English (US)', color: 'bg-blue-500' },
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help & Support', value: '', color: 'bg-zinc-500' },
                { icon: Shield, label: 'Privacy Policy', value: '', color: 'bg-indigo-500' },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
                className="mb-10 text-center"
            >
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-zinc-400">
                    AA
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Ahmed Ali</h1>
                <p className="text-zinc-500 font-medium">ahmed@gradeo.com</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...transitionEase }}
                className="space-y-8"
            >
                {menuSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-4">{section.title}</h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800 overflow-hidden shadow-sm">
                            {section.items.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: "rgba(244, 244, 245, 0.5)" }}
                                    className={`
                                        flex items-center justify-between p-4 cursor-pointer group transition-colors
                                        ${i !== section.items.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shadow-sm`}>
                                            <item.icon size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className="font-semibold text-zinc-900 dark:text-white text-[15px]">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-500 text-[15px]">{item.value}</span>
                                        <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white dark:bg-zinc-900 p-4 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center justify-center gap-2 text-red-500 font-bold text-[15px] hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/30 transition-all"
                >
                    <LogOut size={18} />
                    Sign Out
                </motion.button>
            </motion.div>

            <p className="text-center text-xs text-zinc-400 font-medium mt-10">
                Gradeo Student v4.0.1 (Build 2024.12.26)
            </p>
        </div>
    );
};

export default StudentSettings;
