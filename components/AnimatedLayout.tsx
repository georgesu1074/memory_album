'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageVariants, pageTransition } from '@/lib/animations';

interface AnimatedLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedLayout({ children, className = '' }: AnimatedLayoutProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}