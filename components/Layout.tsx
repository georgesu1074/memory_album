'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col safe-padding">
      {/* Mobile-optimized header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container-mobile py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-primary-600">
              Memory Album
            </h1>
            {/* Placeholder for future navigation */}
            <div className="flex items-center gap-4">
              {/* Navigation items will go here */}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className={`flex-1 container-mobile py-6 sm:py-8 ${className}`}>
        {children}
      </main>

      {/* Mobile-optimized footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="container-mobile py-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your memories from our special day
          </p>
        </div>
      </footer>
    </div>
  );
}