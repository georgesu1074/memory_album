'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  children,
  animate = true 
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 
        rounded-md
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function SkeletonText({ 
  lines = 1, 
  className = '' 
}: { 
  lines?: number; 
  className?: string 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`card ${className}`}
    >
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </motion.div>
  );
}

export function SkeletonImage({ 
  className = '' 
}: { 
  className?: string 
}) {
  return (
    <Skeleton className={`aspect-square ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-300 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </Skeleton>
  );
}

export function SkeletonList({ 
  items = 3,
  className = '' 
}: { 
  items?: number;
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4"
        >
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <SkeletonText lines={2} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}