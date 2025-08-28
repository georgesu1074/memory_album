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
  const secondaryColor = wedding.secondary_color || '#EC4899';

  // Generate gradient based on theme colors
  const gradientStyle = {
    background: `linear-gradient(135deg, ${themeColor}20 0%, ${secondaryColor}20 100%)`,
  };

  const buttonStyle = {
    backgroundColor: themeColor,
  };

  const accentStyle = {
    color: themeColor,
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0" style={gradientStyle} />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <Heart className="w-full h-full" style={accentStyle} />
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
        <Heart className="w-full h-full" style={accentStyle} />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Couple Names */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          {getCoupleNames(wedding)}
        </h1>
        
        {/* Wedding Date */}
        {wedding.wedding_date && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Calendar className="w-5 h-5" style={accentStyle} />
            <p className="text-lg md:text-xl text-gray-700">
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
          <div className="flex items-center justify-center gap-2 mb-8">
            <Clock className="w-5 h-5" style={accentStyle} />
            <p className="text-2xl md:text-3xl font-semibold" style={accentStyle}>
              {timeUntil}
            </p>
          </div>
        )}

        {/* Welcome Message */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {isPast 
            ? "Thank you for celebrating with us! Share your favorite memories from our special day."
            : "We can't wait to celebrate with you! Share your favorite memories with us."}
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onShareMemory}
            className="px-8 py-4 text-white font-semibold rounded-full shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>Share a Memory</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}