import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, MoreHorizontal, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

const ClassDetail: React.FC = () => {
    const navigate = useNavigate();

    const students = [
        { id: '1', name: 'Ahmed Ali', score: 92, status: 'Excellent', trend: 'up' },
        { id: '2', name: 'Sarah Johnson', score: 88, status: 'Good', trend: 'stable' },
        { id: '3', name: 'Mike Chen', score: 74, status: 'Needs Attention', trend: 'down' },
        { id: '4', name: 'Emily Davis', score: 95, status: 'Excellent', trend: 'up' },
        { id: '5', name: 'James Wilson', score: 81, status: 'Good', trend: 'up' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Advanced Biology</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Section 3 • 24 Students</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                        + Add Student
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">Class Average</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">86%</div>
                    <p className="text-xs text-green-500 font-medium mt-1">+2.4% vs last month</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">At Risk</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">3</div>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Students below 75%</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-sm font-medium text-zinc-500">Attendance</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">98%</div>
                    <p className="text-xs text-zinc-400 font-medium mt-1">Last 30 days</p>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Students</h2>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 w-full sm:w-64"
                            />
                        </div>
                        <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-3xl">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Average Score</th>
                                <th className="px-6 py-4">Trend</th>
                                <th className="px-6 py-4 rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {students.map((student, i) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-zinc-900 dark:text-white">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                student.status === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{student.score}%</td>
                                    <td className="px-6 py-4">
                                        {student.trend === 'up' ? (
                                            <TrendingUp size={16} className="text-green-500" />
                                        ) : student.trend === 'down' ? (
                                            <TrendingUp size={16} className="text-red-500 rotate-180" />
                                        ) : (
                                            <div className="w-4 h-1 bg-zinc-300 rounded-full" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                            <ArrowRight size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassDetail;
