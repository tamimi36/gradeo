import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Shield, User, GraduationCap, ChevronDown, ArrowUp } from 'lucide-react';

const AdminUsers: React.FC = () => {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const users = [
        { id: 1, name: 'Ahmed Ali', role: 'Student', email: 'ahmed@gradeo.com', status: 'Active', lastActive: '2 mins ago', avatar: 'A', bg: 'bg-emerald-100 text-emerald-700' },
        { id: 2, name: 'Sarah Wilson', role: 'Teacher', email: 'sarah@gradeo.com', status: 'Active', lastActive: '1 hour ago', avatar: 'S', bg: 'bg-blue-100 text-blue-700' },
        { id: 3, name: 'James Chen', role: 'Teacher', email: 'james@gradeo.com', status: 'Away', lastActive: '5 hours ago', avatar: 'J', bg: 'bg-orange-100 text-orange-700' },
        { id: 4, name: 'Emily Davis', role: 'Admin', email: 'emily@gradeo.com', status: 'Active', lastActive: 'Just now', avatar: 'E', bg: 'bg-purple-100 text-purple-700' },
        { id: 5, name: 'Robert Brown', role: 'Student', email: 'robert@gradeo.com', status: 'Inactive', lastActive: '2 days ago', avatar: 'R', bg: 'bg-zinc-100 text-zinc-700' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage system access and user roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/10 w-full md:w-64 transition-all shadow-sm hover:shadow-md"
                        />
                    </div>
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="btn-primary">
                        Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="swiss-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="w-12 px-6 py-4">
                                    <input type="checkbox" className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                </th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group hover:text-zinc-900 dark:hover:text-white transition-colors">
                                    <div className="flex items-center gap-1">
                                        User
                                        <ArrowUp size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Last Active</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${user.bg} flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-zinc-900`}>
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30' :
                                                user.role === 'Teacher' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' :
                                                    'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                            }`}>
                                            {user.role === 'Admin' && <Shield size={12} />}
                                            {user.role === 'Teacher' && <User size={12} />}
                                            {user.role === 'Student' && <GraduationCap size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-600' :
                                                user.status === 'Away' ? 'text-orange-600' : 'text-zinc-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' :
                                                    user.status === 'Away' ? 'bg-orange-500' : 'bg-zinc-400'
                                                } ring-2 ring-white dark:ring-zinc-900`} />
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                        {user.lastActive}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:shadow-md">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Showing 1-5 of 24 users</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
