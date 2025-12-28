import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Apple, Check, Globe } from 'lucide-react';

// Custom Google Icon Component since it's not in Lucide
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.449 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
    </svg>
);

const MicrosoftIcon = () => (
    <svg viewBox="0 0 23 23" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
);

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [country, setCountry] = useState('United States');
    const [emailPreferences, setEmailPreferences] = useState(false);

    // Floating animation variants for left panel
    const floatingVariants = {
        animate: {
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const floatingVariants2 = {
        animate: {
            y: [0, 15, 0],
            rotate: [0, -3, 3, 0],
            transition: {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
            }
        }
    };

    return (
        <div className="min-h-screen flex font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Helvetica,Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji']">
            {/* Left Panel - Marketing (Hidden on Mobile/Tablet) */}
            <div className="hidden lg:flex w-[45%] bg-[#0d1117] relative overflow-hidden flex-col justify-center px-16 xl:px-24">
                {/* Background Stars/Decoration */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Content */}
                <div className="relative z-10 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl font-medium tracking-tight leading-[1.1] mb-6">
                            Create your<br />Gradeo account
                        </h1>
                        <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                            Join thousands of educators and students managing their academic journey with clarity and speed.
                        </p>
                    </motion.div>

                    {/* Floating 3D-like Elements (Gradeo Themed) */}
                    <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 w-full h-full pointer-events-none">
                        {/* Abstract Shape 1 */}
                        <motion.div
                            variants={floatingVariants}
                            animate="animate"
                            className="absolute top-[20%] right-[10%] w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 blur-2xl opacity-40"
                        />
                        {/* Abstract Shape 2 */}
                        <motion.div
                            variants={floatingVariants2}
                            animate="animate"
                            className="absolute bottom-[20%] right-[20%] w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 blur-[60px] opacity-30"
                        />

                        {/* Concrete Element: Shield/Badge */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[30%] right-[15%] w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center transform rotate-12"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-500/80 shadow-inner"></div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 bg-white flex flex-col relative">
                {/* Header Elements */}
                <div className="absolute top-6 right-6 lg:right-10 flex items-center gap-2 text-sm">
                    <span className="text-zinc-600">Already have an account?</span>
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                        Sign in →
                    </Link>
                </div>

                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-6 left-6">
                    <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-bold">G</div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-[540px] mx-auto lg:mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        <h2 className="text-2xl font-medium tracking-tight text-center mb-8 text-zinc-900">Sign up for Gradeo</h2>

                        {/* OAuth Buttons */}
                        <div className="space-y-3 mb-8">
                            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-200">
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-zinc-900 font-medium hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-200">
                                <MicrosoftIcon />
                                <span>Continue with Microsoft</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-zinc-500">or</span>
                            </div>
                        </div>

                        {/* Inputs */}
                        <form className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm text-zinc-700 font-normal" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-zinc-900 placeholder-zinc-400 transition-shadow"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm text-zinc-700 font-normal" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-zinc-900 placeholder-zinc-400 transition-shadow"
                                    required
                                />
                                <p className="text-xs text-zinc-500 pt-0.5">Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm text-zinc-700 font-normal" htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-zinc-900 placeholder-zinc-400 transition-shadow"
                                    required
                                />
                                <p className="text-xs text-zinc-500 pt-0.5">Username may only contain alphanumeric characters or single hyphens.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm text-zinc-700 font-normal" htmlFor="country">Your Country/Region</label>
                                <div className="relative">
                                    <select
                                        id="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-zinc-900 appearance-none cursor-pointer transition-shadow"
                                    >
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>United Kingdom</option>
                                        <option>Germany</option>
                                        <option>France</option>
                                        <option>Japan</option>
                                        <option>Australia</option>
                                    </select>
                                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${emailPreferences ? 'bg-blue-600 border-blue-600' : 'bg-white border-zinc-300 group-hover:border-zinc-400'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={emailPreferences}
                                            onChange={() => setEmailPreferences(!emailPreferences)}
                                        />
                                        {emailPreferences && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-zinc-600 leading-snug">Receive occasional product updates and announcements</span>
                                </label>
                            </div>

                            <button
                                type="button"
                                className="w-full py-3 px-4 bg-[#1f2328] hover:bg-[#2b313a] text-white font-medium rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                            >
                                Create account
                            </button>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <div className="mt-16 text-center text-xs text-zinc-500 max-w-sm px-4">
                        By creating an account, you agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>. For more information about Gradeo's privacy practices, see the <a href="#" className="text-blue-600 hover:underline">Privacy Statement</a>.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
