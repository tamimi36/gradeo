import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    UserPlus,
    Filter,
    MoreHorizontal,
    Mail,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers = () => {
    const [searchParams] = useSearchParams();
    const [selectedRole, setSelectedRole] = useState('All');

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam && ['All', 'Teachers', 'Students', 'Admins', 'Pending'].includes(filterParam)) {
            setSelectedRole(filterParam);
        }
    }, [searchParams]);

    // APPLE MOTION
    const ANIM_EASE = [0.16, 1, 0.3, 1];
    const ANIM_DURATION = 0.4;

    const users = [
        {
            id: 1,
            name: "Dr. Ahmed Khalil",
            role: "Teacher",
            email: "ahmed.khalil@school.edu",
            school: "Cairo International",
            joined: "Jan 15, 2024",
            status: "Active",
            avatar: "AK",
            lastActive: "2 hours ago"
        },
        {
            id: 2,
            name: "Sara Mohamed",
            role: "Student",
            email: "sara.m@school.edu",
            school: "Cairo International",
            joined: "Jan 20, 2024",
            status: "Active",
            avatar: "SM",
            lastActive: "5 mins ago"
        },
        {
            id: 3,
            name: "John Doe",
            role: "Admin",
            email: "admin@gradeo.system",
            school: "Gradeo HQ",
            joined: "Jan 01, 2024",
            status: "Active",
            avatar: "JD",
            lastActive: "Just now"
        },
        {
            id: 4,
            name: "Fatima Ali",
            role: "Student",
            email: "fatima.ali@school.edu",
            school: "Cairo International",
            joined: "Jan 22, 2024",
            status: "Pending",
            avatar: "FA",
            lastActive: "1 day ago"
        },
        {
            id: 5,
            name: "Prof. Sarah Wilson",
            role: "Teacher",
            email: "sarah.w@school.edu",
            school: "American International",
            joined: "Jan 10, 2024",
            status: "Inactive",
            avatar: "SW",
            lastActive: "2 days ago"
        },
        {
            id: 6,
            name: "Mohamed Hany",
            role: "Student",
            email: "mohamed.h@school.edu",
            school: "Cairo International",
            joined: "Jan 25, 2024",
            status: "Active",
            avatar: "MH",
            lastActive: "3 hours ago"
        }
    ];

    const filteredUsers = users.filter(user => {
        if (selectedRole === 'All') return true;
        if (selectedRole === 'Pending') return user.status === 'Pending';
        return user.role + 's' === selectedRole || user.role === selectedRole.slice(0, -1); // Simple singular/plural match or exact match
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIM_DURATION, ease: ANIM_EASE }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">User Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg tracking-body">
                        Manage access, roles, and permissions for <span className="text-zinc-900 dark:text-white font-medium">{users.length} users</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                    <button className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-sm">
                        <UserPlus size={18} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">

                {/* Table Toolbar */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Search */}
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    {/* Tabs including Pending */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        {['All', 'Teachers', 'Students', 'Admins', 'Pending'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${selectedRole === role
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-12">
                                    <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600"></div>
                                </th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 group">
                                    <div className="flex items-center gap-1">User <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" /></div>
                                </th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">School</th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Last Active</th>
                                <th className="py-3 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="w-4 h-4 rounded border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400 transition-colors cursor-pointer"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-zinc-900 ${user.role === 'Teacher' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                user.role === 'Admin' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white' :
                                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-zinc-900 dark:text-white">{user.name}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'Teacher' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30' :
                                            user.role === 'Admin' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700' :
                                                'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {user.status === 'Active' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            {user.status === 'Pending' && <Clock size={16} className="text-orange-500" />}
                                            {user.status === 'Inactive' && <XCircle size={16} className="text-zinc-400" />}
                                            <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' :
                                                user.status === 'Pending' ? 'text-orange-700 dark:text-orange-400' :
                                                    'text-zinc-500'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <Building2 size={14} className="text-zinc-400" />
                                            {user.school}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="text-xs text-zinc-500 font-medium">{user.lastActive}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>Showing 6 of 1,240 users</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminUsers;
