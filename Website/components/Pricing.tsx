import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { PRICING } from '../constants';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-32 bg-white dark:bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter text-black dark:text-white mb-8"
          >
            Pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl tracking-tight"
          >
            Pro-grade tools for every classroom. <br />
            Simple, transparent, and powerful.
          </motion.p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((tier, index) => {
            const isPopular = tier.popular;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative flex flex-col justify-between p-8 rounded-[2rem] min-h-[500px] group ${isPopular
                  ? 'bg-zinc-100 dark:bg-zinc-900'
                  : 'bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-8 right-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white text-[10px] font-bold uppercase tracking-widest">
                      <Sparkles size={10} fill="currentColor" />
                      Pro
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2 tracking-tight">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-bold tracking-tighter text-black dark:text-white">{tier.price}</span>
                    {tier.period && <span className="text-lg font-medium text-zinc-500">{tier.period}</span>}
                  </div>

                  <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-8" />

                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-black dark:text-white shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`mt-10 w-full h-14 rounded-full font-bold text-[15px] tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center ${isPopular
                    ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-80'
                    : 'bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
                    }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;