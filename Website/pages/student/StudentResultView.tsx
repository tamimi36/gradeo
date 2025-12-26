import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentResultView: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock Result Data
    const result = {
        title: 'Midterm Exam: Calculus I',
        score: 85,
        totalQuestions: 20,
        correct: 17,
        timeTaken: '45m 20s',
        date: 'Oct 24, 2024',
        feedback: 'Great job! You showed strong understanding of derivatives. Review integrals.',
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/student')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 font-medium text-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-zinc-100 dark:border-zinc-800 mb-6 relative">
                            <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {result.score}%
                            </span>
                            <div className="absolute inset-0 rounded-full border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent -rotate-45" />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                            {result.title}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                            Completed on {result.date}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center">
                            <CheckCircle2 size={24} className="text-zinc-900 dark:text-white mb-2" strokeWidth={1.5} />
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">{result.correct}/{result.totalQuestions}</div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Correct</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center">
                            <Clock size={24} className="text-zinc-900 dark:text-white mb-2" strokeWidth={1.5} />
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">{result.timeTaken}</div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Time Taken</div>
                        </div>
                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center">
                            <Calendar size={24} className="text-zinc-900 dark:text-white mb-2" strokeWidth={1.5} />
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">Passed</div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 mb-8">
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-2">AI Feedback</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            {result.feedback}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/student/ai-tutor')}
                            className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                            Review with AI Tutor
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentResultView;
