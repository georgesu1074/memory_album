'use client'

import { motion } from 'framer-motion';
import { fadeInVariants, slideUpVariants, scaleVariants, springConfig } from '@/lib/animations';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function HomePage() {
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
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8"
        >
          Create beautiful digital memory albums for your wedding. Collect photos, stories, and well-wishes from all your guests in one magical place.
        </motion.p>
        
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...springConfig.stiff, delay: 0.4 }}
          className="flex gap-4"
        >
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
            <div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Create Your Wedding</h3>
              <p className="text-sm text-gray-600">Sign up and set up your wedding details in minutes</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Share with Guests</h3>
              <p className="text-sm text-gray-600">Send a link or QR code for guests to contribute memories</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Treasure Forever</h3>
              <p className="text-sm text-gray-600">All memories organized in a beautiful digital album</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}