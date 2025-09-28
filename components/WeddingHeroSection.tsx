'use client';

import { WeddingWithDetails, getCoupleNames } from '@/types/wedding';
import { Calendar, Heart, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeddingHeroSectionProps {
  wedding: WeddingWithDetails;
  onShareMemory: () => void;
}

export default function WeddingHeroSection({ wedding, onShareMemory }: WeddingHeroSectionProps) {
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!wedding.wedding_date) return;

    const updateCountdown = () => {
      const weddingDate = new Date(wedding.wedding_date + 'T00:00:00');
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff < 0) {
        setIsPast(true);
        const daysSince = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
        if (daysSince === 0) {
          setTimeUntil('Today!');
        } else if (daysSince === 1) {
          setTimeUntil('Yesterday');
        } else if (daysSince < 30) {
          setTimeUntil(`${daysSince} days ago`);
        } else if (daysSince < 365) {
          const months = Math.floor(daysSince / 30);
          setTimeUntil(`${months} month${months > 1 ? 's' : ''} ago`);
        } else {
          const years = Math.floor(daysSince / 365);
          setTimeUntil(`${years} year${years > 1 ? 's' : ''} ago`);
        }
      } else {
        setIsPast(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) {
          setTimeUntil('Today!');
        } else if (days === 1) {
          setTimeUntil('Tomorrow!');
        } else if (days < 30) {
          setTimeUntil(`${days} days to go`);
        } else if (days < 365) {
          const months = Math.floor(days / 30);
          setTimeUntil(`${months} month${months > 1 ? 's' : ''} to go`);
        } else {
          const years = Math.floor(days / 365);
          setTimeUntil(`${years} year${years > 1 ? 's' : ''} to go`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [wedding.wedding_date]);

  const themeColor = wedding.theme_color || '#8B5CF6';
  const secondaryColor = (wedding as any).secondary_color || '#4B5563'; // Default to dark grey

  // Generate gradient based on theme colors - using a pink gradient
  const gradientStyle = {
    background: `linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)`, // Light pink gradient
  };

  const buttonStyle = {
    backgroundColor: secondaryColor, // Use secondary color for button
  };

  const accentStyle = {
    color: themeColor,
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0" style={gradientStyle} />
      

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
        {/* Couple Names */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-600 mb-3 sm:mb-4 leading-tight">
          {getCoupleNames(wedding)}
        </h1>
        
        {/* Wedding Date */}
        {wedding.wedding_date && (
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: secondaryColor }} />
            <p className="text-base sm:text-lg md:text-xl text-gray-700">
              {new Date(wedding.wedding_date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Countdown or Time Since */}
        {timeUntil && (
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-400">
              {timeUntil}
            </p>
          </div>
        )}

        {/* Welcome Message */}
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          {isPast 
            ? "Thank you for celebrating with us! Share your favorite memories from our special day."
            : "We can't wait to celebrate with you! Share your favorite memories with us."}
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onShareMemory}
            className="px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold rounded-full shadow-lg transform transition-all active:scale-95 hover:scale-105 hover:shadow-xl text-base sm:text-lg min-h-[48px] min-w-[160px]"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div className="flex items-center gap-2 justify-center">
              <Heart className="w-5 h-5" />
              <span>Share a Memory</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}