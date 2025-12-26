import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Papers Graded', value: '1M+' },
  { label: 'Hours Saved', value: '50k+' },
  { label: 'Accuracy', value: '99.9%' },
  { label: 'Active Teachers', value: '10k+' },
];

const Stats: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 relative">
      {/* Decorative Connector */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-700 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;