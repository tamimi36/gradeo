import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Sparkles,
    ArrowLeft,
    MoreHorizontal,
    Plus,
    Bot,
    User,
    StopCircle,
    BookOpen,
    Calculator,
    Zap,
    FlaskConical,
    Dna,
    Clock,
    FileText,
    BrainCircuit,
    ChevronRight,
    Search
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type FlowStep = 'subject-selection' | 'context-selection' | 'chat';

const StudentAITutor: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const topicParam = searchParams.get('topic');

    // State
    const [step, setStep] = useState<FlowStep>('subject-selection');
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [selectedContext, setSelectedContext] = useState<any>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello Ahmed. I'm ready to help you study. Which subject would you like to focus on today?" },
    ]);

    // APPLE MOTION CONSTANTS
    const transitionSpring = { type: "spring", stiffness: 300, damping: 30 };
    const transitionEase = { duration: 0.35, ease: [0.16, 1, 0.3, 1] }; // Apple ease-out

    const subjects = [
        { id: 'math', name: 'Mathematics', color: 'blue', icon: Calculator, topics: ['Calculus', 'Algebra', 'Trigonometry'] },
        { id: 'physics', name: 'Physics', color: 'purple', icon: Zap, topics: ['Kinematics', 'Dynamics', 'Electromagnetism'] },
        { id: 'chem', name: 'Chemistry', color: 'emerald', icon: FlaskConical, topics: ['Organic', 'Inorganic', 'Physical'] },
        { id: 'bio', name: 'Biology', color: 'orange', icon: Dna, topics: ['Genetics', 'Cell Biology', 'Ecology'] },
        { id: 'eng', name: 'English', color: 'pink', icon: BookOpen, topics: ['Literature', 'Grammar', 'Composition'] },
        { id: 'hist', name: 'History', color: 'indigo', icon: Clock, topics: ['World History', 'Modern Era', 'Ancient Civ'] },
    ];

    const contextOptions = [
        { id: 'general', title: 'General Study', desc: 'Ask questions about concepts, theories, or homework.', icon: Sparkles, color: 'blue' },
        { id: 'exam', title: 'Exam Prep', desc: 'Practice with past papers and mock quizzes.', icon: FileText, color: 'orange' },
        { id: 'quiz', title: 'Quick Quiz', desc: 'Test your knowledge with a generated 5-min quiz.', icon: BrainCircuit, color: 'purple' },
    ];

    // Initialize based on URL param
    useEffect(() => {
        if (topicParam) {
            const subject = subjects.find(s => s.name.toLowerCase() === topicParam.toLowerCase());
            if (subject) {
                setSelectedSubject(subject);
                setStep('context-selection');
            }
        }
    }, [topicParam]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (step === 'chat') {
            scrollToBottom();
        }
    }, [messages, isTyping, step]);

    const handleSubjectSelect = (subject: any) => {
        setSelectedSubject(subject);
        setStep('context-selection');
    };

    const handleContextSelect = (context: any) => {
        setSelectedContext(context);
        setStep('chat');
        // Reset chat with context
        setMessages([
            {
                id: Date.now(),
                sender: 'ai',
                text: `Great choice! I'm ready to help you with ${selectedSubject.name} (${context.title}). How would you like to start?`
            }
        ]);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        // Mock AI response with typing delay
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I can certainly help with that. Let's start by reviewing the core concepts. Would you like a brief summary or shall we jump straight into practice problems?"
            }]);
        }, 1500);
    };

    const handleBack = () => {
        if (step === 'chat') setStep('context-selection');
        else if (step === 'context-selection') setStep('subject-selection');
        else navigate(-1);
    };

    // --- VIEWS ---

    const SubjectSelectionView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={transitionEase}
            className="max-w-4xl mx-auto w-full pt-12 pb-20 px-6"
        >
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700">
                    <Sparkles size={32} className="text-zinc-900 dark:text-white" />
                </div>
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">Choose a Subject</h1>
                <p className="text-lg text-zinc-500 font-medium">What would you like to master today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, i) => (
                    <motion.button
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...transitionEase, delay: i * 0.05 }}
                        whileHover={{
                            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubjectSelect(subject)}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800 shadow-sm text-left group relative overflow-hidden transition-all duration-150 ease-[0.16,1,0.3,1]"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${subject.color}-500/0 to-${subject.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl bg-${subject.color}-50 dark:bg-${subject.color}-900/10 flex items-center justify-center text-${subject.color}-600 dark:text-${subject.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                                <subject.icon size={28} strokeWidth={1.5} />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-300" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{subject.name}</h3>
                            <p className="text-sm text-zinc-500 font-medium">{subject.topics.length} topics available</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    const ContextSelectionView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={transitionEase}
            className="max-w-3xl mx-auto w-full pt-12 pb-20 px-6"
        >
            <div className="text-center mb-12">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-${selectedSubject.color}-500/20 bg-gradient-to-br from-${selectedSubject.color}-500 to-${selectedSubject.color}-600 text-white`}>
                    <selectedSubject.icon size={32} />
                </div>
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">Study Mode</h1>
                <p className="text-lg text-zinc-500 font-medium">How should we approach {selectedSubject.name}?</p>
            </div>

            <div className="space-y-4">
                {contextOptions.map((option, i) => (
                    <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...transitionEase, delay: i * 0.1 }}
                        whileHover={{
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleContextSelect(option)}
                        className="w-full bg-white dark:bg-zinc-900 p-6 rounded-[1.25rem] border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-6 group transition-all duration-150 ease-[0.16,1,0.3,1]"
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-${option.color}-50 dark:bg-${option.color}-900/10 flex items-center justify-center text-${option.color}-600 dark:text-${option.color}-400 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <option.icon size={28} strokeWidth={1.5} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{option.title}</h3>
                            <p className="text-sm text-zinc-500 font-medium pr-8">{option.desc}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                            <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-300 rotate-180" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    const ChatView = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full w-full relative"
        >
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 md:px-0 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={transitionEase}
                                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1">
                                        <Sparkles size={14} className="text-white" fill="currentColor" />
                                    </div>
                                )}

                                <div className={`
                                    max-w-[85%] md:max-w-[75%] px-6 py-3.5 text-[15px] leading-relaxed relative group
                                    ${msg.sender === 'user'
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-[20px] rounded-tr-sm shadow-sm'
                                        : 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-[20px] rounded-tl-sm shadow-sm'
                                    }
                                `}>
                                    {msg.text}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
                                        <User size={14} className="text-zinc-500" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                <Sparkles size={14} className="text-white" fill="currentColor" />
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-[20px] rounded-tl-sm px-5 py-4 flex gap-1 items-center shadow-sm h-12">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-6 left-0 right-0 px-4">
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 p-2 pl-5 rounded-[28px] border border-zinc-200/60 dark:border-zinc-800 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-none transition-all duration-300 ring-4 ring-transparent focus-within:ring-blue-500/10">
                        <button className="p-2.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors mb-1">
                            <Plus size={20} strokeWidth={2.5} />
                        </button>

                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={`Message Gradeo AI about ${selectedSubject ? selectedSubject.name : 'anything'}...`}
                            className="flex-1 max-h-32 min-h-[52px] py-3.5 bg-transparent border-none focus:ring-0 text-[15px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
                            rows={1}
                        />

                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() && !isTyping}
                            className={`
                                p-2.5 rounded-full mb-1 transition-all duration-300
                                ${inputValue.trim()
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md hover:scale-105 active:scale-95'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                }
                            `}
                        >
                            {isTyping ? <StopCircle size={20} fill="currentColor" /> : <ArrowLeft size={20} className="rotate-90" strokeWidth={3} />}
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-zinc-400 font-medium mt-3">
                        AI can make mistakes. Please check important information.
                    </p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden">
            {/* Header - Conditional Rendering based on Step */}
            <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 rounded-full shadow-sm hover:bg-white dark:hover:bg-zinc-800 transition-all pointer-events-auto cursor-pointer group"
                >
                    <ArrowLeft size={20} className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </motion.button>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 rounded-full shadow-sm pointer-events-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {step === 'subject-selection' ? 'AI Tutor' : step === 'context-selection' ? selectedSubject?.name : 'Active Session'}
                    </span>
                </div>

                <div className="w-10"></div> {/* Spacer */}
            </header>

            <AnimatePresence mode="wait">
                {step === 'subject-selection' && <SubjectSelectionView key="subject" />}
                {step === 'context-selection' && <ContextSelectionView key="context" />}
                {step === 'chat' && <ChatView key="chat" />}
            </AnimatePresence>
        </div>
    );
};

export default StudentAITutor;
