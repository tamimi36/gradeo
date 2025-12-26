import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, PenTool, MessageSquare } from 'lucide-react';

const TeacherAIAssistant: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">AI Assistant</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Your intelligent teaching companion.</p>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Lesson Planner', desc: 'Generate comprehensive lesson plans based on curriculum standards.', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Quiz Generator', desc: 'Create quizzes instantly from any text or topic.', icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { title: 'Student Feedback', desc: 'Generate personalized feedback for student assignments.', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="swiss-card p-8 hover:scale-[1.02] cursor-pointer group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <tool.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{tool.title}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{tool.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chat Interface Placeholder */}
            <div className="swiss-card h-[500px] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-zinc-900 dark:text-white">Quick Chat</h3>
                </div>
                <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-4">
                    <Sparkles size={48} className="opacity-20" />
                    <p>Select a tool above or start typing to ask for help.</p>
                </div>
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                    <input
                        type="text"
                        placeholder="Ask AI Assistant..."
                        className="w-full py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-purple-500/20 text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

export default TeacherAIAssistant;
