import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import SlideOver from '../ui/SlideOver';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
}

interface AITutorProps {
    isOpen: boolean;
    onClose: () => void;
    initialContext?: string;
}

const AITutor: React.FC<AITutorProps> = ({ isOpen, onClose, initialContext }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'ai', text: initialContext || "Hi! I'm your AI Tutor. How can I help you with your studies today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialContext) {
            setMessages([{ id: '1', role: 'ai', text: initialContext }]);
        }
    }, [initialContext]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "That's a great question! Based on your recent quiz results, I'd suggest focusing on the core concepts first. Let's break it down..."
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <SlideOver isOpen={isOpen} onClose={onClose} title="AI Tutor">
            <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 pb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>
                                {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'ai'
                                    ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200'
                                    : 'bg-indigo-600 text-white'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center">
                                <Bot size={18} />
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl flex gap-1">
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything..."
                            className="w-full pl-4 pr-12 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['Explain this concept', 'Give me a quiz', 'Summarize notes'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => { setInput(suggestion); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
                            >
                                <Sparkles size={12} />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </SlideOver>
    );
};

export default AITutor;
