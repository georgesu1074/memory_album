'use client';

import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { fadeInVariants, slideUpVariants, scaleVariants, springConfig } from '@/lib/animations';

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.h1 
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary-600 mb-4"
        >
          Memory Album
        </motion.h1>
        
        <motion.p 
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl"
        >
          Share your cherished memories and photos from our special day
        </motion.p>
        
        {/* Mobile-first CTA button with spring animation */}
        <motion.button 
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          transition={{ ...springConfig.stiff, delay: 0.4 }}
          className="btn-base bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 mt-8"
        >
          Share a Memory
        </motion.button>
      </div>
    </Layout>
  );
}