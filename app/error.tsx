'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, scaleVariants } from '@/lib/animations';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 safe-padding">
      <div className="text-center max-w-md">
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-800 dark:text-gray-200">
            Something went wrong!
          </h1>
        </motion.div>
        
        <motion.p
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          We encountered an unexpected error. Don't worry, we've been notified and are working on it.
        </motion.p>
        
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <button
            onClick={reset}
            className="btn-base bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 w-full sm:w-auto"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn-base bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 w-full sm:w-auto ml-0 sm:ml-4"
          >
            Go Home
          </button>
        </motion.div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <motion.details
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mt-8 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              Debug Information
            </summary>
            <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </motion.details>
        )}
      </div>
    </div>
  );
}