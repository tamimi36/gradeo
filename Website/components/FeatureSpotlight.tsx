import React, { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { Scan, Brain, Cloud, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: "Instant Scan",
    description: "Our proprietary optical engine recognizes handwriting and bubble sheets instantly. Hover and go—no shutter button needed.",
    color: "bg-blue-500",
    icon: Scan,
    stats: "0.2s latency",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Contextual AI",
    description: "Gradeo understands open-ended answers. It flags anomalies and generates personalized feedback for every student automatically.",
    color: "bg-purple-500",
    icon: Brain,
    stats: "99.9% accuracy",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop"
  },
  {
    title: "Cloud Sync",
    description: "Start grading in the classroom, finish in the staff room. Your data is encrypted and synced instantly across all your devices.",
    color: "bg-pink-500",
    icon: Cloud,
    stats: "Real-time sync",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
  }
];

interface CardProps {
  i: number;
  feature: typeof features[0];
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card: React.FC<CardProps> = ({ i, feature, progress, range, targetScale }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0 px-4">
      <motion.div
        style={{ scale, top: `calc(-5vh + ${i * 25}px)` }}
        className="flex flex-col relative w-full max-w-5xl h-[600px] rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden origin-top"
      >
        <div className="flex h-full flex-col md:flex-row">
          {/* Content Side */}
          <div className="flex-1 p-10 md:p-14 flex flex-col justify-between relative z-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${feature.color} bg-opacity-10 text-zinc-900 dark:text-white`}>
                  <feature.icon size={24} />
                </div>
                <span className="text-sm font-semibold tracking-wider uppercase text-zinc-500">{feature.stats}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight tracking-tight">
                {feature.title}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>

            <div className="mt-8">
              <ul className="space-y-3 mb-8">
                {[1, 2, 3].map((_, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 size={18} className="text-zinc-900 dark:text-white" />
                    <span className="text-sm">Enterprise-grade feature included</span>
                  </li>
                ))}
              </ul>
              <button className="group flex items-center gap-2 text-zinc-900 dark:text-white font-semibold">
                Learn more <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative flex-1 h-[300px] md:h-full overflow-hidden">
            <motion.div style={{ scale: imageScale }} className="w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10 w-20 md:w-32" />
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const FeatureSpotlight: React.FC = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  })

  return (
    <section className="bg-zinc-50 dark:bg-black pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
        <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-zinc-900 dark:text-white mb-6">
          Built for <span className="text-zinc-400">speed.</span>
        </h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Every interaction is meticulously designed to be fluid, responsive, and delightful.
        </p>
      </div>

      <div ref={container} className="relative">
        {features.map((feature, i) => {
          const targetScale = 1 - ((features.length - i) * 0.05);
          return (
            <Card
              key={i}
              i={i}
              feature={feature}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          )
        })}
      </div>
    </section>
  );
};

export default FeatureSpotlight;