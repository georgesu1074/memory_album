'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import PhotoLightbox from './PhotoLightbox'

interface Photo {
  id: string
  url: string
  thumbnail_url: string | null
  memoryId?: string
  guestName?: string
}

interface PhotoCarouselProps {
  photos: Photo[]
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)
  const isDragging = useRef(false)

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || startX.current === null) return
    
    const currentX = e.touches[0].clientX
    const diff = startX.current - currentX

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrevious()
      }
      isDragging.current = false
      startX.current = null
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    startX.current = null
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (photos.length === 0) return null

  return (
    <div className="relative w-full bg-gray-100">
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.map((photo, index) => (
            <div key={photo.id} className="w-full h-full flex-shrink-0 relative">
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-contain bg-gray-100 cursor-pointer"
                onClick={() => {
                  setLightboxIndex(index)
                  setLightboxOpen(true)
                }}
              />
              {/* Photo attribution */}
              {photo.guestName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm">
                    Photo by {photo.guestName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => {
            setLightboxIndex(currentIndex)
            setLightboxOpen(true)
          }}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
          aria-label="View fullscreen"
        >
          <Expand className="h-4 w-4 text-gray-700" />
          <span className="text-sm text-gray-700 hidden sm:inline">View fullscreen</span>
        </button>

        {/* Navigation Arrows - Desktop */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all items-center justify-center"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all items-center justify-center"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                } rounded-full`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip - Desktop */}
      <div className="hidden md:block bg-white border-t p-4">
        <div className="flex gap-3 overflow-x-auto px-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'shadow-lg scale-110 ring-2 ring-gray-200' 
                  : 'hover:shadow-md hover:scale-105 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}