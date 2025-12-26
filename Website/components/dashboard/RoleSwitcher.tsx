import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GraduationCap, Users, Shield } from 'lucide-react';

const roles = [
    { id: 'student', label: 'Student View', icon: GraduationCap, path: '/student', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'teacher', label: 'Teacher View', icon: Users, path: '/teacher', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'admin', label: 'Admin View', icon: Shield, path: '/admin', color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const RoleSwitcher: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const currentRole = roles.find(r => location.pathname.startsWith(r.path)) || roles[0];

    const handleSwitch = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-1.5 py-1.5 pr-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-md group"
            >
                <div className={`p-2 rounded-full ${currentRole.bg} ${currentRole.color} group-hover:scale-105 transition-transform`}>
                    <currentRole.icon size={16} />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-none mb-0.5">View As</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">{currentRole.label}</p>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(8px)' }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-3 w-72 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-zinc-900/20 border border-white/20 dark:border-zinc-800 p-2 z-50 origin-top-right ring-1 ring-black/5"
                        >
                            <div className="px-4 py-3 mb-1 border-b border-zinc-100 dark:border-zinc-800/50">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Switch Perspective</p>
                            </div>
                            <div className="space-y-1">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleSwitch(role.path)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${currentRole.id === role.id
                                            ? 'bg-zinc-100 dark:bg-zinc-800 shadow-inner'
                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${role.bg} ${role.color}`}>
                                            <role.icon size={20} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className={`text-sm font-bold ${currentRole.id === role.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                {role.label}
                                            </p>
                                            <p className="text-xs text-zinc-400">Access {role.id} features</p>
                                        </div>
                                        {currentRole.id === role.id && (
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleSwitcher;
