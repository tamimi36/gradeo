import React from 'react';
import {
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Sparkles,
    ArrowLeft,
    TrendingUp,
    BookOpen,
    Clock,
    FileText
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const StudentExamView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleStartChat = () => {
        navigate(`/student/ai-tutor?topic=Exam Prep`);
    };

    return (
        <div className="pb-10 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/student/exams')}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                    >
                        <ArrowLeft size={20} className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Calculus I Midterm
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Exam Analysis & Breakdown</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Main Stats Card (4 cols) */}
                    <div className="md:col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                            <div className="relative w-48 h-48 mb-6">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                                    <circle
                                        cx="96" cy="96" r="84"
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth="12"
                                        className="text-zinc-100 dark:text-zinc-800"
                                    />
                                    <circle
                                        cx="96" cy="96" r="84"
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth="12"
                                        className="text-blue-600"
                                        strokeDasharray="527.79"
                                        strokeDashoffset={527.79 - (527.79 * 92) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">92%</span>
                                    <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest mt-1">Score</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-900/30 mb-6">
                                <TrendingUp size={14} />
                                Top 10% of Class
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center">
                                    <span className="text-xl font-bold text-zinc-900 dark:text-white">23</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Correct</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center">
                                    <span className="text-xl font-bold text-zinc-900 dark:text-white">90m</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Time</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden group shadow-lg shadow-indigo-500/20">
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <Sparkles size={24} className="text-indigo-200" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Review Mistakes?</h3>
                                <p className="text-indigo-100 font-medium text-sm mb-6">AI Tutor can explain where you lost points and why.</p>
                                <button
                                    onClick={handleStartChat}
                                    className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                                >
                                    Start Review <ChevronRight size={16} />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Sparkles size={120} />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown (8 cols) */}
                    <div className="md:col-span-12 lg:col-span-8 space-y-6">
                        {/* Strengths */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                            <h4 className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                Strongest Sections
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:scale-[1.01] transition-transform">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">1</div>
                                    <div>
                                        <h5 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Differentiation Rules</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Perfect score on Chain Rule and Product Rule questions.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 hover:scale-[1.01] transition-transform">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">2</div>
                                    <div>
                                        <h5 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Limits at Infinity</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Correctly identified all horizontal asymptotes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                            <h4 className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <AlertCircle size={16} className="text-orange-500" />
                                Review Needed
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 hover:scale-[1.01] transition-transform">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">1</div>
                                    <div>
                                        <h5 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Related Rates</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Difficulty setting up the initial geometric equation.</p>
                                    </div>
                                    <button onClick={handleStartChat} className="ml-auto text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-50 transition-colors">Review</button>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 hover:scale-[1.01] transition-transform">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">2</div>
                                    <div>
                                        <h5 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">Optimization</h5>
                                        <p className="text-xs text-zinc-500 font-medium">Calculation error in finding critical points.</p>
                                    </div>
                                    <button onClick={handleStartChat} className="ml-auto text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-50 transition-colors">Review</button>
                                </div>
                            </div>
                        </div>

                        {/* Exam Timeline/Topics */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <h4 className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest">
                                    <FileText size={16} className="text-zinc-500" />
                                    Exam Content Breakdown
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Section A: Limits (15%)', 'Section B: Derivatives (45%)', 'Section C: Applications (30%)', 'Section D: Proofs (10%)'].map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{topic}</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentExamView;
