import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const StudentExamView: React.FC = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});

    const questions = [
        {
            id: 1,
            text: "Which organelle is known as the powerhouse of the cell?",
            options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"]
        },
        {
            id: 2,
            text: "What is the primary function of the cell membrane?",
            options: ["Energy production", "Protein synthesis", "Protection and transport", "DNA storage"]
        },
        {
            id: 3,
            text: "Which process converts light energy into chemical energy?",
            options: ["Respiration", "Photosynthesis", "Fermentation", "Digestion"]
        }
    ];

    const handleAnswer = (optionIndex: number) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleSubmit = () => {
        navigate('/student/result/1');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Advanced Biology Midterm</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Section 3 • Dr. Wilson</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full font-mono font-medium">
                    <Clock size={18} />
                    24:15
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg"
            >
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 block">
                    Question {currentQuestion + 1} of {questions.length}
                </span>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-8 leading-relaxed">
                    {questions[currentQuestion].text}
                </h2>

                <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${answers[currentQuestion] === index
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                }`}
                        >
                            <span className="font-medium">{option}</span>
                            {answers[currentQuestion] === index && (
                                <CheckCircle2 size={20} className="text-blue-500" />
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                    >
                        Submit Exam
                        <CheckCircle2 size={20} />
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default StudentExamView;
