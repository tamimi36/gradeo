import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    Bot,
    Menu,
    Bell,
    Search,
    Users,
    FileText,
    BarChart3,
    Shield,
    Database
} from 'lucide-react';
import RoleSwitcher from '../components/dashboard/RoleSwitcher';

type UserRole = 'student' | 'teacher' | 'admin';

interface DashboardLayoutProps {
    role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const getNavLinks = (role: UserRole) => {
        switch (role) {
            case 'student':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
                    { icon: FileText, label: 'Exams', href: '/student/exams' },
                    { icon: BarChart3, label: 'Progress', href: '/student/progress' },
                    { icon: BookOpen, label: 'Subjects', href: '/student/subjects' },
                    { icon: Bot, label: 'AI Tutor', href: '/student/ai-tutor' },
                    { icon: Settings, label: 'Settings', href: '/student/settings' },
                ];
            case 'teacher':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
                    { icon: Users, label: 'Classes', href: '/teacher/classes' },
                    { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
                    { icon: FileText, label: 'Exam Builder', href: '/teacher/exams' },
                    { icon: Bot, label: 'AI Assistant', href: '/teacher/ai-assistant' },
                    { icon: BookOpen, label: 'Library', href: '/teacher/library' },
                ];
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
                    { icon: Users, label: 'Users', href: '/admin/users' },
                    { icon: Shield, label: 'System', href: '/admin/system' },
                    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
                    { icon: Database, label: 'Backups', href: '/admin/backups' },
                    { icon: Settings, label: 'Settings', href: '/admin/settings' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks(role);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex font-sans selection:bg-blue-500/20">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-r border-zinc-200/60 dark:border-zinc-800/60 transform transition-transform duration-300 ease-[0.23,1,0.32,1] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="h-full flex flex-col p-5">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-3 mb-8">
                        <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] mr-3">
                            <span className="tracking-tighter">G</span>
                        </div>
                        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Gradeo</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.href;
                            return (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    className={`relative flex items-center px-4 py-3.5 text-[15px] font-medium rounded-2xl transition-all duration-300 group overflow-hidden ${isActive
                                        ? 'text-zinc-900 dark:text-white'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            initial={false}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center">
                                        <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`mr-3.5 transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-white scale-110' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                                        {link.label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User Profile Snippet */}
                    <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group active:scale-[0.98] duration-200">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-medium group-hover:bg-white group-hover:shadow-md transition-all">
                                {role.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                    {role === 'student' ? 'Ahmed Ali' : role === 'teacher' ? 'Sarah Wilson' : 'System Admin'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate capitalize">
                                    {role} Account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-72 min-h-screen transition-all duration-300">
                {/* Header */}
                <header className="h-20 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-transparent transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 rounded-xl text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 transition-all custom-active"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:block">
                            <motion.h1
                                key={location.pathname}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight"
                            >
                                {role === 'student' ? 'Welcome back, Ahmed' : role === 'teacher' ? 'Good morning, Sarah' : 'System Overview'}
                            </motion.h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <RoleSwitcher />
                        <div className="relative hidden md:block group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 w-64 transition-shadow duration-200 shadow-sm group-hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] placeholder:text-zinc-400 font-medium"
                            />
                        </div>
                        <button className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:shadow-md transition-colors duration-200 relative active:scale-95">
                            <Bell size={20} strokeWidth={2} />
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
