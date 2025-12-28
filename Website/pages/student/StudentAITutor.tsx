import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ArrowLeft,
    Plus,
    User,
    StopCircle,
    BookOpen,
    Zap,
    FlaskConical,
    Dna,
    Clock,
    FileText,
    BrainCircuit,
    ChevronRight,
    Calculator
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
        { id: 'general', title: 'General Study', desc: 'Ask questions about concepts.', icon: Sparkles },
        { id: 'exam', title: 'Exam Prep', desc: 'Practice with past papers.', icon: FileText },
        { id: 'quiz', title: 'Quick Quiz', desc: 'Test your knowledge.', icon: BrainCircuit },
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
        setMessages([
            {
                id: Date.now(),
                sender: 'ai',
                text: `I'm ready to help you with ${selectedSubject.name}. \n\nWe are in ${context.title} mode. How would you like to start?`
            }
        ]);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Here is a breakdown of that concept.\n\nFirst, consider the fundamental principles. Unlike classical mechanics, quantum mechanics operates on probabilities. \n\nWould you like me to elaborate on the wave function?"
            }]);
        }, 1200);
    };

    const handleBack = () => {
        if (step === 'chat') setStep('context-selection');
        else if (step === 'context-selection') setStep('subject-selection');
        else navigate(-1);
    };

    // --- VIEWS ---

    // --- VIEWS (Inlined to prevent focus loss bugs) ---

    const renderSubjectSelection = () => (
        <motion.div
            key="subject"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transitionEase}
            className="max-w-4xl mx-auto w-full pt-16 px-6"
        >
            <div className="mb-12">
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-editorial mb-2">Choose a Subject</h1>
                <p className="text-lg text-zinc-500 font-normal">Select a topic to begin your session.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject, i) => (
                    <button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject)}
                        className={`group relative bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-${subject.color}-200 dark:hover:border-${subject.color}-900 hover:shadow-sm transition-all duration-200 text-left overflow-hidden`}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${subject.color}-500/0 group-hover:bg-${subject.color}-500 transition-all duration-300`} />
                        <div className={`w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <subject.icon size={20} strokeWidth={1.5} className={`group-hover:text-${subject.color}-600 transition-colors`} />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">{subject.name}</h3>
                        <p className="text-sm text-zinc-500 group-hover:translate-x-1 transition-transform">{subject.topics.length} topics</p>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <ChevronRight size={20} className="text-zinc-400" />
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const renderContextSelection = () => (
        <motion.div
            key="context"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionEase}
            className="max-w-2xl mx-auto w-full pt-16 px-6"
        >
            <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 mb-6 text-zinc-900 dark:text-white shadow-sm border border-zinc-100">
                    <selectedSubject.icon size={24} />
                </div>
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-editorial mb-2">
                    {selectedSubject.name}
                </h1>
                <p className="text-zinc-500 text-lg">Select a mode for this session</p>
            </div>

            <div className="space-y-3">
                {contextOptions.map((option, i) => (
                    <button
                        key={option.id}
                        onClick={() => handleContextSelect(option)}
                        className="w-full bg-white dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm flex items-center gap-5 transition-all duration-200 group"
                    >
                        <div className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                            <option.icon size={22} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{option.title}</h3>
                            <p className="text-sm text-zinc-500">{option.desc}</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </motion.div>
    );

    // Helper for Typewriter Effect
    const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
        const [display, setDisplay] = useState('');

        useEffect(() => {
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplay(prev => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(timer);
                    onComplete?.();
                }
            }, 10); // Adjustable speed (ms per char) as requested "faster"
            return () => clearInterval(timer);
        }, [text]);

        return <>{display}</>;
    };

    const renderChatView = () => (
        <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full w-full relative"
        >
            {/* Main Chat Area - Centered */}
            <div className="flex-1 flex flex-col h-full relative selection:bg-blue-100 dark:selection:bg-blue-900/30 bg-zinc-50 dark:bg-zinc-900">
                {/* Header for Mobile/Small */}
                <div className="lg:hidden p-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-20">
                    <button onClick={handleBack} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">AI Tutor</span>
                </div>

                {/* Scrollable Messages - Flex 1 to take available space */}
                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`mt-1 w-8 h-8 shrink-0 flex items-center justify-center rounded-full ${msg.sender === 'ai' ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent'}`}>
                                        {msg.sender === 'ai' ? (
                                            <Sparkles size={16} className="text-zinc-900 dark:text-white" />
                                        ) : null}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`
                                        prose prose-zinc dark:prose-invert max-w-none 
                                        ${msg.sender === 'user'
                                            ? 'bg-zinc-200/50 dark:bg-zinc-800 px-5 py-3 rounded-2xl rounded-tr-sm'
                                            : ''}
                                    `}>
                                        <p className={`text-[15px] leading-7 whitespace-pre-wrap font-normal tracking-wide ${msg.sender === 'user' ? 'text-zinc-900 dark:text-white m-0' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                            {msg.sender === 'ai' ? (
                                                <Typewriter text={msg.text} />
                                            ) : (
                                                msg.text
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                        <Sparkles size={16} className="text-zinc-900 dark:text-white" />
                                    </div>
                                    <div className="flex gap-1.5 pt-2">
                                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area - Static at Bottom (Not Absolute) */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900">
                    <div className="max-w-2xl mx-auto relative cursor-text group" onClick={(e) => {
                        const textarea = e.currentTarget.querySelector('textarea');
                        textarea?.focus();
                    }}>
                        {/* Redesigned Input */}
                        <div className="relative flex items-end gap-3 bg-zinc-100 dark:bg-black p-3 rounded-[1.5rem] transition-shadow duration-300 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-800 shadow-sm">
                            <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 rounded-full hover:bg-black/5 dark:hover:bg-white/10 mb-0.5">
                                <Plus size={20} strokeWidth={2} />
                            </button>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Message AI Tutor..."
                                className="flex-1 max-h-40 min-h-[40px] pt-2.5 pb-2 bg-transparent border-none focus:ring-0 text-[15px] text-zinc-900 dark:text-white placeholder:text-zinc-500 resize-none leading-relaxed outline-none"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`p-2 rounded-full transition-colors duration-200 mb-0.5 ${inputValue.trim() ? 'bg-zinc-900 text-white hover:bg-black' : 'text-zinc-300 bg-transparent'}`}
                            >
                                <ArrowLeft size={18} className={inputValue.trim() ? "rotate-90" : "rotate-90 opacity-50"} strokeWidth={2.5} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-zinc-400 mt-3 font-medium">
                            AI Tutor can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Fixed */}
            <div className="w-72 border-l border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hidden lg:flex flex-col p-4 space-y-3">

                {/* Current Session Card */}
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Current Session</h2>
                    <div className="mb-3">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">{selectedSubject?.name}</h3>
                        <p className="text-sm text-zinc-500 font-medium">{selectedContext?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-full inline-flex shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>ACTIVE</span>
                    </div>
                </div>

                {/* New Session Button */}
                <button
                    onClick={() => {
                        setStep('subject-selection');
                        setSelectedSubject(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    Start New Session
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative bg-zinc-50 dark:bg-zinc-950">
            <div className="px-6 py-4">
                <button onClick={handleBack} className="text-zinc-500 hover:text-zinc-900 transition-colors">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {step === 'subject-selection' && renderSubjectSelection()}
                {step === 'context-selection' && renderContextSelection()}
                {step === 'chat' && renderChatView()}
            </AnimatePresence>
        </div>
    );
};

export default StudentAITutor;
