'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInVariants, scaleVariants } from '@/lib/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 safe-padding">
      <div className="text-center max-w-md">
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-8xl sm:text-9xl font-display font-bold text-primary-500">
            404
          </h1>
        </motion.div>
        
        <motion.h2
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-display font-semibold text-gray-800 dark:text-gray-200 mb-4"
        >
          Page Not Found
        </motion.h2>
        
        <motion.p
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </motion.p>
        
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/"
            className="inline-block btn-base bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 no-tap-highlight"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}