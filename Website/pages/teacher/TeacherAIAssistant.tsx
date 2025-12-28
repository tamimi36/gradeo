import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Bot, User, GraduationCap, AlertCircle, ChevronRight, Plus, MoreHorizontal, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherAIAssistant: React.FC = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Context Selection State
    const [contextMode, setContextMode] = useState<'exams' | 'students'>('exams');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const contexts = {
        exams: [
            { id: 'exam-1', title: 'Calculus I Midterm', subtitle: '128 Students • Oct 24', icon: GraduationCap },
            { id: 'exam-2', title: 'Physics Final', subtitle: '94 Students • Nov 12', icon: GraduationCap },
            { id: 'exam-3', title: 'Algebra Quiz 4', subtitle: '112 Students • Oct 10', icon: GraduationCap },
        ],
        students: [
            { id: 'student-1', title: 'Ahmed Hassan', subtitle: 'Grade: A • 98% Avg', icon: User },
            { id: 'student-2', title: 'Sarah Miller', subtitle: 'Grade: B+ • 88% Avg', icon: User },
            { id: 'student-3', title: 'Mike Ross', subtitle: 'Grade: C • 74% Avg', icon: User },
        ]
    };

    const currentContext = selectedId ? contexts[contextMode].find(c => c.id === selectedId) : null;

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Good morning, Professor. I've analyzed the recent Calculus Midterm results. There's a notable pattern of errors in negative sign operations affecting 15% of students. How would you like to proceed?"
        },
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentContext]);

    const handleSend = () => {
        if (!inputValue.trim() || !currentContext) return;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'teacher', text: inputValue }]);
        setInputValue('');

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: `I'll analyze the data for ${currentContext.title}. Based on the performance metrics, I recommend focusing on the lowest scoring questions first.`
            }]);
        }, 1000);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-[#f9f9f9] dark:bg-black font-sans overflow-hidden">

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative min-w-0">

                {/* 2. Top AI Header - GPT-Level */}
                <div className="h-16 flex items-center justify-between px-6 sticky top-0 z-10 bg-[#f9f9f9]/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 py-1.5 px-3 rounded-full border border-black/5 dark:border-white/10 shadow-sm transition-colors">
                        <span className="text-zinc-500 dark:text-zinc-400">
                            <Sparkles size={16} />
                        </span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                            Teacher Assistant {currentContext && <><span className="text-zinc-300 mx-1">/</span> {currentContext.title}</>}
                        </span>
                        {currentContext && <ChevronRight size={14} className="text-zinc-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </span>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-zinc-500 transition-colors"
                        >
                            <History size={18} />
                        </button>
                    </div>
                </div>

                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-0 scroll-smooth">
                    {currentContext ? (
                        <div className="max-w-3xl mx-auto py-8 space-y-8">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    key={msg.id}
                                    className={`flex gap-4 ${msg.sender === 'teacher' ? 'justify-end' : ''}`}
                                >
                                    {/* AI Avatar */}
                                    {msg.sender === 'ai' && (
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                            <Sparkles size={16} className="text-indigo-500" />
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === 'teacher' ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                        px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed
                                        ${msg.sender === 'teacher'
                                                ? 'bg-[#1a1a1a] dark:bg-zinc-100 text-white dark:text-black rounded-tr-sm shadow-sm'
                                                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                                            }
                                    `}>
                                            {msg.text}
                                        </div>
                                    </div>

                                    {/* User Avatar */}
                                    {msg.sender === 'teacher' && (
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                            AH
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    ) : (
                        /* Empty State / Context Selection */
                        <div className="flex h-full flex-col items-center justify-center max-w-2xl mx-auto p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center mb-10"
                            >
                                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={32} className="text-indigo-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome, Professor</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">Select a context to begin your analysis session.</p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Recent Exams</h3>
                                    {contexts.exams.map(exam => (
                                        <button
                                            key={exam.id}
                                            onClick={() => {
                                                setContextMode('exams');
                                                setSelectedId(exam.id);
                                            }}
                                            className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                                        >
                                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 dark:text-white">{exam.title}</div>
                                                <div className="text-xs text-zinc-500 mt-1">{exam.subtitle}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Students of Concern</h3>
                                    {contexts.students.map(student => (
                                        <button
                                            key={student.id}
                                            onClick={() => {
                                                setContextMode('students');
                                                setSelectedId(student.id);
                                            }}
                                            className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                                        >
                                            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-100 transition-colors">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 dark:text-white">{student.title}</div>
                                                <div className="text-xs text-zinc-500 mt-1">{student.subtitle}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. Message Entry Bar - Premium */}
                <div className="p-6 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent dark:from-black dark:via-black pb-8">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute inset-0 bg-red-500/0 rounded-2xl transition-all" />
                        <div className="relative bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-within:border-black/20 dark:focus-within:border-white/20 transition-all duration-200 overflow-hidden">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask for analysis, quiz generation, or teaching advice..."
                                className="w-full bg-transparent border-none px-5 py-4 pr-14 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-0 text-[15px]"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${inputValue.trim()
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                    }`}
                            >
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-[11px] text-zinc-400 font-medium">Gradeo AI can make mistakes. Consider checking important information.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. Optional Right Sidebar (Collapsible) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0"
                    >
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Context</span>
                            <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        <div className="p-5 space-y-6 overflow-y-auto">
                            {/* Action Button */}
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
                                <Plus size={16} />
                                Start New Session
                            </button>

                            {/* Context Selector */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Select Focus</h3>

                                {/* Tabs */}
                                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3">
                                    <button
                                        onClick={() => setContextMode('exams')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${contextMode === 'exams'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                            }`}
                                    >
                                        Exams
                                    </button>
                                    <button
                                        onClick={() => setContextMode('students')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${contextMode === 'students'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700'
                                            }`}
                                    >
                                        Students
                                    </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2">
                                    {contexts[contextMode].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedId(item.id)}
                                            className={`w-full p-3 rounded-xl border flex items-start gap-3 transition-all text-left group ${selectedId === item.id
                                                ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg shrink-0 ${selectedId === item.id ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-600'
                                                }`}>
                                                <item.icon size={16} />
                                            </div>
                                            <div>
                                                <div className={`font-semibold text-sm ${selectedId === item.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-900 dark:text-white'}`}>
                                                    {item.title}
                                                </div>
                                                <div className={`text-xs mt-0.5 ${selectedId === item.id ? 'text-indigo-600/80 dark:text-indigo-300/80' : 'text-zinc-500'}`}>
                                                    {item.subtitle}
                                                </div>
                                            </div>
                                            {selectedId === item.id && (
                                                <div className="ml-auto flex items-center h-full">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Insight Card */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Live Insights</h3>
                                <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                                        <AlertCircle size={12} />
                                        Critical Pattern
                                    </div>
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                                        15% of students struggling with negative sign operations in equation expansion.
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex justify-between text-xs text-zinc-500 py-1">
                                    <span>Model</span>
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Gradeo-v4-Turbo</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500 py-1">
                                    <span>Tokens</span>
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">4,281 used</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherAIAssistant;
