import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    Database,
    ScanLine,
    PanelLeft,
    Sun,
    Moon,
    LogOut,
    ChevronDown,
    User
} from 'lucide-react';
import RoleSwitcher from '../components/dashboard/RoleSwitcher';

type UserRole = 'student' | 'teacher' | 'admin';

interface DashboardLayoutProps {
    role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
    // State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarState');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });
    const [isDark, setIsDark] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Hooks
    const location = useLocation();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Initial Theme Check
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Persist Sidebar State
    useEffect(() => {
        localStorage.setItem('sidebarState', JSON.stringify(isDesktopSidebarOpen));
    }, [isDesktopSidebarOpen]);

    // Close User Menu on Outside Click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    const toggleSidebar = () => {
        if (window.innerWidth >= 1024) {
            setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
        } else {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }
    };

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
                    { icon: ScanLine, label: 'Grading', href: '/teacher/grading' },
                    { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
                    { icon: FileText, label: 'Exam Builder', href: '/teacher/exams' },
                    { icon: Bot, label: 'AI Assistant', href: '/teacher/ai-assistant' },
                    { icon: Settings, label: 'Settings', href: '/teacher/settings' },
                ];
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
                    { icon: Users, label: 'Users', href: '/admin/users' },
                    { icon: Database, label: 'System', href: '/admin/system' },
                    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
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
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-r border-zinc-200/60 dark:border-zinc-800/60 transform transition-transform duration-300 ease-[0.23,1,0.32,1] 
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
            >
                <div className="h-full flex flex-col p-4">
                    {/* Logo - kept compact */}
                    <div className="h-10 flex items-center px-2 mb-6">
                        <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg shadow-sm mr-2.5">
                            <span className="tracking-tighter">G</span>
                        </div>
                        <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Gradeo</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.href;
                            return (
                                <NavLink
                                    key={link.href}
                                    to={link.href}
                                    className={`relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group overflow-hidden ${isActive
                                        ? 'text-zinc-900 dark:text-white'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
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

                    {/* User Profile Menu (Bottom of Sidebar) */}
                    <div className="relative mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50" ref={userMenuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group border
                            ${isUserMenuOpen
                                    ? 'bg-white dark:bg-zinc-800 shadow-md border-zinc-200 dark:border-zinc-700/50'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-transparent'
                                }`}
                        >
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm ring-2 ring-white dark:ring-zinc-900">
                                {role.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                    {role === 'student' ? 'Ahmed Ali' : role === 'teacher' ? 'Sarah Wilson' : 'System Admin'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                                    {role === 'student' ? 'Student Plan' : role === 'teacher' ? 'Pro Teacher' : 'Enterprise'}
                                </p>
                            </div>
                            <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-zinc-900 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 p-1.5"
                                >
                                    <div className="space-y-0.5">
                                        <div className="px-3 py-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                                            <div className="flex items-center gap-3">
                                                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                                                <span>Dark Mode</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTheme();
                                                }}
                                                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 border ${isDark ? 'bg-black border-black border-opacity-20' : 'bg-zinc-200 border-transparent'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-200 bg-white ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <NavLink
                                            to={`/${role}/settings`}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <Settings size={16} />
                                            <span>Settings</span>
                                        </NavLink>

                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />

                                        <button
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600/90 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-[0.23,1,0.32,1] ${isDesktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
                {/* Header */}
                <header className="h-20 sticky top-0 z-40 px-6 lg:px-8 flex items-center justify-between bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-transparent">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-xl text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white transition-all custom-active"
                            aria-label="Toggle Sidebar"
                        >
                            <PanelLeft size={20} className={`${!isDesktopSidebarOpen && 'rotate-180'} transition-transform duration-300`} />
                        </button>

                        <div className="hidden sm:block">
                            <motion.h1
                                key={location.pathname}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight"
                            >
                                {role === 'student' ? 'Dashboard' : role === 'teacher' ? 'Teacher Portal' : 'Admin Console'}
                            </motion.h1>
                        </div>

                        {/* Breadcrumbs placeholder could go here */}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <RoleSwitcher />

                        <div className="hidden md:flex relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-11 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 w-48 lg:w-64 transition-shadow duration-200 shadow-sm group-hover:shadow-md placeholder:text-zinc-400 font-medium"
                            />
                        </div>

                        {/* Dark Mode Toggle (Header) */}
                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:shadow-md transition-all duration-200 custom-active"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:shadow-md transition-all duration-200 custom-active relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
                        </button>


                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
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
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
