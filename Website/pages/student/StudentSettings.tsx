import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Bell,
    Shield,
    Moon,
    LogOut,
    ChevronRight,
    Globe,
    HelpCircle,
    Mail,
    Lock
} from 'lucide-react';

const StudentSettings: React.FC = () => {
    // Apple Motion Constants
    const transitionEase = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

    const menuSections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Profile Information', value: 'Ahmed Ali' },
                { icon: Mail, label: 'Email Address', value: 'ahmed@gradeo.com' },
                { icon: Lock, label: 'Password & Security', value: 'Last changed 30d ago' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: Bell, label: 'Notifications', value: 'On', type: 'toggle', active: true },
                { icon: Moon, label: 'Appearance', value: 'Auto', type: 'select' },
                { icon: Globe, label: 'Language', value: 'English (US)', type: 'select' },
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help & Support', value: '' },
                { icon: Shield, label: 'Privacy Policy', value: '' },
            ]
        }
    ];

    const Toggle = ({ active }: { active: boolean }) => (
        <div className={`w-[50px] h-[30px] rounded-full p-[2px] cursor-pointer transition-colors duration-200 ${active ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
            <motion.div
                className={`w-[26px] h-[26px] bg-white dark:bg-zinc-900 rounded-full shadow-sm`}
                animate={{ x: active ? 20 : 0 }}
                transition={{ type: "tween", duration: 0.18, ease: "easeInOut" }}
            />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-12 pt-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitionEase}
                className="mb-14"
            >
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">Profile</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-lg font-bold text-zinc-400">
                        AA
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Ahmed Ali</h1>
                        <p className="text-zinc-500 font-medium text-xs">ahmed@gradeo.com</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, ...transitionEase }}
                className="space-y-14"
            >
                {menuSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">{section.title}</h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            {section.items.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                    className={`
                                        flex items-center justify-between p-4 cursor-pointer transition-colors
                                        ${i !== section.items.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-zinc-500 dark:text-zinc-400">
                                            <item.icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <span className="font-medium text-zinc-900 dark:text-white text-[15px]">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {item.type === 'toggle' ? (
                                            <Toggle active={!!item.active} />
                                        ) : (
                                            <>
                                                <span className="text-zinc-500 dark:text-zinc-500 text-[15px]">{item.value}</span>
                                                <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600" strokeWidth={2} />
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-6 px-4">
                    <button
                        className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-red-600 font-medium text-[15px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                    >
                        Sign Out
                    </button>
                    <p className="text-center text-xs text-zinc-300 font-medium mt-6">
                        Gradeo v4.0.1
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentSettings;
