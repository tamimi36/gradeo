import React from 'react';
import { motion } from 'framer-motion';

const keywords = [
  "Private", "Secure", "Fast", "Intelligent", "Local", "Encrypted", "Offline-First", "Precision"
];

const LogoTicker: React.FC = () => {
  return (
    <div className="w-full py-10 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex relative select-none">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {[...keywords, ...keywords, ...keywords, ...keywords].map((word, index) => (
            <div key={index} className="flex items-center gap-16">
              <span className="text-xl md:text-2xl font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                {word}
              </span>
              <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LogoTicker;