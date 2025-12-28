import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ZoomIn,
    ZoomOut,
    RotateCw,
    PenTool,
    Check,
    X,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    Save,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherGradingDetail: React.FC = () => {
    const navigate = useNavigate();
    const [activeQuestion, setActiveQuestion] = useState<number | null>(2);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1800px] mx-auto bg-zinc-50 dark:bg-black overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl my-4">

            {/* Top Bar */}
            <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            Ahmed Hassan
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase">92% Match</span>
                        </h1>
                        <p className="text-xs text-zinc-500 font-medium">Mathematics Midterm • Scanned 12m ago</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm font-medium text-zinc-500">Current Score:</span>
                        <span className="text-2xl font-bold text-blue-600">40/55</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Save size={16} />
                        Save Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        Approve Grade
                        <ArrowRight size={16} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* LEFT COLUMN: Paper Viewer (Scan) */}
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-900/50 relative overflow-hidden flex flex-col items-center justify-center p-8 group">
                    {/* Floating Toolbar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 p-2 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-zinc-500" title="Zoom Out"><ZoomOut size={18} /></button>
                        <span className="text-xs font-bold text-zinc-400 w-12 text-center">100%</span>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-zinc-500" title="Zoom In"><ZoomIn size={18} /></button>
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-zinc-500" title="Rotate"><RotateCw size={18} /></button>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-blue-600 bg-blue-50 dark:bg-blue-900/20" title="Annotate"><PenTool size={18} /></button>
                    </div>

                    {/* Paper Simulation */}
                    <div className="w-[500px] h-[700px] bg-white shadow-2xl rounded-sm relative transform transition-transform duration-200">
                        {/* Placeholder Content for Scan */}
                        <div className="absolute inset-0 p-8 opacity-60 pointer-events-none">
                            <div className="w-32 h-8 bg-zinc-200 mb-8 rounded" /> {/* Name */}
                            <div className="w-1/2 h-4 bg-zinc-100 mb-2 rounded" />
                            <div className="w-3/4 h-4 bg-zinc-100 mb-8 rounded" />

                            {/* Q1 */}
                            <div className="mb-12">
                                <div className="flex justify-between mb-2">
                                    <div className="w-1/4 h-6 bg-zinc-200 rounded" />
                                    <div className="w-8 h-8 rounded-full border-2 border-red-500 opacity-50" />
                                </div>
                                <div className="w-full h-24 bg-zinc-100 rounded-lg border-2 border-zinc-200" />
                                <div className="mt-2 text-red-500 font-handwriting text-xl transform -rotate-12 ml-4">
                                    -2 (Check formula)
                                </div>
                            </div>

                            {/* Q2 */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <div className="w-1/3 h-6 bg-zinc-200 rounded" />
                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 opacity-50" />
                                </div>
                                <div className="w-full h-32 bg-zinc-100 rounded-lg border-2 border-emerald-500/20" />
                                <div className="mt-2 text-emerald-600 font-handwriting text-xl transform -rotate-6 ml-8">
                                    Good work!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Grading Console */}
                <div className="w-[450px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col">

                    {/* List Header */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Grading Queue</h2>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">4 Questions</span>
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">2 Need Review</span>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="flex-1 overflow-y-auto">
                        {[
                            { id: 1, title: 'Linear Algebra', score: '10/10', status: 'correct' },
                            { id: 2, title: 'Calculus Limits', score: '8/15', status: 'review' },
                            { id: 3, title: 'Geometric Proofs', score: '10/10', status: 'correct' },
                            { id: 4, title: 'Word Problem', score: '12/20', status: 'review' },
                        ].map((q, i) => (
                            <div key={q.id} className="border-b border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setActiveQuestion(activeQuestion === q.id ? null : q.id)}
                                    className={`w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${activeQuestion === q.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                                            ${q.status === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}
                                        `}>
                                            Q{q.id}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{q.title}</p>
                                            <p className="text-xs text-zinc-500">AI Confidence: {q.status === 'correct' ? '98%' : 'Low (45%)'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{q.score}</span>
                                        {activeQuestion === q.id ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronRight size={16} className="text-zinc-400" />}
                                    </div>
                                </button>

                                {/* Expanded Grading Controls */}
                                {activeQuestion === q.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="bg-zinc-50 dark:bg-zinc-800/30 px-6 pb-6 pt-2 space-y-4"
                                    >
                                        {/* Score Slider/Input */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">Score</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                        min="0" max="15" defaultValue="8"
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-12 text-center text-sm font-bold border border-zinc-200 rounded-md py-1"
                                                        defaultValue="8"
                                                    />
                                                    <span className="text-xs font-bold text-zinc-400">/ 15</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feedback */}
                                        <div>
                                            <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">Feedback</label>
                                            <div className="flex gap-2 mb-2">
                                                {['Show Work', 'Formula Error', 'Good Job'].map(tag => (
                                                    <button key={tag} className="text-[10px] font-bold px-2 py-1 bg-white border border-zinc-200 rounded-md text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-20"
                                                placeholder="Add specific feedback..."
                                                defaultValue="The application of the chain rule here is incorrect. Please review the inner function derivative."
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                                <Check size={14} /> Accept
                                            </button>
                                            <button className="px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Console Footer */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
                            <span>Keyboard Shortcuts</span>
                            <span>Cmd + Enter to Approve</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherGradingDetail;
