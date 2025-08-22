'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail_url?: string | null
  caption?: string
}

interface PhotoLightboxProps {
  photos: Photo[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function PhotoLightbox({ photos, initialIndex, isOpen, onClose }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0 })
  
  // Update index when props change
  useEffect(() => {
    setCurrentIndex(initialIndex)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [initialIndex, isOpen])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-') handleZoomOut()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])
  
  if (!isOpen || photos.length === 0) return null
  
  const currentPhoto = photos[currentIndex]
  
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))
    resetZoom()
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))
    resetZoom()
  }
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3))
  }
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5))
  }
  
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }
  
  // Touch/mouse handlers for panning
  const handleStart = (clientX: number, clientY: number) => {
    if (scale > 1) {
      setIsDragging(true)
      startPos.current = { x: clientX - position.x, y: clientY - position.y }
      lastPos.current = { ...position }
    }
  }
  
  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging && scale > 1) {
      const newX = clientX - startPos.current.x
      const newY = clientY - startPos.current.y
      setPosition({ x: newX, y: newY })
    }
  }
  
  const handleEnd = () => {
    setIsDragging(false)
  }
  
  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  
  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }
  
  // Pinch to zoom for mobile
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3))
  }
  
  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            {photos.length > 1 && (
              <span className="text-sm">
                {currentIndex + 1} / {photos.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Image */}
      <div 
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={currentPhoto.url}
          alt={`Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s',
          }}
          draggable={false}
        />
      </div>
      
      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Caption */}
      {currentPhoto.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-center">{currentPhoto.caption}</p>
        </div>
      )}
      
      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 rounded-lg max-w-[90vw] overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => {
                setCurrentIndex(index)
                resetZoom()
              }}
              className={`flex-shrink-0 ${
                index === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-12 w-12 object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}